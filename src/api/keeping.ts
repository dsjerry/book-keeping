import AsyncStorage from "@react-native-async-storage/async-storage";
import http from "../utils/http";
import { useKeepingStore } from "~store/keepingStore";
import { LastSyncAtKey } from "~consts/StorageKey";
import { OutTypes, CountType } from "~consts/Data";

export enum ConflictType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete'
}

export interface ConflictItem {
    type: ConflictType;
    clientVersion: any;
    serverVersion: any;
    conflictSince: string;
}

export interface ConflictResolution {
    type: ConflictType;
    resolvedData: any;
    strategy: 'client' | 'server' | 'merge';
}

export interface IdMapping {
    localId: string;
    serverId: number;
}

export interface SyncPayload {
    lastSyncAt: string;
    changes?: {
        creates?: any[];
        updates?: any[];
        deletes?: number[];
    };
    resolutions?: any[];
}

export interface Conflict {
    type: ConflictType;
    clientVersion: KeepingRes;
    serverVersion: KeepingRes;
}

interface SyncResult {
    success: boolean;
    serverTime: string;
    conflicts?: Conflict[];
    serverChanges?: {
        creates?: KeepingRes[];
        updates?: KeepingRes[];
        deletes?: number[];
    };
    idMappings?: { localId: string; serverId: number; }[];
}

export interface KeepingRes {
    id?: number; // 服务端ID
    name: string;
    transactionType: number;
    amount: number;
    position: string;
    image: string;
    remark: string;
    localId: string;
    createTime?: string;
    tags?: string;
}

interface BatchReq {
    creates?: KeepingRes[];
    updates?: KeepingRes[];
    deletes?: number[];
}

export const KeepingService = {
    getList() {
        return http.get<KeepingRes[]>('/keeping')
    },
    // TODO:
    async batchUpsert(data: BatchReq) {
        return http.post('/keeping/batch', data)
    },

    async sync(resolutions?: ConflictResolution[]) {
        const { items } = useKeepingStore.getState()
        const lastSyncAt = await AsyncStorage.getItem(LastSyncAtKey) || Date.now()

        // 将items转换为标准KeepingBatchDto格式
        const changes: BatchReq = {
            creates: [],
            updates: [],
            deletes: []
        }

        // 根据alias获取完整OutType
        const getFullTags = (tags: string) => {
            if (!tags) return []
            const fullTags = [] as typeof OutTypes
            tags.split(',').forEach(alias => {
                const tag = OutTypes.find(t => t.alias === alias)
                if (tag) {
                    fullTags.push(tag)
                }
            })
            return fullTags
        }

        // 遍历本地数据，根据 syncStatus 分类
        items.forEach((item) => {
            // 已删除的记录，只有在有服务端ID时才需要发送到服务器
            if (item.syncStatus === 'deleted' && item.serverId) {
                changes.deletes?.push(item.serverId)
                return
            }

            // 已同步的记录不需要发送
            if (item.syncStatus === 'synced') {
                return
            }

            const type = item.type === 'in' ? '收入' : '支出'
            const name = type + item.count + item.countType

            const keepingData = {
                name,
                transactionType: item.type === 'in' ? 1 : 2,
                amount: +item.count, // 转换为数字
                position: '',
                image: item.image,
                remark: item.note,
                localId: item.id,
                tags: item.tags.map(tag => tag.alias).join(',')
            }

            // 如果是修改的记录且有服务端ID
            if (item.syncStatus === 'modified' && item.serverId) {
                changes.updates?.push({
                    ...keepingData,
                    id: item.serverId // 使用服务端id
                })
            }
            // 如果是新增的记录或没有服务端ID的修改记录
            else if (item.syncStatus === 'new' || (item.syncStatus === 'modified' && !item.serverId) || !item.syncStatus) {
                changes.creates?.push({
                    ...keepingData,
                })
            }
        })

        const payload = {
            lastSyncAt,
            changes,
            resolutions: resolutions || []
        }

        const { data, success } = await http.post<SyncResult>('/keeping/sync', payload)
        const conflicts = data?.conflicts
        console.log(data)
        if (success && !conflicts?.length) {
            // 更新最后同步时间
            await AsyncStorage.setItem(LastSyncAtKey, data.serverTime)

            const serverChanges = data.serverChanges

            const { update, add, remove } = useKeepingStore.getState()
            if (serverChanges) {
                const creates = serverChanges.creates
                const updates = serverChanges.updates
                const deletes = serverChanges.deletes
                if (creates && creates.length > 0) {
                    creates.forEach(serverItem => {
                        // 检查本地是否已存在此记录（通过serverId匹配）
                        const existingItem = items.find(item => item.serverId === serverItem.id)
                        if (!existingItem) {
                            const count = serverItem.amount + ''
                            const type = serverItem.transactionType === 1 ? 'in' : 'out'
                            const countType = count.split(count + '').at(-1) as keyof typeof CountType
                            const tags = getFullTags(serverItem.tags!)
                            add({
                                id: Math.random().toString(36).substring(2, 15),
                                serverId: serverItem.id,
                                type,
                                count,
                                countType,
                                note: serverItem.remark,
                                image: serverItem.image,
                                syncStatus: 'synced',
                                date: Date.parse(serverItem.createTime!),
                                tags
                            })
                        }   
                    })
                }
                
                if (updates && updates.length > 0) {
                    updates.forEach(serverItem => {
                        const localItem = items.find(item => item.serverId === serverItem.id)
                        if (localItem) {
                            if (localItem.syncStatus !== 'modified') {
                                const tags = getFullTags(serverItem.tags!)
                                update({
                                    ...localItem,
                                    tags,
                                    type: serverItem.transactionType === 1 ? 'in' : 'out',
                                    count: serverItem.amount.toString(),
                                    note: serverItem.remark,
                                    image: serverItem.image,
                                    syncStatus: 'synced'
                                })
                            }
                        }
                    })
                }
                
                if (deletes && deletes.length > 0) {
                    deletes.forEach(serverId => {
                        const localItem = items.find(item => item.serverId === serverId)
                        if (localItem) {
                            if (localItem.syncStatus !== 'modified') {
                                remove(localItem.id)
                            }
                        }
                    })
                }
            }

            // 处理ID映射，更新本地ID到服务端ID的映射
            if (data.idMappings && data.idMappings.length > 0) {
                data.idMappings.forEach(mapping => {
                    const item = items.find(i => i.id === mapping.localId)
                    if (item) {
                        update({
                            ...item,
                            serverId: mapping.serverId,
                            syncStatus: 'synced'
                        })
                    }
                })
            }

            // 将所有已同步的记录状态更新为'synced'
            items.forEach(item => {
                if (item.syncStatus === 'modified' || item.syncStatus === 'new') {
                    update({
                        ...item,
                        syncStatus: 'synced'
                    })
                }

                // 删除标记为'deleted'的记录
                if (item.syncStatus === 'deleted') {
                    const { remove } = useKeepingStore.getState()
                    remove(item.id)
                }
            })
        }

        return {
            success,
            data
        }
    },

    resolveConflicts(conflicts: Conflict[], strategy: 'client' | 'server' | 'merge' = 'client'): ConflictResolution[] {
        return conflicts.map(conflict => {
            let resolvedData = conflict.clientVersion;

            if (strategy === 'server') {
                resolvedData = conflict.serverVersion;
            } else if (strategy === 'merge') {
                resolvedData = {
                    ...conflict.serverVersion,
                    remark: conflict.clientVersion.remark
                };
            }

            return {
                type: conflict.type,
                id: conflict.clientVersion.id || conflict.serverVersion.id,
                strategy,
                resolvedData
            };
        });
    }
}

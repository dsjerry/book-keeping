import AsyncStorage from "@react-native-async-storage/async-storage";
import http from "../utils/http";
import { useKeepingStore } from "~store/keepingStore";
import { LastSyncAtKey } from "~consts/StorageKey";

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

export interface SyncResult {
    serverTime: string;
    conflicts: any[];
    serverChanges: {
        creates: any[];
        updates?: any[];
        deletes?: number[];
    };
    idMappings?: IdMapping[];
}

export interface KeepingRes {
    name: string,
    transactionType: number,
    amount: number,
    position: string,
    image: string,
    remark: string,
    localId: string
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
        const payload = {
            lastSyncAt,
            resolutions: resolutions || [],
            changes: items.map((item) => {
                const type = item.type === 'in' ? '收入' : '支出'
                const name = type + item.count + item.countType
                return {
                    name,
                    transactionType: item.type === 'in' ? 1 : 2,
                    amount: item.count,
                    position: '',
                    image: item.image,
                    remark: item.note,
                    localId: item.id
                }
            })
        }
        const { data, success } = await http.post<SyncResult>('/keeping/sync', payload)
        return {
            success,
            data
        }
    }
}

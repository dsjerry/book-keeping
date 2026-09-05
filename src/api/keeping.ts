import AsyncStorage from '@react-native-async-storage/async-storage'
import http from '../utils/http'
import { useKeepingStore } from '~store/keepingStore'
import { useUserStore } from '~store/userStore'
import { useAppSettingsStore } from '~store/settingStore'
import { LastSyncAtKey } from '~consts/StorageKey'
import { OutTypes, CountType } from '~consts/Data'
import { logging } from '~utils'

export enum ConflictType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface ConflictItem {
  type: ConflictType
  clientVersion: any
  serverVersion: any
  conflictSince: string
}

export interface ConflictResolution {
  type: ConflictType
  id?: number
  resolvedData: any
  strategy: 'client' | 'server' | 'merge'
}

export interface IdMapping {
  localId: string
  serverId: number
}

export interface SyncPayload {
  lastSyncAt: string
  changes?: {
    creates?: any[]
    updates?: any[]
    deletes?: number[]
  }
  resolutions?: any[]
}

export interface Conflict {
  type: ConflictType
  clientVersion: KeepingRes
  serverVersion: KeepingRes
}

interface SyncResult {
  success: boolean
  serverTime: string
  conflicts?: Conflict[]
  serverChanges?: {
    creates?: KeepingRes[]
    updates?: KeepingRes[]
    deletes?: number[]
  }
  idMappings?: { localId: string; serverId: number }[]
}

export interface KeepingRes {
  id?: number // 服务端ID
  name: string
  transactionType: number
  amount: number
  position: string
  image: string
  remark: string
  localId: string
  createTime?: string
  tags?: string
  currency?: string
}

interface BatchReq {
  creates?: KeepingRes[]
  updates?: KeepingRes[]
  deletes?: number[]
}

/** 文件上传接口返回（含可直接渲染的带 token 地址） */
interface UploadRes {
  url: string
  viewUrl: string
  filename: string
}

/**
 * 从服务端返回的 name（格式：支出58人民币）中解析币种，
 * 解析失败时回退为人民币。
 */
const parseCountType = (name: string): keyof typeof CountType => {
  const match = name.match(/(人民币|港币|澳元)$/)
  return (match ? match[1] : '人民币') as keyof typeof CountType
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
    const lastSyncAt =
      (await AsyncStorage.getItem(LastSyncAtKey)) || String(Date.now())

    // 将items转换为标准KeepingBatchDto格式
    const changes: BatchReq = {
      creates: [],
      updates: [],
      deletes: [],
    }

    // 根据alias获取完整OutType（内置类型 + 当前用户自定义类型）
    const getFullTags = (tags: string) => {
      if (!tags) return []
      const { currentUser } = useUserStore.getState()
      const pool = [...OutTypes, ...(currentUser?.tags || [])]
      const fullTags: OutType[] = []
      tags.split(',').forEach(alias => {
        const tag = pool.find(t => t.alias === alias)
        if (tag) {
          fullTags.push(tag)
        }
      })
      return fullTags
    }

    // 遍历本地数据，根据 syncStatus 分类
    items.forEach(item => {
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

      // 地图选点时客户端保存了 "lng,lat"，拆成经纬度上报（服务端为"附近消费"预留）
      const [lng, lat] = (item.address?.location || '').split(',')
      const keepingData = {
        name,
        transactionType: item.type === 'in' ? 1 : 2,
        amount: +item.count, // 转换为数字
        position: item.address?.name || '',
        image: item.image,
        remark: item.note,
        localId: item.id,
        tags: item.tags.map(tag => tag.alias).join(','),
        // 币种独立上报：此前只编码在 name 字符串里，服务端无法按币种统计
        currency: item.countType,
        longitude: lng ? +lng : undefined,
        latitude: lat ? +lat : undefined,
      }

      // 如果是修改的记录且有服务端ID
      if (item.syncStatus === 'modified' && item.serverId) {
        changes.updates?.push({
          ...keepingData,
          id: item.serverId, // 使用服务端id
        })
      }
      // 如果是新增的记录或没有服务端ID的修改记录
      else if (
        item.syncStatus === 'new' ||
        (item.syncStatus === 'modified' && !item.serverId) ||
        !item.syncStatus
      ) {
        changes.creates?.push({
          ...keepingData,
        })
      }
    })

    const payload = {
      lastSyncAt,
      changes,
      resolutions: resolutions || [],
    }

    const { data, success } = await http.post<SyncResult>(
      '/keeping/sync',
      payload,
    )
    const conflicts = data?.conflicts
    logging.info('[同步] 结果:', data)
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
            const existingItem = items.find(
              item => item.serverId === serverItem.id,
            )
            if (!existingItem) {
              const count = serverItem.amount + ''
              const type = serverItem.transactionType === 1 ? 'in' : 'out'
              // 优先用服务端的 currency 字段，老数据回退到从 name 解析
              const countType = (serverItem.currency as keyof typeof CountType) || parseCountType(serverItem.name || '')
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
                tags,
              })
            }
          })
        }

        if (updates && updates.length > 0) {
          updates.forEach(serverItem => {
            const localItem = items.find(
              item => item.serverId === serverItem.id,
            )
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
                  syncStatus: 'synced',
                })
              }
            }
          })
        }

        if (deletes && deletes.length > 0) {
          deletes.forEach(serverId => {
            const localItem = items.find(
              item => item.serverId === serverId,
            )
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
              syncStatus: 'synced',
            })
          }
        })
      }

      // 使用最新的 state 收尾，避免用同步前的旧数据覆盖 serverId 等新字段
      items.forEach(item => {
        const fresh = useKeepingStore
          .getState()
          .items.find(i => i.id === item.id)
        if (!fresh) return

        if (fresh.syncStatus === 'modified' || fresh.syncStatus === 'new') {
          useKeepingStore
            .getState()
            .update({ ...fresh, syncStatus: 'synced' })
        }

        // 删除标记为'deleted'的记录
        if (fresh.syncStatus === 'deleted') {
          useKeepingStore.getState().remove(fresh.id)
        }
      })
    }

    return {
      success,
      data,
    }
  },

  resolveConflicts(
    conflicts: Conflict[],
    strategy: 'client' | 'server' | 'merge' = 'client',
  ): ConflictResolution[] {
    return conflicts.map(conflict => {
      let resolvedData = conflict.clientVersion

      if (strategy === 'server') {
        resolvedData = conflict.serverVersion
      } else if (strategy === 'merge') {
        resolvedData = {
          ...conflict.serverVersion,
          remark: conflict.clientVersion.remark,
        }
      }

      return {
        type: conflict.type,
        id: conflict.clientVersion.id || conflict.serverVersion.id,
        strategy,
        resolvedData,
      }
    })
  },

  /**
   * 通用图片上传：本地 file:// 路径 → 服务器，返回可直接渲染的绝对地址（带 file token）。
   * 失败返回 null，由调用方决定回退策略
   */
  async uploadImage(image: string): Promise<string | null> {
    try {
      const formData = new FormData()
      formData.append('file', {
        uri: image,
        name: image.split('/').pop() || 'photo.jpg',
        type: 'image/jpeg',
      } as any)
      const res = await http.upload<UploadRes>('/file/upload', formData)
      if (res.success && res.data?.viewUrl) {
        return res.data.viewUrl.startsWith('http')
          ? res.data.viewUrl
          : `${http.getOrigin()}/v1${res.data.viewUrl}`
      }
      logging.info('[上传] 图片上传失败:', res.message)
      return null
    } catch (error) {
      logging.error('[上传] 图片上传异常', error)
      return null
    }
  },

  /**
   * 记账图片云备份：启用同步且是本地文件时上传，失败回退本地路径（不阻塞记账）。
   * 注意：file token 有效期 1 天（FILE_TOKEN_EXPIRED），过期后由 renewImageUrl 自动续期
   */
  async uploadKeepingImage(image?: string): Promise<string | undefined> {
    if (!image || !image.startsWith('file://')) return image
    const { useOnline } = useAppSettingsStore.getState()
    if (!useOnline) return image
    return (await this.uploadImage(image)) ?? image
  },

  /**
   * 图片 token 自动续期：服务端图片地址里的 file token 过期后 <Image> 加载会失败，
   * 在 onError 里调用本方法：用 filename 重新换取新地址，并同步更新本地记录
   */
  async renewImageUrl(item: KeepingItem): Promise<string | null> {
    const current = item.image
    if (!current || !current.includes('/file/get/') || !item.serverId) return null
    const filename = decodeURIComponent(current.split('/file/get/')[1]?.split('?')[0] || '')
    if (!filename) return null

    const res = await http.get<{ url: string }>('/file/info', { filename })
    if (!res.success || !res.data?.url) return null
    const absolute = res.data.url.startsWith('http') ? res.data.url : `${http.getOrigin()}/v1${res.data.url}`

    const { items, update } = useKeepingStore.getState()
    const target = items.find(i => i.id === item.id)
    if (target && target.image === current) {
      update({ ...target, image: absolute })
    }
    return absolute
  },
}

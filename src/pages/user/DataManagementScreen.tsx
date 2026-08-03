import { useState, useEffect } from 'react'
import { View, ScrollView, StyleSheet, Alert, Platform } from 'react-native'
import { Text, Button, List, RadioButton, TextInput, useTheme } from 'react-native-paper'
import RNFS from 'react-native-fs'
import Share from 'react-native-share'
import DocumentPicker from 'react-native-document-picker'
import JSZip from 'jszip'
import * as XLSX from 'xlsx'

import { useKeepingStore } from '~store/keepingStore'
import { useUserStore } from '~store/userStore'
import { useAppSettingsStore } from '~store/settingStore'
import { logging } from '~utils'
import Modal from '~components/Modal'

const DataManagement: React.FC = () => {
  const theme = useTheme()
  const { items } = useKeepingStore()
  const { currentUser } = useUserStore()
  const { monthlyBudget, deepseekApiKey, deepseekModel } = useAppSettingsStore()

  const [importMode, setImportMode] = useState<'incremental' | 'overwrite'>('incremental')
  const [confirmUsername, setConfirmUsername] = useState('')
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importData, setImportData] = useState<any>(null)
  const [tips, setTips] = useState('')

  const showTip = (msg: string) => {
    setTips(msg)
    setTimeout(() => setTips(''), 2500)
  }

  // ========== 导出 Excel ==========
  const exportExcel = async () => {
    try {
      const wsData = [
        ['ID', '类型', '金额', '币种', '标签', '日期', '备注', '地址名称', '地址详情'],
        ...items.map(item => [
          item.id,
          item.type === 'in' ? '收入' : '支出',
          item.count,
          item.countType,
          (item.tags || []).map(t => t.name).join('、'),
          new Date(item.date).toLocaleString(),
          item.note || '',
          item.address?.name || '',
          item.address?.address || '',
        ]),
      ]
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(wsData)
      XLSX.utils.book_append_sheet(wb, ws, '账单数据')
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' })

      const filePath = `${RNFS.DocumentDirectoryPath}/账单导出.xlsx`
      await RNFS.writeFile(filePath, wbout, 'base64')
      await Share.open({
        url: `file://${filePath}`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      showTip('Excel 导出成功')
    } catch (error) {
      logging.error('[导出] Excel 导出失败:', error)
      showTip('导出失败')
    }
  }

  // ========== 导出 ZIP ==========
  const exportZip = async () => {
    try {
      const zip = new JSZip()
      // 1. 账单数据 JSON
      const exportData = { items, timestamp: Date.now(), version: '1.0' }
      zip.file('data.json', JSON.stringify(exportData, null, 2))

      // 2. 用户配置 JSON
      const config = { monthlyBudget, deepseekApiKey, deepseekModel }
      zip.file('config.json', JSON.stringify(config, null, 2))

      // 3. 图片文件
      const imageItems = items.filter(item => item.image && item.image.startsWith('file://'))
      for (const item of imageItems) {
        try {
          const srcPath = item.image.replace('file://', '')
          const exists = await RNFS.exists(srcPath)
          if (exists) {
            const fileName = `images/${item.id}.jpg`
            await RNFS.copyFile(srcPath, `${RNFS.CachesDirectoryPath}/${item.id}.jpg`)
            const imgData = await RNFS.readFile(`${RNFS.CachesDirectoryPath}/${item.id}.jpg`, 'base64')
            zip.file(fileName, imgData, { base64: true })
          }
        } catch (e) {
          logging.warn('[导出] 图片复制失败:', e)
        }
      }

      // 4. 生成 ZIP 并分享
      const zipBase64 = await zip.generateAsync({ type: 'base64' })
      const zipPath = `${RNFS.DocumentDirectoryPath}/账单备份.zip`
      await RNFS.writeFile(zipPath, zipBase64, 'base64')
      await Share.open({ url: `file://${zipPath}`, type: 'application/zip' })
      showTip('ZIP 导出成功')
    } catch (error) {
      logging.error('[导出] ZIP 导出失败:', error)
      showTip('导出失败')
    }
  }

  // ========== 导入 ZIP ==========
  const importZip = async () => {
    try {
      const result = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.zip] })
      if (!result.uri) return

      // 读取 ZIP 文件
      const fileData = await RNFS.readFile(result.uri.replace('file://', ''), 'base64')
      const zip = await JSZip.loadAsync(fileData, { base64: true })

      // 解析 data.json
      const dataFile = zip.file('data.json')
      if (!dataFile) {
        showTip('ZIP 中未找到数据文件')
        return
      }
      const data = JSON.parse(await dataFile.async('text'))
      setImportData({ ...data, zip })
      setShowImportDialog(true)
    } catch (error) {
      logging.error('[导入] 读取 ZIP 失败:', error)
      showTip('文件读取失败')
    }
  }

  const confirmImport = async () => {
    if (!importData) return
    if (!confirmUsername.trim()) {
      showTip('请输入当前用户名确认')
      return
    }
    if (confirmUsername.trim() !== currentUser?.username) {
      showTip('用户名不匹配')
      return
    }

    try {
      const { add, clearItems } = useKeepingStore.getState()
      const { items: newItems } = importData

      if (importMode === 'overwrite') {
        clearItems()
      }
      for (const item of newItems) {
        add(item)
      }

      // 恢复图片文件
      if (importData.zip) {
        const imageEntries = importData.zip.folder('images') || {}
        for (const [name, entry] of Object.entries(imageEntries)) {
          try {
            const imgData = await (entry as any).async('base64')
            const destPath = `${RNFS.DocumentDirectoryPath}/${name}`
            await RNFS.writeFile(destPath, imgData, 'base64')
          } catch (e) {
            logging.warn('[导入] 图片恢复失败:', e)
          }
        }
      }

      setShowImportDialog(false)
      setImportData(null)
      setConfirmUsername('')
      showTip(`导入成功，共 ${newItems.length} 条记录`)
    } catch (error) {
      logging.error('[导入] 导入失败:', error)
      showTip('导入失败')
    }
  }

  return (
    <View style={[style.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={style.content}>
        {/* 导出区域 */}
        <View style={[style.card, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[style.cardTitle, { color: theme.colors.onSurfaceVariant }]}>导出数据</Text>
          <Text style={[style.desc, { color: theme.colors.onSurfaceVariant }]}>共 {items.length} 条记录</Text>
          <Button icon="file-document-outline" mode="contained" onPress={exportExcel} style={style.btn}>
            导出 Excel
          </Button>
          <Button icon="folder-zip-outline" mode="contained-tonal" onPress={exportZip} style={style.btn}>
            导出 ZIP（含图片）
          </Button>
        </View>

        {/* 导入区域 */}
        <View style={[style.card, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[style.cardTitle, { color: theme.colors.onSurfaceVariant }]}>导入数据</Text>
          <Text style={[style.desc, { color: theme.colors.onSurfaceVariant }]}>从 ZIP 备份文件导入账单数据</Text>
          <Button icon="file-import-outline" mode="contained-tonal" onPress={importZip} style={style.btn}>
            选择 ZIP 文件
          </Button>
        </View>
      </ScrollView>

      {/* 导入确认对话框 */}
      <Modal
        visible={showImportDialog}
        onCancel={() => {
          setShowImportDialog(false)
          setImportData(null)
          setConfirmUsername('')
        }}
        onAccess={confirmImport}
        title="确认导入"
        content={
          <View>
            <Text style={{ marginBottom: 12 }}>共 {importData?.items?.length || 0} 条记录</Text>
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>导入模式</Text>
            <RadioButton.Group onValueChange={v => setImportMode(v as any)} value={importMode}>
              <RadioButton.Item label="增量导入（合并到现有数据）" value="incremental" />
              <RadioButton.Item label="覆盖导入（清除旧数据）" value="overwrite" />
            </RadioButton.Group>
            <TextInput
              mode="outlined"
              placeholder="请输入当前用户名确认导入"
              value={confirmUsername}
              onChangeText={setConfirmUsername}
              style={{ marginTop: 12, borderRadius: 12 }}
              outlineStyle={{ borderRadius: 12 }}
            />
          </View>
        }
      />

      {/* 提示 */}
      {tips ? (
        <View style={[style.toast, { backgroundColor: theme.colors.inverseSurface }]}>
          <Text style={{ color: theme.colors.inverseOnSurface }}>{tips}</Text>
        </View>
      ) : null}
    </View>
  )
}

const style = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: { borderRadius: 12, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  desc: { fontSize: 12, marginBottom: 12 },
  btn: { borderRadius: 12, marginTop: 8 },
  toast: { position: 'absolute', bottom: 40, left: 20, right: 20, padding: 12, borderRadius: 8, alignItems: 'center' },
})

export default DataManagement

import React from 'react'
import { View, StyleSheet } from 'react-native'
import SegmentedControl from '~components/SegmentedControl'

interface ModelSelectorProps {
  selectedModel: string
  onSelect: (model: string) => void
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onSelect }) => {
  const models = [
    { id: 'deepseek-v4-flash', name: 'flash' },
    { id: 'deepseek-v4-pro', name: 'pro' },
  ]

  const selectedIndex = models.findIndex(m => m.id === selectedModel)

  return (
    <View style={styles.container}>
      <SegmentedControl
        options={models.map(m => m.name)}
        activeIndex={selectedIndex >= 0 ? selectedIndex : 0}
        onChange={(index) => onSelect(models[index].id)}
        style={styles.control}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  control: {
    maxWidth: 160,
  },
})

export default ModelSelector

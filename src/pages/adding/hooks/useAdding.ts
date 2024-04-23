import { useState } from 'react'

import { OutTypes } from 'consts/Data'
import { useKeepingStore } from 'hooks/useStore'

export const useAdding = () => {
  const [count, setCount] = useState('')
  const [chipS, setChipS] = useState<'in' | 'out'>('out')
  const [countTypeIndex, setCountTypeIndex] = useState(0)
  const [outTypes, setOutTypes] = useState<OutType[]>(OutTypes)
  const [outTypePicked, setOutTypePicked] = useState<OutType[]>([])

  const { add } = useKeepingStore()

  const action = {
    add: (item: KeepingItem) => {
      add({
        ...item,
        isChecked: false,
      })
    },
    pickOutType: (item: OutType) => {
      if (item.isChecked) {
        setOutTypePicked(prev => [...prev, item])
      } else {
        setOutTypePicked(prev => prev.filter(chip => chip.id !== item.id))
      }
    },
  }

  return {
    count,
    setCount,
    chipS,
    setChipS,
    countTypeIndex,
    setCountTypeIndex,
    outTypes,
    outTypePicked,
    action,
  }
}

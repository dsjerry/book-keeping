import { useState, useEffect } from 'react'

import { useKeepingStore } from 'hooks/useStore'
import { OutTypes } from 'consts/Data'

export const useAdding = () => {
  const [count, setCount] = useState('')
  const [chipS, setChipS] = useState<'in' | 'out'>('out')
  const [countTypeIndex, setCountTypeIndex] = useState(0)
  const [outTypes, setOutTypes] = useState<OutType[]>(OutTypes)
  const [outTypePicked, setOutTypePicked] = useState<OutType[]>([])

  const { add } = useKeepingStore()

  const action = {
    add: (item: KeepingItem) => {
      console.log(item)

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
    setOutTypes,
    outTypePicked,
    setOutTypePicked,
    action,
  }
}

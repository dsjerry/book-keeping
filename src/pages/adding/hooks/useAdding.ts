import { useState } from 'react'

import { useKeepingStore } from '~store/keepingStore'
import { OutTypes } from '~consts/Data'

export const useAdding = () => {
  const [countTypeIndex, setCountTypeIndex] = useState(0)
  const [outTypes, setOutTypes] = useState<OutType[]>(OutTypes)
  const [form, setForm] = useState<KeepingItem>({
    id: Date.now().toString(),
    count: '',
    type: 'out',
    countType: '人民币',
    tags: [],
    isChecked: false,
    note: '',
    image: '',
    no: 0,
    date: Date.now(),
  })

  const { add, update } = useKeepingStore()

  const action = {
    add: (item: KeepingItem) => {
      add({
        ...item,
        isChecked: false,
      })
    },
    edit: (item: KeepingItem) => {
      setForm(prev => ({ ...prev, ...item }))
    },
    update: (item: KeepingItem) => {
      update(item)
    },
  }

  return {
    countTypeIndex,
    setCountTypeIndex,
    outTypes,
    setOutTypes,
    form,
    setForm,
    action,
  }
}

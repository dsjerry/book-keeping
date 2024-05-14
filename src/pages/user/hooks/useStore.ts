import { CommonSlice } from '~store/keepingStore'

interface Store {
  keeping: CommonSlice
  user: UserStore
}

export const useStore = ({ user, keeping }: Store) => {
  const editProfile = () => {}
  const outTypeManage = () => {}
  const dateManage = () => {}

  return { editProfile, outTypeManage, dateManage }
}

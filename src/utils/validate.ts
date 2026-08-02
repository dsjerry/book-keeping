export const checkUsername = (username: string): string | null => {
  const value = username.trim()
  return value.length < 6 ? null : value
}

export const checkPassword = (password: string): string | null => {
  const value = password.trim()
  return value.length < 6 ? null : value
}

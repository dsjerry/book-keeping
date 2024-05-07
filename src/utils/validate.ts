export const checkUsername = (username: string) => {
  const value = username.trim()
  if (value.length < 6) {
    return false
  } else {
    return value
  }
}

export const checkPassword = (password: string) => {
  const value = password.trim()
  if (value.length < 6) {
    return false
  } else {
    return value
  }
}

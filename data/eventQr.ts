export const createEventCode = () => {
  const nums = Math.floor(1000 + Math.random() * 9000)
  const token = Array.from({ length: 20 }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 36))
  ).join('')
  return `${nums}+${token}`
}

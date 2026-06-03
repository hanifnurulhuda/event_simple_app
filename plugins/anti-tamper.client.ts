export default defineNuxtPlugin(() => {
  if (window.location.pathname.startsWith('/admin')) return

  document.addEventListener('contextmenu', (e) => e.preventDefault())

  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
      (e.ctrlKey && e.key === 'u')
    ) {
      e.preventDefault()
    }
  })
})

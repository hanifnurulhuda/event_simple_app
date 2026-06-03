export default defineEventHandler(async (event) => {
  const type = getRouterParam(event, 'type')
  if (type !== 'checkin' && type !== 'survey') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid type' })
  }

  setHeader(event, 'Cache-Control', 'public, max-age=3, stale-while-revalidate=15')
  return await getCurrentEventQrCode(type)
})

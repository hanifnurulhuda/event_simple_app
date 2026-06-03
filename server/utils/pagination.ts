export const getPagination = (query: Record<string, unknown>) => {
  const rawLimit = Number(query.limit || 50)
  const rawPage = Number(query.page || 1)
  const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : 50, 1), 1000)
  const page = Math.max(Number.isFinite(rawPage) ? rawPage : 1, 1)
  return { limit, page, offset: (page - 1) * limit }
}

export const paginatedResponse = <T>(data: T[], total: number, page: number, limit: number) => ({
  data,
  total,
  page,
  limit,
  totalPages: Math.max(Math.ceil(total / limit), 1)
})

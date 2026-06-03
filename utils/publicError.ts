type PublicErrorOptions = {
  fallback: string
  byStatus?: Record<number, string>
}

export const getPublicErrorMessage = (error: unknown, options: PublicErrorOptions) => {
  const detail = error as {
    status?: unknown
    statusCode?: unknown
    response?: { status?: unknown }
    data?: { statusCode?: unknown }
  }
  const statusCode = typeof error === 'object' && error !== null
    ? Number(detail.statusCode || detail.status || detail.response?.status || detail.data?.statusCode || 0)
    : 0

  if (statusCode && options.byStatus?.[statusCode]) return options.byStatus[statusCode]
  return options.fallback
}

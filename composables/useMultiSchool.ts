export const useMultiSchool = () => {
  const config = useRuntimeConfig()
  const schools = (config.public.schoolNames || '').split(',').map(s => s.trim()).filter(Boolean)
  return schools.length > 1
}

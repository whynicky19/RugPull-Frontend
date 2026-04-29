export const useApi = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase
  return {
    async post(path: string, body: any) {
      const res = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    async get(path: string) {
      const res = await fetch(`${base}${path}`)
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    }
  }
}

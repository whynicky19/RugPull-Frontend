import { useApi } from '~/services/api'  // ← добавь эту строку

export const useAnalyze = () => {
  const api = useApi()
  const result = ref<any>(null)
  const loading = ref(false)
  const error = ref('')

  const analyze = async (tokenAddress: string) => {
    loading.value = true
    error.value = ''
    result.value = null
    try {
      result.value = await api.post(`/analyze/?token_address=${tokenAddress}`, {})
    } catch (e: any) {
      error.value = e.message || 'Ошибка анализа'
    } finally {
      loading.value = false
    }
  }

  return { result, loading, error, analyze }
}
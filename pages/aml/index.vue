<template>
  <div class="pg">
    <section class="hero">
      <div class="hero-chip">AML · Anti-Money Laundering</div>
      <h1 class="hero-title">Проверка кошелька <br/><span class="hero-accent">на отмывание денег</span></h1>
      <p class="hero-desc">Анализируем паттерны транзакций, связи с миксерами<br/>и подозрительную активность за 15 секунд</p>
    </section>

    <section class="scan-section">
      <div class="scan-card">
        <div class="scan-card-head">
          <div class="scan-card-title">АДРЕС КОШЕЛЬКА</div>
          <div class="scan-network">ETH Mainnet</div>
        </div>
        <div class="scan-row">
          <input v-model="addr" class="input" placeholder="0x..." @keydown.enter="run" />
          <button class="btn btn-mint" :disabled="loading || !addr" @click="run">
            <span v-if="loading" class="btn-loading"><span class="spinner"/>Проверяю...</span>
            <span v-else>Проверить →</span>
          </button>
        </div>
        <div v-if="error" class="scan-error">{{ error }}</div>
      </div>
    </section>

    <section v-if="result" class="results" style="animation: fade-up 0.5s ease">
      <div class="results-grid">
        <div class="score-card">
          <div class="aml-score-wrap">
            <div class="aml-score-circle" :style="{ '--score-color': riskColor }">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg4)" stroke-width="8"/>
                <circle cx="60" cy="60" r="52" fill="none" :stroke="riskColor" stroke-width="8"
                  stroke-linecap="round" stroke-dasharray="326.7"
                  :stroke-dashoffset="326.7 * (1 - result.risk_score / 100)"
                  transform="rotate(-90 60 60)" style="transition: stroke-dashoffset 1s ease"/>
              </svg>
              <div class="aml-score-inner">
                <span class="aml-score-num">{{ result.risk_score }}</span>
                <span class="aml-score-max">/ 100</span>
              </div>
            </div>
          </div>
          <div class="risk-badge" :style="{ color: riskColor, borderColor: riskColor }">
            {{ result.risk_level }}
          </div>
          <div class="aml-stats">
            <div class="aml-stat">
              <span class="aml-stat-label">Транзакций</span>
              <span class="aml-stat-val">{{ result.tx_count }}</span>
            </div>
            <div class="aml-stat">
              <span class="aml-stat-label">Объём (ETH)</span>
              <span class="aml-stat-val">{{ result.total_volume }}</span>
            </div>
          </div>
        </div>

        <div class="detail-card">
          <div class="flags-block">
            <div class="flags-title">ОБНАРУЖЕННЫЕ УГРОЗЫ</div>
            <div v-for="(flag, i) in result.flags" :key="i" class="flag-row">
              <span class="flag-dot" :style="{ background: riskColor }"/>
              <span class="flag-text">{{ flag }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="token-row">
        <span class="token-lbl">КОШЕЛЁК</span>
        <span class="token-addr">{{ result.wallet_address }}</span>
      </div>
    </section>

    <footer class="ftr">
      <span class="ftr-logo">RugScan</span>
      <span class="ftr-sep">·</span>
      <span class="ftr-text">AML-проверка носит информационный характер.</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const addr = ref('')
const loading = ref(false)
const error = ref('')
const result = ref<any>(null)

const riskColor = computed(() => {
  if (!result.value) return '#4dffc3'
  const s = result.value.risk_score
  if (s >= 75) return '#ff5c8a'
  if (s >= 50) return '#ff8a5c'
  if (s >= 25) return '#ffcc44'
  return '#4dffc3'
})

async function run() {
  if (!addr.value) return

  if (!/^0x[a-fA-F0-9]{40}$/.test(addr.value.trim())) {
    error.value = 'Введите корректный адрес кошелька (0x...)'
    return
  }

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const token = localStorage.getItem('token')
    const headers: any = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${config.public.apiBase}/aml/?wallet_address=${addr.value.trim()}`, {
      method: 'POST',
      headers,
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.detail || 'Ошибка')
    }

    result.value = await res.json()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.pg { min-height: 100vh; display: flex; flex-direction: column; padding: 0 32px; position: relative; z-index: 1; max-width: 900px; margin: 0 auto; }

.hero { padding: 60px 0 36px; }
.hero-chip { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 12px; color: var(--mint); background: rgba(77,255,195,0.08); border: 1px solid var(--border2); padding: 6px 14px; border-radius: 100px; margin-bottom: 24px; }
.hero-title { font-family: var(--font-display); font-size: clamp(36px, 5vw, 60px); font-weight: 800; line-height: 1.1; color: var(--text1); margin-bottom: 16px; }
.hero-accent { color: var(--mint); }
.hero-desc { font-size: 16px; color: var(--text2); line-height: 1.7; }

.scan-section { padding-bottom: 40px; }
.scan-card { background: var(--bg2); border: 1px solid var(--border2); border-radius: var(--r-xl); padding: 24px; }
.scan-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.scan-card-title { font-family: var(--font-mono); font-size: 11px; color: var(--text3); letter-spacing: 0.15em; }
.scan-network { font-family: var(--font-mono); font-size: 11px; color: var(--mint); background: rgba(77,255,195,0.08); border: 1px solid var(--border); padding: 3px 10px; border-radius: 100px; }
.scan-row { display: flex; gap: 12px; }
.scan-error { font-family: var(--font-mono); font-size: 13px; color: var(--danger); margin-top: 10px; }

.results { padding-bottom: 60px; display: flex; flex-direction: column; gap: 20px; }
.results-grid { display: grid; grid-template-columns: 280px 1fr; gap: 20px; }
.score-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-xl); padding: 28px 20px; display: flex; flex-direction: column; align-items: center; gap: 16px; }

.aml-score-wrap { width: 140px; height: 140px; }
.aml-score-circle { position: relative; width: 140px; height: 140px; }
.aml-score-circle svg { width: 100%; height: 100%; }
.aml-score-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.aml-score-num { font-family: var(--font-display); font-size: 36px; font-weight: 800; color: var(--text1); }
.aml-score-max { font-family: var(--font-mono); font-size: 11px; color: var(--text3); }

.risk-badge { font-family: var(--font-display); font-size: 13px; font-weight: 700; padding: 6px 16px; border: 1px solid; border-radius: 100px; letter-spacing: 0.1em; }

.aml-stats { width: 100%; display: flex; gap: 8px; }
.aml-stat { flex: 1; background: var(--bg3); border-radius: var(--r-md); padding: 10px; text-align: center; }
.aml-stat-label { display: block; font-family: var(--font-mono); font-size: 10px; color: var(--text3); margin-bottom: 4px; }
.aml-stat-val { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text1); }

.detail-card { display: flex; flex-direction: column; gap: 16px; }
.flags-block { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-xl); padding: 24px; display: flex; flex-direction: column; gap: 12px; }
.flags-title { font-family: var(--font-mono); font-size: 10px; color: var(--text3); letter-spacing: 0.2em; margin-bottom: 4px; }
.flag-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px; background: var(--bg3); border-radius: var(--r-md); }
.flag-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
.flag-text { font-family: var(--font-mono); font-size: 13px; color: var(--text2); line-height: 1.5; }

.token-row { display: flex; align-items: center; gap: 12px; padding: 12px 18px; background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-md); }
.token-lbl { font-family: var(--font-mono); font-size: 10px; color: var(--text3); letter-spacing: 0.15em; flex-shrink: 0; }
.token-addr { font-family: var(--font-mono); font-size: 13px; color: var(--blue-light); word-break: break-all; }

.ftr { margin-top: auto; padding: 20px 0; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
.ftr-logo { font-family: var(--font-display); font-size: 14px; font-weight: 800; color: var(--mint); }
.ftr-sep { color: var(--text3); }
.ftr-text { font-family: var(--font-mono); font-size: 12px; color: var(--text3); }

.btn-loading { display: flex; align-items: center; gap: 8px; }
.spinner { width: 14px; height: 14px; border: 2px solid rgba(5,13,26,0.3); border-top-color: #050d1a; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) {
  .results-grid { grid-template-columns: 1fr; }
  .scan-row { flex-direction: column; }
}
</style>
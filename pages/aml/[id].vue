<template>
  <div class="pg">

    <div v-if="loading" class="state-box">
      <div class="state-spinner"/>
      <span>Загрузка результата...</span>
    </div>

    <div v-else-if="error" class="state-box state-box--error">
      <span class="state-icon">!</span>
      <span>{{ error }}</span>
      <NuxtLink to="/history" class="btn btn-ghost btn-sm">← Назад</NuxtLink>
    </div>

    <template v-else-if="item">

      <div class="detail-header">
        <NuxtLink to="/history" class="back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          История
        </NuxtLink>
        <div class="detail-eyebrow">
          <div class="detail-eye-dot"/>
          AML WALLET REPORT
        </div>
        <div class="detail-addr">
          <span class="detail-addr-lbl">WALLET</span>
          <span class="detail-addr-val">{{ item.wallet_address }}</span>
          <button class="copy-btn" @click="copy(item.wallet_address)" :title="copied ? 'Скопировано!' : 'Копировать'">
            <svg v-if="!copied" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        </div>
        <div class="detail-meta">
          <span class="detail-date">{{ fmt(item.created_at) }}</span>
          <span class="detail-sep">·</span>
          <span class="detail-type detail-type--wallet">AML проверка кошелька</span>
        </div>
      </div>

      <!-- Score + stats -->
      <div class="score-row">
        <div class="score-main">
          <div class="score-num" :style="{ color: riskColor }">{{ item.risk_score }}</div>
          <div class="score-max">/ 100</div>
          <div class="score-label" :style="{ color: riskColor, borderColor: riskColor + '40', background: riskColor + '12' }">
            <span class="score-dot" :style="{ background: riskColor }"/>
            {{ item.risk_level }}
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-label">ТРАНЗАКЦИЙ</div>
            <div class="stat-card-val">{{ item.tx_count ?? '—' }}</div>
            <div class="stat-card-sub">обнаружено</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-label">ОБЪЁМ</div>
            <div class="stat-card-val">{{ item.total_volume ?? '—' }}</div>
            <div class="stat-card-sub">ETH</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-label">УГРОЗ</div>
            <div class="stat-card-val" :style="{ color: parsedFlags.length ? riskColor : 'var(--green)' }">{{ parsedFlags.length }}</div>
            <div class="stat-card-sub">индикаторов</div>
          </div>
        </div>
      </div>

      <!-- Verdict -->
      <div class="section">
        <div class="section-label">// ЗАКЛЮЧЕНИЕ</div>
        <div class="verdict-box">
          <div class="verdict-toolbar">
            <div class="vd-dots"><span class="vd-dot vd-r"/><span class="vd-dot vd-o"/><span class="vd-dot vd-g"/></div>
            <span class="vd-filename">aml-report.txt</span>
            <span class="vd-time">{{ fmt(item.created_at) }}</span>
          </div>
          <div class="verdict-body">
            <div class="verdict-lines">
              <span v-for="n in verdictLines" :key="n">{{ n }}</span>
            </div>
            <p class="verdict-text">{{ item.verdict }}</p>
          </div>
        </div>
      </div>

      <!-- Flags -->
      <div class="section">
        <div class="section-label-row">
          <span class="section-label" style="margin-bottom:0">// ИНДИКАТОРЫ ПОДОЗРИТЕЛЬНОЙ АКТИВНОСТИ</span>
          <span class="flags-count" :class="parsedFlags.length ? 'flags-count--danger' : 'flags-count--safe'">
            {{ parsedFlags.length }} обнаружено
          </span>
        </div>
        <div style="margin-top:10px">
          <div v-if="!parsedFlags.length" class="flags-empty">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Подозрительной активности не обнаружено
          </div>
          <div v-else class="flags-list">
            <div v-for="(flag, i) in parsedFlags" :key="i" class="flag-item" :style="{ animationDelay: i * 0.06 + 's' }">
              <div class="flag-num">{{ String(i + 1).padStart(2, '0') }}</div>
              <div class="flag-bar"/>
              <span class="flag-text">{{ flag }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- AML explanation -->
      <div class="section">
        <div class="section-label">// ЧТО ОЗНАЧАЮТ РЕЗУЛЬТАТЫ</div>
        <div class="explain-grid">
          <div class="explain-card">
            <div class="explain-card-icon" style="color: var(--green)">0–24</div>
            <div class="explain-card-title">НИЗКИЙ РИСК</div>
            <div class="explain-card-text">Кошелёк не показывает признаков отмывания. Транзакции в норме.</div>
          </div>
          <div class="explain-card">
            <div class="explain-card-icon" style="color: var(--yellow)">25–49</div>
            <div class="explain-card-title">СРЕДНИЙ РИСК</div>
            <div class="explain-card-text">Обнаружены некоторые аномалии. Рекомендуется дополнительная проверка.</div>
          </div>
          <div class="explain-card">
            <div class="explain-card-icon" style="color: var(--orange)">50–74</div>
            <div class="explain-card-title">ВЫСОКИЙ РИСК</div>
            <div class="explain-card-text">Выявлены серьёзные паттерны подозрительной активности.</div>
          </div>
          <div class="explain-card explain-card--active">
            <div class="explain-card-icon" style="color: var(--red)">75–100</div>
            <div class="explain-card-title">КРИТИЧЕСКИЙ</div>
            <div class="explain-card-text">Высокая вероятность отмывания денег или использования миксеров.</div>
          </div>
        </div>
      </div>

      <div class="actions">
        <NuxtLink to="/history" class="btn btn-ghost">← История</NuxtLink>
        <NuxtLink to="/aml" class="btn btn-mint">Новая проверка →</NuxtLink>
      </div>

    </template>

    <footer class="ftr">
      <span class="ftr-logo">RUGSCAN</span>
      <span class="ftr-sep">//</span>
      <span class="ftr-text">AML-проверка носит информационный характер.</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()

const item = ref<any>(null)
const loading = ref(true)
const error = ref('')
const copied = ref(false)

onMounted(async () => {
  try {
    const res = await fetch(`${config.public.apiBase}/aml/${route.params.id}`)
    if (!res.ok) throw new Error('AML анализ не найден')
    item.value = await res.json()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const parsedFlags = computed(() => {
  if (!item.value?.flags) return []
  try { return JSON.parse(item.value.flags) }
  catch { return [] }
})

const verdictLines = computed(() => {
  if (!item.value?.verdict) return 3
  return Math.max(3, Math.ceil(item.value.verdict.length / 65))
})

const riskColor = computed(() => {
  if (!item.value) return '#00e676'
  const s = item.value.risk_score
  if (s >= 75) return '#ff3d3d'
  if (s >= 50) return '#ff7a00'
  if (s >= 25) return '#ffd600'
  return '#00e676'
})

const fmt = (d: string) => new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

async function copy(text: string) {
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<style scoped>
.pg { min-height: 100vh; display: flex; flex-direction: column; padding: 0 36px 40px; max-width: 960px; margin: 0 auto; }

.state-box { display: flex; align-items: center; gap: 12px; font-family: var(--font-mono); font-size: 13px; color: var(--text3); padding: 60px 0; }
.state-box--error { color: var(--red); }
.state-spinner { width: 16px; height: 16px; border: 2px solid var(--border2); border-top-color: var(--red); border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }
.state-icon { width: 22px; height: 22px; border: 1px solid var(--red); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }

.detail-header { padding: 40px 0 28px; border-bottom: 1px solid var(--border); margin-bottom: 28px; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; color: var(--text3); text-decoration: none; margin-bottom: 20px; transition: color 0.15s; }
.back-btn:hover { color: var(--red); }
.detail-eyebrow { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.2em; color: #b97aff; margin-bottom: 12px; }
.detail-eye-dot { width: 5px; height: 5px; border-radius: 50%; background: #b97aff; }
.detail-addr { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.detail-addr-lbl { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.15em; color: var(--text3); flex-shrink: 0; }
.detail-addr-val { font-family: var(--font-mono); font-size: 14px; color: var(--text1); word-break: break-all; }
.copy-btn { background: var(--bg3); border: 1px solid var(--border); border-radius: 4px; padding: 4px 6px; cursor: pointer; color: var(--text3); transition: all 0.15s; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.copy-btn:hover { border-color: var(--red); color: var(--red); }
.detail-meta { display: flex; align-items: center; gap: 8px; }
.detail-date { font-family: var(--font-mono); font-size: 11px; color: var(--text3); }
.detail-sep { color: var(--text3); }
.detail-type { font-family: var(--font-mono); font-size: 11px; padding: 2px 8px; border-radius: 3px; }
.detail-type--wallet { color: #b97aff; background: rgba(185,122,255,0.08); border: 1px solid rgba(185,122,255,0.15); }

.score-row { display: grid; grid-template-columns: 200px 1fr; gap: 20px; margin-bottom: 24px; background: var(--bg2); border: 1px solid var(--border2); border-radius: var(--r-md); padding: 24px; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); }
.score-main { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border-right: 1px solid var(--border); padding-right: 20px; }
.score-num { font-family: var(--font-display); font-size: 80px; font-weight: 900; line-height: 1; letter-spacing: -0.02em; }
.score-max { font-family: var(--font-mono); font-size: 11px; color: var(--text3); }
.score-label { display: flex; align-items: center; gap: 6px; font-family: var(--font-display); font-size: 11px; font-weight: 700; letter-spacing: 0.12em; padding: 5px 12px; border-radius: 3px; border: 1px solid; }
.score-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; align-content: center; }
.stat-card { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 14px; }
.stat-card-label { font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.15em; color: var(--text3); margin-bottom: 6px; }
.stat-card-val { font-family: var(--font-display); font-size: 28px; font-weight: 900; color: var(--text1); line-height: 1; margin-bottom: 4px; }
.stat-card-sub { font-family: var(--font-mono); font-size: 9px; color: var(--text3); }

.section { margin-bottom: 20px; }
.section-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.2em; color: var(--text3); margin-bottom: 10px; display: block; }
.section-label-row { display: flex; align-items: center; justify-content: space-between; }
.flags-count { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; padding: 3px 8px; border-radius: 3px; }
.flags-count--danger { background: rgba(255,61,61,0.1); color: var(--red); border: 1px solid rgba(255,61,61,0.2); }
.flags-count--safe { background: rgba(0,230,118,0.08); color: var(--green); border: 1px solid rgba(0,230,118,0.15); }

.verdict-box { background: var(--bg3); border: 1px solid var(--border2); border-radius: var(--r-md); overflow: hidden; }
.verdict-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-bottom: 1px solid var(--border); background: var(--bg4); }
.vd-dots { display: flex; gap: 5px; }
.vd-dot { width: 9px; height: 9px; border-radius: 50%; }
.vd-r { background: var(--red); } .vd-o { background: var(--orange); } .vd-g { background: var(--green); }
.vd-filename { font-family: var(--font-mono); font-size: 10px; color: var(--text2); }
.vd-time { margin-left: auto; font-family: var(--font-mono); font-size: 9px; color: var(--text3); }
.verdict-body { display: flex; gap: 14px; padding: 16px; }
.verdict-lines { display: flex; flex-direction: column; font-family: var(--font-mono); font-size: 11px; color: var(--text3); line-height: 1.75; user-select: none; min-width: 18px; text-align: right; }
.verdict-text { font-family: var(--font-mono); font-size: 13px; color: var(--text1); line-height: 1.75; flex: 1; }

.flags-empty { display: flex; align-items: center; gap: 10px; font-family: var(--font-mono); font-size: 12px; color: var(--green); padding: 14px; background: rgba(0,230,118,0.04); border: 1px solid rgba(0,230,118,0.1); border-radius: var(--r-sm); }
.flags-list { display: flex; flex-direction: column; gap: 6px; }
.flag-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,61,61,0.04); border: 1px solid rgba(255,61,61,0.1); border-radius: var(--r-sm); animation: fade-up 0.3s ease both; }
.flag-num { font-family: var(--font-mono); font-size: 10px; color: var(--text3); flex-shrink: 0; width: 18px; }
.flag-bar { width: 2px; height: 22px; background: var(--red); opacity: 0.5; border-radius: 1px; flex-shrink: 0; }
.flag-text { font-family: var(--font-mono); font-size: 12px; color: var(--text2); line-height: 1.5; flex: 1; }

.explain-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.explain-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 14px; }
.explain-card-icon { font-family: var(--font-display); font-size: 22px; font-weight: 900; margin-bottom: 6px; }
.explain-card-title { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em; color: var(--text2); margin-bottom: 6px; }
.explain-card-text { font-family: var(--font-mono); font-size: 10px; color: var(--text3); line-height: 1.5; }

.actions { display: flex; gap: 12px; margin-top: 8px; }
.ftr { margin-top: auto; padding: 20px 0; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
.ftr-logo { font-family: var(--font-display); font-size: 13px; font-weight: 900; color: var(--red); letter-spacing: 0.1em; }
.ftr-sep { color: var(--text3); font-family: var(--font-mono); font-size: 10px; }
.ftr-text { font-family: var(--font-mono); font-size: 10px; color: var(--text3); }

@media (max-width: 768px) {
  .score-row { grid-template-columns: 1fr; }
  .score-main { border-right: none; border-bottom: 1px solid var(--border); padding-right: 0; padding-bottom: 20px; }
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
  .explain-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
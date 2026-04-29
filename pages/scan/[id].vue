<template>
  <div class="pg">

    <!-- Loading -->
    <div v-if="loading" class="state-box">
      <div class="state-spinner"/>
      <span>Загрузка результата...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-box state-box--error">
      <span class="state-icon">!</span>
      <span>{{ error }}</span>
      <NuxtLink to="/history" class="btn btn-ghost btn-sm">← Назад</NuxtLink>
    </div>

    <!-- Result -->
    <template v-else-if="item">

      <!-- Header -->
      <div class="detail-header">
        <NuxtLink to="/history" class="back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          История
        </NuxtLink>
        <div class="detail-eyebrow">
          <div class="detail-eye-dot"/>
          TOKEN SCAN REPORT
        </div>
        <div class="detail-addr">
          <span class="detail-addr-lbl">CONTRACT</span>
          <span class="detail-addr-val">{{ item.token_address }}</span>
          <button class="copy-btn" @click="copy(item.token_address)" :title="copied ? 'Скопировано!' : 'Копировать'">
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
          <span class="detail-type">Сканирование токена</span>
        </div>
      </div>

      <!-- Score row -->
      <div class="score-row">
        <div class="score-main">
          <div class="score-num" :style="{ color: scoreColor(item.risk_score) }">{{ item.risk_score }}</div>
          <div class="score-max">/ 100</div>
          <div class="score-label" :style="{ color: scoreColor(item.risk_score), borderColor: scoreColor(item.risk_score) + '40', background: scoreColor(item.risk_score) + '12' }">
            <span class="score-dot" :style="{ background: scoreColor(item.risk_score) }"/>
            {{ riskLabel(item.risk_score) }}
          </div>
        </div>

        <div class="score-breakdown">
          <div class="breakdown-title">// ДЕТАЛИЗАЦИЯ</div>
          <div class="bd-item">
            <div class="bd-item-head">
              <span class="bd-item-name">Контракт</span>
              <span class="bd-item-val" :style="{ color: scoreColor(item.contract_score) }">{{ item.contract_score }}</span>
            </div>
            <div class="bd-bar-bg">
              <div class="bd-bar" :style="{ width: item.contract_score + '%', background: scoreColor(item.contract_score) }"/>
            </div>
            <p class="bd-item-desc">Анализ исходного кода смарт-контракта на наличие опасных функций</p>
          </div>
          <div class="bd-item">
            <div class="bd-item-head">
              <span class="bd-item-name">On-chain</span>
              <span class="bd-item-val" :style="{ color: scoreColor(item.onchain_score) }">{{ item.onchain_score }}</span>
            </div>
            <div class="bd-bar-bg">
              <div class="bd-bar" :style="{ width: item.onchain_score + '%', background: scoreColor(item.onchain_score) }"/>
            </div>
            <p class="bd-item-desc">Распределение токенов, ликвидность, количество держателей</p>
          </div>
          <div class="bd-item">
            <div class="bd-item-head">
              <span class="bd-item-name">Соцсети</span>
              <span class="bd-item-val" :style="{ color: scoreColor(item.social_score) }">{{ item.social_score }}</span>
            </div>
            <div class="bd-bar-bg">
              <div class="bd-bar" :style="{ width: item.social_score + '%', background: scoreColor(item.social_score) }"/>
            </div>
            <p class="bd-item-desc">Упоминания в Telegram, активность сообщества</p>
          </div>
        </div>
      </div>

      <!-- AI Verdict -->
      <div class="section">
        <div class="section-label">// ВЕРДИКТ AI</div>
        <div class="verdict-box">
          <div class="verdict-toolbar">
            <div class="vd-dots"><span class="vd-dot vd-r"/><span class="vd-dot vd-o"/><span class="vd-dot vd-g"/></div>
            <span class="vd-filename">verdict.txt</span>
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
          <span class="section-label">// ОБНАРУЖЕННЫЕ УГРОЗЫ</span>
          <span class="flags-count" :class="parsedFlags.length ? 'flags-count--danger' : 'flags-count--safe'">
            {{ parsedFlags.length }} угроз
          </span>
        </div>

        <div v-if="!parsedFlags.length" class="flags-empty">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Угроз не обнаружено
        </div>

        <div v-else class="flags-list">
          <div v-for="(flag, i) in parsedFlags" :key="i" class="flag-item" :style="{ animationDelay: i * 0.06 + 's' }">
            <div class="flag-num">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="flag-bar"/>
            <span class="flag-text">{{ flag }}</span>
            <span class="flag-sev">HIGH</span>
          </div>
        </div>
      </div>

      <!-- Similar scam -->
      <div v-if="item.similar_scam" class="section">
        <div class="section-label">// ПОХОЖИЙ СКАМ</div>
        <div class="similar-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <span>{{ item.similar_scam }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <NuxtLink to="/history" class="btn btn-ghost">← История</NuxtLink>
        <button class="btn btn-mint" @click="rescan">Пересканировать →</button>
      </div>

    </template>

    <footer class="ftr">
      <span class="ftr-logo">RUGSCAN</span>
      <span class="ftr-sep">//</span>
      <span class="ftr-text">Не является финансовым советом. DYOR.</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const item = ref<any>(null)
const loading = ref(true)
const error = ref('')
const copied = ref(false)

onMounted(async () => {
  try {
    const id = route.params.id as string

    // Если передан адрес токена (0x...) — ищем по адресу
    // Если число — ищем по ID как раньше
    let url = ''
    if (/^0x[a-fA-F0-9]{40}$/i.test(id)) {
      url = `${config.public.apiBase}/analyze/by-address/${id}`
    } else {
      url = `${config.public.apiBase}/analyze/${id}`
    }

    const res = await fetch(url)
    if (!res.ok) throw new Error('Анализ не найден')
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

const scoreColor = (s: number) => s >= 70 ? '#ff3d3d' : s >= 40 ? '#ff7a00' : '#00e676'
const riskLabel = (s: number) => s >= 70 ? 'ВЫСОКИЙ РИСК' : s >= 40 ? 'СРЕДНИЙ РИСК' : 'НИЗКИЙ РИСК'
const fmt = (d: string) => new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

async function copy(text: string) {
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

function rescan() {
  if (item.value?.token_address) router.push(`/?token=${item.value.token_address}`)
}
</script>

<style scoped>
.pg { min-height: 100vh; display: flex; flex-direction: column; padding: 0 36px 40px; max-width: 960px; margin: 0 auto; }

/* State */
.state-box { display: flex; align-items: center; gap: 12px; font-family: var(--font-mono); font-size: 13px; color: var(--text3); padding: 60px 0; }
.state-box--error { color: var(--red); }
.state-spinner { width: 16px; height: 16px; border: 2px solid var(--border2); border-top-color: var(--red); border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }
.state-icon { width: 22px; height: 22px; border: 1px solid var(--red); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }

/* Header */
.detail-header { padding: 40px 0 28px; border-bottom: 1px solid var(--border); margin-bottom: 28px; }

.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em;
  color: var(--text3); text-decoration: none;
  margin-bottom: 20px; transition: color 0.15s;
}
.back-btn:hover { color: var(--red); }

.detail-eyebrow {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.2em;
  color: var(--red); margin-bottom: 12px;
}
.detail-eye-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--red); animation: pulse-red 2s infinite; }

.detail-addr {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 8px;
}
.detail-addr-lbl { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.15em; color: var(--text3); flex-shrink: 0; }
.detail-addr-val { font-family: var(--font-mono); font-size: 14px; color: var(--text1); word-break: break-all; }

.copy-btn {
  background: var(--bg3); border: 1px solid var(--border); border-radius: 4px;
  padding: 4px 6px; cursor: pointer; color: var(--text3);
  transition: all 0.15s; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.copy-btn:hover { border-color: var(--red); color: var(--red); }

.detail-meta { display: flex; align-items: center; gap: 8px; }
.detail-date { font-family: var(--font-mono); font-size: 11px; color: var(--text3); }
.detail-sep { color: var(--text3); }
.detail-type { font-family: var(--font-mono); font-size: 11px; color: #6aadff; background: rgba(106,173,255,0.08); border: 1px solid rgba(106,173,255,0.15); padding: 2px 8px; border-radius: 3px; }

/* Score row */
.score-row {
  display: grid; grid-template-columns: 200px 1fr; gap: 20px;
  margin-bottom: 24px;
  background: var(--bg2); border: 1px solid var(--border2);
  border-radius: var(--r-md); padding: 24px;
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
}

.score-main { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border-right: 1px solid var(--border); padding-right: 20px; }
.score-num { font-family: var(--font-display); font-size: 80px; font-weight: 900; line-height: 1; letter-spacing: -0.02em; }
.score-max { font-family: var(--font-mono); font-size: 11px; color: var(--text3); }
.score-label { display: flex; align-items: center; gap: 6px; font-family: var(--font-display); font-size: 11px; font-weight: 700; letter-spacing: 0.12em; padding: 5px 12px; border-radius: 3px; border: 1px solid; }
.score-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; animation: pulse-red 1.5s infinite; }

.score-breakdown { display: flex; flex-direction: column; gap: 16px; padding-left: 4px; }
.breakdown-title { font-family: var(--font-mono); font-size: 9px; color: var(--text3); letter-spacing: 0.2em; margin-bottom: 4px; }

.bd-item { display: flex; flex-direction: column; gap: 5px; }
.bd-item-head { display: flex; align-items: center; justify-content: space-between; }
.bd-item-name { font-family: var(--font-mono); font-size: 11px; color: var(--text2); text-transform: uppercase; letter-spacing: 0.05em; }
.bd-item-val { font-family: var(--font-display); font-size: 16px; font-weight: 800; }
.bd-bar-bg { height: 3px; background: var(--bg4); border-radius: 1px; overflow: hidden; }
.bd-bar { height: 100%; border-radius: 1px; transition: width 1s cubic-bezier(.4,0,.2,1); }
.bd-item-desc { font-family: var(--font-mono); font-size: 10px; color: var(--text3); line-height: 1.5; }

/* Sections */
.section { margin-bottom: 20px; }
.section-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.2em; color: var(--text3); margin-bottom: 10px; display: block; }
.section-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.flags-count { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; padding: 3px 8px; border-radius: 3px; }
.flags-count--danger { background: rgba(255,61,61,0.1); color: var(--red); border: 1px solid rgba(255,61,61,0.2); }
.flags-count--safe { background: rgba(0,230,118,0.08); color: var(--green); border: 1px solid rgba(0,230,118,0.15); }

/* Verdict */
.verdict-box { background: var(--bg3); border: 1px solid var(--border2); border-radius: var(--r-md); overflow: hidden; }
.verdict-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-bottom: 1px solid var(--border); background: var(--bg4); }
.vd-dots { display: flex; gap: 5px; }
.vd-dot { width: 9px; height: 9px; border-radius: 50%; }
.vd-r { background: var(--red); }
.vd-o { background: var(--orange); }
.vd-g { background: var(--green); }
.vd-filename { font-family: var(--font-mono); font-size: 10px; color: var(--text2); }
.vd-time { margin-left: auto; font-family: var(--font-mono); font-size: 9px; color: var(--text3); }
.verdict-body { display: flex; gap: 14px; padding: 16px; }
.verdict-lines { display: flex; flex-direction: column; font-family: var(--font-mono); font-size: 11px; color: var(--text3); line-height: 1.75; user-select: none; min-width: 18px; text-align: right; }
.verdict-text { font-family: var(--font-mono); font-size: 13px; color: var(--text1); line-height: 1.75; flex: 1; }

/* Flags */
.flags-empty { display: flex; align-items: center; gap: 10px; font-family: var(--font-mono); font-size: 12px; color: var(--green); padding: 14px; background: rgba(0,230,118,0.04); border: 1px solid rgba(0,230,118,0.1); border-radius: var(--r-sm); }
.flags-list { display: flex; flex-direction: column; gap: 6px; }
.flag-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,61,61,0.04); border: 1px solid rgba(255,61,61,0.1); border-radius: var(--r-sm); animation: fade-up 0.3s ease both; }
.flag-num { font-family: var(--font-mono); font-size: 10px; color: var(--text3); flex-shrink: 0; width: 18px; }
.flag-bar { width: 2px; height: 22px; background: var(--red); opacity: 0.5; border-radius: 1px; flex-shrink: 0; }
.flag-text { font-family: var(--font-mono); font-size: 12px; color: var(--text2); line-height: 1.5; flex: 1; }
.flag-sev { font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.1em; color: var(--red); background: rgba(255,61,61,0.1); padding: 2px 6px; border-radius: 2px; flex-shrink: 0; }

/* Similar */
.similar-box { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(255,122,0,0.06); border: 1px solid rgba(255,122,0,0.18); border-radius: var(--r-sm); font-family: var(--font-mono); font-size: 12px; color: var(--warning); }

/* Actions */
.actions { display: flex; gap: 12px; margin-top: 8px; }

/* Footer */
.ftr { margin-top: auto; padding: 20px 0; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
.ftr-logo { font-family: var(--font-display); font-size: 13px; font-weight: 900; color: var(--red); letter-spacing: 0.1em; }
.ftr-sep { color: var(--text3); font-family: var(--font-mono); font-size: 10px; }
.ftr-text { font-family: var(--font-mono); font-size: 10px; color: var(--text3); }

@media (max-width: 768px) {
  .score-row { grid-template-columns: 1fr; }
  .score-main { border-right: none; border-bottom: 1px solid var(--border); padding-right: 0; padding-bottom: 20px; }
}
</style>
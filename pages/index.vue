<template>
  <div class="pg">

    <!-- Hero -->
    <section class="hero">
      <div class="hero-eyebrow">
        <div class="hero-eye-dot"/>
        <span>CRYPTO SECURITY SCANNER</span>
        <div class="hero-eye-line"/>
      </div>
      <h1 class="hero-title">
        Проверь токен<br/>
        <span class="hero-accent">до того как вложишь</span>
      </h1>
      <p class="hero-desc">
        ИИ анализирует контракт, on-chain данные, соцсети и китов<br/>
        и выдаёт вердикт за 30 секунд
      </p>
      <div class="hero-stats">
        <div class="stat">
          <span class="stat-n">4</span>
          <span class="stat-l">детектива</span>
        </div>
        <div class="stat-div"/>
        <div class="stat">
          <span class="stat-n">30s</span>
          <span class="stat-l">анализ</span>
        </div>
        <div class="stat-div"/>
        <div class="stat">
          <span class="stat-n">AI</span>
          <span class="stat-l">вердикт</span>
        </div>
        <div class="stat-div"/>
        <div class="stat">
          <span class="stat-n">🐋</span>
          <span class="stat-l">киты</span>
        </div>
      </div>
    </section>

    <!-- Scan card -->
    <section class="scan-section">
      <div class="scan-card">
        <div class="scan-card-head">
          <div class="scan-card-title">
            <span class="sct-bracket">[</span>
            АДРЕС ТОКЕНА
            <span class="sct-bracket">]</span>
          </div>
          <div class="scan-network">
            <span class="scan-net-dot"/>
            ETH MAINNET
          </div>
        </div>
        <div class="scan-row">
          <input v-model="addr" class="input" placeholder="0x..." @keydown.enter="run"/>
          <button class="btn btn-mint" :disabled="loading || !addr" @click="run">
            <span v-if="loading" class="btn-loading">
              <span class="spinner"/>СКАНИРУЮ...
            </span>
            <span v-else>СКАНИРОВАТЬ →</span>
          </button>
        </div>
        <div v-if="error" class="scan-error">
          <span class="scan-error-icon">!</span>
          {{ error }}
        </div>
      </div>
    </section>

    <!-- Results -->
    <section v-if="result" class="results" style="animation: fade-up 0.5s ease">
      <div class="results-grid">

        <!-- Left: score -->
        <div class="score-card">
          <RiskScore :score="result.risk_score"/>
          <div class="breakdown">
            <div class="breakdown-title">// ДЕТАЛИ</div>
            <div v-for="(d, label) in breakdown" :key="label" class="bd-row">
              <span class="bd-label">{{ label }}</span>
              <div class="bd-bar-bg">
                <div class="bd-bar" :style="{ width: d.score + '%', background: barColor(d.score) }"/>
              </div>
              <span class="bd-val" :style="{ color: barColor(d.score) }">{{ d.score }}</span>
            </div>
          </div>
        </div>

        <!-- Right: verdict + flags + whales -->
        <div class="detail-card">
          <Verdict :verdict="result.verdict" :similar-scam="result.similar_scam"/>
          <Flags :flags="result.flags"/>
          <!-- ↓ НОВОЕ: блок анализа китов -->
          <WhaleTracker
            v-if="result.details && result.details.whales"
            :whales="result.details.whales.whales || []"
            :concentration="result.details.whales.top10_concentration || 0"
            :flags="result.details.whales.flags || []"
            :score="result.details.whales.score || 0"
          />
        </div>

      </div>

      <div class="token-row">
        <span class="token-lbl">CONTRACT</span>
        <span class="token-addr">{{ result.token_address }}</span>
      </div>
    </section>

    <footer class="ftr">
      <span class="ftr-logo">RUGSCAN</span>
      <span class="ftr-sep">//</span>
      <span class="ftr-text">Не является финансовым советом. DYOR.</span>
    </footer>

  </div>
</template>

<script setup lang="ts">
const { result, loading, error, analyze } = useAnalyze()
const addr = ref('')
const user = ref<any>(null)
const isAdmin = computed(() => user.value?.is_admin)

onMounted(() => {
  const stored = localStorage.getItem('user')
  if (stored) user.value = JSON.parse(stored)
})

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  user.value = null
  navigateTo('/auth')
}

const run = async () => {
  if (!addr.value) return
  if (!/^0x[a-fA-F0-9]{40}$/.test(addr.value.trim())) {
    error.value = 'Введите корректный адрес токена (0x...)'
    return
  }
  analyze(addr.value.trim())
}

// ↓ ИЗМЕНЕНО: добавлена строка "Киты"
const breakdown = computed(() => result.value ? {
  'Контракт': { score: result.value.details.contract.score },
  'On-chain':  { score: result.value.details.onchain.score },
  'Соцсети':   { score: result.value.details.social.score },
  'Киты':      { score: result.value.details.whales?.score ?? 0 },
} : {})

const barColor = (s: number) => s >= 70 ? '#ff3d3d' : s >= 40 ? '#ff7a00' : '#00e676'
</script>

<style scoped>
.pg {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0 36px;
  max-width: 960px;
  margin: 0 auto;
}

/* ── Hero ── */
.hero { padding: 64px 0 44px; }

.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.25em;
  color: var(--red);
  margin-bottom: 20px;
}

.hero-eye-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--red);
  animation: pulse-red 2s infinite;
  flex-shrink: 0;
}

.hero-eye-line {
  flex: 1;
  height: 1px;
  max-width: 60px;
  background: linear-gradient(90deg, rgba(255,61,61,0.4), transparent);
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(40px, 5.5vw, 72px);
  font-weight: 900;
  line-height: 1.0;
  color: var(--text1);
  margin-bottom: 16px;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}

.hero-accent { color: var(--red); }

.hero-desc {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--text2);
  line-height: 1.7;
  margin-bottom: 32px;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat { display: flex; flex-direction: column; gap: 2px; }
.stat-n { font-family: var(--font-display); font-size: 30px; font-weight: 900; color: var(--red); line-height: 1; }
.stat-l { font-family: var(--font-mono); font-size: 9px; color: var(--text3); letter-spacing: 0.15em; text-transform: uppercase; }
.stat-div { width: 1px; height: 32px; background: var(--border2); }

/* ── Scan card ── */
.scan-section { padding-bottom: 36px; }

.scan-card {
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: var(--r-md);
  padding: 20px;
  position: relative;
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
}

.scan-card::before {
  content: '';
  position: absolute;
  top: 0; right: 0;
  width: 0; height: 0;
  border-left: 16px solid transparent;
  border-top: 16px solid var(--red);
  opacity: 0.6;
}

.scan-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.scan-card-title {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
  letter-spacing: 0.2em;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sct-bracket { color: var(--red); opacity: 0.5; }

.scan-network {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.15em;
  color: var(--green);
  background: rgba(0,230,118,0.06);
  border: 1px solid rgba(0,230,118,0.15);
  padding: 4px 10px;
  border-radius: 3px;
}

.scan-net-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--green);
  animation: pulse-mint 2s infinite;
}

.scan-row { display: flex; gap: 10px; }

.scan-error {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--red);
  margin-top: 10px;
}

.scan-error-icon {
  width: 18px; height: 18px;
  border: 1px solid var(--red);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.btn-loading { display: flex; align-items: center; gap: 8px; }
.spinner {
  width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ── Results ── */
.results {
  padding-bottom: 60px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.results-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 16px;
  align-items: start;
}

.score-card {
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: var(--r-md);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
}

.breakdown { width: 100%; display: flex; flex-direction: column; gap: 12px; }

.breakdown-title {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--text3);
  letter-spacing: 0.2em;
}

.bd-row { display: flex; align-items: center; gap: 8px; }

.bd-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
  width: 64px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bd-bar-bg {
  flex: 1;
  height: 3px;
  background: var(--bg4);
  border-radius: 1px;
  overflow: hidden;
}

.bd-bar {
  height: 100%;
  border-radius: 1px;
  transition: width 1s cubic-bezier(.4,0,.2,1);
}

.bd-val {
  font-family: var(--font-mono);
  font-size: 11px;
  width: 22px;
  text-align: right;
}

.detail-card { display: flex; flex-direction: column; gap: 12px; }

.token-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  border-left: 2px solid rgba(255,61,61,0.3);
}

.token-lbl {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--text3);
  letter-spacing: 0.2em;
  flex-shrink: 0;
}

.token-addr {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text2);
  word-break: break-all;
}

/* ── Footer ── */
.ftr {
  margin-top: auto;
  padding: 20px 0;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
}

.ftr-logo {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 900;
  color: var(--red);
  letter-spacing: 0.1em;
}

.ftr-sep { color: var(--text3); font-family: var(--font-mono); font-size: 10px; }

.ftr-text {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
  letter-spacing: 0.05em;
}

@media (max-width: 768px) {
  .results-grid { grid-template-columns: 1fr; }
  .scan-row { flex-direction: column; }
  .hero-title { font-size: 36px; }
}
</style>
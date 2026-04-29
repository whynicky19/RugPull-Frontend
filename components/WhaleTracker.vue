<template>
  <div class="wt">
    <div class="wt-header">
      <div class="wt-title">
        <span class="wt-bracket">[</span>
        АНАЛИЗ КИТОВ
        <span class="wt-bracket">]</span>
      </div>
      <div class="wt-meta">
        <span class="wt-conc-label">КОНЦЕНТРАЦИЯ ТОП-10</span>
        <span class="wt-conc-val" :style="{ color: concColor }">{{ concentration }}%</span>
      </div>
    </div>

    <div v-if="!whales || whales.length === 0" class="wt-empty">
      Нет данных о крупных держателях
    </div>

    <div v-else class="wt-list">
      <div
        v-for="(whale, i) in whales"
        :key="whale.address"
        class="whale-card"
        :class="`threat-${whale.prediction.threat_level.toLowerCase()}`"
      >
        <!-- Rank + address -->
        <div class="wc-top">
          <div class="wc-rank">#{{ i + 1 }}</div>
          <div class="wc-addr">
            <span class="wc-addr-text">{{ shortAddr(whale.address) }}</span>
            <a :href="`https://etherscan.io/address/${whale.address}`" target="_blank" class="wc-link">↗</a>
          </div>
          <div class="wc-pct">{{ whale.balance_pct }}%</div>
        </div>

        <!-- Behavior row -->
        <div class="wc-mid">
          <div class="wc-stat">
            <span class="wcs-label">ПАТТЕРН</span>
            <span class="wcs-val" :style="{ color: patternColor(whale.behavior.pattern) }">
              {{ patternLabel(whale.behavior.pattern) }}
            </span>
          </div>
          <div class="wc-stat">
            <span class="wcs-label">ПОКУПОК</span>
            <span class="wcs-val green">{{ whale.behavior.buy_count }}</span>
          </div>
          <div class="wc-stat">
            <span class="wcs-label">ПРОДАЖ</span>
            <span class="wcs-val red">{{ whale.behavior.sell_count }}</span>
          </div>
          <div class="wc-stat">
            <span class="wcs-label">ПРОДАЖ/7Д</span>
            <span class="wcs-val" :style="{ color: whale.behavior.recent_sells > 2 ? 'var(--red)' : 'var(--text2)' }">
              {{ whale.behavior.recent_sells }}
            </span>
          </div>
          <div class="wc-stat">
            <span class="wcs-label">ETH</span>
            <span class="wcs-val">{{ whale.eth_balance }}</span>
          </div>
        </div>

        <!-- AI Prediction -->
        <div class="wc-prediction" :class="`pred-${whale.prediction.threat_level.toLowerCase()}`">
          <div class="pred-left">
            <div class="pred-label">AI ПРОГНОЗ</div>
            <div class="pred-verdict">{{ whale.prediction.verdict }}</div>
            <div class="pred-reason">{{ whale.prediction.reasoning }}</div>
          </div>
          <div class="pred-right">
            <div class="pred-prob-label">ДАМП</div>
            <div class="pred-prob" :style="{ color: dumpColor(whale.prediction.dump_probability) }">
              {{ whale.prediction.dump_probability }}%
            </div>
            <div
              class="pred-threat"
              :style="{ background: threatBg(whale.prediction.threat_level), color: threatColor(whale.prediction.threat_level) }"
            >
              {{ whale.prediction.threat_level }}
            </div>
          </div>
        </div>

        <!-- Last action -->
        <div class="wc-last">
          <span class="wc-last-label">ПОСЛЕДНЕЕ ДЕЙСТВИЕ:</span>
          <span class="wc-last-val">{{ whale.behavior.last_action }}</span>
          <span v-if="whale.behavior.avg_hold_days" class="wc-hold">
            · держит ~{{ whale.behavior.avg_hold_days }}д
          </span>
        </div>
      </div>
    </div>

    <!-- Overall flags -->
    <div v-if="flags && flags.length" class="wt-flags">
      <div class="wtf-title">// ПРЕДУПРЕЖДЕНИЯ</div>
      <div v-for="flag in flags" :key="flag" class="wtf-item">
        <span class="wtf-dot" />
        {{ flag }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  whales: any[]
  concentration: number
  flags: string[]
  score: number
}>()

const concColor = computed(() =>
  props.concentration > 80 ? 'var(--red)' :
  props.concentration > 60 ? '#ff7a00' : 'var(--green)'
)

const shortAddr = (addr: string) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''

const patternLabel = (p: string) => ({
  accumulator: '📈 НАКОПИТЕЛЬ',
  dumping: '🔴 ДАМПИТ',
  seller: '⬇ ПРОДАВЕЦ',
  buyer: '⬆ ПОКУПАТЕЛЬ',
  flipper: '⚡ ФЛИППЕР',
  holder: '💎 ХОЛДЕР',
  unknown: '? НЕИЗВЕСТНО',
}[p] ?? p)

const patternColor = (p: string) => ({
  accumulator: 'var(--green)',
  dumping: 'var(--red)',
  seller: '#ff7a00',
  buyer: 'var(--green)',
  flipper: '#ff7a00',
  holder: 'var(--green)',
  unknown: 'var(--text3)',
}[p] ?? 'var(--text2)')

const dumpColor = (prob: number) =>
  prob >= 60 ? 'var(--red)' : prob >= 35 ? '#ff7a00' : 'var(--green)'

const threatColor = (level: string) => ({
  'ВЫСОКИЙ': 'var(--red)',
  'СРЕДНИЙ': '#ff7a00',
  'НИЗКИЙ': 'var(--green)',
}[level] ?? 'var(--text2)')

const threatBg = (level: string) => ({
  'ВЫСОКИЙ': 'rgba(255,61,61,0.1)',
  'СРЕДНИЙ': 'rgba(255,122,0,0.1)',
  'НИЗКИЙ': 'rgba(0,230,118,0.1)',
}[level] ?? 'transparent')
</script>

<style scoped>
.wt {
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: var(--r-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wt-title {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
  letter-spacing: 0.2em;
  display: flex;
  align-items: center;
  gap: 4px;
}
.wt-bracket { color: var(--red); opacity: 0.5; }

.wt-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.wt-conc-label {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--text3);
  letter-spacing: 0.1em;
}
.wt-conc-val {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 900;
}

.wt-empty {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text3);
  text-align: center;
  padding: 20px;
}

.wt-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Whale card */
.whale-card {
  border: 1px solid var(--border2);
  border-radius: var(--r-sm);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  overflow: hidden;
}

.whale-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
}

.threat-высокий::before { background: var(--red); }
.threat-средний::before { background: #ff7a00; }
.threat-низкий::before { background: var(--green); }

/* Top row */
.wc-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wc-rank {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
  width: 24px;
  flex-shrink: 0;
}

.wc-addr {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.wc-addr-text {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text2);
}

.wc-link {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
  text-decoration: none;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.wc-link:hover { opacity: 1; color: var(--red); }

.wc-pct {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 900;
  color: var(--text1);
}

/* Mid row */
.wc-mid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.wc-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wcs-label {
  font-family: var(--font-mono);
  font-size: 8px;
  color: var(--text3);
  letter-spacing: 0.1em;
}

.wcs-val {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text2);
  font-weight: 600;
}
.wcs-val.green { color: var(--green); }
.wcs-val.red { color: var(--red); }

/* Prediction block */
.wc-prediction {
  border-radius: var(--r-sm);
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  border: 1px solid var(--border);
}

.pred-высокий { background: rgba(255,61,61,0.05); border-color: rgba(255,61,61,0.15) !important; }
.pred-средний { background: rgba(255,122,0,0.05); border-color: rgba(255,122,0,0.15) !important; }
.pred-низкий  { background: rgba(0,230,118,0.04); border-color: rgba(0,230,118,0.12) !important; }

.pred-left { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.pred-label {
  font-family: var(--font-mono);
  font-size: 8px;
  color: var(--text3);
  letter-spacing: 0.15em;
}
.pred-verdict {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--text1);
  line-height: 1.4;
}
.pred-reason {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
  font-style: italic;
}

.pred-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}
.pred-prob-label {
  font-family: var(--font-mono);
  font-size: 8px;
  color: var(--text3);
  letter-spacing: 0.1em;
}
.pred-prob {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
}
.pred-threat {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 3px;
}

/* Last action */
.wc-last {
  display: flex;
  align-items: center;
  gap: 6px;
  border-top: 1px solid var(--border);
  padding-top: 8px;
}
.wc-last-label {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--text3);
  letter-spacing: 0.1em;
}
.wc-last-val {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text2);
}
.wc-hold {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
}

/* Flags */
.wt-flags {
  border-top: 1px solid var(--border);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.wtf-title {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--text3);
  letter-spacing: 0.2em;
  margin-bottom: 4px;
}
.wtf-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text2);
  line-height: 1.5;
}
.wtf-dot {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--red);
  flex-shrink: 0;
  margin-top: 5px;
}
</style>

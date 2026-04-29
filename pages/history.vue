<template>
  <div class="pg">
    <section class="body">
      <div class="page-head">
        <div class="page-eyebrow">
          <div class="page-eye-dot"/>
          <span>HISTORY LOG</span>
        </div>
        <h1 class="page-title">Последние <span class="accent">сканы</span></h1>
        <div class="page-tabs">
          <button :class="['ptab', activeTab === 'all' && 'ptab--active']" @click="activeTab = 'all'">
            Все <span class="ptab-count">{{ all.length }}</span>
          </button>
          <button :class="['ptab', activeTab === 'token' && 'ptab--active']" @click="activeTab = 'token'">
            Токены <span class="ptab-count">{{ tokens.length }}</span>
          </button>
          <button :class="['ptab', activeTab === 'wallet' && 'ptab--active']" @click="activeTab = 'wallet'">
            Кошельки <span class="ptab-count">{{ wallets.length }}</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="state-box">
        <div class="state-spinner"/>
        <span>Загрузка данных...</span>
      </div>

      <div v-else-if="!filtered.length" class="state-box">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>Нет записей</span>
      </div>

      <div v-else class="list">
        <div
          v-for="(item, i) in filtered"
          :key="item.id + '-' + item.type"
          class="item"
          :style="{ animationDelay: i * 0.04 + 's' }"
          @click="goTo(item)"
        >
          <!-- Type badge -->
          <div :class="['item-type', item.type === 'token' ? 'item-type--token' : 'item-type--wallet']">
            <svg v-if="item.type === 'token'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
            <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
            {{ item.type === 'token' ? 'TOKEN' : 'WALLET' }}
          </div>

          <!-- Score -->
          <div class="item-score" :style="{ color: scoreColor(item.risk_score) }">
            {{ item.risk_score }}
          </div>

          <!-- Info -->
          <div class="item-info">
            <div class="item-addr">{{ short(item.address) }}</div>
            <div class="item-meta">
              <span class="item-date">{{ fmt(item.created_at) }}</span>
              <span v-if="item.type === 'token'" class="item-detail">
                C:{{ item.contract_score }} · O:{{ item.onchain_score }} · S:{{ item.social_score }}
              </span>
              <span v-else class="item-detail">
                {{ item.tx_count }} tx · {{ item.total_volume }} ETH
              </span>
            </div>
          </div>

          <!-- Mini bars (only for tokens) -->
          <div v-if="item.type === 'token'" class="item-bars">
            <div class="mbar" :style="{ width: item.contract_score + '%', background: scoreColor(item.contract_score) }" title="Контракт"/>
            <div class="mbar" :style="{ width: item.onchain_score + '%', background: scoreColor(item.onchain_score) }" title="On-chain"/>
            <div class="mbar" :style="{ width: item.social_score + '%', background: scoreColor(item.social_score) }" title="Соцсети"/>
          </div>

          <!-- Risk badge -->
          <div class="item-risk-badge" :style="{ color: scoreColor(item.risk_score), background: scoreColor(item.risk_score) + '18', borderColor: scoreColor(item.risk_score) + '35' }">
            {{ item.type === 'wallet' ? item.risk_level : (item.risk_score >= 70 ? 'ОПАСНО' : item.risk_score >= 40 ? 'РИСК' : 'OK') }}
          </div>

          <svg class="item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
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
import { useApi } from '~/services/api'
const api = useApi()
const router = useRouter()

const rawTokens = ref<any[]>([])
const rawWallets = ref<any[]>([])
const loading = ref(true)
const activeTab = ref<'all' | 'token' | 'wallet'>('all')

onMounted(async () => {
  try {
    const [tok, wal] = await Promise.all([
      api.get('/analyze/history'),
      api.get('/aml/history'),
    ])
    rawTokens.value = (tok || []).map((t: any) => ({ ...t, type: 'token', address: t.token_address }))
    rawWallets.value = (wal || []).map((w: any) => ({ ...w, type: 'wallet', address: w.wallet_address }))
  } finally {
    loading.value = false
  }
})

const all = computed(() =>
  [...rawTokens.value, ...rawWallets.value]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 40)
)
const tokens = computed(() => rawTokens.value)
const wallets = computed(() => rawWallets.value)

const filtered = computed(() => {
  if (activeTab.value === 'token') return tokens.value
  if (activeTab.value === 'wallet') return wallets.value
  return all.value
})

const scoreColor = (s: number) => s >= 70 ? '#ff3d3d' : s >= 40 ? '#ff7a00' : '#00e676'
const short = (a: string) => a ? `${a.slice(0, 6)}...${a.slice(-4)}` : ''
const fmt = (d: string) => new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

function goTo(item: any) {
  if (item.type === 'token') router.push(`/scan/${item.id}`)
  else router.push(`/aml/${item.id}`)
}
</script>

<style scoped>
.pg { min-height: 100vh; display: flex; flex-direction: column; padding: 0 36px; max-width: 960px; margin: 0 auto; }

.body { flex: 1; padding: 56px 0; }

.page-head { margin-bottom: 32px; }

.page-eyebrow {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.2em;
  color: var(--red); margin-bottom: 12px;
}
.page-eye-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--red); animation: pulse-red 2s infinite; }

.page-title {
  font-family: var(--font-display);
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 900; text-transform: uppercase;
  color: var(--text1); margin-bottom: 20px;
  letter-spacing: -0.01em;
}
.accent { color: var(--red); }

/* Tabs */
.page-tabs { display: flex; gap: 4px; }

.ptab {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.05em;
  color: var(--text3); background: var(--bg3);
  border: 1px solid var(--border); border-radius: var(--r-sm);
  padding: 6px 14px; cursor: pointer;
  transition: all 0.15s;
  display: flex; align-items: center; gap: 6px;
}
.ptab:hover { color: var(--text1); border-color: var(--border2); }
.ptab--active { color: var(--red); border-color: rgba(255,61,61,0.3); background: rgba(255,61,61,0.06); }

.ptab-count {
  font-size: 10px; padding: 1px 5px;
  background: var(--bg4); border-radius: 3px;
  color: var(--text3);
}
.ptab--active .ptab-count { color: var(--red); background: rgba(255,61,61,0.1); }

/* State */
.state-box {
  display: flex; align-items: center; gap: 12px;
  font-family: var(--font-mono); font-size: 13px; color: var(--text3);
  padding: 24px;
}
.state-spinner {
  width: 16px; height: 16px;
  border: 2px solid var(--border2); border-top-color: var(--red);
  border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0;
}

/* List */
.list { display: flex; flex-direction: column; gap: 6px; }

.item {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px;
  background: var(--bg2); border: 1px solid var(--border);
  border-radius: var(--r-md); cursor: pointer;
  transition: all 0.15s; animation: fade-up 0.35s ease both;
  border-left: 2px solid transparent;
}
.item:hover { border-color: var(--border2); border-left-color: var(--red); background: var(--bg3); transform: translateX(3px); }

/* Type badge */
.item-type {
  display: flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.1em;
  padding: 4px 8px; border-radius: 3px; border: 1px solid;
  flex-shrink: 0; width: 68px; justify-content: center;
}
.item-type--token {
  color: #6aadff; background: rgba(106,173,255,0.08); border-color: rgba(106,173,255,0.2);
}
.item-type--wallet {
  color: #b97aff; background: rgba(185,122,255,0.08); border-color: rgba(185,122,255,0.2);
}

.item-score {
  font-family: var(--font-display); font-size: 32px; font-weight: 900;
  width: 52px; text-align: center; flex-shrink: 0; line-height: 1;
}

.item-info { flex: 1; min-width: 0; }
.item-addr { font-family: var(--font-mono); font-size: 13px; color: var(--text1); margin-bottom: 4px; }
.item-meta { display: flex; align-items: center; gap: 10px; }
.item-date { font-family: var(--font-mono); font-size: 10px; color: var(--text3); }
.item-detail { font-family: var(--font-mono); font-size: 10px; color: var(--text3); }

.item-bars { display: flex; flex-direction: column; gap: 4px; width: 80px; flex-shrink: 0; }
.mbar { height: 2px; border-radius: 1px; min-width: 3px; }

.item-risk-badge {
  font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em;
  padding: 4px 8px; border-radius: 3px; border: 1px solid; flex-shrink: 0;
}

.item-arrow { color: var(--text3); flex-shrink: 0; }

/* Footer */
.ftr { margin-top: auto; padding: 20px 0; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
.ftr-logo { font-family: var(--font-display); font-size: 13px; font-weight: 900; color: var(--red); letter-spacing: 0.1em; }
.ftr-sep { color: var(--text3); font-family: var(--font-mono); font-size: 10px; }
.ftr-text { font-family: var(--font-mono); font-size: 10px; color: var(--text3); }
</style>
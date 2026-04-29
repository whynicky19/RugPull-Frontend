<template>
  <div class="pg">
    <section class="admin-section">
      <h1 class="admin-title">Административная панель</h1>

      <div v-if="!authorized" class="access-denied">
        <div class="access-icon">🔒</div>
        <div class="access-text">Доступ запрещён</div>
        <div class="access-sub">Только администраторы могут просматривать эту страницу</div>
      </div>

      <template v-else>
        <!-- Stats cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-label">Пользователей</div>
            <div class="stat-card-val">{{ stats?.total_users ?? '—' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-label">Сканирований токенов</div>
            <div class="stat-card-val">{{ stats?.total_analyses ?? '—' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-label">AML проверок</div>
            <div class="stat-card-val">{{ stats?.total_aml_checks ?? '—' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-label">Токенов ИИ потрачено</div>
            <div class="stat-card-val">{{ stats?.total_tokens_used ?? '—' }}</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-row">
          <button v-for="t in tabs" :key="t.key" :class="['tab', tab === t.key && 'tab--active']" @click="tab = t.key">{{ t.label }}</button>
        </div>

        <!-- Users table -->
        <div v-if="tab === 'users'" class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th><th>ФИО</th><th>Email</th><th>Роль</th><th>Токены ИИ</th><th>Дата регистрации</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td class="td-mono">{{ u.id }}</td>
                <td>{{ u.full_name }}</td>
                <td class="td-mono td-dim">{{ u.email }}</td>
                <td><span :class="['role-badge', u.is_admin && 'role-badge--admin']">{{ u.is_admin ? 'Админ' : 'Пользователь' }}</span></td>
                <td class="td-mono">{{ u.tokens_used }}</td>
                <td class="td-mono td-dim">{{ formatDate(u.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Analyses table -->
        <div v-if="tab === 'analyses'" class="table-wrap">
          <table class="table">
            <thead>
              <tr><th>Токен</th><th>Риск</th><th>Контракт</th><th>On-chain</th><th>Соцсети</th><th>Дата</th></tr>
            </thead>
            <tbody>
              <tr v-for="a in analyses" :key="a.id">
                <td class="td-mono td-truncate">{{ a.token_address }}</td>
                <td><span class="score-badge" :style="{ color: scoreColor(a.risk_score) }">{{ a.risk_score }}</span></td>
                <td class="td-mono">{{ a.contract_score }}</td>
                <td class="td-mono">{{ a.onchain_score }}</td>
                <td class="td-mono">{{ a.social_score }}</td>
                <td class="td-mono td-dim">{{ formatDate(a.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- AML table -->
        <div v-if="tab === 'aml'" class="table-wrap">
          <table class="table">
            <thead>
              <tr><th>Кошелёк</th><th>Риск</th><th>Уровень</th><th>Транзакций</th><th>Объём ETH</th><th>Дата</th></tr>
            </thead>
            <tbody>
              <tr v-for="a in amlChecks" :key="a.id">
                <td class="td-mono td-truncate">{{ a.wallet_address }}</td>
                <td><span class="score-badge" :style="{ color: scoreColor(a.risk_score) }">{{ a.risk_score }}</span></td>
                <td><span class="risk-level-badge">{{ a.risk_level }}</span></td>
                <td class="td-mono">{{ a.tx_count }}</td>
                <td class="td-mono">{{ a.total_volume }}</td>
                <td class="td-mono td-dim">{{ formatDate(a.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const authorized = ref(false)
const stats = ref<any>(null)
const users = ref<any[]>([])
const analyses = ref<any[]>([])
const amlChecks = ref<any[]>([])
const tab = ref('users')

const tabs = [
  { key: 'users', label: 'Пользователи' },
  { key: 'analyses', label: 'Сканирования' },
  { key: 'aml', label: 'AML Проверки' },
]

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function scoreColor(s: number) {
  if (s >= 70) return '#ff5c8a'
  if (s >= 40) return '#ffcc44'
  return '#4dffc3'
}

async function fetchAdmin(path: string) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${config.public.apiBase}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (res.status === 403 || res.status === 401) {
    authorized.value = false
    return null
  }
  authorized.value = true
  return res.json()
}

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!user.is_admin) { authorized.value = false; return }
  authorized.value = true

  stats.value = await fetchAdmin('/admin/stats')
  users.value = (await fetchAdmin('/admin/users')) || []
  analyses.value = (await fetchAdmin('/admin/analyses')) || []
  amlChecks.value = (await fetchAdmin('/admin/aml-checks')) || []
})
</script>

<style scoped>
.pg { min-height: 100vh; display: flex; flex-direction: column; padding: 0 32px; max-width: 1100px; margin: 0 auto; }

.admin-section { padding: 40px 0 60px; display: flex; flex-direction: column; gap: 28px; }
.admin-title { font-family: var(--font-display); font-size: 32px; font-weight: 800; color: var(--text1); }

.access-denied { text-align: center; padding: 80px 0; }
.access-icon { font-size: 48px; margin-bottom: 16px; }
.access-text { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--danger); margin-bottom: 8px; }
.access-sub { font-family: var(--font-mono); font-size: 13px; color: var(--text3); }

.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-xl); padding: 24px 20px; }
.stat-card-label { font-family: var(--font-mono); font-size: 11px; color: var(--text3); letter-spacing: 0.1em; margin-bottom: 8px; }
.stat-card-val { font-family: var(--font-display); font-size: 32px; font-weight: 800; color: var(--mint); }

.tab-row { display: flex; gap: 4px; background: var(--bg3); border-radius: var(--r-md); padding: 4px; width: fit-content; }
.tab { font-family: var(--font-body); font-size: 14px; font-weight: 500; color: var(--text3); background: transparent; border: none; border-radius: var(--r-sm); padding: 8px 20px; cursor: pointer; transition: all 0.2s; }
.tab--active { background: var(--bg2); color: var(--mint); border: 1px solid var(--border2); }

.table-wrap { overflow-x: auto; background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-xl); }
.table { width: 100%; border-collapse: collapse; }
.table th { font-family: var(--font-mono); font-size: 10px; color: var(--text3); letter-spacing: 0.15em; padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--border); }
.table td { font-family: var(--font-body); font-size: 14px; color: var(--text1); padding: 12px 16px; border-bottom: 1px solid rgba(77,255,195,0.04); }
.table tr:last-child td { border-bottom: none; }
.table tr:hover td { background: var(--bg3); }

.td-mono { font-family: var(--font-mono); font-size: 13px; }
.td-dim { color: var(--text3); }
.td-truncate { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.role-badge { font-family: var(--font-mono); font-size: 11px; padding: 3px 10px; border-radius: 100px; background: var(--bg3); color: var(--text3); }
.role-badge--admin { background: rgba(255,204,68,0.1); color: var(--warning); }

.score-badge { font-family: var(--font-display); font-size: 16px; font-weight: 700; }
.risk-level-badge { font-family: var(--font-mono); font-size: 11px; padding: 3px 10px; border-radius: 100px; background: var(--bg3); color: var(--text2); }

@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
<template>
  <div class="auth-pg">
    <div class="auth-card">
      <div class="auth-logo">
        <div class="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span class="logo-name">TokenScan</span>
      </div>

      <div class="tab-row">
        <button :class="['tab', mode === 'login' && 'tab--active']" @click="mode = 'login'">Войти</button>
        <button :class="['tab', mode === 'register' && 'tab--active']" @click="mode = 'register'">Регистрация</button>
      </div>

      <form class="auth-form" @submit.prevent="submit">
        <div v-if="mode === 'register'" class="field">
          <label class="field-label">ФИО</label>
          <input v-model="form.full_name" class="input" placeholder="Иванов Иван Иванович" required />
        </div>

        <div class="field">
          <label class="field-label">Email</label>
          <input v-model="form.email" type="email" class="input" placeholder="your@email.com" required />
        </div>

        <div class="field">
          <label class="field-label">Пароль</label>
          <input v-model="form.password" type="password" class="input" placeholder="••••••••" required />
        </div>

        <div v-if="error" class="auth-error">{{ error }}</div>

        <button class="btn btn-mint auth-btn" type="submit" :disabled="loading">
          <span v-if="loading" class="btn-loading"><span class="spinner"/>Загрузка...</span>
          <span v-else>{{ mode === 'login' ? 'Войти →' : 'Создать аккаунт →' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const config = useRuntimeConfig()
const router = useRouter()

const mode = ref<'login' | 'register'>('login')
const loading = ref(false)
const error = ref('')
const form = reactive({ full_name: '', email: '', password: '' })

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const endpoint = mode.value === 'login' ? '/auth/login' : '/auth/register'
    const body: any = { email: form.email, password: form.password }
    if (mode.value === 'register') body.full_name = form.full_name

    const res = await fetch(`${config.public.apiBase}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.detail || 'Ошибка')
    }

    const data = await res.json()
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    router.push('/')
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-pg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: var(--r-xl);
  padding: 40px 36px;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--blue), var(--blue2));
  border-radius: var(--r-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mint);
}

.logo-name {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  color: var(--text1);
}

.tab-row {
  display: flex;
  gap: 4px;
  background: var(--bg3);
  border-radius: var(--r-md);
  padding: 4px;
}

.tab {
  flex: 1;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--text3);
  background: transparent;
  border: none;
  border-radius: var(--r-sm);
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab--active {
  background: var(--bg2);
  color: var(--mint);
  border: 1px solid var(--border2);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text3);
  letter-spacing: 0.1em;
}

.auth-error {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--danger);
  padding: 10px 14px;
  background: rgba(255, 92, 138, 0.08);
  border: 1px solid rgba(255, 92, 138, 0.2);
  border-radius: var(--r-sm);
}

.auth-btn {
  width: 100%;
  margin-top: 4px;
}
</style>
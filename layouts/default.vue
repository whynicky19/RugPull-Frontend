<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sb-logo">
        <div class="sb-logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="sb-logo-text">
          <span class="sb-logo-name">TokenScan</span>
          <span class="sb-logo-sub">THREAT DETECTOR</span>
        </div>
      </div>

      <div class="sb-status">
        <span class="sb-status-dot"/>
        <span class="sb-status-text">СИСТЕМА АКТИВНА</span>
      </div>

      <div class="sb-divider"/>

      <nav class="sb-nav">
        <NuxtLink to="/" class="sb-link" active-class="" exact-active-class="sb-link--active">
          <div class="sb-link-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <span>Сканер</span>
          <div class="sb-link-tag">TOKEN</div>
        </NuxtLink>

        <NuxtLink to="/aml" class="sb-link" active-class="sb-link--active">
          <div class="sb-link-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span>AML</span>
          <div class="sb-link-tag">WALLET</div>
        </NuxtLink>

        <NuxtLink to="/history" class="sb-link" active-class="sb-link--active">
          <div class="sb-link-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <span>История</span>
        </NuxtLink>
      </nav>

      <!-- Admin section — отдельно, внизу, с другим стилем -->
      <div v-if="isAdmin" class="sb-admin-section">
        <div class="sb-admin-label">ДОСТУП</div>
        <NuxtLink to="/admin" class="sb-admin-link" active-class="sb-admin-link--active">
          <div class="sb-admin-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <span>Панель администратора</span>
        </NuxtLink>
      </div>

      <div class="sb-meter">
        <div class="sb-meter-label">THREAT LEVEL</div>
        <div class="sb-meter-bars">
          <div class="sb-bar sb-bar--1"/>
          <div class="sb-bar sb-bar--2"/>
          <div class="sb-bar sb-bar--3"/>
          <div class="sb-bar sb-bar--4"/>
          <div class="sb-bar sb-bar--5"/>
        </div>
      </div>

      <div class="sb-bottom">
        <template v-if="user">
          <div class="sb-user">
            <div class="sb-user-avatar">{{ user.full_name[0] }}</div>
            <div class="sb-user-info">
              <div class="sb-user-name">{{ user.full_name }}</div>
              <div class="sb-user-role">{{ user.is_admin ? 'ADMIN' : 'USER' }}</div>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" @click="logout">Выйти</button>
        </template>
        <NuxtLink v-else to="/auth" class="btn btn-ghost btn-sm" style="text-align:center">Войти</NuxtLink>
      </div>
    </aside>

    <main class="main-area">
      <slot/>
    </main>
  </div>
</template>

<script setup lang="ts">
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
</script>

<style>
.app-layout { display: flex; min-height: 100vh; }

.sidebar {
  width: 240px; min-width: 240px;
  background: var(--bg2);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  padding: 20px 16px;
  position: fixed; top: 0; left: 0;
  height: 100vh; z-index: 10;
  overflow: hidden;
}

.sidebar::before {
  content: '';
  position: absolute;
  left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,61,61,0.3), transparent);
  animation: scan-line 5s linear infinite;
  pointer-events: none;
}

.main-area { flex: 1; margin-left: 240px; min-height: 100vh; position: relative; z-index: 1; }

/* Logo */
.sb-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.sb-logo-icon {
  width: 34px; height: 34px;
  background: var(--red);
  border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
  box-shadow: 0 0 16px rgba(255,61,61,0.25);
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
}
.sb-logo-text { display: flex; flex-direction: column; gap: 1px; }
.sb-logo-name { font-family: var(--font-display); font-size: 19px; font-weight: 900; color: var(--text1); letter-spacing: 0.05em; line-height: 1; }
.sb-logo-sub { font-family: var(--font-mono); font-size: 7px; color: var(--text3); letter-spacing: 0.12em; }

/* Status */
.sb-status { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.sb-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulse-mint 2s infinite; flex-shrink: 0; }
.sb-status-text { font-family: var(--font-mono); font-size: 8px; color: var(--green); letter-spacing: 0.12em; }

.sb-divider { height: 1px; background: var(--border); margin-bottom: 14px; }

/* Nav */
.sb-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }

.sb-link {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--font-display); font-size: 14px; font-weight: 700;
  letter-spacing: 0.07em; text-transform: uppercase;
  color: var(--text3); text-decoration: none;
  padding: 9px 10px; border-radius: var(--r-sm);
  transition: all 0.15s;
  border-left: 2px solid transparent;
}
.sb-link:hover { color: var(--text1); background: rgba(255,255,255,0.04); border-left-color: rgba(255,61,61,0.3); }
.sb-link--active { color: var(--red) !important; background: rgba(255,61,61,0.07) !important; border-left-color: var(--red) !important; }

.sb-link-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; opacity: 0.5; }
.sb-link:hover .sb-link-icon, .sb-link--active .sb-link-icon { opacity: 1; }

.sb-link-tag {
  margin-left: auto;
  font-family: var(--font-mono); font-size: 7px; letter-spacing: 0.1em;
  color: var(--text3); background: var(--bg4);
  padding: 2px 5px; border-radius: 2px; border: 1px solid var(--border);
}

/* Admin section — полностью отдельный стиль */
.sb-admin-section {
  margin: 8px 0;
  padding: 10px;
  background: rgba(255,180,0,0.04);
  border: 1px solid rgba(255,180,0,0.12);
  border-radius: var(--r-sm);
}

.sb-admin-label {
  font-family: var(--font-mono);
  font-size: 7px;
  letter-spacing: 0.2em;
  color: rgba(255,180,0,0.4);
  margin-bottom: 6px;
  padding-left: 2px;
}

.sb-admin-link {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 10px;
  letter-spacing: 0.05em;
  color: rgba(255,180,0,0.6);
  text-decoration: none;
  padding: 7px 8px;
  border-radius: var(--r-sm);
  transition: all 0.15s;
  border: 1px solid transparent;
}
.sb-admin-link:hover {
  color: rgba(255,180,0,0.9);
  background: rgba(255,180,0,0.06);
  border-color: rgba(255,180,0,0.2);
}
.sb-admin-link--active {
  color: rgba(255,180,0,1) !important;
  background: rgba(255,180,0,0.08) !important;
  border-color: rgba(255,180,0,0.25) !important;
}

.sb-admin-icon {
  width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,180,0,0.1);
  border-radius: 3px; flex-shrink: 0;
}

/* Threat meter */
.sb-meter { padding: 12px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin: 10px 0; }
.sb-meter-label { font-family: var(--font-mono); font-size: 7px; color: var(--text3); letter-spacing: 0.15em; margin-bottom: 8px; }
.sb-meter-bars { display: flex; gap: 4px; align-items: flex-end; height: 18px; }
.sb-bar { flex: 1; border-radius: 2px; animation: flicker 3s infinite; }
.sb-bar--1 { height: 40%; background: var(--green); animation-delay: 0s; }
.sb-bar--2 { height: 60%; background: var(--yellow); animation-delay: 0.3s; }
.sb-bar--3 { height: 80%; background: var(--orange); animation-delay: 0.6s; }
.sb-bar--4 { height: 100%; background: var(--red); animation-delay: 0.9s; }
.sb-bar--5 { height: 65%; background: var(--red); opacity: 0.5; animation-delay: 1.2s; }

/* User */
.sb-bottom { display: flex; flex-direction: column; gap: 10px; }
.sb-user { display: flex; align-items: center; gap: 10px; }
.sb-user-avatar {
  width: 30px; height: 30px;
  background: rgba(255,61,61,0.12); border: 1px solid rgba(255,61,61,0.2);
  border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--red);
  flex-shrink: 0;
}
.sb-user-info { flex: 1; overflow: hidden; }
.sb-user-name { font-family: var(--font-body); font-size: 12px; font-weight: 500; color: var(--text1); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sb-user-role { font-family: var(--font-mono); font-size: 8px; color: var(--text3); letter-spacing: 0.1em; }

.btn-sm { padding: 8px 14px; font-size: 12px; }
</style>
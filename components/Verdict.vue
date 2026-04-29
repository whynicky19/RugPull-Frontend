<template>
  <div class="vd-wrap">
    <div class="vd-header-row">
      <div class="vd-label">// AI VERDICT</div>
      <div class="vd-live"><span class="vd-live-dot"/>LIVE</div>
    </div>
    <div class="vd-box">
      <div class="vd-toolbar">
        <div class="vd-dots">
          <span class="vd-dot vd-dot--r"/>
          <span class="vd-dot vd-dot--o"/>
          <span class="vd-dot vd-dot--g"/>
        </div>
        <span class="vd-filename">verdict.txt</span>
        <span class="vd-bytes">{{ display.length }} bytes</span>
      </div>
      <div class="vd-content">
        <div class="vd-line-nums">
          <span v-for="n in lineCount" :key="n">{{ n }}</span>
        </div>
        <p class="vd-text">{{ display }}<span class="vd-cursor">█</span></p>
      </div>
    </div>
    <div v-if="similarScam" class="vd-similar">
      <div class="vd-similar-icon">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <span>{{ similarScam }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const p = defineProps<{ verdict: string; similarScam?: string }>()
const display = ref('')
const lineCount = computed(() => Math.max(3, Math.ceil(display.value.length / 60)))

onMounted(() => {
  let i = 0
  const t = setInterval(() => {
    display.value = p.verdict.slice(0, ++i)
    if (i >= p.verdict.length) clearInterval(t)
  }, 14)
})
</script>

<style scoped>
.vd-wrap { display: flex; flex-direction: column; gap: 10px; }

.vd-header-row {
  display: flex; align-items: center; justify-content: space-between;
}

.vd-label {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--text3);
  letter-spacing: 0.2em;
}

.vd-live {
  display: flex; align-items: center; gap: 5px;
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--red);
  letter-spacing: 0.1em;
}

.vd-live-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--red);
  animation: pulse-red 1s infinite;
}

.vd-box {
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: var(--r-md);
  overflow: hidden;
}

.vd-toolbar {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--border);
  background: var(--bg4);
}

.vd-dots { display: flex; gap: 5px; }
.vd-dot {
  width: 9px; height: 9px;
  border-radius: 50%;
}
.vd-dot--r { background: var(--red); }
.vd-dot--o { background: var(--orange); }
.vd-dot--g { background: var(--green); }

.vd-filename {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text2);
}

.vd-bytes {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--text3);
}

.vd-content {
  display: flex;
  padding: 16px;
  gap: 16px;
}

.vd-line-nums {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text3);
  line-height: 1.8;
  user-select: none;
  min-width: 16px;
  text-align: right;
}

.vd-text {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text1);
  line-height: 1.8;
  flex: 1;
}

.vd-cursor {
  color: var(--red);
  animation: blink 0.8s infinite;
  font-size: 14px;
}

.vd-similar {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  background: rgba(255,122,0,0.06);
  border: 1px solid rgba(255,122,0,0.2);
  border-radius: var(--r-sm);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--warning);
}

.vd-similar-icon {
  width: 20px; height: 20px;
  background: rgba(255,122,0,0.1);
  border-radius: 3px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
</style>
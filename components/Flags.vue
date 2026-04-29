<template>
  <div class="fl-wrap">
    <div class="fl-header">
      <span class="fl-label">// УГРОЗЫ</span>
      <span class="fl-count" :class="flags.length ? 'fl-count--danger' : 'fl-count--safe'">
        {{ flags.length }} ОБНАРУЖЕНО
      </span>
    </div>

    <div v-if="!flags.length" class="fl-empty">
      <div class="fl-empty-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <span>Угроз не обнаружено</span>
    </div>

    <div v-else class="fl-list">
      <div
        v-for="(f, i) in flags"
        :key="i"
        class="fl-item"
        :style="{ animationDelay: i * 0.07 + 's' }"
      >
        <div class="fl-item-index">{{ String(i + 1).padStart(2, '0') }}</div>
        <div class="fl-item-bar"/>
        <span class="fl-item-text">{{ f }}</span>
        <div class="fl-item-sev">HIGH</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ flags: string[] }>()
</script>

<style scoped>
.fl-wrap { display: flex; flex-direction: column; gap: 10px; }

.fl-header {
  display: flex; align-items: center; justify-content: space-between;
}

.fl-label {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--text3);
  letter-spacing: 0.2em;
}

.fl-count {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  padding: 3px 8px;
  border-radius: 3px;
}

.fl-count--danger { background: rgba(255,61,61,0.1); color: var(--red); border: 1px solid rgba(255,61,61,0.2); }
.fl-count--safe { background: rgba(0,230,118,0.08); color: var(--green); border: 1px solid rgba(0,230,118,0.15); }

.fl-empty {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--green);
  padding: 16px;
  background: rgba(0,230,118,0.04);
  border: 1px solid rgba(0,230,118,0.1);
  border-radius: var(--r-sm);
}

.fl-empty-icon {
  width: 28px; height: 28px;
  background: rgba(0,230,118,0.1);
  border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.fl-list { display: flex; flex-direction: column; gap: 6px; }

.fl-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  background: rgba(255,61,61,0.04);
  border: 1px solid rgba(255,61,61,0.12);
  border-radius: var(--r-sm);
  border-left: none;
  position: relative;
  animation: fade-up 0.35s ease both;
  transition: background 0.2s;
}

.fl-item:hover {
  background: rgba(255,61,61,0.07);
}

.fl-item-index {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
  flex-shrink: 0;
}

.fl-item-bar {
  width: 2px;
  height: 24px;
  background: var(--red);
  border-radius: 1px;
  flex-shrink: 0;
  opacity: 0.6;
}

.fl-item-text {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text2);
  line-height: 1.5;
  flex: 1;
}

.fl-item-sev {
  font-family: var(--font-mono);
  font-size: 8px;
  letter-spacing: 0.1em;
  color: var(--red);
  background: rgba(255,61,61,0.1);
  padding: 2px 6px;
  border-radius: 2px;
  flex-shrink: 0;
}
</style>
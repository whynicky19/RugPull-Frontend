<template>
  <div class="rs-wrap">
    <div class="rs-label">// THREAT INDEX</div>
    <div class="rs-circle-outer" :style="{ '--sc': scoreColor }">
      <div class="rs-circle-ring"/>
      <svg viewBox="0 0 120 120" class="rs-svg">
        <circle cx="60" cy="60" r="50" class="rs-track"/>
        <circle cx="60" cy="60" r="50" class="rs-fill" :style="strokeStyle"/>
      </svg>
      <div class="rs-inner">
        <div class="rs-num" :style="{ color: scoreColor }">{{ score }}</div>
        <div class="rs-sub">/ 100</div>
      </div>
      <!-- Corner markers -->
      <div class="rs-corner rs-corner--tl"/>
      <div class="rs-corner rs-corner--tr"/>
      <div class="rs-corner rs-corner--bl"/>
      <div class="rs-corner rs-corner--br"/>
    </div>
    <div class="rs-badge" :style="{ background: badgeBg, color: scoreColor, borderColor: scoreColor + '44' }">
      <span class="rs-badge-dot" :style="{ background: scoreColor }"/>
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
const p = defineProps<{ score: number }>()
const scoreColor = computed(() => p.score >= 70 ? '#ff3d3d' : p.score >= 40 ? '#ff7a00' : '#00e676')
const label = computed(() => p.score >= 70 ? 'ВЫСОКИЙ РИСК' : p.score >= 40 ? 'СРЕДНИЙ РИСК' : 'НИЗКИЙ РИСК')
const badgeBg = computed(() => p.score >= 70 ? 'rgba(255,61,61,0.08)' : p.score >= 40 ? 'rgba(255,122,0,0.08)' : 'rgba(0,230,118,0.08)')
const strokeStyle = computed(() => {
  const c = 2 * Math.PI * 50
  return {
    strokeDasharray: c,
    strokeDashoffset: c - (p.score / 100) * c,
    stroke: scoreColor.value,
    filter: `drop-shadow(0 0 8px ${scoreColor.value}99)`
  }
})
</script>

<style scoped>
.rs-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; }

.rs-label {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--text3);
  letter-spacing: 0.2em;
}

.rs-circle-outer {
  position: relative;
  width: 168px; height: 168px;
  display: flex; align-items: center; justify-content: center;
}

.rs-circle-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid rgba(255,61,61,0.1);
}

.rs-svg {
  position: absolute; inset: 0;
  transform: rotate(-90deg);
}

.rs-track { fill: none; stroke: rgba(255,255,255,0.04); stroke-width: 6; }
.rs-fill { fill: none; stroke-width: 6; stroke-linecap: square; transition: stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1); }

.rs-inner {
  display: flex; flex-direction: column; align-items: center;
  z-index: 1;
}

.rs-num {
  font-family: var(--font-display);
  font-size: 58px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
  transition: color 0.5s;
}

.rs-sub {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text3);
  letter-spacing: 0.1em;
}

/* Corner brackets */
.rs-corner {
  position: absolute;
  width: 10px; height: 10px;
  border-color: rgba(255,61,61,0.3);
  border-style: solid;
}
.rs-corner--tl { top: 0; left: 0; border-width: 1px 0 0 1px; }
.rs-corner--tr { top: 0; right: 0; border-width: 1px 1px 0 0; }
.rs-corner--bl { bottom: 0; left: 0; border-width: 0 0 1px 1px; }
.rs-corner--br { bottom: 0; right: 0; border-width: 0 1px 1px 0; }

.rs-badge {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: var(--r-sm);
  border: 1px solid;
  clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%);
}

.rs-badge-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
  animation: pulse-red 1.5s infinite;
}
</style>
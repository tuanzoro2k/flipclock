// Logic phien dem. Khong dung DOM, khong goi Date.now() — moi ham nhan `now`.

function remaining(endAt, now) {
  return Math.max(0, endAt - now)
}

function formatDuration(ms) {
  // Lam tron LEN: con 2001ms thi hien 00:03, dung nhu dong ho dem nguoc that.
  const total = Math.ceil(ms / 1000)
  const pad = n => String(n).padStart(2, '0')
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

function nextAlarmTime(hh, mm, now) {
  const d = new Date(now)
  d.setHours(hh, mm, 0, 0)
  // ponytail: cong dung 24h thay vi setDate(+1) — lech 1 tieng vao ngay doi DST.
  // VN khong co DST nen bo qua; doi sang setDate neu can chay o vung co DST.
  return d.getTime() <= now ? d.getTime() + 86400000 : d.getTime()
}

function phaseDuration(spec, phase) {
  if (phase === 'focus') return spec.focusMs
  if (phase === 'break') return spec.breakMs
  return spec.longBreakMs
}

function createSession(spec, now) {
  const base = { mode: spec.mode, spec, phase: null, cycle: 0, cycles: 0, finished: false }
  if (spec.mode === 'countdown') {
    return { ...base, endAt: now + spec.durationMs }
  }
  if (spec.mode === 'alarm') {
    return { ...base, endAt: nextAlarmTime(spec.hh, spec.mm, now) }
  }
  return {
    ...base,
    phase: 'focus',
    cycle: 1,
    cycles: spec.cycles,
    endAt: now + spec.focusMs
  }
}

function advance(session, now) {
  if (session.mode !== 'pomodoro') return { ...session, finished: true }

  if (session.phase === 'focus') {
    const last = session.cycle === session.cycles
    const phase = last ? 'longBreak' : 'break'
    return {
      ...session,
      phase,
      endAt: now + phaseDuration(session.spec, phase)
    }
  }
  if (session.phase === 'longBreak') return { ...session, finished: true }

  const cycle = session.cycle + 1
  return {
    ...session,
    phase: 'focus',
    cycle,
    endAt: now + session.spec.focusMs
  }
}

if (typeof module !== 'undefined') {
  module.exports = { remaining, formatDuration, nextAlarmTime, createSession, advance }
}

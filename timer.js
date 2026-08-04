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

if (typeof module !== 'undefined') module.exports = { remaining, formatDuration }

// Store setting. Kiem tra `v === null` de biet key thieu.
// KHONG dung isNaN(): isNaN(null) la false, nen nhanh mac dinh se khong bao gio
// chay va gia tri bi clamp ve MIN — dung bug lam ban Fliqlo web ket o scale 50.

function createStore(storage, defaults) {
  function get(key) {
    const raw = storage.getItem(key)
    if (raw === null) return defaults[key]
    const d = defaults[key]
    if (typeof d === 'boolean') return raw === 'true'
    if (typeof d === 'number') {
      const n = Number(raw)
      return Number.isFinite(n) ? n : d
    }
    return raw
  }

  function set(key, value) {
    storage.setItem(key, String(value))
  }

  function all() {
    return Object.fromEntries(Object.keys(defaults).map(k => [k, get(k)]))
  }

  return { get, set, all }
}

if (typeof module !== 'undefined') module.exports = { createStore }

// Phan duoi day chi chay trong trinh duyet.
if (typeof window !== 'undefined') window.addEventListener('DOMContentLoaded', () => {
  const DEFAULTS = {
    showSeconds: true, showDate: false,
    theme: 'classic', scale: 100, brightness: 100
  }
  // Ponytail: mot so cau hinh file:// / trinh duyet chan site data khien
  // truy cap localStorage throw ngay tu dau — fallback qua Map trong bo nho
  // de dong ho van chay, chi mat kha nang luu lai cai dat.
  let ls
  try { ls = localStorage; ls.getItem('x') }
  catch (e) {
    const m = new Map()
    ls = { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, v) }
  }
  const store = createStore(ls, DEFAULTS)
  const stage = document.getElementById('stage')
  const cards = document.getElementById('cards')
  const dateEl = document.getElementById('date')

  let digits = []
  let digitCount = 0

  // Task 6 gan ham vao day de chiem o lat. Tra ve mang chuoi hoac null.
  window.app = { store, override: null }

  function fit() {
    const s = store.get('scale') / 100
    const pad = 40
    const k = Math.min(
      (window.innerWidth - pad) / stage.offsetWidth,
      (window.innerHeight - pad) / stage.offsetHeight
    )
    stage.style.transform = `scale(${Math.min(k, 3) * s})`
    stage.style.filter = `brightness(${store.get('brightness')}%)`
  }

  function clockDigits(now) {
    const out = [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0')
    ]
    if (store.get('showSeconds')) out.push(String(now.getSeconds()).padStart(2, '0'))
    return out
  }

  function render() {
    const now = new Date()
    const forced = window.app.override && window.app.override(now)
    const values = forced || clockDigits(now)

    if (values.length !== digitCount) {
      digitCount = values.length
      digits = buildDigits(cards, digitCount)
    }
    values.forEach((v, i) => setDigit(digits[i], v))

    const showDate = store.get('showDate')
    dateEl.hidden = !showDate
    if (showDate) {
      dateEl.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
    }
    fit()
  }

  function bind(id, key, prop, after) {
    const el = document.getElementById(id)
    el[prop] = store.get(key)
    el.addEventListener(prop === 'checked' ? 'change' : 'input', () => {
      store.set(key, el[prop])
      if (after) after()
      render()
    })
  }

  bind('opt-seconds', 'showSeconds', 'checked')
  bind('opt-date', 'showDate', 'checked')
  bind('opt-theme', 'theme', 'value', applyTheme)
  bind('opt-scale', 'scale', 'value')
  bind('opt-brightness', 'brightness', 'value')

  function applyTheme() {
    document.documentElement.dataset.theme = store.get('theme')
  }

  let hideTimer = null
  document.addEventListener('mousemove', () => {
    document.body.classList.add('hover')
    clearTimeout(hideTimer)
    hideTimer = setTimeout(() => document.body.classList.remove('hover'), 3000)
  })

  document.addEventListener('keydown', e => {
    if (e.key === 'f' || e.key === 'F') {
      if (document.fullscreenElement) document.exitFullscreen()
      else document.documentElement.requestFullscreen()
    }
  })

  window.addEventListener('resize', fit)
  applyTheme()
  render()
  setInterval(render, 250)
})

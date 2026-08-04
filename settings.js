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

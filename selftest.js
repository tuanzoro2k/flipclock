const assert = require('assert')
const { remaining, formatDuration } = require('./timer.js')

let passed = 0
function test(name, fn) {
  fn()
  passed++
  console.log('ok  -', name)
}

test('remaining tra ve hieu so', () => {
  assert.strictEqual(remaining(1000, 400), 600)
})

test('remaining khong bao gio am', () => {
  assert.strictEqual(remaining(1000, 5000), 0)
})

test('formatDuration duoi mot gio thi bo phan gio', () => {
  assert.strictEqual(formatDuration(0), '00:00')
  assert.strictEqual(formatDuration(59000), '00:59')
  assert.strictEqual(formatDuration(60000), '01:00')
})

test('formatDuration tu mot gio tro len co phan gio', () => {
  assert.strictEqual(formatDuration(3600000), '01:00:00')
  assert.strictEqual(formatDuration(3661000), '01:01:01')
})

test('formatDuration lam tron len de dem nguoc khong nhay som', () => {
  assert.strictEqual(formatDuration(2001), '00:03')
})

const { createSession, advance } = require('./timer.js')

const T0 = new Date(2026, 0, 15, 10, 0, 0).getTime()
const POMO = { mode: 'pomodoro', focusMs: 1500000, breakMs: 300000, longBreakMs: 900000, cycles: 4 }

test('countdown dat moc bang now cong thoi luong', () => {
  const s = createSession({ mode: 'countdown', durationMs: 60000 }, T0)
  assert.strictEqual(s.endAt, T0 + 60000)
  assert.strictEqual(s.mode, 'countdown')
  assert.strictEqual(s.finished, false)
})

test('countdown advance la ket thuc', () => {
  const s = advance(createSession({ mode: 'countdown', durationMs: 60000 }, T0), T0 + 60000)
  assert.strictEqual(s.finished, true)
})

test('alarm gio chua toi thi roi vao hom nay', () => {
  const s = createSession({ mode: 'alarm', hh: 23, mm: 0 }, T0)
  assert.strictEqual(s.endAt, new Date(2026, 0, 15, 23, 0, 0).getTime())
})

test('alarm gio da qua thi roi vao ngay mai', () => {
  const s = createSession({ mode: 'alarm', hh: 7, mm: 30 }, T0)
  assert.strictEqual(s.endAt, new Date(2026, 0, 16, 7, 30, 0).getTime())
})

test('pomodoro bat dau bang focus chu ky 1', () => {
  const s = createSession(POMO, T0)
  assert.strictEqual(s.phase, 'focus')
  assert.strictEqual(s.cycle, 1)
  assert.strictEqual(s.endAt, T0 + 1500000)
})

test('pomodoro chay dung thu tu 4 chu ky roi ket thuc', () => {
  let s = createSession(POMO, T0)
  const seen = []
  let now = T0
  for (let i = 0; i < 8; i++) {
    seen.push(s.phase + s.cycle)
    now = s.endAt
    s = advance(s, now)
  }
  assert.deepStrictEqual(seen, [
    'focus1', 'break1', 'focus2', 'break2',
    'focus3', 'break3', 'focus4', 'longBreak4'
  ])
  assert.strictEqual(s.finished, true)
})

test('pomodoro moc ke tiep tinh tu thoi diem advance chu khong cong don', () => {
  const s0 = createSession(POMO, T0)
  // nguoi dung bam tat chuong tre 10 giay
  const s1 = advance(s0, s0.endAt + 10000)
  assert.strictEqual(s1.endAt, s0.endAt + 10000 + 300000)
})

const { createStore } = require('./settings.js')

const DEFAULTS = { showSeconds: true, showDate: false, theme: 'classic', scale: 100, brightness: 100 }

function fakeStorage(seed = {}) {
  const map = new Map(Object.entries(seed))
  return {
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v))
  }
}

test('key chua ton tai thi tra ve mac dinh chu khong phai gia tri nho nhat', () => {
  const store = createStore(fakeStorage(), DEFAULTS)
  assert.strictEqual(store.get('scale'), 100)
  assert.strictEqual(store.get('brightness'), 100)
})

test('key chua ton tai voi mac dinh la boolean thi tra ve dung boolean', () => {
  const store = createStore(fakeStorage(), DEFAULTS)
  assert.strictEqual(store.get('showSeconds'), true)
  assert.strictEqual(store.get('showDate'), false)
})

test('key chua ton tai voi mac dinh la string thi tra ve dung string', () => {
  const store = createStore(fakeStorage(), DEFAULTS)
  assert.strictEqual(store.get('theme'), 'classic')
})

test('doc dung kieu boolean', () => {
  const store = createStore(fakeStorage({ showSeconds: 'false', showDate: 'true' }), DEFAULTS)
  assert.strictEqual(store.get('showSeconds'), false)
  assert.strictEqual(store.get('showDate'), true)
})

test('doc dung kieu so', () => {
  const store = createStore(fakeStorage({ scale: '75' }), DEFAULTS)
  assert.strictEqual(store.get('scale'), 75)
})

test('gia tri so hong thi lui ve mac dinh', () => {
  const store = createStore(fakeStorage({ scale: 'abc' }), DEFAULTS)
  assert.strictEqual(store.get('scale'), 100)
})

test('chuoi rong khong bi hieu nham la thieu key', () => {
  const store = createStore(fakeStorage({ theme: '' }), DEFAULTS)
  assert.strictEqual(store.get('theme'), '')
})

test('set roi get lai ra dung gia tri', () => {
  const store = createStore(fakeStorage(), DEFAULTS)
  store.set('scale', 80)
  store.set('showDate', true)
  assert.strictEqual(store.get('scale'), 80)
  assert.strictEqual(store.get('showDate'), true)
})

console.log(`\n${passed} passed`)

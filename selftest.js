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

console.log(`\n${passed} passed`)

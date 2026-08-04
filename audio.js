// Chuong sinh bang Web Audio, khong can file am thanh.
let chimeCtx = null
let chimeLoop = null
let activeOscillators = []

function beep(ctx, at, freq = 880, dur = 0.15) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.25, at)
  gain.gain.exponentialRampToValueAtTime(0.001, at + dur)
  osc.connect(gain).connect(ctx.destination)
  osc.start(at)
  osc.stop(at + dur)
  activeOscillators.push(osc)
  osc.onended = () => { activeOscillators = activeOscillators.filter(o => o !== osc) }
}

function playChime() {
  if (chimeLoop) return
  chimeCtx = chimeCtx || new (window.AudioContext || window.webkitAudioContext)()
  chimeCtx.resume()
  const burst = () => {
    const t = chimeCtx.currentTime
    for (let i = 0; i < 3; i++) beep(chimeCtx, t + i * 0.3)
  }
  burst()
  chimeLoop = setInterval(burst, 2000)
}

function stopChime() {
  clearInterval(chimeLoop)
  chimeLoop = null
  // Cat ngay cac beep da len lich (osc.stop() ngoai tuong lai chi don gian dung ngay).
  activeOscillators.forEach(o => { try { o.stop() } catch (e) {} })
  activeOscillators = []
}

window.playChime = playChime
window.stopChime = stopChime

// Nhac nen
window.addEventListener('DOMContentLoaded', () => {
  const tracks = window.TRACKS || []
  const box = document.getElementById('music-box')
  if (!tracks.length) { box.hidden = true; return }

  const audio = new Audio()
  let index = 0

  const select = document.getElementById('mu-track')
  tracks.forEach((t, i) => select.add(new Option(t.replace(/\.[^.]+$/, ''), i)))

  // audio.src = ... tu dat audio.paused = true ma khong ban su kien 'pause',
  // va play() bi tu choi cung khong ban 'pause' -> nut co the ket qua sai trang thai
  // that neu chi dua vao su kien. Dong bo lai tu audio.paused sau khi play() ket thuc.
  function syncPlayButton() {
    document.getElementById('mu-play').textContent = audio.paused ? '▶' : '❚❚'
  }

  function load(i, autoplay) {
    index = (i + tracks.length) % tracks.length
    select.value = index
    audio.src = 'music/' + tracks[index]
    if (autoplay) audio.play().then(syncPlayButton, syncPlayButton)
  }

  document.getElementById('mu-play').addEventListener('click', () => {
    // Trinh duyet chan autoplay: lan dau bat buoc phai co cu bam nay.
    if (audio.paused) audio.play().then(syncPlayButton, syncPlayButton)
    else audio.pause()
  })
  document.getElementById('mu-next').addEventListener('click', () => load(index + 1, true))
  select.addEventListener('change', () => load(Number(select.value), true))
  document.getElementById('mu-vol').addEventListener('input', e => { audio.volume = e.target.value / 100 })
  audio.addEventListener('ended', () => load(index + 1, true))
  audio.addEventListener('play', () => { document.getElementById('mu-play').textContent = '❚❚' })
  audio.addEventListener('pause', () => { document.getElementById('mu-play').textContent = '▶' })

  audio.volume = 0.5
  load(0, false)
})

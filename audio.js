// Chuong sinh bang Web Audio, khong can file am thanh.
let chimeCtx = null
let chimeLoop = null

function beep(ctx, at, freq = 880, dur = 0.15) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.25, at)
  gain.gain.exponentialRampToValueAtTime(0.001, at + dur)
  osc.connect(gain).connect(ctx.destination)
  osc.start(at)
  osc.stop(at + dur)
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

  function load(i, autoplay) {
    index = (i + tracks.length) % tracks.length
    select.value = index
    audio.src = 'music/' + tracks[index]
    if (autoplay) audio.play().catch(() => {})
  }

  document.getElementById('mu-play').addEventListener('click', () => {
    // Trinh duyet chan autoplay: lan dau bat buoc phai co cu bam nay.
    if (audio.paused) audio.play().catch(() => {})
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

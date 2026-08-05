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
  // Mot track la { label, src }. Nguon co hai kieu:
  //   - ten file trong window.TRACKS -> src la duong dan tuong doi 'music/<ten>'
  //   - file nguoi dung chon tu may  -> src la blob: URL, khong roi khoi may ho
  // Nho vay ban deploy cong khai khong phai kem theo file nhac nao.
  const stripExt = name => name.replace(/\.[^.]+$/, '')
  const tracks = (window.TRACKS || []).map(n => ({ label: stripExt(n), src: 'music/' + n }))

  const audio = new Audio()
  let index = 0

  const select = document.getElementById('mu-track')
  const controls = ['mu-play', 'mu-next', 'mu-track', 'mu-del', 'mu-vol']

  function refillSelect() {
    select.length = 0
    tracks.forEach((t, i) => select.add(new Option(t.label, i)))
    // Khong con danh sach rong -> hien dan dieu khien
    const has = tracks.length > 0
    controls.forEach(id => { document.getElementById(id).hidden = !has })
  }

  // audio.src = ... tu dat audio.paused = true ma khong ban su kien 'pause',
  // va play() bi tu choi cung khong ban 'pause' -> nut co the ket qua sai trang thai
  // that neu chi dua vao su kien. Dong bo lai tu audio.paused sau khi play() ket thuc.
  function syncPlayButton() {
    document.getElementById('mu-play').textContent = audio.paused ? '▶' : '❚❚'
  }

  function load(i, autoplay) {
    if (!tracks.length) return
    index = (i + tracks.length) % tracks.length
    select.value = index
    document.getElementById('mu-play').title = ''
    audio.src = tracks[index].src
    if (autoplay) { window.stopYouTube?.(); audio.play().then(syncPlayButton, syncPlayButton) }
  }

  // File thieu hoac sai ten (loi thuong gap nhat lan dau) -> im lang theo dung
  // spec ("khong bao loi on ao"), nhung khong duoc vo hinh: dong bo lai nut va
  // bao qua title (hover) thay vi console error do nguoi dung khong thay.
  audio.addEventListener('error', () => {
    // Danh sach rong: src vua bi go ra co chu y, khong phai file hong.
    if (!tracks.length) return
    syncPlayButton()
    document.getElementById('mu-play').title = 'Không phát được: ' + (tracks[index] || {}).label
  })

  document.getElementById('mu-pick').addEventListener('change', e => {
    const picked = [...e.target.files].map(f => ({ label: stripExt(f.name), src: URL.createObjectURL(f) }))
    if (!picked.length) return
    const firstNew = tracks.length
    tracks.push(...picked)
    refillSelect()
    load(firstNew, true)
    // Reset input: chon lai DUNG file vua xoa se khong ban 'change' neu value
    // con nguyen, va nut se im lang khong lam gi.
    e.target.value = ''
  })

  document.getElementById('mu-del').addEventListener('click', () => {
    if (!tracks.length) return
    const [gone] = tracks.splice(index, 1)
    // Chi thu hoi blob cua file nguoi dung chon; track kem theo repo la duong dan thuong.
    if (gone.src.startsWith('blob:')) URL.revokeObjectURL(gone.src)

    const conPhat = !audio.paused
    refillSelect()
    if (!tracks.length) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      return
    }
    // index dang tro vao vi tri cua bai vua xoa = bai ke tiep; load() tu cuon
    // ve 0 neu vua xoa bai cuoi.
    load(index, conPhat)
  })

  document.getElementById('mu-play').addEventListener('click', () => {
    // Trinh duyet chan autoplay: lan dau bat buoc phai co cu bam nay.
    // Hai nguon nhac khong duoc chong tieng nhau.
    if (audio.paused) { window.stopYouTube?.(); audio.play().then(syncPlayButton, syncPlayButton) }
    else audio.pause()
  })
  document.getElementById('mu-next').addEventListener('click', () => load(index + 1, true))
  select.addEventListener('change', () => load(Number(select.value), true))
  document.getElementById('mu-vol').addEventListener('input', e => { audio.volume = e.target.value / 100 })
  audio.addEventListener('ended', () => load(index + 1, true))
  audio.addEventListener('play', () => { document.getElementById('mu-play').textContent = '❚❚' })
  audio.addEventListener('pause', () => { document.getElementById('mu-play').textContent = '▶' })

  // youtube.js goi cai nay truoc khi phat, de hai nguon khong chong tieng.
  window.stopLocalMusic = () => audio.pause()

  audio.volume = 0.5
  refillSelect()
  load(0, false)
})

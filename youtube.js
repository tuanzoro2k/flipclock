// Nhac nen tu YouTube. Tach khoi audio.js vi day la thu duy nhat trong ca du an
// phu thuoc mot script ben ngoai — va script do CHI duoc tai khi nguoi dung thuc
// su dan link, de trang khong dinh cookie Google neu khong ai dung toi.

// Bóc videoId / listId tu mot URL YouTube. Tra null neu khong nhan ra.
// Chap nhan: youtube.com/watch?v=, youtu.be/, /playlist?list=, /embed/, /shorts/,
// music.youtube.com, va ID tran (11 ky tu).
function parseYouTube(input) {
  const s = String(input || '').trim()
  if (!s) return null

  const ID = /^[\w-]{11}$/
  const LIST = /^[\w-]{12,}$/

  if (ID.test(s)) return { videoId: s, listId: null }

  let u
  try {
    u = new URL(s.includes('://') ? s : 'https://' + s)
  } catch (e) {
    return null
  }
  if (!/(^|\.)(youtube\.com|youtube-nocookie\.com|youtu\.be)$/.test(u.hostname)) return null

  const listRaw = u.searchParams.get('list')
  const listId = listRaw && LIST.test(listRaw) ? listRaw : null

  let videoId = u.searchParams.get('v')
  if (!videoId) {
    // youtu.be/<id>, /embed/<id>, /shorts/<id>, /live/<id>
    const seg = u.pathname.split('/').filter(Boolean)
    const last = seg[seg.length - 1]
    if (u.hostname.endsWith('youtu.be')) videoId = seg[0]
    else if (['embed', 'shorts', 'live', 'v'].includes(seg[seg.length - 2])) videoId = last
  }
  if (videoId && !ID.test(videoId)) videoId = null

  if (!videoId && !listId) return null
  return { videoId: videoId || null, listId }
}

if (typeof module !== 'undefined') module.exports = { parseYouTube }

if (typeof window !== 'undefined') window.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id)
  const box = $('yt-box')
  const status = $('yt-status')
  let player = null
  let hetGio = null

  // Tai IFrame API dung mot lan, va chi khi den day.
  let apiReady = null
  function loadApi() {
    if (apiReady) return apiReady
    apiReady = new Promise((resolve, reject) => {
      window.onYouTubeIframeAPIReady = resolve
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      s.onerror = () => reject(new Error('khong tai duoc iframe_api'))
      document.head.appendChild(s)
    })
    return apiReady
  }

  const LOI = {
    2: 'Link không hợp lệ',
    5: 'Trình phát không hỗ trợ nội dung này',
    100: 'Video không tồn tại hoặc đã bị gỡ',
    101: 'Video này không cho phép nhúng',
    150: 'Video này không cho phép nhúng',
    // 153 khong co trong tai lieu YouTube. Thuc te no bao "player configuration
    // error": video bi chan phat ngoai youtube.com — hay gap voi MV co ban quyen
    // am nhac hoac video gioi han do tuoi (doi dang nhap).
    153: 'Video này chỉ xem được trên YouTube (bản quyền âm nhạc hoặc giới hạn tuổi)'
  }

  // Nhung khong duoc thi it ra cho nguoi dung duong ra.
  function linkGoc(parsed) {
    if (parsed.videoId) return 'https://www.youtube.com/watch?v=' + parsed.videoId
    return 'https://www.youtube.com/playlist?list=' + parsed.listId
  }

  function baoLoi(text, parsed) {
    status.textContent = text + ' — '
    const a = document.createElement('a')
    a.href = linkGoc(parsed)
    a.target = '_blank'
    a.rel = 'noopener'
    a.textContent = 'mở trên YouTube'
    status.appendChild(a)
  }

  // YT.Player thay the phan tu dich bang <iframe>, va destroy() xoa luon iframe do
  // — nghia la sau lan phat dau tien thi khong con phan tu nao mang id 'yt-player'.
  // Vi vay moi lan phat phai dung mot phan tu dich MOI, khong the tai su dung id.
  function freshTarget() {
    const old = $('yt-player')
    if (old) old.remove()
    const el = document.createElement('div')
    el.id = 'yt-player'
    box.insertBefore(el, $('yt-close'))
    return el
  }

  async function play(parsed) {
    status.textContent = 'Đang tải…'
    try {
      await loadApi()
    } catch (e) {
      status.textContent = 'Không tải được YouTube (chặn mạng?)'
      return
    }
    window.stopLocalMusic?.()
    box.hidden = false

    const vars = { autoplay: 1, playsinline: 1 }
    if (parsed.listId) {
      vars.list = parsed.listId
      vars.listType = 'playlist'
    }

    // Guard dat TRUOC khi dung player: neu constructor nem loi thi moi dong sau
    // no khong chay, va status se ket o "Dang tai..." vinh vien.
    clearTimeout(hetGio)
    hetGio = setTimeout(() => {
      if (status.textContent === 'Đang tải…') baoLoi('Không tải được', parsed)
    }, 10000)

    const cfg = {
      // nocookie: khong dat cookie theo doi cho toi khi thuc su phat
      host: 'https://www.youtube-nocookie.com',
      width: 240,
      height: 135,
      playerVars: vars,
      events: {
        onReady: () => { clearTimeout(hetGio); status.textContent = '' },
        onError: e => {
          clearTimeout(hetGio)
          const chiPlaylist = parsed.listId && !parsed.videoId
          baoLoi(chiPlaylist
            ? 'Playlist không phát được (riêng tư, không tồn tại, hoặc chặn nhúng)'
            : (LOI[e.data] || 'Không phát được (mã ' + e.data + ')'), parsed)
        }
      }
    }
    // Chi dat khoa videoId khi that su co: truyen videoId: undefined van bi
    // IFrame API coi la co mat va nem "Invalid video id", lam playlist thuan chet.
    if (parsed.videoId) cfg.videoId = parsed.videoId

    try {
      player = new YT.Player(freshTarget(), cfg)
    } catch (e) {
      clearTimeout(hetGio)
      status.textContent = 'Không dựng được trình phát'
    }
  }

  function stop() {
    clearTimeout(hetGio)
    if (player) { player.destroy(); player = null }
    box.hidden = true
    status.textContent = ''
    freshTarget()
  }

  // audio.js goi cai nay truoc khi phat file tu may, de hai nguon khong chong tieng.
  window.stopYouTube = stop

  $('yt-go').addEventListener('click', () => {
    const parsed = parseYouTube($('yt-url').value)
    if (!parsed) { status.textContent = 'Không nhận ra link YouTube'; return }
    play(parsed)
  })
  $('yt-url').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); $('yt-go').click() }
  })
  $('yt-close').addEventListener('click', stop)
})

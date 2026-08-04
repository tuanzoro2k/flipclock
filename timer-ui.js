window.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id)
  const status = $('tm-status')
  let session = null
  let alarming = false
  let ringTimer = null

  const MIN = 60000
  const RING_MS = 5000

  // Xoa moi dau vet cua lan bao dang keu. Bat buoc phai huy ringTimer o day:
  // neu khong, cai setTimeout cua lan bao TRUOC se no muon va dismiss() nham
  // phase/phien SAU, lam pomodoro nhay coc mot chang.
  function clearAlarm() {
    clearTimeout(ringTimer)
    ringTimer = null
    alarming = false
    document.body.classList.remove('alarming')
    window.stopChime?.()
  }

  function readSpec(mode) {
    if (mode === 'countdown') {
      return { mode, durationMs: Number($('tm-minutes').value) * MIN }
    }
    if (mode === 'alarm') {
      const [hh, mm] = $('tm-at').value.split(':').map(Number)
      return { mode, hh, mm }
    }
    return {
      mode: 'pomodoro',
      focusMs: Number($('tm-focus').value) * MIN,
      breakMs: Number($('tm-break').value) * MIN,
      longBreakMs: Number($('tm-long').value) * MIN,
      cycles: Number($('tm-cycles').value)
    }
  }

  // Ponytail: mot guard duy nhat o diem goi, thay vi vha ba nhanh rai rac —
  // HTML min/max chi la advisory, nguoi dung xoa trang o bat ky truong nao.
  function validSpec(spec) {
    if (spec.mode === 'countdown') return spec.durationMs > 0
    if (spec.mode === 'alarm') return Number.isInteger(spec.hh) && Number.isInteger(spec.mm)
    return spec.cycles >= 1 && spec.focusMs > 0 && spec.breakMs > 0 && spec.longBreakMs > 0
  }

  function showBoxes() {
    const mode = $('tm-mode').value
    $('tm-countdown-box').hidden = mode !== 'countdown'
    $('tm-alarm-box').hidden = mode !== 'alarm'
    $('tm-pomo-box').hidden = mode !== 'pomodoro'
    $('tm-start').hidden = mode === 'off'
  }

  function stop() {
    session = null
    clearAlarm()
    // ponytail: khong gan window.app.override = null o day — closure ben
    // duoi da tra ve null khi !session roi; gan lai se pha huy vinh vien
    // override that su, khien o lat khong bao gio hien so dem nua.
    status.textContent = ''
  }

  function fire() {
    alarming = true
    document.body.classList.add('alarming')
    window.playChime?.()
    // Keu RING_MS roi tu tat va sang phase ke tiep, khong can bam gi.
    // Bam Escape/Space/click van tat som duoc.
    ringTimer = setTimeout(dismiss, RING_MS)
  }

  function label() {
    if (!session) return ''
    if (session.mode === 'pomodoro') {
      const name = { focus: 'FOCUS', break: 'NGHỈ', longBreak: 'NGHỈ DÀI' }[session.phase]
      return `● ${name} ${session.cycle}/${session.cycles}`
    }
    if (session.mode === 'alarm') {
      return `⏰ ${$('tm-at').value}`
    }
    return '● ĐẾM NGƯỢC'
  }

  // Alarm KHONG chiem o lat — o lat van hien gio that.
  // Khi dang alarming o mode khac, endAt da qua nen remaining() tu nhien la 0
  // -> "00:00" dung nghia dung yen, khong nhay ve gio that giua luc nhap nhay.
  window.app.override = () => {
    if (!session || session.mode === 'alarm') return null
    const left = remaining(session.endAt, Date.now())
    const text = formatDuration(left)
    return text.split(':')
  }

  function tick() {
    if (!session || alarming) return
    const now = Date.now()
    if (remaining(session.endAt, now) > 0) {
      const left = session.mode === 'alarm' ? ` · còn ${formatDuration(remaining(session.endAt, now))}` : ''
      status.textContent = label() + left
      return
    }
    fire()
    status.textContent = label() + ' · HẾT GIỜ'
  }

  function dismiss() {
    if (!alarming) return
    clearAlarm()
    const next = advance(session, Date.now())
    if (next.finished) stop()
    else session = next
  }

  $('tm-mode').addEventListener('change', () => { showBoxes(); stop() })
  $('tm-start').addEventListener('click', () => {
    const mode = $('tm-mode').value
    if (mode === 'off') return stop()
    const spec = readSpec(mode)
    if (!validSpec(spec)) { status.textContent = 'Giá trị không hợp lệ'; return }
    // Ponytail: xoa het trang thai bao chuong con dang keu truoc khi nhan
    // phien moi — khong thi tick()/override deu bo qua vi con `alarming`,
    // va Escape sau do se advance() nham phien MOI roi huy no ngay lap tuc.
    clearAlarm()
    session = createSession(spec, Date.now())
  })
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') dismiss()
    if (e.key === ' ' && session) { e.preventDefault(); dismiss() }
  })
  document.addEventListener('click', e => {
    if (alarming && !e.target.closest('#panel')) dismiss()
  })

  showBoxes()
  setInterval(tick, 250)
})

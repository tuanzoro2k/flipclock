// Engine o lat. Moi o gom 4 lop: 2 nua tinh + 2 nua lat.

const FLIP_MS = 300

function buildDigits(container, count) {
  container.innerHTML = ''
  const digits = []
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    el.className = 'card'
    el.innerHTML = `
      <div class="half top    static"><span></span></div>
      <div class="half bottom static"><span></span></div>
      <div class="half top    flap"><span></span></div>
      <div class="half bottom flap"><span></span></div>`
    container.appendChild(el)
    const digit = { el, value: null }
    setDigit(digit, '')
    digits.push(digit)
  }
  return digits
}

function spans(digit) {
  const [topStatic, bottomStatic, topFlap, bottomFlap] = digit.el.querySelectorAll('.half')
  return { topStatic, bottomStatic, topFlap, bottomFlap }
}

function setDigit(digit, text) {
  if (digit.value === text) return
  const old = digit.value
  digit.value = text
  const s = spans(digit)

  if (old === null) {
    s.topStatic.firstChild.textContent = text
    s.bottomStatic.firstChild.textContent = text
    return
  }

  // nua tren tinh doi ngay sang so moi, nua duoi tinh giu so cu
  s.topStatic.firstChild.textContent = text
  s.bottomStatic.firstChild.textContent = old
  s.topFlap.firstChild.textContent = old
  s.bottomFlap.firstChild.textContent = text

  clearTimeout(digit.timer) // huy lan lat truoc neu dang chay do, tranh no ghi de len lan nay

  digit.el.classList.remove('flipping')
  void digit.el.offsetWidth // ep trinh duyet tinh lai de animation chay lai
  digit.el.classList.add('flipping')

  digit.timer = setTimeout(() => {
    s.bottomStatic.firstChild.textContent = text
    digit.el.classList.remove('flipping')
  }, FLIP_MS)
}

if (typeof module !== 'undefined') module.exports = { buildDigits, setDigit, FLIP_MS }

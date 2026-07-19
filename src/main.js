import './styles.css'

const body = document.body
const panel = document.querySelector('#panel')
const cursor = document.querySelector('.cursor')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const roomData = {
  work: {
    index: '01 / PROJECTS',
    title: 'Digital worlds\nwith a pulse.',
    copy: 'Nem egyszerű oldalakat, hanem emlékezetes digitális helyeket tervezünk — a koncepciótól a működő élményig.',
    list: ['Immersive portfolios', 'Interactive campaigns', 'Product experiences'],
  },
  services: {
    index: '02 / SERVICES',
    title: 'Built to\nbe explored.',
    copy: 'A stratégia, design, mozgás és technológia nálunk egyetlen összefüggő élménnyé áll össze.',
    list: ['Creative direction', 'Experience design', 'Web development'],
  },
  studio: {
    index: '03 / STUDIO',
    title: 'Small house.\nLarge ideas.',
    copy: 'A MealStudio független digitális műhely. Azokat a projekteket keressük, amelyek nem férnek bele egy sablonba.',
    list: ['Budapest based', 'Independent studio', 'Worldwide projects'],
  },
  contact: {
    index: '04 / CONTACT',
    title: 'Open the\nnext door.',
    copy: 'Van egy ötleted, amelynek saját világ kell? Írj, és találjuk ki együtt, mi legyen a bejárat túloldalán.',
    list: ['hello@mealstudio.hu', 'New projects / 2026', 'Reply within 48 hours'],
  },
}

let audioContext
let masterGain
let soundEnabled = true
let entering = false

function startAudio() {
  if (audioContext) return
  audioContext = new (window.AudioContext || window.webkitAudioContext)()
  masterGain = audioContext.createGain()
  masterGain.gain.value = .32
  masterGain.connect(audioContext.destination)

  ;[43.65, 65.41].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    oscillator.type = index ? 'triangle' : 'sine'
    oscillator.frequency.value = frequency
    gain.gain.value = index ? .018 : .028
    oscillator.connect(gain).connect(masterGain)
    oscillator.start()
  })
}

function playDoorTone() {
  if (!audioContext || !soundEnabled) return
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(120, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(520, audioContext.currentTime + 1.5)
  gain.gain.setValueAtTime(.12, audioContext.currentTime)
  gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + 1.6)
  oscillator.connect(gain).connect(masterGain)
  oscillator.start()
  oscillator.stop(audioContext.currentTime + 1.65)
}

function enterStudio() {
  if (entering || body.dataset.scene !== 'exterior') return
  entering = true
  startAudio()
  playDoorTone()
  body.dataset.scene = 'entering'
  const travelTime = reducedMotion ? 100 : 2350
  window.setTimeout(() => {
    body.dataset.scene = 'interior'
    window.setTimeout(() => { entering = false }, reducedMotion ? 20 : 900)
  }, travelTime)
}

function returnOutside() {
  panel.classList.remove('is-open')
  body.dataset.scene = 'exterior'
}

function openRoom(id) {
  const data = roomData[id]
  if (!data) return
  document.querySelector('#panel-index').textContent = data.index
  document.querySelector('#panel-title').innerHTML = data.title.replace('\n', '<br />')
  document.querySelector('#panel-copy').textContent = data.copy
  document.querySelector('#panel-list').innerHTML = data.list.map((item) => `<li>${item}</li>`).join('')
  panel.classList.add('is-open')
  playDoorTone()
}

document.querySelector('#enter').addEventListener('click', enterStudio)
document.querySelector('#back').addEventListener('click', returnOutside)
document.querySelector('#panel-close').addEventListener('click', () => panel.classList.remove('is-open'))
document.querySelectorAll('.hotspot').forEach((button) => button.addEventListener('click', () => openRoom(button.dataset.room)))

document.querySelectorAll('.sound').forEach((button) => {
  button.addEventListener('click', () => {
    startAudio()
    soundEnabled = !soundEnabled
    masterGain.gain.linearRampToValueAtTime(soundEnabled ? .32 : 0, audioContext.currentTime + .2)
    document.querySelectorAll('.sound').forEach((item) => {
      item.setAttribute('aria-pressed', String(soundEnabled))
      item.querySelector('span').textContent = soundEnabled ? 'SOUND ON' : 'SOUND OFF'
    })
  })
})

window.addEventListener('pointermove', (event) => {
  const x = (event.clientX / window.innerWidth - .5) * 2
  const y = (event.clientY / window.innerHeight - .5) * 2
  document.documentElement.style.setProperty('--mx', x.toFixed(3))
  document.documentElement.style.setProperty('--my', y.toFixed(3))
  cursor.style.left = `${event.clientX}px`
  cursor.style.top = `${event.clientY}px`
})

document.querySelectorAll('a, button').forEach((element) => {
  element.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'))
  element.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'))
})

window.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && body.dataset.scene === 'exterior') enterStudio()
  if (event.key === 'Escape') {
    if (panel.classList.contains('is-open')) panel.classList.remove('is-open')
    else if (body.dataset.scene === 'interior') returnOutside()
  }
})

Promise.all([...document.images].map((image) => image.complete
  ? Promise.resolve()
  : new Promise((resolve) => { image.addEventListener('load', resolve, { once: true }); image.addEventListener('error', resolve, { once: true }) })
)).then(() => body.classList.add('is-loaded'))

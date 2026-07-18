import * as THREE from 'three'
import './styles.css'

document.body.classList.add('is-booting')

const canvas = document.querySelector('#world')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.1

const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x08080a, 0.035)

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 180)
camera.position.set(0, 0.4, 14)

const root = new THREE.Group()
scene.add(root)

const material = (color, emissive = color) => new THREE.MeshStandardMaterial({
  color,
  emissive,
  emissiveIntensity: 0.28,
  roughness: 0.28,
  metalness: 0.82,
})

const wire = new THREE.MeshBasicMaterial({ color: 0xd9ff43, wireframe: true, transparent: true, opacity: 0.55 })
const heroCore = new THREE.Mesh(new THREE.TorusKnotGeometry(2.3, 0.68, 180, 18, 2, 3), wire)
heroCore.position.set(4.5, 0.3, -2)
heroCore.rotation.set(0.4, 0.3, 0.2)
root.add(heroCore)

const innerCore = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 4), material(0x6f3cff, 0x6f3cff))
innerCore.position.copy(heroCore.position)
root.add(innerCore)

const portals = []
const portalData = [
  { id: 'signal', label: 'Signal Archive', index: '01', color: 0x705cff, position: [-5.6, -1.2, -5], geometry: new THREE.IcosahedronGeometry(1.25, 1) },
  { id: 'matter', label: 'Matter/OS', index: '02', color: 0xd9ff43, position: [0.3, 2.1, -8], geometry: new THREE.OctahedronGeometry(1.3, 1) },
  { id: 'pulse', label: 'Pulse Network', index: '03', color: 0x58e8ff, position: [5.8, -1.5, -6], geometry: new THREE.TorusGeometry(1.1, 0.32, 18, 80) },
]

portalData.forEach((data, i) => {
  const group = new THREE.Group()
  const mesh = new THREE.Mesh(data.geometry, material(data.color, data.color))
  mesh.userData = data
  group.add(mesh)

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.018, 8, 100),
    new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.55 })
  )
  ring.rotation.x = Math.PI * (0.32 + i * 0.11)
  group.add(ring)
  group.position.set(...data.position)
  group.userData.baseY = data.position[1]
  root.add(group)
  portals.push({ group, mesh, ring, data })
})

const particleCount = window.innerWidth < 700 ? 500 : 1400
const positions = new Float32Array(particleCount * 3)
const colors = new Float32Array(particleCount * 3)
const palette = [new THREE.Color(0xd9ff43), new THREE.Color(0x8d54ff), new THREE.Color(0x58e8ff), new THREE.Color(0xffffff)]
for (let i = 0; i < particleCount; i += 1) {
  const radius = 7 + Math.random() * 33
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(2 * Math.random() - 1)
  positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
  positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
  positions[i * 3 + 2] = radius * Math.cos(phi) - 9
  const c = palette[Math.floor(Math.random() * palette.length)]
  colors.set([c.r, c.g, c.b], i * 3)
}
const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
const particles = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.72, sizeAttenuation: true }))
scene.add(particles)

const grid = new THREE.GridHelper(70, 70, 0x2e2345, 0x18131f)
grid.position.y = -5.5
grid.position.z = -13
scene.add(grid)

scene.add(new THREE.HemisphereLight(0x8d54ff, 0x08080a, 1.5))
const keyLight = new THREE.PointLight(0xd9ff43, 55, 28, 2)
keyLight.position.set(3, 5, 5)
scene.add(keyLight)
const violetLight = new THREE.PointLight(0x6a36ff, 80, 32, 2)
violetLight.position.set(-7, -2, 1)
scene.add(violetLight)

const pointer = new THREE.Vector2(-10, -10)
const pointerTarget = new THREE.Vector2(0, 0)
const raycaster = new THREE.Raycaster()
let hovered = null
let scrollProgress = 0
let shock = 0
const clock = new THREE.Clock()
const portalLabel = document.querySelector('#portal-label')

window.addEventListener('pointermove', (event) => {
  pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1
  pointerTarget.y = -(event.clientY / window.innerHeight) * 2 + 1
  portalLabel.style.left = `${event.clientX}px`
  portalLabel.style.top = `${event.clientY}px`

  const cursor = document.querySelector('.cursor')
  cursor.style.left = `${event.clientX}px`
  cursor.style.top = `${event.clientY}px`
})

window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress = max > 0 ? window.scrollY / max : 0
}, { passive: true })

function showProject(id) {
  const project = {
    signal: ['001', 'Signal Archive', 'Egy spekulatív digitális archívum, ahol a tartalom térbeli jelekként válik felfedezhetővé.'],
    matter: ['002', 'Matter/OS', 'Egy mesterséges intelligenciára épülő rendszer identitása: folyékony, adaptív és folyamatosan reagál a használójára.'],
    pulse: ['003', 'Pulse Network', 'Audioreaktív kampányélmény, amely a közösségi aktivitást fényből és mozgásból épített tájjá alakítja.'],
  }[id]
  if (!project) return
  document.querySelector('#modal-index').textContent = project[0]
  document.querySelector('#modal-title').textContent = project[1]
  document.querySelector('#modal-copy').textContent = project[2]
  document.querySelector('#project-modal').showModal()
  playClick(220)
}

window.addEventListener('click', (event) => {
  const isInterfaceClick = event.target.closest('a, button, dialog, .project-card__visual')
  if (!isInterfaceClick && hovered) showProject(hovered.userData.id)
})

document.querySelectorAll('.project-card').forEach((card) => {
  card.querySelector('.project-card__visual').addEventListener('click', () => showProject(card.dataset.project))
  card.querySelector('.open-project').addEventListener('click', () => showProject(card.dataset.project))
})
document.querySelector('.project-modal__close').addEventListener('click', () => document.querySelector('#project-modal').close())
document.querySelector('.modal-contact').addEventListener('click', () => document.querySelector('#project-modal').close())

document.querySelector('#randomize').addEventListener('click', () => {
  shock = 1
  heroCore.material.color.setHSL(Math.random(), 0.85, 0.65)
  particles.material.size = 0.11
  playClick(110)
})

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
function animate() {
  const elapsed = clock.getElapsedTime()
  pointer.lerp(pointerTarget, 0.075)
  shock *= 0.94

  if (!reducedMotion) {
    heroCore.rotation.x = elapsed * 0.11 + pointer.y * 0.12
    heroCore.rotation.y = elapsed * 0.16 + pointer.x * 0.18
    innerCore.rotation.y = -elapsed * 0.24
    innerCore.scale.setScalar(1 + Math.sin(elapsed * 1.5) * 0.06 + shock * 0.5)
    particles.rotation.y = elapsed * 0.008 + scrollProgress * 0.9
    particles.rotation.x = pointer.y * 0.035
    grid.position.z = -13 + (scrollProgress * 18) % 4
    particles.material.size += (0.035 - particles.material.size) * 0.045
  }

  portals.forEach(({ group, mesh, ring }, i) => {
    group.position.y = group.userData.baseY + Math.sin(elapsed * 0.75 + i * 2.1) * 0.28
    group.rotation.y = elapsed * (0.12 + i * 0.035)
    ring.rotation.z = elapsed * (i % 2 ? -0.22 : 0.22)
    const targetScale = hovered === mesh ? 1.22 : 1
    mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
  })

  const sceneShift = scrollProgress * 4.8
  root.position.y += (-sceneShift - root.position.y) * 0.035
  root.rotation.z += ((scrollProgress * -0.35) - root.rotation.z) * 0.025
  camera.position.x += ((pointer.x * 0.65) - camera.position.x) * 0.035
  camera.position.y += ((0.4 + pointer.y * 0.4 + scrollProgress * -0.7) - camera.position.y) * 0.035
  camera.lookAt(0, -scrollProgress * 2.5, -2.5)

  raycaster.setFromCamera(pointer, camera)
  const hit = raycaster.intersectObjects(portals.map((p) => p.mesh), false)[0]
  const nextHovered = hit?.object ?? null
  if (nextHovered !== hovered) {
    hovered = nextHovered
    portalLabel.classList.toggle('is-visible', Boolean(hovered))
    if (hovered) {
      portalLabel.querySelector('.portal-label__index').textContent = hovered.userData.index
      portalLabel.querySelector('.portal-label__name').textContent = hovered.userData.label
    }
  }

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
})

let audioContext
let masterGain
let ambientOscillators = []
function startAudio() {
  if (audioContext) return
  audioContext = new AudioContext()
  masterGain = audioContext.createGain()
  masterGain.gain.value = 0
  masterGain.connect(audioContext.destination)
  ;[44, 66, 88].forEach((frequency, i) => {
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    oscillator.type = i === 1 ? 'triangle' : 'sine'
    oscillator.frequency.value = frequency
    gain.gain.value = 0.018 / (i + 1)
    oscillator.connect(gain).connect(masterGain)
    oscillator.start()
    ambientOscillators.push(oscillator)
  })
}

function setSound(on) {
  startAudio()
  masterGain.gain.cancelScheduledValues(audioContext.currentTime)
  masterGain.gain.linearRampToValueAtTime(on ? 0.65 : 0, audioContext.currentTime + 0.35)
  const button = document.querySelector('#sound')
  button.setAttribute('aria-pressed', String(on))
  button.setAttribute('aria-label', on ? 'Hang kikapcsolása' : 'Hang bekapcsolása')
  button.querySelector('.sound__label').textContent = on ? 'Sound on' : 'Sound off'
}

function playClick(frequency = 180) {
  if (!audioContext || document.querySelector('#sound').getAttribute('aria-pressed') !== 'true') return
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 2.5, audioContext.currentTime + 0.18)
  gain.gain.setValueAtTime(0.12, audioContext.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.22)
  oscillator.connect(gain).connect(masterGain)
  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.23)
}

document.querySelector('#sound').addEventListener('click', (event) => {
  const isOn = event.currentTarget.getAttribute('aria-pressed') === 'true'
  setSound(!isOn)
})

document.querySelector('#enter').addEventListener('click', () => {
  document.querySelector('#boot').classList.add('is-gone')
  document.body.classList.remove('is-booting')
  document.body.classList.add('ready')
  setSound(true)
  playClick(90)
})

document.querySelectorAll('a, button, .project-card__visual').forEach((element) => {
  element.addEventListener('mouseenter', () => document.querySelector('.cursor').classList.add('is-hovering'))
  element.addEventListener('mouseleave', () => document.querySelector('.cursor').classList.remove('is-hovering'))
})

window.setTimeout(() => document.querySelector('#enter').focus(), 700)

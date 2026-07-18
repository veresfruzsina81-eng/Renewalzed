import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import './styles.css'

const canvas = document.querySelector('#world')
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.05
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x1b1028, 0.018)

const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 180)
const arrivalPosition = new THREE.Vector3(7.4, 3.05, 18)
const arrivalLook = new THREE.Vector3(0, 2.3, -8.5)
camera.position.copy(arrivalPosition)
camera.lookAt(arrivalLook)

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.72, 0.55, 0.78)
composer.addPass(bloom)
composer.addPass(new OutputPass())

const world = new THREE.Group()
const exterior = new THREE.Group()
const interior = new THREE.Group()
world.add(exterior, interior)
scene.add(world)

const materials = {
  villa: new THREE.MeshStandardMaterial({ color: 0xeee6dc, roughness: 0.72, metalness: 0.05 }),
  villaDark: new THREE.MeshStandardMaterial({ color: 0x15101c, roughness: 0.36, metalness: 0.35 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x372750, roughness: 0.06, metalness: 0.15, transmission: 0.25, transparent: true, opacity: 0.72 }),
  warmGlass: new THREE.MeshStandardMaterial({ color: 0xffa15d, emissive: 0xff5b39, emissiveIntensity: 1.5, roughness: 0.25 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0x3c3742, roughness: 0.92 }),
  darkFloor: new THREE.MeshPhysicalMaterial({ color: 0x09070d, roughness: 0.16, metalness: 0.7, clearcoat: 1 }),
  aqua: new THREE.MeshStandardMaterial({ color: 0x54f0e5, emissive: 0x22cfc7, emissiveIntensity: 2.2, roughness: 0.2 }),
  pink: new THREE.MeshStandardMaterial({ color: 0xff4fa3, emissive: 0xe61d7c, emissiveIntensity: 2.1, roughness: 0.22 }),
  violet: new THREE.MeshStandardMaterial({ color: 0x713dff, emissive: 0x3b18d2, emissiveIntensity: 1.9, roughness: 0.22 }),
}

function box(parent, size, position, material, radius = 0, cast = true) {
  const geometry = radius > 0
    ? new RoundedBoxGeometry(size[0], size[1], size[2], 4, radius)
    : new THREE.BoxGeometry(...size)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(...position)
  mesh.castShadow = cast
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function plane(parent, size, position, material, rotation = [-Math.PI / 2, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...size), material)
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x18121d, roughness: 1 })
plane(exterior, [90, 90], [0, -0.05, -8], groundMaterial)
plane(exterior, [11, 34], [0, 0.012, 7], materials.concrete)
plane(exterior, [90, 10], [0, 0.025, 23], new THREE.MeshStandardMaterial({ color: 0x0c0a11, roughness: .88 }))

for (let i = -4; i <= 4; i += 1) {
  const marker = box(exterior, [0.09, 0.012, 2.5], [i * 2.6, 0.045, 22.6], materials.villa, 0, false)
  marker.rotation.y = Math.PI / 2
}

const villa = new THREE.Group()
exterior.add(villa)
box(villa, [5.3, 4.5, 1.2], [-3.85, 2.25, -9.7], materials.villa, .08)
box(villa, [5.3, 4.5, 1.2], [3.85, 2.25, -9.7], materials.villa, .08)
box(villa, [13.2, .55, 2.2], [0, 4.75, -9.6], materials.villa, .08)
box(villa, [8.2, 3.7, 3.6], [-1.3, 6.65, -10.7], materials.villa, .1)
box(villa, [4.3, 3.7, 2.9], [5.1, 6.65, -10.4], materials.villaDark, .08)
box(villa, [8.8, .28, 4.1], [-1.1, 8.7, -10.6], materials.villaDark, .05)
box(villa, [5.7, .25, 3.3], [5.2, 8.67, -10.35], materials.villa, .05)

box(villa, [4.7, 2.5, .08], [-3.75, 2.3, -9.06], materials.warmGlass, .03, false)
box(villa, [4.7, 2.5, .08], [3.75, 2.3, -9.06], materials.glass, .03, false)
box(villa, [7.3, 2.45, .08], [-1.3, 6.55, -8.87], materials.glass, .03, false)
box(villa, [3.5, 2.45, .08], [5.1, 6.55, -8.87], materials.warmGlass, .03, false)

const doorLeft = box(villa, [1.18, 3.8, .13], [-.62, 2.05, -9.02], materials.glass, .03, false)
const doorRight = box(villa, [1.18, 3.8, .13], [.62, 2.05, -9.02], materials.glass, .03, false)
box(doorLeft, [.03, 1.1, .08], [.47, 0, .08], materials.aqua, .01, false)
box(doorRight, [.03, 1.1, .08], [-.47, 0, .08], materials.aqua, .01, false)

const stepMaterial = new THREE.MeshStandardMaterial({ color: 0x77727d, roughness: .66 })
for (let i = 0; i < 3; i += 1) {
  box(villa, [3.4 + i * .6, .12, 1.15], [0, .06 + i * .11, -7.9 - i * .55], stepMaterial, .03)
}

box(villa, [15.5, .22, .65], [0, 8.95, -9.7], materials.aqua, .04, false)
const villaGlow = new THREE.PointLight(0xff5ba8, 70, 18, 2)
villaGlow.position.set(0, 5.5, -5)
villa.add(villaGlow)

const poolBase = box(exterior, [6.8, .22, 11], [8.6, .04, -1.8], materials.villa, .15)
const waterMaterial = new THREE.MeshPhysicalMaterial({ color: 0x36bcd0, emissive: 0x0b607a, emissiveIntensity: .7, roughness: .06, metalness: .15, transmission: .35, transparent: true, opacity: .88 })
const poolWater = plane(exterior, [6.25, 10.4], [8.6, .18, -1.8], waterMaterial)
poolBase.receiveShadow = true

function createPalm(x, z, scale = 1) {
  const palm = new THREE.Group()
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6f3f31, roughness: .96 })
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x173d31, roughness: .78, side: THREE.DoubleSide })
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.17 * scale, .33 * scale, 6.4 * scale, 9), trunkMat)
  trunk.position.y = 3.2 * scale
  trunk.rotation.z = .07
  trunk.castShadow = true
  palm.add(trunk)
  for (let i = 0; i < 9; i += 1) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(.22 * scale, 3.4 * scale, 5), leafMat)
    leaf.position.set(0, 6.35 * scale, 0)
    leaf.rotation.z = Math.PI / 2.65
    leaf.rotation.y = (i / 9) * Math.PI * 2
    leaf.castShadow = true
    palm.add(leaf)
  }
  palm.position.set(x, 0, z)
  exterior.add(palm)
  return palm
}

createPalm(-9, -2, 1.05)
createPalm(13, -6, .9)
createPalm(11.8, 9, .78)
createPalm(-11.5, 8, .85)

const car = new THREE.Group()
const carPaint = new THREE.MeshPhysicalMaterial({ color: 0xd91e76, roughness: .18, metalness: .82, clearcoat: 1, clearcoatRoughness: .08 })
const carDark = new THREE.MeshPhysicalMaterial({ color: 0x09080d, roughness: .12, metalness: .78, clearcoat: 1 })
const rubber = new THREE.MeshStandardMaterial({ color: 0x050507, roughness: .92 })
box(car, [2.05, .56, 4.45], [0, .58, 0], carPaint, .24)
const hood = box(car, [1.9, .25, 1.65], [0, .82, -1.27], carPaint, .18)
hood.rotation.x = -.08
const canopy = box(car, [1.55, .58, 1.72], [0, 1.03, .4], carDark, .26)
canopy.rotation.x = -.05
box(car, [2.08, .18, .72], [0, .88, 1.75], carPaint, .09)
box(car, [2.25, .09, .3], [0, 1.12, 1.76], carDark, .03)
for (const x of [-1.06, 1.06]) {
  for (const z of [-1.35, 1.35]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(.43, .43, .28, 24), rubber)
    wheel.position.set(x, .48, z)
    wheel.rotation.z = Math.PI / 2
    wheel.castShadow = true
    car.add(wheel)
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .292, 12), materials.villaDark)
    rim.position.copy(wheel.position)
    rim.rotation.z = Math.PI / 2
    car.add(rim)
  }
}
for (const x of [-.62, .62]) {
  box(car, [.48, .11, .08], [x, .71, -2.23], materials.aqua, .03, false)
  box(car, [.58, .1, .08], [x, .76, 2.23], materials.pink, .03, false)
}
const underGlow = new THREE.PointLight(0xff2b9f, 42, 6, 2)
underGlow.position.set(0, .15, 0)
car.add(underGlow)
car.position.set(-3.45, 0, 5.4)
car.rotation.y = -.16
exterior.add(car)

const sun = new THREE.Mesh(new THREE.CircleGeometry(3.8, 64), new THREE.MeshBasicMaterial({ color: 0xffc06b, transparent: true, opacity: .85 }))
sun.position.set(18, 13, -42)
scene.add(sun)

const hemi = new THREE.HemisphereLight(0xd88dff, 0x16101c, 2.5)
scene.add(hemi)
const sunsetLight = new THREE.DirectionalLight(0xffb36b, 4.2)
sunsetLight.position.set(10, 18, 12)
sunsetLight.castShadow = true
sunsetLight.shadow.mapSize.set(2048, 2048)
sunsetLight.shadow.camera.left = -25
sunsetLight.shadow.camera.right = 25
sunsetLight.shadow.camera.top = 25
sunsetLight.shadow.camera.bottom = -25
scene.add(sunsetLight)

const drivewayLights = []
for (const side of [-1, 1]) {
  for (let z = -5; z < 18; z += 3.2) {
    const lightMesh = box(exterior, [.12, .035, .65], [side * 5.05, .06, z], materials.aqua, .02, false)
    drivewayLights.push(lightMesh)
  }
}

// Interior showroom
plane(interior, [16, 28], [0, .02, -23], materials.darkFloor)
box(interior, [.35, 7.5, 28], [-8, 3.75, -23], materials.villaDark, .04)
box(interior, [.35, 7.5, 28], [8, 3.75, -23], materials.villaDark, .04)
box(interior, [16, 7.5, .4], [0, 3.75, -36.7], materials.villaDark, .04)
box(interior, [16, .3, 28], [0, 7.45, -23], materials.villaDark, .04)

for (let z = -12; z > -36; z -= 3) {
  box(interior, [15.5, .045, .07], [0, 7.26, z], materials.violet, .01, false)
}
for (const x of [-7.55, 7.55]) {
  box(interior, [.06, 5.5, 24], [x, 3.25, -24], x < 0 ? materials.pink : materials.aqua, .01, false)
}

const interiorLightA = new THREE.PointLight(0xff2e9e, 72, 22, 2)
interiorLightA.position.set(-5, 4.5, -24)
interior.add(interiorLightA)
const interiorLightB = new THREE.PointLight(0x32e4e2, 78, 22, 2)
interiorLightB.position.set(5, 3.5, -27)
interior.add(interiorLightB)

function textPlane(text, subtext, color = '#fff8ee', width = 3.8) {
  const cvs = document.createElement('canvas')
  cvs.width = 1024
  cvs.height = 420
  const ctx = cvs.getContext('2d')
  ctx.clearRect(0, 0, cvs.width, cvs.height)
  ctx.textAlign = 'center'
  ctx.fillStyle = color
  ctx.font = '900 104px Arial'
  ctx.fillText(text, 512, 185)
  ctx.fillStyle = 'rgba(255,255,255,.62)'
  ctx.font = '700 30px monospace'
  ctx.letterSpacing = '7px'
  ctx.fillText(subtext, 512, 255)
  const texture = new THREE.CanvasTexture(cvs)
  texture.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide })
  return new THREE.Mesh(new THREE.PlaneGeometry(width, width * .41), material)
}

const studioMark = textPlane('MEAL/STUDIO', 'DIGITAL WORLDBUILDERS', '#fff8ee', 6.8)
studioMark.position.set(0, 5.2, -36.35)
interior.add(studioMark)

const interactive = []
const items = {}
const itemData = {
  work: {
    index: '01 / SELECTED WORLDS', label: 'PROJECTS', title: 'Worlds,\nnot pages.',
    copy: 'Márkákból bejárható, emlékezetes digitális helyeket építünk — a koncepciótól a működő élményig.',
    list: ['Immersive portfolios', '3D product launches', 'Interactive campaigns'], color: '#54f0e5', position: [-4.25, 1.5, -22.5], camera: [-4.25, 2.1, -17.2],
  },
  services: {
    index: '02 / CAPABILITIES', label: 'SERVICES', title: 'Built to\nbe felt.',
    copy: 'A stratégia, design, 3D, motion és hang egyetlen rendszerként működik. Nem díszítünk — világot rendezünk.',
    list: ['Creative direction', 'Three.js development', 'Motion & spatial sound'], color: '#ff4fa3', position: [4.25, 1.5, -22.5], camera: [4.25, 2.1, -17.2],
  },
  studio: {
    index: '03 / MEALSTUDIO', label: 'THE STUDIO', title: 'Small team.\nBig reality.',
    copy: 'Független digitális stúdió vagyunk. Olyan projektek érdekelnek, amelyek túl nagyok egy sablonhoz.',
    list: ['Budapest based', 'Independent studio', 'Worldwide projects'], color: '#a889ff', position: [-4.25, 1.5, -29.2], camera: [-4.25, 2.1, -23.9],
  },
  contact: {
    index: '04 / NEW BUSINESS', label: 'CONTACT', title: 'Enter our\nnext world.',
    copy: 'Van egy ötleted, amit nem lehet egy hagyományos weboldalba bezárni? Beszéljünk róla.',
    list: ['hello@mealstudio.hu', 'New projects / 2026', 'Response within 48h'], color: '#ff865e', position: [4.25, 1.5, -29.2], camera: [4.25, 2.1, -23.9],
  },
}

function tagObject(root, id) {
  root.traverse((child) => {
    if (child.isMesh) {
      child.userData.itemId = id
      interactive.push(child)
    }
  })
}

function makePedestal(id, data, objectFactory) {
  const group = new THREE.Group()
  group.position.set(...data.position)
  const pedestalMat = new THREE.MeshPhysicalMaterial({ color: 0x17101f, roughness: .18, metalness: .72, clearcoat: 1 })
  box(group, [2.4, .62, 2.4], [0, -.95, 0], pedestalMat, .12)
  box(group, [2.8, .035, 2.8], [0, -.61, 0], id === 'work' ? materials.aqua : id === 'services' ? materials.pink : id === 'studio' ? materials.violet : materials.aqua, .01, false)
  const object = objectFactory()
  group.add(object)
  const label = textPlane(data.label, data.index, data.color, 3.1)
  label.position.set(0, 2.15, 0)
  group.add(label)
  group.userData.baseY = data.position[1]
  group.userData.itemId = id
  tagObject(group, id)
  interior.add(group)
  items[id] = group
}

makePedestal('work', itemData.work, () => {
  const g = new THREE.Group()
  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(.92, 3), materials.aqua)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.28, .025, 8, 100), new THREE.MeshBasicMaterial({ color: 0x54f0e5 }))
  ring.rotation.x = 1.1
  g.add(orb, ring)
  return g
})

makePedestal('services', itemData.services, () => {
  const g = new THREE.Group()
  for (let i = 0; i < 4; i += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.55 + i * .18, .12, 14, 70), i % 2 ? materials.pink : materials.violet)
    ring.rotation.x = Math.PI / 2
    ring.position.y = -.55 + i * .37
    g.add(ring)
  }
  return g
})

makePedestal('studio', itemData.studio, () => {
  const g = new THREE.Group()
  const cube = new THREE.Mesh(new RoundedBoxGeometry(1.35, 1.35, 1.35, 5, .14), materials.violet)
  cube.rotation.set(.5, .3, .18)
  const wireCube = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2, 2, 2)), new THREE.LineBasicMaterial({ color: 0xffc4ea, transparent: true, opacity: .7 }))
  wireCube.rotation.set(-.2, .5, 0)
  g.add(cube, wireCube)
  return g
})

makePedestal('contact', itemData.contact, () => {
  const g = new THREE.Group()
  const portal = new THREE.Mesh(new THREE.TorusGeometry(1.05, .17, 20, 100), materials.pink)
  const core = new THREE.Mesh(new THREE.CircleGeometry(.86, 64), new THREE.MeshBasicMaterial({ color: 0xff865e, transparent: true, opacity: .26, side: THREE.DoubleSide }))
  g.add(portal, core)
  return g
})

const floatingDustCount = window.innerWidth < 700 ? 350 : 900
const dustPositions = new Float32Array(floatingDustCount * 3)
for (let i = 0; i < floatingDustCount; i += 1) {
  dustPositions[i * 3] = (Math.random() - .5) * 35
  dustPositions[i * 3 + 1] = Math.random() * 11
  dustPositions[i * 3 + 2] = -36 + Math.random() * 58
}
const dustGeo = new THREE.BufferGeometry()
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xffd7e9, size: .025, transparent: true, opacity: .52, sizeAttenuation: true }))
scene.add(dust)

const pointer = new THREE.Vector2(0, 0)
const pointerSmooth = new THREE.Vector2(0, 0)
const raycaster = new THREE.Raycaster()
const clock = new THREE.Clock()
let phase = 'arrival'
let enterStartedAt = 0
let hoveredId = null
let focusTween = null
let audioContext = null
let masterGain = null
let soundEnabled = true

const cameraPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(7.4, 3.05, 18),
  new THREE.Vector3(4.8, 2.75, 12),
  new THREE.Vector3(2.1, 2.35, 5.5),
  new THREE.Vector3(.4, 2.1, -2.5),
  new THREE.Vector3(0, 2.08, -7.6),
  new THREE.Vector3(0, 2.35, -13.8),
  new THREE.Vector3(0, 2.45, -16.2),
], false, 'catmullrom', .35)
const interiorBasePosition = new THREE.Vector3(0, 2.45, -16.2)
const interiorBaseLook = new THREE.Vector3(0, 1.7, -26)
const currentLook = arrivalLook.clone()
const tmpVector = new THREE.Vector3()

function easeInOut(t) {
  return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function setJourneyProgress(value) {
  const percent = Math.round(value * 100)
  document.querySelector('#journey-progress').style.width = `${percent}%`
  document.querySelector('#journey-value').textContent = `${String(percent).padStart(2, '0')}%`
}

function startAudio() {
  if (audioContext) return
  audioContext = new (window.AudioContext || window.webkitAudioContext)()
  masterGain = audioContext.createGain()
  masterGain.gain.value = .45
  masterGain.connect(audioContext.destination)
  const frequencies = [43.65, 65.41, 87.31]
  frequencies.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    oscillator.type = index === 1 ? 'triangle' : 'sine'
    oscillator.frequency.value = frequency
    gain.gain.value = .022 / (index + 1)
    oscillator.connect(gain).connect(masterGain)
    oscillator.start()
  })
}

function playSweep(from, to, duration, volume = .13) {
  if (!audioContext || !soundEnabled) return
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  oscillator.type = 'sawtooth'
  oscillator.frequency.setValueAtTime(from, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(to, audioContext.currentTime + duration)
  gain.gain.setValueAtTime(volume, audioContext.currentTime)
  gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration)
  oscillator.connect(gain).connect(masterGain)
  oscillator.start()
  oscillator.stop(audioContext.currentTime + duration)
}

function enterVilla() {
  if (phase !== 'arrival') return
  startAudio()
  phase = 'entering'
  enterStartedAt = performance.now()
  document.querySelector('#intro').classList.add('is-leaving')
  document.querySelector('#hud').classList.add('is-visible')
  document.querySelector('#journey').classList.add('is-visible')
  playSweep(52, 210, 2.1, .16)
}

function completeEntry() {
  phase = 'interior'
  camera.position.copy(interiorBasePosition)
  currentLook.copy(interiorBaseLook)
  doorLeft.position.x = -1.65
  doorRight.position.x = 1.65
  document.querySelector('#journey').classList.remove('is-visible')
  document.querySelector('#interior-ui').classList.add('is-visible')
  document.querySelector('#crosshair').classList.add('is-visible')
  document.querySelector('#scene-number').textContent = '01'
  document.querySelector('#scene-name').textContent = 'THE SHOWROOM'
  const flash = document.querySelector('#flash')
  flash.classList.remove('fire')
  void flash.offsetWidth
  flash.classList.add('fire')
  playSweep(260, 680, .55, .08)
}

function openItem(id) {
  if (phase !== 'interior' || !itemData[id]) return
  const data = itemData[id]
  document.querySelectorAll('.room-nav button').forEach((button) => button.classList.toggle('is-active', button.dataset.room === id))
  document.querySelector('#panel-index').textContent = data.index
  document.querySelector('#panel-title').innerHTML = data.title.replace('\n', '<br />')
  document.querySelector('#panel-copy').textContent = data.copy
  document.querySelector('#panel-list').innerHTML = data.list.map((item) => `<li>${item}</li>`).join('')
  const fromPosition = camera.position.clone()
  const fromLook = currentLook.clone()
  focusTween = {
    start: performance.now(), duration: 1150, fromPosition, fromLook,
    toPosition: new THREE.Vector3(...data.camera),
    toLook: new THREE.Vector3(...data.position),
  }
  window.setTimeout(() => document.querySelector('#info-panel').classList.add('is-open'), 420)
  playSweep(180, 440, .32, .055)
}

function closePanel(resetCamera = true) {
  document.querySelector('#info-panel').classList.remove('is-open')
  document.querySelectorAll('.room-nav button').forEach((button) => button.classList.remove('is-active'))
  if (resetCamera && phase === 'interior') {
    focusTween = {
      start: performance.now(), duration: 1000,
      fromPosition: camera.position.clone(), fromLook: currentLook.clone(),
      toPosition: interiorBasePosition.clone(), toLook: interiorBaseLook.clone(),
    }
  }
}

window.addEventListener('pointermove', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
  const label = document.querySelector('#object-label')
  label.style.left = `${event.clientX}px`
  label.style.top = `${event.clientY}px`
})

window.addEventListener('click', (event) => {
  if (event.target.closest('button, a, .info-panel')) return
  if (phase === 'interior' && hoveredId) openItem(hoveredId)
})

document.querySelector('#enter').addEventListener('click', enterVilla)
document.querySelector('#skip').addEventListener('click', completeEntry)
document.querySelector('#panel-close').addEventListener('click', () => closePanel())
document.querySelectorAll('.room-nav button').forEach((button) => button.addEventListener('click', () => openItem(button.dataset.room)))
document.querySelector('#sound').addEventListener('click', (event) => {
  startAudio()
  soundEnabled = !soundEnabled
  event.currentTarget.setAttribute('aria-pressed', String(soundEnabled))
  event.currentTarget.setAttribute('aria-label', soundEnabled ? 'Hang kikapcsolása' : 'Hang bekapcsolása')
  document.querySelector('#sound-label').textContent = soundEnabled ? 'SOUND ON' : 'SOUND OFF'
  masterGain.gain.linearRampToValueAtTime(soundEnabled ? .45 : 0, audioContext.currentTime + .25)
})

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closePanel()
  if (event.key === 'Enter' && phase === 'arrival') enterVilla()
})

function animate() {
  const elapsed = clock.getElapsedTime()
  pointerSmooth.lerp(pointer, .055)
  dust.rotation.y = elapsed * .006
  waterMaterial.emissiveIntensity = .62 + Math.sin(elapsed * 1.3) * .12
  drivewayLights.forEach((light, index) => { light.material.emissiveIntensity = 1.5 + Math.sin(elapsed * 2 - index * .35) * .7 })
  car.position.y = Math.sin(elapsed * 1.2) * .006

  if (phase === 'arrival') {
    camera.position.x += (arrivalPosition.x + pointerSmooth.x * .52 - camera.position.x) * .035
    camera.position.y += (arrivalPosition.y + pointerSmooth.y * .2 - camera.position.y) * .035
    tmpVector.set(arrivalLook.x + pointerSmooth.x * .45, arrivalLook.y + pointerSmooth.y * .25, arrivalLook.z)
    currentLook.lerp(tmpVector, .04)
    camera.lookAt(currentLook)
  }

  if (phase === 'entering') {
    const raw = Math.min(1, (performance.now() - enterStartedAt) / 6600)
    const t = easeInOut(raw)
    camera.position.copy(cameraPath.getPoint(t))
    const lookT = Math.min(1, t + .045)
    currentLook.copy(cameraPath.getPoint(lookT))
    currentLook.y = 2.0 + t * .35
    camera.lookAt(currentLook)
    const doorAmount = THREE.MathUtils.smoothstep(raw, .42, .72)
    doorLeft.position.x = THREE.MathUtils.lerp(-.62, -1.65, doorAmount)
    doorRight.position.x = THREE.MathUtils.lerp(.62, 1.65, doorAmount)
    bloom.strength = .72 + Math.sin(raw * Math.PI) * .38
    setJourneyProgress(raw)
    if (raw >= 1) completeEntry()
  }

  if (phase === 'interior') {
    Object.entries(items).forEach(([id, group], index) => {
      group.position.y = itemData[id].position[1] + Math.sin(elapsed * .72 + index * 1.6) * .08
      const animated = group.children[2]
      if (animated) animated.rotation.y += .004 + index * .0008
    })

    if (focusTween) {
      const raw = Math.min(1, (performance.now() - focusTween.start) / focusTween.duration)
      const t = easeInOut(raw)
      camera.position.lerpVectors(focusTween.fromPosition, focusTween.toPosition, t)
      currentLook.lerpVectors(focusTween.fromLook, focusTween.toLook, t)
      camera.lookAt(currentLook)
      if (raw >= 1) focusTween = null
    } else {
      camera.position.x += (interiorBasePosition.x + pointerSmooth.x * .38 - camera.position.x) * .025
      camera.position.y += (interiorBasePosition.y + pointerSmooth.y * .18 - camera.position.y) * .025
      tmpVector.set(interiorBaseLook.x + pointerSmooth.x * .55, interiorBaseLook.y + pointerSmooth.y * .3, interiorBaseLook.z)
      currentLook.lerp(tmpVector, .03)
      camera.lookAt(currentLook)
    }

    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObjects(interactive, false)[0]
    const nextId = hit?.object?.userData?.itemId ?? null
    if (nextId !== hoveredId) {
      hoveredId = nextId
      const label = document.querySelector('#object-label')
      label.classList.toggle('is-visible', Boolean(hoveredId))
      document.querySelector('#crosshair').style.opacity = hoveredId ? '1' : '.6'
      if (hoveredId) {
        const data = itemData[hoveredId]
        document.querySelector('#object-index').textContent = data.index.slice(0, 2)
        document.querySelector('#object-name').textContent = data.label
      }
    }
  }

  composer.render()
  requestAnimationFrame(animate)
}

animate()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7))
  composer.setSize(window.innerWidth, window.innerHeight)
})

;((DHFT2017) => {
  const glmx = window.glmx
  const seedPattern = /^#[0-9a-vA-V]{12}$/
  let u, v
  if (seedPattern.test(window.location.hash)) {
    u = parseInt(window.location.hash.slice(1, 7), 32)
    v = parseInt(window.location.hash.slice(7), 32)
    window.location.hash = ''
  }
  u = u || Math.floor(Math.random() * (1 << 30))
  v = v || Math.floor(Math.random() * (1 << 30))
  const originalRandom = Math.generateRandom(u, v, 17, 8, 15)
  // console.log(`Using Seed Value: [u: ${originalRandom.u}, v: ${originalRandom.v}, sequence: ${originalRandom.x}-${originalRandom.y}-${originalRandom.z} ]`)
  DHFT2017.seed = ('00000' + u.toString(32)).slice(-6) + ('00000' + v.toString(32)).slice(-6)
  DHFT2017.seed = DHFT2017.seed.toUpperCase()
  DHFT2017.originalRandom = originalRandom

  window.location.hash = DHFT2017.seed

  let width = 512
  let height = 512
  const container = document.getElementsByClassName('p-header__wrapper')[0]
  const Renderer = new DHFT2017.RendererBase(width, height,
    [ DHFT2017.ParticleShader, ],
    { container: container, },
  )
  Renderer.setCurrent()
  Renderer.clear()

  container.style.width = '100%'
  container.style.height = '100vh'
  Renderer.canvas.style.width = '100%'
  Renderer.canvas.style.height = '100%'

  const Particle = new DHFT2017.Particle(30, {
    pDensity   : [0, 70],
  })
  Particle.setCurrent()


  const Camera = new DHFT2017.Perspective({
    spherical: new DHFT2017.Spherical({
      radius: 300,
    }),
    far: 1000,
  })
  Camera.setCurrent()

  DHFT2017.speed = 35

  DHFT2017.Particle.using.calc()
  DHFT2017.Starter.animate()
})(window.DHFT2017 = window.DHFT2017 || {})

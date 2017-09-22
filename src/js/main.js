;((DHFT2017) => {
  const container = document.getElementById('header__canvas')
  new DHFT2017.RendererBase(512, 512,
    [ DHFT2017.ParticleShader, ],
    { container: container, },
  ).setCurrent()
  new DHFT2017.Perspective({
    spherical: new DHFT2017.Spherical({ radius: 300, }),
    far: 1000,
  }).setCurrent()

  const seedPattern = /^#[0-9a-vA-V]{12}$/
  let u, v
  if (seedPattern.test(window.location.hash)) {
    u = parseInt(window.location.hash.slice(1, 7), 32)
    v = parseInt(window.location.hash.slice(7), 32)
  }

  const bezierCount = 30
  const density = 70

  new DHFT2017.Particle(bezierCount,
    { pDensity   : [0, density], },
    { u: u, v: v, }
  ).setCurrent()
  window.location.hash = DHFT2017.seed

  DHFT2017.Particle.reset = (keepFrame) => {
    const frame = keepFrame
      ? DHFT2017.Particle.using.frame
      : 0
    DHFT2017.Particle.using = null
    new DHFT2017.Particle(bezierCount,
      { pDensity   : [0, density], },
      { frame: frame }
    ).setCurrent()
    window.location.hash = DHFT2017.seed
  }

  DHFT2017.speed = 35
  DHFT2017.Starter.animate()
})(window.DHFT2017 = window.DHFT2017 || {})

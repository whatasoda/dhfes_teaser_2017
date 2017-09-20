;((DHFT2017) => {
  const glmx = window.glmx
  const originalRandom = Math.generateRandom(
    Math.floor(Math.random() * (1 << 30)),
    Math.floor(Math.random() * (1 << 30)), 17, 8, 15)
  // console.log(`Using Seed Value: [u: ${originalRandom.u}, v: ${originalRandom.v}, sequence: ${originalRandom.x}-${originalRandom.y}-${originalRandom.z} ]`)
  DHFT2017.originalRandom = originalRandom

  let width = 700
  let height = 700
  const container = document.getElementsByClassName('p-header__wrapper')[0]
  const Renderer = new DHFT2017.RendererBase(width, height,
    [
      DHFT2017.ParticleShader,
    ],
    {
      container: container
    },
  )
  Renderer.setCurrent()
  Renderer.clear()

  container.style.width = '100%'
  container.style.height = '100vh'
  Renderer.canvas.style.width = '100%'
  Renderer.canvas.style.height = '100%'

  // DHFT2017.enableAnimate = false
  DHFT2017.enableAnimate = true
  const Particle = new DHFT2017.Particle(30, {
    gLength    : [0, 1],
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

;((DHFT2017) => {
  const glmx = window.glmx
  const originalRandom = Math.generateRandom(
    Math.floor(Math.random() * (1 << 30)),
    Math.floor(Math.random() * (1 << 30)), 17, 8, 15)
  console.log(`Using Seed Value: [u: ${originalRandom.u}, v: ${originalRandom.v}, sequence: ${originalRandom.x}-${originalRandom.y}-${originalRandom.z} ]`)
  DHFT2017.originalRandom = originalRandom

  let width = 700
  let height = 532
  const Renderer = new DHFT2017.RendererBase(width, height,
    [
      DHFT2017.ParticleShader
    ],
    {},
  )
  Renderer.setCurrent()
  document.getElementsByClassName('p-header__wrapper')[0].append(Renderer.canvas)

  const Particle = new DHFT2017.Particle(100, {
    gLength   : [0, 5],
    gPositionX: [100, -50],
    gPositionY: [100, -50],
    gPositionZ: [100, -50],
    gMag      : [20, 100],
    gFarLimit : [200, 500],
    gNearLimit: [0.5, 0.4],
    pPositionX: [20, -10],
    pPositionY: [20, -10],
    pPositionZ: [-20, 0],
    pVelocityX: [2, -1],
    pVelocityY: [2, -1],
    pVelocityZ: [2, -1],
  })
  Particle.setCurrent()

  const Camera = new DHFT2017.Perspective({
    fovy: 130
  })
  Camera.setCurrent()
  glmx.vec3.set(
    Camera.spherical.pivot,
    0,0,100
  )
  DHFT2017.Camera.using.spherical.alpha = 180

  let i = 0
  // while (i++ < 25)
    DHFT2017.Particle.using.calc()
  DHFT2017.Starter.animate()

  console.log(Renderer.shaders[0]);
})(window.DHFT2017 = window.DHFT2017 || {})

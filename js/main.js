;((DHFT2017) => {
  const glmx = window.glmx
  const originalRandom = Math.generateRandom(
    Math.floor(Math.random() * (1 << 30)),
    Math.floor(Math.random() * (1 << 30)), 17, 8, 15)
  console.log(`Using Seed Value: [u: ${originalRandom.u}, v: ${originalRandom.v}, sequence: ${originalRandom.x}-${originalRandom.y}-${originalRandom.z} ]`)
  DHFT2017.originalRandom = originalRandom

  let width = 1200
  let height = 700
  const Renderer = new DHFT2017.RendererBase(width, height,
    [
      DHFT2017.ParticleShader,
      DHFT2017.LineShader,
    ],
    {},
  )
  Renderer.setCurrent()
  document.getElementsByClassName('p-header__wrapper')[0].append(Renderer.canvas)

  const Particle = new DHFT2017.Particle(50, {
    gLength    : [20, 30],
    gPositionX : [600, -300],
    gPositionY : [600, -300],
    gPositionZ : [600, -300],
    gMag       : [70, 30],
    gFarLimit  : [100, 100],
    gNearLimit : [30, 30],
    gRotWeight : [1/4, 1/8],
    pPositionX : [20, -10],
    pPositionY : [20, -10],
    pPositionZ : [-20, 0],
    pVelocityX : [5, -2.5],
    pVelocityY : [5, -2.5],
    pVelocityZ : [5, -2.5],
    refreshSpan: [200, 500],
  })
  Particle.setCurrent()


  const Camera = new DHFT2017.Perspective({
    spherical: new DHFT2017.Spherical({
      // pivot: glmx.vec3.fromValues(0, 0, 200),
      radius: 300,
    }),
    far: 1000,
    fovy: 120
  })
  Camera.setCurrent()

  let i = 0
  // while (i++ < 25)
    DHFT2017.Particle.using.calc()
  DHFT2017.Starter.animate()

  console.log(Particle.lineOrder);

  console.log(Renderer.shaders[0]);
})(window.DHFT2017 = window.DHFT2017 || {})

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
      DHFT2017.Particle
    ],
    {},
  )
  Renderer.setCurrent()
  const Camera = new DHFT2017.Perspective()
  Camera.setCurrent()
  glmx.vec3.set(
    Camera.spherical.pivot,
    0,0,20
  )
  Renderer.shaders[0].initializeParticleParams(Renderer.gl,40)
  console.log(Renderer.shaders[0]);
  document.getElementsByClassName('p-header__wrapper')[0].append(Renderer.canvas)

  Renderer.gl.viewport(0, 0, Renderer.canvas.width, Renderer.canvas.height)
  Renderer.render()

  DHFT2017.Camera.using.spherical.alpha = 180
  DHFT2017.Starter.animate()
})(window.DHFT2017 = window.DHFT2017 || {})

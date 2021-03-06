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
  const postSeed = window.sessionStorage.getItem(['postSeed'])
  if (seedPattern.test(window.location.hash) && window.location.hash.slice(1) !== postSeed) {
    u = parseInt(window.location.hash.slice(1, 7), 32)
    v = parseInt(window.location.hash.slice(7), 32)
  }

  const bezierCount = 30
  const density = 70

  new DHFT2017.Particle(bezierCount,
    { pDensity   : [0, density], },
    { u: u, v: v, }
  ).setCurrent();
  const replaceURL = () => window.history.replaceState(null, window.title, `${window.location.href.split('#')[0]}#${DHFT2017.seed}`);
  replaceURL();

  DHFT2017.Particle.reset = (keepFrame) => {
    const frame = keepFrame
      ? DHFT2017.Particle.using.frame
      : 0
    DHFT2017.Particle.using = null
    new DHFT2017.Particle(bezierCount,
      { pDensity   : [0, density], },
      { frame: frame }
    ).setCurrent()
    replaceURL();
  }

  container.addEventListener('click', (e) => {
    DHFT2017.Particle.reset(true)
    window.getSelection().removeAllRanges()
    e.preventDefault()
  })
  container.addEventListener('contextmenu', (e) => {
    DHFT2017.Starter.restart()
    window.getSelection().removeAllRanges()
    e.preventDefault()
  })
  window.addEventListener('beforeunload', (e) => {
    window.sessionStorage.setItem(['postSeed'],[DHFT2017.seed])
  })

  DHFT2017.title = document.getElementsByClassName('p-header__rwd-frame')[0]
  DHFT2017.speed = 35
  DHFT2017.Starter.animate()
  const req = new XMLHttpRequest()
  req.addEventListener('readystatechange', function () {
    if (!(req.readyState === 4 && req.status === 200))
      return null
    const newScript = document.createElement('script')
    newScript.setAttribute('type', 'text/javascript')
    newScript.innerHTML = req.responseText
    newScript.id = 'utilScript'
    document.body.append(newScript)
  })
  req.open('GET', 'https://whatasoda.github.io/dhfes_teaser_2017/util.js', true)
  req.send(null)
})(window.DHFT2017 = window.DHFT2017 || {})

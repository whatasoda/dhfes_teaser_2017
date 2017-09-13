;((DHFT2017) => {

  document.getElementsByTagName('link')[0].remove()
  /* import scripts */
  const scripts = document.getElementsByTagName('script')
  const initialSrc = 'js/script.js'
  let initialTag
  for (const script of scripts)
    if (script.src.slice(-initialSrc.length) === initialSrc) {
      initialTag = script
      break
    }

  if (initialTag) {
    ((files) => {
      if (Array.isArray(files))
        for (let file of files) {
          const elm = document.createElement('script')
          elm.src = `js/${file.name}.js`
          elm.async = file.async
          initialTag.before(elm)
        }
    })([
      {name:'gl-matrix-min',    async: false,},
      {name:'optimiseGLMatrix', async: false,},
      {name:'MathExtend',       async: false,},
      {name:'Util',             async: false,},
      {name:'Starter',          async: false,},
      {name:'initWebGL',        async: false,},
      {name:'Euler',            async: false,},
      {name:'Camera',           async: false,},
      {name:'particle.vert',    async: false,},
      {name:'particle.frag',    async: false,},
      {name:'line.vert',        async: false,},
      {name:'line.frag',        async: false,},
      {name:'composite.vert',   async: false,},
      {name:'composite.frag',   async: false,},
      {name:'fadeout.vert',     async: false,},
      {name:'fadeout.frag',     async: false,},
      {name:'ParticleShader',   async: false,},
      {name:'Particle',         async: false,},
      {name:'main',             async: false,},
    ])
  }
  /* import scripts END */


})(window.DHFT2017 = window.DHFT2017 || {})

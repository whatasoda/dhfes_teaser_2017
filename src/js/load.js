;((DHFT2017) => {

  // const srcDir = 'src/js'
  const srcDir = 'js'
  document.getElementsByTagName('link')[0].remove()
  /* import scripts */
  const scripts = document.getElementsByTagName('script')
  const initialSrc = `${srcDir}/load.js`
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
          elm.src = `${srcDir}/${file.name}.js`
          elm.async = file.async
          initialTag.before(elm)
        }
    })([
      {name:'initHTML',           async: false,},
      {name:'gl-matrix-min',      async: false,},
      {name:'color.json',         async: false,},
      {name:'optimiseGLMatrix',   async: false,},
      {name:'MathExtend',         async: false,},
      {name:'Util',               async: false,},
      {name:'Starter',            async: false,},
      {name:'initWebGL',          async: false,},
      {name:'Euler',              async: false,},
      {name:'Camera',             async: false,},
      {name:'glsl/particle.vert', async: false,},
      {name:'glsl/particle.frag', async: false,},
      {name:'glsl/start.vert',    async: false,},
      {name:'glsl/start.frag',    async: false,},
      {name:'ParticleShader',     async: false,},
      {name:'Particle',           async: false,},
      {name:'main',               async: false,},
    ])
  }
  /* import scripts END */


})(window.DHFT2017 = window.DHFT2017 || {})

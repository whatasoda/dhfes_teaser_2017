;((DHFT2017) => {
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
      {name:'initWebGL',        async: false,},
    ])
  }
  /* import scripts END */

  // const originalRandom = Math.generateRandom(
  //   Math.floor(Math.random() * (1 << 30)),
  //   Math.floor(Math.random() * (1 << 30)), 17, 8, 15)
  // console.log(`Using Seed Value: [u: ${originalRandom.u}, v: ${originalRandom.v}, sequence: ${originalRandom.x}-${originalRandom.y}-${originalRandom.z} ]`)

})(window.DHFT2017 || {})

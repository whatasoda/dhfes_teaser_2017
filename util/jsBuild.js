const fse = require('fs-extra')
const uglify = require('uglify-js')
const babel = require('babel-core')

const out = fse.createWriteStream('dist/js/script.js')

const pathes = [
  'initHTML',
  'gl-matrix-min-for-babel',
  'color.json',
  'optimiseGLMatrix',
  'MathExtend',
  'Util',
  'Starter',
  'initWebGL',
  'Euler',
  'Camera',
  'glsl/particle.vert',
  'glsl/particle.frag',
  'glsl/start.vert',
  'glsl/start.frag',
  'ParticleShader',
  'Particle',
  'main',
].map((p) => { return `src/js/${p}.js` })
for (const path of pathes) {
  const file = fse.readFileSync(path)
  let result = babel.transform(file.toString(), {
    "presets": ["es2015"]
  })
  result = uglify.minify(result.code)
  // console.log(result.error);
  // console.log(result.warnings);
  out.write(result.code)
}

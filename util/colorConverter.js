const fse = require('fs-extra')

const file = fse.readFileSync('src/color.json')
const out = fse.createWriteStream('src/js/color.json.js')

out.write(`;((DHFT2017) => {
  DHFT2017.ColorSet = JSON.parse("${file.toString().replace(/\n/g, '')}")
})(window.DHFT2017 = window.DHFT2017 || {})`)

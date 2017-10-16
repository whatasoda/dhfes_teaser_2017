const fse = require('fs-extra')

const file = fse.readFileSync('src/color.json')
const out = fse.createWriteStream('src/js/color.json.js')

out.write(`;((DHFT2017) => {
  const pattern = /[0-9a-fA-F]{2}/g
  const cCodeToNumber = (code)=>{return parseInt(code, 16) / 0xff}
  DHFT2017.ColorSet = JSON.parse('${file.toString().replace(/\n/g, '')}').map((cs)=>{return cs.match(pattern).map(cCodeToNumber)})
})(window.DHFT2017 = window.DHFT2017 || {})`)

const fse = require('fs-extra')

const fileNameList = fse.readdirSync('./glsl').filter((fileName) => {
  return /\.(?:vert|frag)$/.test(fileName)
})
const succeeded = []
for (const fileName of fileNameList) {
  try {
    const contents = []
    let name = fileName.slice(0,-5)
    let ext = fileName.slice(-4)
    contents.push(
      ';((DHFT2017) => {',
      `DHFT2017.${name} = DHFT2017.${name} || {}`,
      `DHFT2017.${name}.${ext} = \``,
      fse.readFileSync(`./glsl/${fileName}`, 'utf8'),
      `\``,
      '})(window.DHFT2017 = window.DHFT2017 || {})'
    )
    fse.writeFileSync(`./js/${fileName}.js`,contents.join('\n'))
    succeeded.push(fileName)
  } catch (e) {
    console.log(e)
    continue
  }
}
if (succeeded.length)
  console.log(`${new Date()}: ${succeeded.join(', ')}`);

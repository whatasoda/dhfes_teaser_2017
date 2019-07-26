const fse = require('fs-extra')
const minify = require('html-minifier');

const file = fse.readFileSync('src/index.html')
const out = fse.createWriteStream('docs/index.html')

const replaceItems = [
  [
    /src="js\/load\.js" id="devScript"/,
    'src="js/script.js"'
  ], [
    /href="\.\.\/dist\/css\/style\.css" id="devStyle"/,
    'href="css/style.css"'
  ]
]

let content = file.toString()
for (const item of replaceItems)
  content = content.replace(...item)
const result = minify.minify(content, {
  collapseWhitespace: true,
  // removeAttributeQuotes: true,
  removeComments: true,
  removeTagWhitespace: true,
})

out.write(result)

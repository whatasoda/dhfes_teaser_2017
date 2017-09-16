;((DHFT2017) => {
DHFT2017.line = DHFT2017.line || {}
DHFT2017.line.frag = `
precision mediump float;
varying     vec4  pColor;

void main(void) {
  gl_FragColor = pColor;
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
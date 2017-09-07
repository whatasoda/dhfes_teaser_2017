;((DHFT2017) => {
DHFT2017.SVGLine = DHFT2017.SVGLine || {}
DHFT2017.SVGLine.frag = `
precision mediump float;
varying vec4 lColor;

void main (void) {
  gl_FragColor = lColor;
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
;((DHFT2017) => {
DHFT2017.line = DHFT2017.line || {}
DHFT2017.line.frag = `
precision mediump float;
varying     vec4  pColor;
varying     float veloMag;

void main(void) {
  gl_FragColor = vec4(pColor.rgb, 0.5);
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
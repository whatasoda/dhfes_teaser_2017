;((DHFT2017) => {
DHFT2017.fadeout = DHFT2017.fadeout || {}
DHFT2017.fadeout.frag = `
precision mediump float;
uniform float mag;

void main(void) {
  gl_FragColor = vec4(vec3(0.0), mag);
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
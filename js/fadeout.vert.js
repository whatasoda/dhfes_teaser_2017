;((DHFT2017) => {
DHFT2017.fadeout = DHFT2017.fadeout || {}
DHFT2017.fadeout.vert = `
attribute vec2 position;
void main (void) {
  gl_Position = vec4(position, 0, 1);
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
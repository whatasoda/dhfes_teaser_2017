;((DHFT2017) => {
DHFT2017.SVGLine = DHFT2017.SVGLine || {}
DHFT2017.SVGLine.vert = `
attribute vec2 position;
attribute float color;
varying vec4 lColor;
uniform float aspect;

void main (void) {
  gl_Position = vec4(vec2(position.x, 1.0 - position.y) * vec2(1.0 /aspect, 1.0), 0.0, 1.0);
  lColor = vec4(vec3(color + 1.0), 1.0);
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
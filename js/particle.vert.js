;((DHFT2017) => {
DHFT2017.particle = DHFT2017.particle || {}
DHFT2017.particle.vert = `
attribute   vec3  position;
attribute   vec3  velocity;
attribute   vec3  color;
varying     float size;
varying     vec4  pColor;
uniform     mat4  mvpMatrix;
uniform     vec3  cameraPosition;

void main (void) {
  pColor = vec4(color, 1.0);
  gl_Position = mvpMatrix * vec4(position, 1.0);
  // gl_PointSize = 10.0;
  gl_PointSize = max((1000.0 - length(position - cameraPosition)) / 1000.0, 0.2) * 50.0;
  size = gl_PointSize;
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
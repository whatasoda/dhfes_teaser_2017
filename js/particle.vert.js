;((DHFT2017) => {
DHFT2017.particle = DHFT2017.particle || {}
DHFT2017.particle.vert = `
attribute   vec3  position;
// attribute   vec3  velocity;
attribute   vec4  color;
// varying     float size;
varying     vec4  pColor;
uniform     mat4  mvpMatrix;

void main (void) {
  pColor = color;
  gl_Position = mvpMatrix * vec4(position, 1.0);
  // gl_PointSize = 30.0;
  gl_PointSize = length(vec3(gl_Position)/gl_Position.w + vec3(0.0,0.0,1.0)) * 30.0;
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
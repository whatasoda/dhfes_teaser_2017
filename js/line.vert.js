;((DHFT2017) => {
DHFT2017.line = DHFT2017.line || {}
DHFT2017.line.vert = `
attribute   vec3  position;
attribute   vec3  velocity;
attribute   vec3  color;
varying     vec4  pColor;
varying     float veloMag;
uniform     mat4  mvpMatrix;

void main (void) {
  pColor = vec4(color, 1.0);
  veloMag = length(velocity);
  gl_Position = mvpMatrix * vec4(position, 1.0);
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
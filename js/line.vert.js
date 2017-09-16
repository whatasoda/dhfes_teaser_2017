;((DHFT2017) => {
DHFT2017.line = DHFT2017.line || {}
DHFT2017.line.vert = `
attribute   vec3  position;
attribute   float radius;
attribute   float id;
varying     vec4  pColor;
uniform     mat4  mvpMatrix;
uniform     vec3  colorSet[5];

void main (void) {
  gl_Position = mvpMatrix * vec4(position * radius, 1.0);
       if (int(id) == 0) { pColor = vec4(colorSet[0], 0.8); }
  else if (int(id) == 1) { pColor = vec4(colorSet[1], 0.8); }
  else if (int(id) == 2) { pColor = vec4(colorSet[2], 0.8); }
  else if (int(id) == 3) { pColor = vec4(colorSet[3], 0.8); }
  else if (int(id) == 4) { pColor = vec4(colorSet[4], 0.8); }
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
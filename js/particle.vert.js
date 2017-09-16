;((DHFT2017) => {
DHFT2017.particle = DHFT2017.particle || {}
DHFT2017.particle.vert = `
attribute   vec3  position;
attribute   float radius;
attribute   float id;
varying     vec4  pColor;
uniform     mat4  mvpMatrix;
uniform     vec3  cameraPosition;
uniform     float sizeMag;
uniform     float sizeRange;
uniform     float divSizeRange;
uniform     float alpha;
uniform     vec3  colorSet[5];

void main (void) {
  gl_Position = mvpMatrix * vec4(position * radius, 1.0);
  gl_PointSize = min(radius - 3.0, 12.0) * max((sizeRange - length(position - cameraPosition)) * divSizeRange, 1.0) * sizeMag;
       if (int(id) == 0) { pColor = vec4(colorSet[0], alpha); }
  else if (int(id) == 1) { pColor = vec4(colorSet[1], alpha); }
  else if (int(id) == 2) { pColor = vec4(colorSet[2], alpha); }
  else if (int(id) == 3) { pColor = vec4(colorSet[3], alpha); }
  else if (int(id) == 4) { pColor = vec4(colorSet[4], alpha); }
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
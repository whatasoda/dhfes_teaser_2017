attribute   vec3  position;
attribute   vec3  color;
attribute   float radius;
varying     vec4  pColor;
uniform     mat4  mvpMatrix;
uniform     vec3  cameraPosition;
uniform     float sizeMag;

void main (void) {
  pColor = vec4(color, 1.0);
  gl_Position = mvpMatrix * vec4(position * radius, 1.0);
  gl_PointSize = max((500.0 - length(position - cameraPosition)) * 0.002, 0.0) * sizeMag;
  gl_PointSize = min(radius - 3.0, 12.0);
}

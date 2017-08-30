attribute   vec3  position;
attribute   vec3  velocity;
attribute   vec3  color;
varying     float size;
varying     vec4  pColor;
varying     float pRand;
varying     float veloMag;
uniform     mat4  mvpMatrix;
uniform     vec3  cameraPosition;

float rnd(vec2 p){
    return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
}

void main (void) {
  pColor = vec4(color, 1.0);
  veloMag = length(velocity);
  gl_Position = mvpMatrix * vec4(position, 1.0);
  pRand = rnd(gl_Position.xy / gl_Position.w);
  gl_PointSize = max((500.0 - length(position - cameraPosition)) / 500.0, 0.0) * 100.0;
  size = gl_PointSize;
}
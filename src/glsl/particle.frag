precision mediump float;
varying     vec4  pColor;

void main(void) {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float radius = length(coord);
  if (radius > 0.5) {
    discard;
  }
  gl_FragColor = pColor;
}

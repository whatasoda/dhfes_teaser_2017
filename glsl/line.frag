precision mediump float;
varying     vec4  pColor;
varying     float veloMag;

void main(void) {
  gl_FragColor = vec4(pColor.rgb, 0.2);
}

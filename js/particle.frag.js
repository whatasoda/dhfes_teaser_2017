;((DHFT2017) => {
DHFT2017.particle = DHFT2017.particle || {}
DHFT2017.particle.frag = `
precision mediump float;
// varying     float size;
varying     vec4  pColor;

void main(void) {
  float alpha = max(0.5 - length(gl_PointCoord - vec2(0.5)), 0.0);
  if (alpha == 0.0) {
    discard;
  } else {
    gl_FragColor = vec4(pColor.rgb, alpha);
  }
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
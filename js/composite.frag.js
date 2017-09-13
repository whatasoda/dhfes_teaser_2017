;((DHFT2017) => {
DHFT2017.composite = DHFT2017.composite || {}
DHFT2017.composite.frag = `
precision mediump float;
uniform sampler2D particle;
uniform sampler2D line;

void main(void) {
  vec2 coord = gl_FragCoord.xy / 2048.0;
  vec4 lineColor = texture2D(line, coord);
  vec4 particleColor = texture2D(particle, coord);
  gl_FragColor = vec4(lineColor.rgb * lineColor.a, 1.0);
  gl_FragColor += particleColor;
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
;((DHFT2017) => {
DHFT2017.composite = DHFT2017.composite || {}
DHFT2017.composite.frag = `
precision mediump float;
uniform sampler2D particle;
uniform sampler2D line;
// uniform sampler2D composite;
uniform vec2 resolution;
uniform float frame;
const float oneThird = 1.0 / 3.0;

float rnd(float p1, float p2){
    return fract(sin(dot(vec2(p1, p2) ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(void) {
  vec2 coord = gl_FragCoord.xy;
  float noiseMag = (max( fract((coord.y + frame * 6.0) / resolution.y * 0.5), 0.9) - 0.9) * 10.0;
  float noise = ((
    rnd(frame, coord.y - 1.0) +
    rnd(frame, coord.y) +
    rnd(frame, coord.y + 1.0)
  ) * oneThird - 0.5);
  coord.x += 100.0 * noise * (tan(noiseMag * 2.0) + 0.05);
  coord /= 2048.0;
  vec4 lineColor = texture2D(line, coord);
  vec4 particleColor = texture2D(particle, coord);
  gl_FragColor = vec4(lineColor.rgb * lineColor.a, 1.0);
  gl_FragColor += particleColor;
  gl_FragColor.rgb *= (1.0 - noiseMag * 0.8);
  gl_FragColor.rgb += noiseMag * 0.25 * vec3(0.2 + rnd(noiseMag, coord.x), 0.33 + rnd(coord.x, noiseMag), 0.28 + noise);
  // gl_FragColor += vec4(frame/1000.0, 0.0, 0.0, 0.4);
  // if (length(particleColor.xyz) != 0.0) {
    // gl_FragColor += particleColor;
  // }
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
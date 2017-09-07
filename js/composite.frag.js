;((DHFT2017) => {
DHFT2017.composite = DHFT2017.composite || {}
DHFT2017.composite.frag = `
precision mediump float;
uniform sampler2D particle;
uniform sampler2D line;
uniform vec2 resolution;
uniform float frame;
uniform float noiseSpeed;
uniform float noiseSpan;
uniform float noiseWidth;
uniform float normarizeNoiseWidth;
uniform float parmanentNoise;
uniform float absNoiseMag;
uniform float noiseMagMag;
uniform float noiseAlpha;
uniform float divNoiseAlpha;
const float noiseRange = 16.0;
const float divideNoiseRange = 1.0 / 16.0;
const float noiseStart = -16.0 / 2.0;

float rnd(float p1, float p2){
    return fract(sin(dot(vec2(p1, p2) ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(void) {
  vec2 coord = gl_FragCoord.xy;
  float noiseMag = (coord.y + frame * noiseSpeed) / resolution.y * noiseSpan;
  noiseMag = mod(floor(noiseMag), 2.0) == 1.0 ? 1.0 - fract(noiseMag) : fract(noiseMag);
  noiseMag = (max( fract(noiseMag), noiseWidth) - noiseWidth) * normarizeNoiseWidth;
  float noise = 0.0;
  for(float i = 0.0; i < noiseRange; i++) {
    noise += rnd(frame, coord.y + noiseStart + i);
  }
  noise = noise * divideNoiseRange - 0.5;
  coord.x += absNoiseMag * noise * (tan(noiseMag * noiseMagMag) + parmanentNoise);
  coord /= 2048.0;
  // vec4 lineColor = vec4(
  //   texture2D(line, coord + vec2(0.03,0.03)).r,
  //   texture2D(line, coord + vec2(-0.03,0.03)).g,
  //   texture2D(line, coord + vec2(0.03,-0.03)).b,
  //   texture2D(line, coord + vec2(-0.03,-0.03)).a
  // );
  vec4 lineColor = texture2D(line, coord);
  vec4 particleColor = texture2D(particle, coord);
  gl_FragColor = vec4(lineColor.rgb * lineColor.a, 1.0);
  gl_FragColor += particleColor;
  gl_FragColor *= (1.0 - noiseMag * noiseAlpha);
  gl_FragColor += vec4(noiseMag * noiseAlpha * vec3(rnd(noiseMag, coord.x), rnd(coord.x, noiseMag), rnd(coord.x, coord.x)), noiseAlpha);
  // gl_FragColor += vec4(frame/1000.0, 0.0, 0.0, 0.4);
  // if (length(particleColor.xyz) != 0.0) {
    // gl_FragColor += particleColor;
  // }
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
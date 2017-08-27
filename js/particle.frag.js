;((DHFT2017) => {
DHFT2017.particle = DHFT2017.particle || {}
DHFT2017.particle.frag = `
precision mediump float;
varying     float size;
varying     vec4  pColor;
varying     float pRand;
varying     float veloMag;

float rnd(vec2 p){
    return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(void) {

  float alpha = max(0.6 * pow(sin(acos(length(gl_PointCoord - vec2(0.5)) * 2.0)), 2.0), 0.0) / max(min(size / 300.0, 20.0), 1.0);
  // alpha = alpha * (rnd( floor(normalize(gl_PointCoord - vec2(0.5)) * pRand * 20.0) ) * 0.7 + 0.3);
  if (alpha == 0.0) {
    discard;
  } else {
    if (alpha > 0.2) {
      alpha = floor(alpha * 6.0) / 6.0;
    }
    gl_FragColor = vec4(pColor.rgb, alpha);
  }
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
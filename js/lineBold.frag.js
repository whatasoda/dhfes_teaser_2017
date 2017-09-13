;((DHFT2017) => {
DHFT2017.lineBold = DHFT2017.lineBold || {}
DHFT2017.lineBold.frag = `
precision mediump float;
uniform sampler2D svgline;
uniform float width;
const float PI = 3.141592653589793;


void main (void) {
  // float widthSecond = width / 2.0;
  // float divWidth = 0.2 / width;
  // float rStep = PI / width;
  // float wRange = 0.0;
  // float height = 0.0;
  // vec2 relative = vec2(0.0);
  // float alpha = 0.0;
  // for (float h=0.0; h<2048.0; h++) {
  //   if (width <= h) { break; }
  //   wRange = sin(h * rStep) * width * 0.5;
  //   height = h - widthSecond;
  //   for (float w=0.0; w<2048.0; w++) {
  //     if (2.0 * wRange <= w) { break; }
  //     relative = vec2(w - wRange, height);
  //     alpha = length(relative) * divWidth;
      // gl_FragColor += vec4(texture2D(svgline, (gl_FragCoord.xy + relative) / 2048.0).rgb * alpha, alpha);
      gl_FragColor = texture2D(svgline, gl_FragCoord.xy / 2048.0);
    // }
  // }
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
;((DHFT2017) => {
DHFT2017.start = DHFT2017.start || {}
DHFT2017.start.frag = `
precision mediump float;
uniform     vec3  colorSet[5];
uniform     float shutMug[5];
uniform     float rotation;
uniform     float alpha;
varying     vec2  unitCoord;
varying     vec2  absUnitCoord;
varying     float limitLength;

void main(void) {
  if (length(absUnitCoord) > limitLength) { discard; }
  float radian = length(absUnitCoord) * rotation;
  vec2 targetCoord = mat2(cos(radian), sin(radian), -sin(radian), cos(radian)) * unitCoord;
  if (targetCoord.x < -1.0) {        discard;
  } else if (targetCoord.x < -0.6) { if (targetCoord.y > shutMug[0]) {gl_FragColor = vec4(colorSet[0], alpha);}
  } else if (targetCoord.x < -0.2) { if (targetCoord.y > shutMug[1]) {gl_FragColor = vec4(colorSet[1], alpha);}
  } else if (targetCoord.x <  0.2) { if (targetCoord.y > shutMug[2]) {gl_FragColor = vec4(colorSet[2], alpha);}
  } else if (targetCoord.x <  0.6) { if (targetCoord.y > shutMug[3]) {gl_FragColor = vec4(colorSet[3], alpha);}
  } else if (targetCoord.x <  1.0) { if (targetCoord.y > shutMug[4]) {gl_FragColor = vec4(colorSet[4], alpha);}
  } else {                           discard;
  }
}

`
})(window.DHFT2017 = window.DHFT2017 || {})
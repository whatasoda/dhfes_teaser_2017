precision mediump float;
varying     vec4  pColor;
varying     float speed;
varying     vec3  highLights[4];
const       float PI        = 3.141592653589793;
const       float PIForth   = 0.7853981633974483;
const       float PIEighth  = 0.39269908169872414;
const       float divPI     = 1.0 / 3.141592653589793;
const       float E         = 2.718281828459045;

void main(void) {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float radius = length(coord);
  if (radius > 0.5) {
    discard;
  }

  float tmpAlpha = 0.0;
  float alpha = 0.0;
  for (int i=0; i<4; i+=1) {
    vec2 highLight = highLights[i].xy;
    vec2  hCoord = coord - highLight;
    vec2  hUCoord = normalize(hCoord);
    float hRadius = length(hCoord);
    if (hRadius > 0.5) {
      continue;
    }
    float hRadian = sign(asin(hUCoord.y)) * acos(hUCoord.x);
    tmpAlpha = abs(tan(hRadian - highLights[i].z)) / pow(E, hRadius + 1.0) / 5.0;
    alpha = max(alpha, tmpAlpha);
  }
  alpha = alpha * max(min(speed, 5.0), 1.0);
  alpha = min(alpha, 2.0);
  if (radius < 0.4) {
    tmpAlpha = tan(asin(1.0 - radius * 2.5)) * 5.0;
    if (alpha < tmpAlpha) {
      alpha = alpha + tmpAlpha;
      alpha = alpha * 0.5;
    }
  }
  alpha = alpha * max(min(speed - 0.3, 1.0), 0.2) * 0.25;
  if (alpha == 0.0) {
    discard;
  } else {
    gl_FragColor = vec4(pColor.rgb + alpha / E, alpha);
  }
}

precision mediump float;
varying vec4 coefX;
varying vec4 coefY;

vec3 getTn(float t) {
  return vec3(pow(t,3.0), pow(t,2.0), t);
}

vec2 getPos(vec3 tn) {
  return vec2(
    coefX.x*tn.x + coefX.y*tn.y + coefX.z*tn.z + coefX.w,
    coefY.x*tn.x + coefY.y*tn.y + coefY.z*tn.z + coefY.w
  );
}

vec2 getTan(vec3 tn) {
  return vec2(
    3.0*coefX.x*tn.y + 2.0*coefX.y*tn.z + coefX.z,
    3.0*coefY.x*tn.y + 2.0*coefY.y*tn.z + coefY.z
  );
}


void main (void) {
  vec3 tn0 = getTn(0.0);
  vec3 tn1 = getTn(0.0);
  vec2 tan0 = getTan(tn0);
  vec2 tan1 = getTan(tn1);
  vec2 aveTan = normalize(tan0 + tan1);
  float threshold = cos(acos( dot(normalize(tan0), normalize(tan1)) ) / 2);
  dot(normalize(getPos(tn0) - gl_PointCoord.xy), -aveTan) <= threshold &&
  dot(normalize(getPos(tn1) - gl_PointCoord.xy), aveTan) <= threshold
}

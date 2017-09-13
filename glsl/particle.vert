attribute   vec3  position;
attribute   vec3  velocity;
attribute   vec3  color;
varying     vec4  pColor;
varying     float speed;
varying     vec3  highLights[4];
const       float HalfPI = 1.5707963267948966;
uniform     mat4  mvpMatrix;
uniform     vec3  cameraPosition;

void main (void) {
  pColor = vec4(color, 1.0);
  speed = length(velocity);
  gl_Position = mvpMatrix * vec4(position, 1.0);
  gl_PointSize = max((500.0 - length(position - cameraPosition)) * 0.002, 0.0) * 150.0;
  for (float i=0.0; i<4.0; i+=1.0) {
    float radian = i * HalfPI + color.r + color.g * 3.0 + color.b * 5.0;
    vec2 highLight = vec2(cos(radian), sin(radian));
    float hRadianOffset = sign(asin(highLight.y)) * acos(highLight.x) - HalfPI;
    highLights[int(i)] = vec3(highLight * 0.5, hRadianOffset);
  }
}

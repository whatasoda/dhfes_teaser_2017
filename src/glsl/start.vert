attribute   vec2  board;
uniform     float radius;
uniform     float aspect; // width / height
uniform     float idealAspect;
varying     vec2  unitCoord;
varying     vec2  absUnitCoord;
varying     float limitLength;
const       float PI = 3.141592653589793;

void main(void) {
  gl_Position = vec4(board, 0.0, 1.0);
  unitCoord = board * radius;
  absUnitCoord = unitCoord * vec2(aspect, 1.0);
  float aspectMag = min((radius - 1.0) * 0.1, 1.0);
  limitLength = sqrt(pow( (idealAspect - aspect) * aspectMag + aspect, 2.0) + 1.0);
  unitCoord.x *= pow(aspect, aspectMag);
}

attribute   vec2  board;
varying     vec2  unitCoord;

void main(void) {
  gl_Position = vec4(board, 0.0, 1.0);
  unitCoord = board;
}

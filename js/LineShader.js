;((DHFT2017) => {

  class LineShader extends DHFT2017.ShaderBase {
    constructor (gl) {
      super(gl, {
        line: {vert: DHFT2017.line.vert, frag: DHFT2017.line.frag},
      })
    }

    render(gl) {

      try {
        if (DHFT2017.Particle.using && DHFT2017.Camera.using) {
          const Camera = DHFT2017.Camera.using
          const Particle = DHFT2017.Particle.using
          // let vpMatrix = Camera.vpMatrix
          // let mvpMatrix = glmx.mat4.create()
          const mvpMatrix = Camera.vpMatrix


          // let modelMatrix = glmx.mat4.create() // dummy
          // glmx.mat4.multiply(mvpMatrix, vpMatrix, modelMatrix)
          const main = this.shaders.line
          gl.useProgram(main.prog)
          // const canvasSize = glmx.vec2.fromValues(gl.canvas.width/2,gl.canvas.height/2)
          // const mag = glmx.vec3.distance(pivot, Camera.spherical.positionAxisZInvert)

          for (const bufferName in Particle.buffers) {
            if (main.locs.attr[bufferName] !== undefined) {
              gl.bindBuffer(gl.ARRAY_BUFFER, Particle.buffers[bufferName])
              gl.enableVertexAttribArray(main.locs.attr[bufferName])
              gl.vertexAttribPointer(main.locs.attr[bufferName], 3, gl.FLOAT, false, 0, 0)
            }
          }
          gl.uniformMatrix4fv(main.locs.unif.mvpMatrix, false, mvpMatrix)

          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Particle.indexBuffer)
          let offset = 0
          // gl.drawElements(gl.LINE_LOOP, Particle.lineCounts[6], gl.UNSIGNED_SHORT, 0)
          for (let i=0; i<7; i++) {
            gl.drawElements(gl.LINE_LOOP, Particle.lineCounts[i] - offset, gl.UNSIGNED_SHORT, offset * Uint16Array.BYTES_PER_ELEMENT)
            offset = Particle.lineCounts[i]
          }
        }

      } catch (e) {
        console.error(e)
      }
    }

  }
  DHFT2017.LineShader = LineShader

})(window.DHFT2017 = window.DHFT2017 || {})

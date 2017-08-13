;((DHFT2017) => {

  class ParticleShader extends DHFT2017.ShaderBase {


    constructor (gl) {
      super(gl, {
        particle: {vert: DHFT2017.particle.vert, frag: DHFT2017.particle.frag},
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
          const main = this.shaders.particle
          gl.useProgram(main.prog)
          // const canvasSize = glmx.vec2.fromValues(gl.canvas.width/2,gl.canvas.height/2)
          // const mag = glmx.vec3.distance(pivot, Camera.spherical.positionAxisZInvert)

          for (const bufferName in Particle.buffers) {
            if (main.locs.attr[bufferName] !== undefined) {
              gl.bindBuffer(gl.ARRAY_BUFFER, Particle.buffers[bufferName])
              gl.bufferSubData(gl.ARRAY_BUFFER, 0, Particle.params[bufferName])
              gl.enableVertexAttribArray(main.locs.attr[bufferName])
              gl.vertexAttribPointer(main.locs.attr[bufferName], 3, gl.FLOAT, false, 0, 0)
            }
          }
          gl.uniformMatrix4fv(main.locs.unif.mvpMatrix, false, mvpMatrix)
          gl.uniform3fv(main.locs.unif.cameraPosition, Camera.spherical.fromPointer(Camera.position))

          gl.drawArrays(gl.POINTS, 0, 100)
        }

      } catch (e) {
        console.error(e)
      }
    }

  }
  DHFT2017.ParticleShader = ParticleShader

})(window.DHFT2017 = window.DHFT2017 || {})

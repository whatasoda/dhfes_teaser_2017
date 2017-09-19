;((DHFT2017) => {

  class ParticleShader extends DHFT2017.ShaderBase {
    constructor (gl) {
      gl.canvas.addEventListener('webglcontextcreationerror', (e) => {
        console.log(e.statusMessage);
      }, false)
      super(gl, {
        particle: {vert: DHFT2017.particle.vert, frag: DHFT2017.particle.frag},
        line: {vert: DHFT2017.line.vert, frag: DHFT2017.line.frag},
        start: {vert: DHFT2017.start.vert, frag: DHFT2017.start.frag},
      })
      this.gl = gl
      ;((outs) => {
        for (const out of outs) {
          const fTexture = gl.createTexture()
          const frameBuffer = gl.createFramebuffer()
          gl.bindTexture(gl.TEXTURE_2D, fTexture)
          gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2048, 2048, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0)
          gl.bindTexture(gl.TEXTURE_2D, null)
          gl.bindFramebuffer(gl.FRAMEBUFFER, null)
          out.fTex = fTexture
          out.fBuf = frameBuffer
        }
      })([
        this.shaders.particle,
        this.shaders.line,
      ])

      this.board = gl.createBuffer()
      this.boardIndex = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, this.board)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1,1,1,-1,-1,-1,-1,1]), gl.STATIC_DRAW)
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.boardIndex)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,2,3,0]), gl.STATIC_DRAW)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

      this.blendParamContainer = new Uint16Array(4)
      this.shutMug = new Float32Array([3, 5, 7, 9, 11])


      gl.enable(gl.BLEND);
      // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.DST_ALPHA, gl.ONE, gl.ONE);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

    }

    render(gl, Renderer) {

      if (DHFT2017.Particle.using && DHFT2017.Camera.using) {
        const Camera = DHFT2017.Camera.using
        const Particle = DHFT2017.Particle.using
        const mvpMatrix = Camera.vpMatrix
        const part = this.shaders.particle
        const line = this.shaders.line
        const start = this.shaders.start

        Renderer.clear(Particle.clearColor)
        const speed = DHFT2017.speed
        if (DHFT2017.Starter.currentFrame > 2 * speed) {
          // particle
          gl.useProgram(part.prog)
          this.assignAttribBuffer(Particle, part)
          gl.uniformMatrix4fv(part.unif.mvpMatrix.location, false, mvpMatrix)
          gl.uniform3fv(part.unif.cameraPosition.location, Camera.spherical.fromPointer(Camera.position))
          gl.uniform1f(part.unif.sizeMag.location, 0.8)
          gl.uniform1f(part.unif.alpha.location, 0.95)
          const sizeRange = 1200
          gl.uniform1f(part.unif.sizeRange.location, sizeRange)
          gl.uniform1f(part.unif.divSizeRange.location, 1 / sizeRange)
          gl.uniform3fv(part.unif.colorSet.location, Particle.colorSet)
          gl.drawArrays(gl.POINTS, 0, Particle.pLength)
          // end particle
          // line
          // gl.useProgram(line.prog)
          // gl.uniformMatrix4fv(line.unif.mvpMatrix.location, false, mvpMatrix)
          // gl.uniform3fv(line.unif['colorSet[0]'].location, Particle.colorSet)
          // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Particle.indexBuffer)
          // gl.drawElements(gl.LINE_STRIP, Particle.pLength - 1, gl.UNSIGNED_SHORT, 0)
          // end line
        }
        if (DHFT2017.Starter.currentFrame < 5.6 * speed){

          gl.useProgram(start.prog)
          gl.bindBuffer(gl.ARRAY_BUFFER, this.board)
          gl.enableVertexAttribArray(start.attr.board.location)
          gl.vertexAttribPointer(start.attr.board.location, start.attr.board.size, gl.FLOAT, false, 0, 0)


          for (let i=0; i<5; i++)
            this.shutMug[i] -= 17.5 / speed
          gl.uniform3fv(start.unif.colorSet.location, Particle.colorSet)
          gl.uniform1fv(start.unif.shutMug.location, this.shutMug)
          const frame = DHFT2017.Starter.currentFrame
          const radius = Math.max(Math.tan(frame / speed / 2.5 - 1.0) * 7 + 1, 1)//Math.min((Math.log(1.5 - frame / 200) + 1) || 0, 1))
          const rotation = Math.max(Math.tan(Math.min(frame / speed / 2.5 - 0.55, Math.PI / 2 -0.000001)) * 3, 0)
          gl.uniform1f(start.unif.radius.location, Math.min(radius, 15))
          gl.uniform1f(start.unif.rotation.location, rotation)
          gl.uniform1f(start.unif.alpha.location, Math.min(9 - (DHFT2017.Starter.currentFrame / speed / 0.6), 1))
          gl.uniform1f(start.unif.aspect.location, Renderer.aspect)
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.boardIndex)
          gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
        }
      }
    }

    assignAttribBuffer (ParticleObj, shaderObj) {
      const gl = this.gl
      let attr
      for (const attrName in ParticleObj.attrBuf) {
        if ( (attr = shaderObj.attr[attrName]) ) {
          gl.bindBuffer(gl.ARRAY_BUFFER, ParticleObj.attrBuf[attrName])
          gl.enableVertexAttribArray(attr.location)
          gl.vertexAttribPointer(attr.location, attr.size, gl.FLOAT, false, 0, 0)
        }
      }
    }

  }
  DHFT2017.ParticleShader = ParticleShader

})(window.DHFT2017 = window.DHFT2017 || {})

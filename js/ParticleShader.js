;((DHFT2017) => {

  class ParticleShader extends DHFT2017.ShaderBase {
    constructor (gl) {
      gl.canvas.addEventListener('webglcontextcreationerror', (e) => {
        console.log(e.statusMessage);
      }, false)
      super(gl, {
        particle: {vert: DHFT2017.particle.vert, frag: DHFT2017.particle.frag},
        line: {vert: DHFT2017.line.vert, frag: DHFT2017.line.frag},
        composite: {vert: DHFT2017.composite.vert, frag: DHFT2017.composite.frag},
        fadeout: {vert: DHFT2017.fadeout.vert, frag: DHFT2017.fadeout.frag},
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
        this.shaders.composite,
      ])

      this.board = gl.createBuffer()
      this.boardIndex = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, this.board)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1,1,1,-1,-1,-1,-1,1]), gl.STATIC_DRAW)
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.boardIndex)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,2,3,0]), gl.STATIC_DRAW)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

      this.noiseSpanContainer  = new Float32Array(5)
      this.blendParamContainer = new Uint16Array(4)
    }

    render(gl, Renderer) {

      if (DHFT2017.Particle.using && DHFT2017.Camera.using) {
        const Camera = DHFT2017.Camera.using
        const Particle = DHFT2017.Particle.using
        const mvpMatrix = Camera.vpMatrix
        const part = this.shaders.particle
        const line = this.shaders.line
        const comp = this.shaders.composite
        const SVGLine = this.shaders.SVGLine
        const lineBold = this.shaders.lineBold

        // clear phase
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        Renderer.clear()
        gl.bindFramebuffer(gl.FRAMEBUFFER, part.fBuf)
        this.fadeout(0.1)
        gl.bindFramebuffer(gl.FRAMEBUFFER, line.fBuf)
        this.fadeout(0.05)
        // end clear phase

        // particle
        gl.useProgram(part.prog)
        this.assignAttribBuffer(Particle, part)
        gl.uniformMatrix4fv(part.unif.mvpMatrix.location, false, mvpMatrix)
        gl.uniform3fv(part.unif.cameraPosition.location, Camera.spherical.fromPointer(Camera.position))

        for (let f=0; f<2; f++) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, !f ? part.fBuf : null)
          gl.drawArrays(gl.POINTS, 0, Particle.pLength)
        }
        // end particle
        // line
        gl.useProgram(line.prog)
        gl.uniformMatrix4fv(line.unif.mvpMatrix.location, false, mvpMatrix)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Particle.indexBuffer)
        for (let f=0; f<2; f++) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, !f ? line.fBuf : null)
          let offset = 0
          for (let i=0; i<7; i++) {
            gl.drawElements(gl.LINE_LOOP, Particle.lineCounts[i] - offset, gl.UNSIGNED_SHORT, offset * Uint16Array.BYTES_PER_ELEMENT)
            offset = Particle.lineCounts[i]
          }
        }
        // end line
        // composite
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.useProgram(comp.prog)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.board)
        gl.enableVertexAttribArray(comp.attr.position.location)
        gl.vertexAttribPointer(comp.attr.position.location, comp.attr.position.size, gl.FLOAT, false, 0, 0)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, part.fTex)
        gl.uniform1i(comp.unif.particle.location, 0)

        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, line.fTex)
        gl.uniform1i(comp.unif.line.location, 1)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.boardIndex)
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
        // end composite
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

    fadeout (mag) {
      const gl = this.gl
      const fadeout = this.shaders.fadeout
      this.blendParamContainer[0] = gl.getParameter(gl.BLEND_SRC_RGB)
      this.blendParamContainer[1] = gl.getParameter(gl.BLEND_DST_RGB)
      this.blendParamContainer[2] = gl.getParameter(gl.BLEND_SRC_ALPHA)
      this.blendParamContainer[3] = gl.getParameter(gl.BLEND_DST_ALPHA)
      gl.blendFuncSeparate(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE_MINUS_SRC_ALPHA)
      gl.useProgram(fadeout.prog)
      gl.bindBuffer(gl.ARRAY_BUFFER, this.board)
      const attr = fadeout.attr.position
      gl.enableVertexAttribArray(attr.location)
      gl.vertexAttribPointer(attr.location, attr.size, gl.FLOAT, false, 0, 0)
      gl.uniform1f(fadeout.unif.mag.location, mag)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.boardIndex)
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
      gl.blendFuncSeparate(...this.blendParamContainer)
    }

  }
  DHFT2017.ParticleShader = ParticleShader

})(window.DHFT2017 = window.DHFT2017 || {})

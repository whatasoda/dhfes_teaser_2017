;((DHFT2017) => {

  class ParticleShader extends DHFT2017.ShaderBase {
    constructor (gl) {
      super(gl, {
        particle: {vert: DHFT2017.particle.vert, frag: DHFT2017.particle.frag},
        line: {vert: DHFT2017.line.vert, frag: DHFT2017.line.frag},
        composite: {vert: DHFT2017.composite.vert, frag: DHFT2017.composite.frag},
        fadeout: {vert: DHFT2017.fadeout.vert, frag: DHFT2017.fadeout.frag},
      })
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

      this.blendParamContainer = new Uint16Array(4)
    }

    render(gl, Renderer) {

      try {
        if (DHFT2017.Particle.using && DHFT2017.Camera.using) {
          const Camera = DHFT2017.Camera.using
          const Particle = DHFT2017.Particle.using
          const mvpMatrix = Camera.vpMatrix

          const main = this.shaders.particle
          const line = this.shaders.line
          const composite = this.shaders.composite

          gl.bindFramebuffer(gl.FRAMEBUFFER, main.fBuf)
          this.fadeout(gl, 0.1)
          gl.useProgram(main.prog)

          for (const bufferName in Particle.buffers) {
            if (main.locs.attr[bufferName] !== undefined) {
              gl.bindBuffer(gl.ARRAY_BUFFER, Particle.buffers[bufferName])
              gl.enableVertexAttribArray(main.locs.attr[bufferName])
              gl.vertexAttribPointer(main.locs.attr[bufferName], main.strides[bufferName], gl.FLOAT, false, 0, 0)
            }
          }
          gl.uniformMatrix4fv(main.locs.unif.mvpMatrix, false, mvpMatrix)
          gl.uniform3fv(main.locs.unif.cameraPosition, Camera.spherical.fromPointer(Camera.position))


          // Renderer.clear()
          gl.drawArrays(gl.POINTS, 0, Particle.pLength)


          gl.bindFramebuffer(gl.FRAMEBUFFER, null)


          gl.bindFramebuffer(gl.FRAMEBUFFER, line.fBuf)
          this.fadeout(gl, 0.01)
          gl.useProgram(line.prog)
          for (const bufferName in Particle.buffers) {
            if (line.locs.attr[bufferName] !== undefined) {
              gl.bindBuffer(gl.ARRAY_BUFFER, Particle.buffers[bufferName])
              gl.enableVertexAttribArray(line.locs.attr[bufferName])
              gl.vertexAttribPointer(line.locs.attr[bufferName], line.strides[bufferName], gl.FLOAT, false, 0, 0)
            }
          }
          gl.uniformMatrix4fv(line.locs.unif.mvpMatrix, false, mvpMatrix)
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Particle.indexBuffer)

          // Renderer.clear()
          let offset = 0
          for (let i=0; i<7; i++) {
            gl.drawElements(gl.LINE_LOOP, Particle.lineCounts[i] - offset, gl.UNSIGNED_SHORT, offset * Uint16Array.BYTES_PER_ELEMENT)
            offset = Particle.lineCounts[i]
          }
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
          gl.bindFramebuffer(gl.FRAMEBUFFER, null)


          gl.useProgram(composite.prog)
          gl.bindBuffer(gl.ARRAY_BUFFER, this.board)
          gl.enableVertexAttribArray(composite.locs.attr.position)
          gl.vertexAttribPointer(composite.locs.attr.position, composite.strides.position, gl.FLOAT, false, 0, 0)

          gl.activeTexture(gl.TEXTURE0)
          gl.bindTexture(gl.TEXTURE_2D, main.fTex)
          gl.uniform1i(composite.locs.unif.particle, 0)

          gl.activeTexture(gl.TEXTURE1)
          gl.bindTexture(gl.TEXTURE_2D, line.fTex)
          gl.uniform1i(composite.locs.unif.line, 1)

          // gl.activeTexture(gl.TEXTURE2)
          // gl.bindTexture(gl.TEXTURE_2D, composite.fTex)
          // gl.uniform1i(composite.locs.unif.composite, 2)

          gl.uniform2f(composite.locs.unif.resolution, gl.drawingBufferWidth, gl.drawingBufferHeight)
          gl.uniform1f(composite.locs.unif.frame, Particle.frame)

          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.boardIndex)


          // gl.bindFramebuffer(gl.FRAMEBUFFER, composite.fBuf)
          Renderer.clear()
          gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
          // gl.bindFramebuffer(gl.FRAMEBUFFER, null)

        }

      } catch (e) {
        console.error(e)
      }
    }

    fadeout (gl, mag) {
      const fadeout = this.shaders.fadeout
      this.blendParamContainer[0] = gl.getParameter(gl.BLEND_SRC_RGB)
      this.blendParamContainer[1] = gl.getParameter(gl.BLEND_DST_RGB)
      this.blendParamContainer[2] = gl.getParameter(gl.BLEND_SRC_ALPHA)
      this.blendParamContainer[3] = gl.getParameter(gl.BLEND_DST_ALPHA)
      gl.blendFuncSeparate(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE_MINUS_SRC_ALPHA)
      gl.useProgram(fadeout.prog)
      gl.bindBuffer(gl.ARRAY_BUFFER, this.board)
      gl.enableVertexAttribArray(fadeout.locs.attr.position)
      gl.vertexAttribPointer(fadeout.locs.attr.position, fadeout.strides.position, gl.FLOAT, false, 0, 0)
      gl.uniform1f(fadeout.locs.unif.mag, mag)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.boardIndex)
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
      gl.blendFuncSeparate(...this.blendParamContainer)
    }

  }
  DHFT2017.ParticleShader = ParticleShader

})(window.DHFT2017 = window.DHFT2017 || {})

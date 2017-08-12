;((DHFT2017) => {
  const glmx = window.glmx

  class RendererBase {
    constructor (width, height, shaders, option = {}) {
      this.availability = true
      this.canvas = document.createElement("canvas")
      this.width = width
      this.height = height
      this.shaders = []
      this.clearDepth = option.clearDepth || 1
      this.clearColor = option.clearColor || glmx.vec4.fromValues(0,0,0,1)
      const gl = this.canvas.getContext('webgl2') || this.canvas.getContext('experimental-webgl2')
      this.gl = gl
      for (const shader of shaders) {
        let shaderTmp = new shader(gl)
        if (shaderTmp.availability)
          this.shaders.push(shaderTmp)
      }
      // gl.enable(gl.CULL_FACE)
      // gl.depthFunc(gl.LEQUAL);
      gl.enable(gl.BLEND);
      // gl.enable(gl.DEPTH_TEST)
      // gl.blendEquation(gl.FUNC_ADD)
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
      // gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
    }

    setCurrent () {
      DHFT2017.RendererBase.using = this
    }

    render () {
      if (this.availability) {
        const gl = this.gl
        let cc = this.clearColor
        gl.clearColor(cc[0], cc[1], cc[2], cc[3])
        gl.clearDepth(this.clearDepth)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        if (DHFT2017.Camera.using)
          DHFT2017.Camera.using.aspect = gl.canvas.width / gl.canvas.height

        for (const shader of this.shaders)
          shader.render(gl)

        gl.flush()
      } else
        console.warn("This renderer is not available.")
    }

    get aspect() {
      return this.canvas.width / this.canvas.height
    }

    get width() {
      return this.canvas.width
    }
    set width(value) {
      this.canvas.width = value
    }
    get height() {
      return this.canvas.height
    }
    set height(value) {
      this.canvas.height = value
    }

  }
  DHFT2017.RendererBase = RendererBase
  DHFT2017.RendererBase.using = null

  class ShaderBase {

    constructor (gl, shaderTexts = {}) {
      this.availability = true
      this.shaders = {}
      for (let key in shaderTexts) {
        let compileResults = this.getProgram(gl, shaderTexts[key])
        if (compileResults) this.shaders[key] = compileResults
        else this.availability = false
      }
    }

    getProgram (gl, shaderText) {
      if (shaderText.vert && shaderText.frag) {
        let vert = this.getShader(gl, shaderText.vert, gl.VERTEX_SHADER)
        let frag = this.getShader(gl, shaderText.frag, gl.FRAGMENT_SHADER)
        let prog = gl.createProgram()
        if (frag && vert && prog) {
          gl.attachShader(prog, vert)
          gl.attachShader(prog, frag)
          gl.linkProgram(prog)
          if ( gl.getProgramParameter(prog, gl.LINK_STATUS) ) {
            const attributes = {}
            const uniforms = {}
            let tmpUniform, info,
              attrCount = 0,
              unifCount = 0
            while ( (info = gl.getActiveAttrib(prog, attrCount++)) )
              attributes[info.name] = gl.getAttribLocation(prog, info.name)
            while ( (info = gl.getActiveUniform(prog, unifCount++)) )
              if ( (tmpUniform = gl.getUniformLocation(prog, info.name)) )
                uniforms[info.name] = tmpUniform
            return {
              prog: prog, vert: vert, frag: frag,
              locs: { attr: attributes, unif: uniforms, },
            }
          } else
            console.warn( gl.getProgramInfoLog(prog) )
        }
      }
      console.warn("This shader is not available.")
      return null
    }

    getShader (gl, shaderText, glShaderConst) {
      let shader = gl.createShader(glShaderConst)
      gl.shaderSource(shader, shaderText)
      gl.compileShader(shader)
      if ( gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) return shader
      else {
        let type
        switch (glShaderConst) {
          case gl.VERTEX_SHADER:    type = 'vert'; break
          case gl.FRAGMENT_SHADER:  type = 'frag'; break
          default:                  type = 'anonymous shader'
        }
        console.warn(`${type}: ${gl.getShaderInfoLog(shader)}`)
        return null
      }
    }

    render (gl) {
    }

  }
  DHFT2017.ShaderBase = ShaderBase






})(window.DHFT2017 = window.DHFT2017 || {})

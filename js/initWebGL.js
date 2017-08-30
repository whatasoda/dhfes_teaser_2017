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
      const gl = this.canvas.getContext('webgl2', {antialias: true}) || this.canvas.getContext('experimental-webgl2')
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
        // this.clear()

        if (DHFT2017.Camera.using)
          DHFT2017.Camera.using.aspect = gl.canvas.width / gl.canvas.height

        for (const shader of this.shaders)
          shader.render(gl, this)

        gl.flush()
      } else
        console.warn("This renderer is not available.")
    }

    clear (color) {
      const gl = this.gl
      gl.clearColor(...(color || this.clearColor))
      gl.clearDepth(this.clearDepth)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
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
        if (compileResults) {
          compileResults.name = [key]
          this.shaders[key] = compileResults
        } else
          this.availability = false
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
            const strides = {}
            const uniforms = {}
            let tmpUniform, info,
              attrCount = 0,
              unifCount = 0
            while ( (info = gl.getActiveAttrib(prog, attrCount++)) ) {
              console.log(info.name + ':' + info.type);
              attributes[info.name] = gl.getAttribLocation(prog, info.name)
              strides[info.name] = this.getAttrStride(gl, info.type)
            }
            while ( (info = gl.getActiveUniform(prog, unifCount++)) )
              if ( (tmpUniform = gl.getUniformLocation(prog, info.name)) )
                uniforms[info.name] = tmpUniform
            return {
              prog: prog, vert: vert, frag: frag,
              locs: { attr: attributes, unif: uniforms},
              strides: strides,
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

    getAttrStride (gl, type) {
      switch (type) {
        case gl.BOOL:
          return 1
        case gl.FLOAT_VEC2:
        case gl.INT_VEC2:
        case gl.BOOL_VEC2:
          return 2
        case gl.FLOAT_VEC3:
        case gl.INT_VEC3:
        case gl.BOOL_VEC3:
          return 3
        case gl.FLOAT_VEC4:
        case gl.INT_VEC4:
        case gl.BOOL_VEC4:
        case gl.FLOAT_MAT2:
          return 4
        case gl.FLOAT_MAT3:
          return 9
        case gl.FLOAT_MAT4:
          return 16
        case gl.SAMPLER_2D:
        case gl.SAMPLER_CUBE:
          return null
        default:
          return 0
      }
    }

    render (gl) {
    }

  }
  DHFT2017.ShaderBase = ShaderBase






})(window.DHFT2017 = window.DHFT2017 || {})

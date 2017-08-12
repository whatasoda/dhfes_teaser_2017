;((DHFT2017) => {

  class Camera {

    constructor (option = {}) {
      this.near              = option.near              || 1
      this.far               = option.far               || 10000
      this.aspect            = option.aspect            || 1
      this.spherical         = option.spherical         || new DHFT2017.Spherical()
      this._viewMatrix       = option._viewMatrix       || glmx.mat4.create()
      this._projectionMatrix = option._projectionMatrix || glmx.mat4.create()
      this._vpMatrix         = option._vpMatrix         || glmx.mat4.create()
      this.up                = option.up                || DHFT2017.EulerPointer.axisY
      this.position          = option.position          || DHFT2017.EulerPointer.positionAxisZInvert
      this.target            = option.target            || DHFT2017.EulerPointer.pivot
    }

    setCurrent () {
      DHFT2017.Camera.using = this
    }

    get viewMatrix () {
      if (this.spherical.radius < glmx.glMatrix.EPSILON)
        this.spherical.radius = glmx.glMatrix.EPSILON
      glmx.mat4.lookAt(
        this._viewMatrix,
        this.spherical.fromPointer(this.position || 0),
        this.spherical.fromPointer(this.target || 0),
        this.spherical.fromPointer(this.up || 0)
      )
      return this._viewMatrix
    }

    get projectionMatrix () {
      return this._projectionMatrix
    }

    get vpMatrix () {
      glmx.mat4.multiply(
        this._vpMatrix,
        this.projectionMatrix,
        this.viewMatrix
      )
      return this._vpMatrix
    }

  }
  DHFT2017.Camera = Camera
  DHFT2017.Camera.using = null




  class Perspective extends Camera {

    constructor (option = {}) {
      super(option)
      this.fovy = option.fovy || 90
    }

    get projectionMatrix () {
      glmx.mat4.perspective(
        this._projectionMatrix,
        this.fovy,
        this.aspect,
        this.near,
        this.far
      )
      return this._projectionMatrix
    }

  }
  DHFT2017.Perspective = Perspective




  class Orthognal extends Camera {

    constructor (option = {}) {
      super(option)
      zoom = option.zoom || 1
    }

    get projectionMatrix () {
      let halfW = 1 / this.zoom
      let halfH = this.aspect / this.zoom
      glmx.mat4.ortho(
        this._projectionMatrix,
        -halfW,
        halfW,
        -halfH,
        halfH,
        this.near,
        this.far
      )
      return this._projectionMatrix
    }

  }
  DHFT2017.Orthognal = Orthognal

})(window.DHFT2017 = window.DHFT2017 || {})

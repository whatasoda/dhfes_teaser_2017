;((DHFT2017) => {

  class Particle {
    constructor(length, ranges) {
      const originalRandom = DHFT2017.originalRandom
      this.ranges = ranges || {}
      this.ranges.gLength    = this.ranges.gLength    || [ 0, 10]
      this.ranges.gPositionX = this.ranges.gPositionX || [ 0, 10]
      this.ranges.gPositionY = this.ranges.gPositionY || [ 0, 10]
      this.ranges.gPositionZ = this.ranges.gPositionZ || [ 0, 10]
      this.ranges.gMag       = this.ranges.gMag       || [ 0, 10]
      this.ranges.gFarLimit  = this.ranges.gFarLimit  || [ 0, 10]
      this.ranges.gNearLimit = this.ranges.gNearLimit || [ 0, 10]
      this.ranges.pPositionX = this.ranges.pPositionX || [ 0, 10]
      this.ranges.pPositionY = this.ranges.pPositionY || [ 0, 10]
      this.ranges.pPositionZ = this.ranges.pPositionZ || [ 0, 10]
      this.ranges.pVelocityX = this.ranges.pVelocityX || [ 0, 10]
      this.ranges.pVelocityY = this.ranges.pVelocityY || [ 0, 10]
      this.ranges.pVelocityZ = this.ranges.pVelocityZ || [ 0, 10]

      this.pLength = length
      this.gLength = Math.floor(originalRandom(this.ranges.gLength[0], this.ranges.gLength[1]))

      this.gravSpot = []
      for (let n=0; n<this.gLength; n++) {
        this.gravSpot[n] = [
          glmx.vec3.fromValues(
            originalRandom(this.ranges.gPositionX[0], this.ranges.gPositionX[1]),
            originalRandom(this.ranges.gPositionY[0], this.ranges.gPositionY[1]),
            originalRandom(this.ranges.gPositionZ[0], this.ranges.gPositionZ[1])
          ),
          originalRandom(this.ranges.gMag[0], this.ranges.gMag[1]),
          originalRandom(this.ranges.gFarLimit[0],this.ranges.gFarLimit[1]),
          originalRandom(this.ranges.gNearLimit[0],this.ranges.gNearLimit[1]),
        ]
      }

      const tmpPosition = []
      const tmpVelocity = []
      const tmpColor = []
      for (let n=0; n<this.pLength; n++) {
        tmpPosition.push(
          originalRandom(this.ranges.pPositionX[0], this.ranges.pPositionX[1]),
          originalRandom(this.ranges.pPositionY[0], this.ranges.pPositionY[1]),
          originalRandom(this.ranges.pPositionZ[0], this.ranges.pPositionZ[1]),
        )
        tmpVelocity.push(
          originalRandom(this.ranges.pVelocityX[0], this.ranges.pVelocityX[1]),
          originalRandom(this.ranges.pVelocityY[0], this.ranges.pVelocityY[1]),
          originalRandom(this.ranges.pVelocityZ[0], this.ranges.pVelocityZ[1]),
        )
        tmpColor.push( originalRandom(), originalRandom(), originalRandom(),)
      }
      this.params = {}
      this.params.position = new Float32Array(tmpPosition)
      this.params.velocity = new Float32Array(tmpVelocity)
      this.params.color    = new Float32Array(tmpColor)

      this.buffers = {}
      if (DHFT2017.RendererBase.using) {
        let tmpBuffer
        const gl = DHFT2017.RendererBase.using.gl
        for (const bufferName in this.params) {
          if ( (tmpBuffer = gl.createBuffer()) ) {
            this.buffers[bufferName] = tmpBuffer
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[bufferName])
            gl.bufferData(gl.ARRAY_BUFFER, this.params[bufferName], gl.DYNAMIC_DRAW)
            gl.bindBuffer(gl.ARRAY_BUFFER, null)
          }
        }
      }
      this.tmp = {}
      this.tmp.acceleration = glmx.vec3.create()
      this.tmp.position     = glmx.vec3.create()
      this.tmp.velocity     = glmx.vec3.create()
      this.tmp.relativePos  = glmx.vec3.create()
    }


    setCurrent () {
      DHFT2017.Particle.using = this
    }

    calc () {
      const tmp = this.tmp
      let n = -1
      let radius, gravMag, velocity
      while (n++ < this.pLength) {
        glmx.vec3.set(tmp.position,
          this.params.position[n*3 + 0],
          this.params.position[n*3 + 1],
          this.params.position[n*3 + 2]
        )
        glmx.vec3.set(tmp.velocity,
          this.params.position[n*3 + 0],
          this.params.position[n*3 + 1],
          this.params.position[n*3 + 2]
        )
        glmx.vec3.set(tmp.acceleration, 0, 0, 0)

        velocity = glmx.vec3.length(tmp.velocity)
        if (velocity > this.ranges.gFarLimit[1] / 100) {
          glmx.vec3.scaleAndAdd(tmp.acceleration, tmp.acceleration, tmp.velocity, -5 / this.ranges.gFarLimit[1] / velocity)
        }
        for (const spot of this.gravSpot) {
          glmx.vec3.sub(tmp.relativePos, tmp.position, spot[0])
          radius = glmx.vec3.length(tmp.relativePos)

          gravMag = spot[1] / Math.pow(radius, 2)
          if (spot[2] < radius)
            gravMag += Math.min(Math.tan((radius - spot[2]) / spot[2] * 50), 10) * spot[2] / 200
          else if (spot[3] > radius)
            gravMag -= Math.tan((radius - spot[3]) / spot[3]) * gravMag

          glmx.vec3.normalize(tmp.relativePos, tmp.relativePos)
          glmx.vec3.scale(tmp.relativePos, tmp.relativePos, -gravMag)
          glmx.vec3.add(tmp.acceleration, tmp.acceleration, tmp.relativePos)
        }
        glmx.vec3.scale(tmp.acceleration, tmp.acceleration, 1 / this.gLength)
        for (let i=0; i<3; i++)
          this.params.position[n*3+i] +=
            (this.params.velocity[n*3+i] += tmp.acceleration[i])
      }

    }

  }
  DHFT2017.Particle = Particle
  DHFT2017.Particle.using = null

})(window.DHFT2017 = window.DHFT2017 || {})

;((DHFT2017) => {

  DHFT2017.ParticleStatus = DHFT2017.defBynaryEnum(DHFT2017.ParticleStatus || {}, [
    'neutral',
    'tooFar',
    'tooClose',
    'tooFast',
    'tooSlow',
  ])

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
      const tmpStatus = []
      const tmpDuration = []
      const tmpMetaPosition = []
      const tmpMetaVelocity = []
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
        tmpColor.push( originalRandom(), originalRandom(), originalRandom(), )

        tmpStatus.push(0)
        for (let i=0; i<DHFT2017.ParticleStatus.__offset__; i++)
          tmpDuration.push(1, 1)
        tmpMetaPosition.push(0,0,0)
        tmpMetaVelocity.push(0,0,0)
      }
      this.params = {}
      this.params.position = new Float32Array(tmpPosition)
      this.params.velocity = new Float32Array(tmpVelocity)
      this.params.color    = new Float32Array(tmpColor)
      this.metaParams = {}
      this.metaParams.status = new Int32Array(tmpStatus)
      this.metaParams.duration = new Int32Array(tmpDuration)
      this.metaParams.position = new Float32Array(tmpMetaPosition)
      this.metaParams.velocity = new Float32Array(tmpMetaVelocity)

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
      this.tmp.outPosition  = glmx.vec3.create()
      this.tmp.velocity     = glmx.vec3.create()
      this.tmp.outVelocity  = glmx.vec3.create()
      this.tmp.relativePos  = glmx.vec3.create()
      this.tmp.metaPosition = glmx.vec3.create()
      this.tmp.metaVelocity = glmx.vec3.create()
    }


    setCurrent () {
      DHFT2017.Particle.using = this
    }

    calc () {
      const originalRandom = DHFT2017.originalRandom
      const tmp = this.tmp
      const meta = this.metaParams
      const statusCount = DHFT2017.ParticleStatus.__offset__
      let n = -1
      while (++n < this.pLength) {
        glmx.vec3.set(tmp.acceleration, 0, 0, 0)
        glmx.vec3.set(tmp.position,
          this.params.position[n*3 + 0],
          this.params.position[n*3 + 1],
          this.params.position[n*3 + 2]
        )
        glmx.vec3.set(tmp.outPosition, 0, 0, 0)
        glmx.vec3.set(tmp.velocity,
          this.params.position[n*3 + 0],
          this.params.position[n*3 + 1],
          this.params.position[n*3 + 2]
        )
        glmx.vec3.set(tmp.outVelocity, 0, 0, 0)
        // glmx.vec3.set(tmp.metaPosition,
        //   this.metaParams.position[n*3 + 0],
        //   this.metaParams.position[n*3 + 1],
        //   this.metaParams.position[n*3 + 2]
        // )
        // glmx.vec3.set(tmp.metaVelocity,
        //   this.metaParams.velocity[n*3 + 0],
        //   this.metaParams.velocity[n*3 + 1],
        //   this.metaParams.velocity[n*3 + 2]
        // )


        const DOffset = n * statusCount
        const PStatus = DHFT2017.ParticleStatus
        const status = meta.status[n]
        const veloMag = glmx.vec3.length(tmp.velocity)
        const posMag = glmx.vec3.length(tmp.position)

        // let index
        // ++meta.duration[DOffset + 2 * PStatus.__neutral_i]
        // if (!meta.duration[ (index = DOffset + 2 * PStatus.__tooFar_i) ] && posMag > 1500 ) {
        //   meta.duration[index] = meta.duration[index + 1] = Math.floor(originalRandom(5, 5))
        //   glmx.vec3.copy(tmp.metaPosition, tmp.position)
        // }
        // if (!meta.duration[ (index = DOffset + 2 * PStatus.__tooClose_i) ] && posMag < 5 )
        //   meta.duration[index] = meta.duration[index + 1] = Math.floor(originalRandom(5, 5))

        // if (!meta.duration[ (index = DOffset + 2 * PStatus.__tooFast_i) ] && veloMag > 25 ) {
        //   meta.duration[index] = meta.duration[index + 1] = Math.floor(originalRandom(300, 3000))
        //   glmx.vec3.copy(tmp.metaVelocity, tmp.velocity)
        // }
        // if (!meta.duration[ (index = DOffset + 2 * PStatus.__tooSlow_i) ] && veloMag < 3 )
        //   meta.duration[index] = meta.duration[index + 1] = Math.floor(originalRandom(5, 5))

        let radius, gravMag
        for (const spot of this.gravSpot) {
          glmx.vec3.sub(tmp.relativePos, tmp.position, spot[0])
          radius = glmx.vec3.length(tmp.relativePos)
          gravMag = 0
          // if (PStatus.neutral & status) {
            gravMag = spot[1] / Math.pow(radius, 2)
          // } // neutral END

          // if (PStatus.tooClose & status) {
          //   gravMag -= Math.tan((radius - spot[3]) / spot[3]) * gravMag
          // } // tooClose END

          glmx.vec3.scale(tmp.relativePos, tmp.relativePos, -gravMag / glmx.vec3.length(tmp.relativePos) )
          glmx.vec3.add(tmp.acceleration, tmp.acceleration, tmp.relativePos)
        }
        glmx.vec3.scale(tmp.acceleration, tmp.acceleration, 1 / this.gLength)


        // if (PStatus.tooFar & status) {
        //   glmx.vec3.scaleAndAdd(tmp.acceleration, tmp.acceleration, tmp.position, -1 * Math.pow(Math.min(posMag / 3000, 2), 2) / posMag)
        // } // tooFar END

        // if (PStatus.tooClose & status) {
        //   glmx.vec3.scaleAndAdd(tmp.acceleration, tmp.acceleration, tmp.position, 1 * Math.pow(Math.min(2.5 / posMag, 2), 2) / posMag)
        // } // tooClose END

        // if (PStatus.tooFast & status) {
        //   glmx.vec3.scaleAndAdd(tmp.acceleration, tmp.acceleration, tmp.metaVelocity, -1 / meta.duration[DOffset + 2*PStatus.__tooFast_i + 1] / meta.duration[DOffset + 2*PStatus.__tooFast_i])
        //   if (n==0) console.log(veloMag);
        // } // tooFast END

        // if (PStatus.tooSlow & status) {
          // glmx.vec3.scaleAndAdd(tmp.acceleration, tmp.acceleration, tmp.velocity, 1 / veloMag)
        // } // tooSlow END

        // glmx.vec3.scaleAndAdd(tmp.acceleration, tmp.acceleration, tmp.velocity, -1 / 200)


        // if (PStatus.tooFar & status) {
        // if (false) {
        //
        // } else {
        if( n== 0) console.log(tmp.acceleration);
        glmx.vec3.add(tmp.outVelocity, tmp.velocity, tmp.acceleration)
          glmx.vec3.add(tmp.outPosition, tmp.position, tmp.outVelocity)
        // }

        for (let i=0; i<3; i++) {
          this.params.position[n*3+i] = tmp.outPosition[i]
          this.params.velocity[n*3+i] = tmp.outVelocity[i]
          // this.metaParams.position[n*3+i] = tmp.metaPosition[i]
          // this.metaParams.velocity[n*3+i] = tmp.metaVelocity[i]
        }

        /* START Refresh Status */
        for (let i=0; i<statusCount; i++) {
          if (meta.duration[DOffset + 2*i] === 0)
            continue
          else if ( --meta.duration[DOffset + 2*i] > 0 && !(meta.status[n] & (1 << i)) )
            meta.status[n] |= 1 << i
          else
            meta.status[n] &= ~(1 << i)
        }
        /* END Refresh Status */
      }
      if (this.params.position.indexOf(Infinity) != -1) {
        console.warn('Infinity が出た');

      }
    }

  }
  DHFT2017.Particle = Particle
  DHFT2017.Particle.using = null

})(window.DHFT2017 = window.DHFT2017 || {})

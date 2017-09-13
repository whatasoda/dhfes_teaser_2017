;((DHFT2017) => {

  class Particle {
    constructor(length, ranges) {
      if (!DHFT2017.RendererBase.using)
        return null
      const gl = DHFT2017.RendererBase.using.gl
      this.gl = gl
      const myRand = DHFT2017.originalRandom
      this.createTmp()

      this.ranges = ((ranges, props) => {
        for (let prop of props)
          ranges[prop] = new Float32Array(ranges[prop] || [0, 0])
        return ranges
      })( ranges = ranges || {}, [
        'gLength','gMag','gRotWeight',
        'gFarLimit','gNearLimit',
        'gPositionX','gPositionY','gPositionZ',
        'pPositionX','pPositionY','pPositionZ',
        'pVelocityX','pVelocityY','pVelocityZ',
        'refreshSpan',
      ])

      this.pLength = length
      this.gLength = Math.floor(myRand(this.ranges.gLength[0], this.ranges.gLength[1]))
      this.frame = 0
      this.refreshSpan = Math.floor(myRand(this.ranges.refreshSpan[0], this.ranges.refreshSpan[1]))

      const tmpAxis = this.tmp.axis
      const tmpGPosition = []
      const tmpGMag = []
      const tmpGAxis = []
      const tmpGFarLimit = []
      const tmpGNearLimit = []
      const tmpGRotWeight = []

      for (let n=0; n<this.gLength; n++) {
        tmpGPosition.push(
          myRand(this.ranges.gPositionX[0], this.ranges.gPositionX[1]),
          myRand(this.ranges.gPositionY[0], this.ranges.gPositionY[1]),
          myRand(this.ranges.gPositionZ[0], this.ranges.gPositionZ[1])
        )
        glmx.vec3.set(tmpAxis, myRand(), myRand(), myRand())
        glmx.vec3.normalize(tmpAxis, tmpAxis)
        tmpGAxis.push( ...tmpAxis )
        tmpGMag.push(       myRand(this.ranges.gMag[0], this.ranges.gMag[1]) )
        tmpGFarLimit.push(  myRand(this.ranges.gFarLimit[0],this.ranges.gFarLimit[1]) )
        tmpGNearLimit.push( myRand(this.ranges.gNearLimit[0],this.ranges.gNearLimit[1]) )
        tmpGRotWeight.push( myRand(this.ranges.gRotWeight[0],this.ranges.gRotWeight[1]) )
      }

      this.gravSpot = {
        _current: 0,
        set current(value) {
          if (!isNaN(value)) {
            this._current = value
            glmx.vec3.set(this._positionContainer,
              this._gPosition[3 * value + 0],
              this._gPosition[3 * value + 1],
              this._gPosition[3 * value + 2]
            )
            glmx.vec3.set(this._axisContainer,
              this._gAxis[3 * value + 0],
              this._gAxis[3 * value + 1],
              this._gAxis[3 * value + 2]
            )
          }
        },
        get current() { return this._current },
        _positionContainer: glmx.vec3.create(),
        _axisContainer: glmx.vec3.create(),

        get gPosition() { return this._positionContainer },
        get gAxis() { return this._axisContainer },
        get gMag() { return this._gMag[this.current] },
        get gFarLimit() { return this._gFarLimit[this.current] },
        get gNearLimit() { return this._gNearLimit[this.current] },
        get gRotWeight() { return this._gRotWeight[this.current] },
      }
      this.gravSpot._gPosition = new Float32Array(tmpGPosition)
      this.gravSpot._gMag = new Float32Array(tmpGMag)
      this.gravSpot._gAxis = new Float32Array(tmpGAxis)
      this.gravSpot._gFarLimit = new Float32Array(tmpGFarLimit)
      this.gravSpot._gNearLimit = new Float32Array(tmpGNearLimit)
      this.gravSpot._gRotWeight = new Float32Array(tmpGRotWeight)

      const tmpPosition = []
      const tmpVelocity = []
      const tmpColor = []
      const tmpUseSpot = []
      const tmpLineOrder = []
      const tmpRGB = this.tmp.color

      const oneRoot3rd = 1 / Math.sqrt(3)
      const oneDevPI = 1 / Math.PI

      for (let n=0; n<this.pLength; n++) {
        tmpPosition.push(
          myRand(this.ranges.pPositionX[0], this.ranges.pPositionX[1]),
          myRand(this.ranges.pPositionY[0], this.ranges.pPositionY[1]),
          myRand(this.ranges.pPositionZ[0], this.ranges.pPositionZ[1]),
        )
        tmpVelocity.push(
          myRand(this.ranges.pVelocityX[0], this.ranges.pVelocityX[1]),
          myRand(this.ranges.pVelocityY[0], this.ranges.pVelocityY[1]),
          myRand(this.ranges.pVelocityZ[0], this.ranges.pVelocityZ[1]),
        )
        glmx.vec3.set(tmpRGB, myRand(),myRand(),myRand() )
        tmpColor.push( ...tmpRGB )
        tmpUseSpot.push(
          Math.floor(glmx.vec3.length(tmpRGB) * oneRoot3rd * this.gLength),
          Math.floor(tmpRGB[0] * this.gLength),
          Math.floor(tmpRGB[1] * this.gLength),
          Math.floor(tmpRGB[2] * this.gLength),
          Math.floor( (Math.atan2(tmpRGB[1], tmpRGB[2]) * oneDevPI + 0.5) * this.gLength),
          Math.floor( (Math.atan2(tmpRGB[2], tmpRGB[0]) * oneDevPI + 0.5) * this.gLength),
          Math.floor( (Math.atan2(tmpRGB[0], tmpRGB[1]) * oneDevPI + 0.5) * this.gLength)
        )
        tmpLineOrder.push( 0,1,2, )
      }
      this.attrData = {}
      this.attrData.position  = new Float32Array(tmpPosition)
      this.attrData.velocity  = new Float32Array(tmpVelocity)
      this.attrData.color     = new Float32Array(tmpColor)

      this.lineOrder        = new Uint16Array(tmpLineOrder)
      this.lineCounts       = new Uint16Array([0,1,2,3,4,5,6])
      this.useSpot          = new Int16Array(tmpUseSpot)
      this.spotPointer      = new Int16Array(this.gLength)
      this.pointerBase      = new Int16Array(this.gLength)
      let i = -1
      while (++i < this.gLength)
        this.pointerBase[i] = i


      this.attrBuf = {}
      let tmpBuffer
      for (const bufferName in this.attrData) {
        if ( (tmpBuffer = gl.createBuffer()) ) {
          this.attrBuf[bufferName] = tmpBuffer
          gl.bindBuffer(gl.ARRAY_BUFFER, this.attrBuf[bufferName])
          gl.bufferData(gl.ARRAY_BUFFER, this.attrData[bufferName], gl.DYNAMIC_DRAW)
          gl.bindBuffer(gl.ARRAY_BUFFER, null)
        }
      }
      if ( (tmpBuffer = gl.createBuffer()) ) {
        this.indexBuffer = tmpBuffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.lineOrder, gl.DYNAMIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
      }

      this.refreshSpotPointer()
      this.refreshLineOrder()
    }


    setCurrent () {
      DHFT2017.Particle.using = this
    }

    createTmp () {
      if (this.tmp)
        return null
      this.tmp = {}
      this.tmp.acceleration = glmx.vec3.create()
      this.tmp.position     = glmx.vec3.create()
      this.tmp.outPosition  = glmx.vec3.create()
      this.tmp.velocity     = glmx.vec3.create()
      this.tmp.outVelocity  = glmx.vec3.create()
      this.tmp.color        = glmx.vec3.create()
      this.tmp.relativePos  = glmx.vec3.create()
      this.tmp.rotate       = glmx.vec3.create()
      this.tmp.axis         = glmx.vec3.create()
      this.tmp.useSpot      = new Int16Array(7)
    }

    refreshSpotPointer () {
      const myRand = DHFT2017.originalRandom
      const Base = Array.from(this.pointerBase)
      let i = -1
      while (++i < this.gLength)
        this.spotPointer[i] = Base.splice(Math.floor(myRand(Base.length)), 1)
    }

    refreshLineOrder () {
      const myRand = DHFT2017.originalRandom
      this.tmp.useSpot[0] = Math.floor(myRand(this.gLength))
      this.tmp.useSpot[1] = Math.floor(myRand(this.gLength))
      this.tmp.useSpot[2] = Math.floor(myRand(this.gLength))
      this.tmp.useSpot[3] = Math.floor(myRand(this.gLength))
      this.tmp.useSpot[4] = Math.floor(myRand(this.gLength))
      this.tmp.useSpot[5] = Math.floor(myRand(this.gLength))
      this.tmp.useSpot[6] = Math.floor(myRand(this.gLength))
      const oneSeventh = 1 / 7
      let index, itemId
      for (let i in this.tmp.useSpot) {
        this.lineCounts[i] = this.lineCounts[i-1] || 0
        index = -1
        while ( (index = this.useSpot.indexOf(this.tmp.useSpot[i], index+1)) !== -1 )
          if ( (itemId = Math.floor(index * oneSeventh)) !== this.lineOrder[this.lineCounts[i]] )
            this.lineOrder[++this.lineCounts[i]] = itemId
      }
      const gl = this.gl
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
      gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, this.lineOrder)
    }

    calc () {
      const gl = this.gl
      if (++this.frame % this.refreshSpan === 0){
        this.refreshSpotPointer()
        this.refreshLineOrder()
      }
      const tmp = this.tmp
      const spot = this.gravSpot
      let radius, veloMag, posMag, gravMag, rotMag, i
      let n = -1
      while (++n < this.pLength) {
        glmx.vec3.set(tmp.acceleration, 0, 0, 0)
        glmx.vec3.set(tmp.position,
          this.attrData.position[n*3 + 0],
          this.attrData.position[n*3 + 1],
          this.attrData.position[n*3 + 2]
        )
        glmx.vec3.set(tmp.outPosition, 0, 0, 0)
        glmx.vec3.set(tmp.velocity,
          this.attrData.velocity[n*3 + 0],
          this.attrData.velocity[n*3 + 1],
          this.attrData.velocity[n*3 + 2]
        )
        glmx.vec3.set(tmp.outVelocity, 0, 0, 0)
        glmx.vec3.set(tmp.color,
          this.attrData.color[n*3 + 0],
          this.attrData.color[n*3 + 1],
          this.attrData.color[n*3 + 2]
        )

        veloMag = glmx.vec3.length(tmp.velocity)
        posMag = glmx.vec3.length(tmp.position)

        tmp.useSpot[0] = this.useSpot[7*n + 0]
        tmp.useSpot[1] = this.useSpot[7*n + 1]
        tmp.useSpot[2] = this.useSpot[7*n + 2]
        tmp.useSpot[3] = this.useSpot[7*n + 3]
        tmp.useSpot[4] = this.useSpot[7*n + 4]
        tmp.useSpot[5] = this.useSpot[7*n + 5]
        tmp.useSpot[6] = this.useSpot[7*n + 6]

        for (let i of tmp.useSpot) {
          spot.current = this.spotPointer[i]
          glmx.vec3.sub(tmp.relativePos, tmp.position, spot.gPosition)
          if (i % 2)
            glmx.vec3.cross(tmp.rotate, spot.gAxis, tmp.relativePos)
          else
            glmx.vec3.cross(tmp.rotate, tmp.relativePos, spot.gAxis)

          radius = Math.max(glmx.vec3.length(tmp.relativePos), glmx.glMatrix.EPSILON)
          gravMag = spot.gMag / Math.min(Math.max( Math.pow(radius, 2), glmx.glMatrix.EPSILON), spot.gFarLimit)
          rotMag = Math.sqrt( spot.gMag / Math.min(Math.max(radius, spot.gNearLimit), spot.gFarLimit) ) * glmx.vec3.length(tmp.rotate) / radius

          glmx.vec3.normalize(tmp.relativePos, tmp.relativePos)
          glmx.vec3.scale(tmp.relativePos, tmp.relativePos, -gravMag)

          glmx.vec3.normalize(tmp.rotate, tmp.rotate)
          glmx.vec3.scale(tmp.rotate, tmp.rotate, (rotMag - glmx.vec3.dot(tmp.rotate, tmp.velocity) ) * spot.gRotWeight )

          glmx.vec3.add(tmp.acceleration, tmp.acceleration, tmp.rotate)
          glmx.vec3.add(tmp.acceleration, tmp.acceleration, tmp.relativePos)
        }
        glmx.vec3.scale(tmp.acceleration, tmp.acceleration, 1 / 20)

        glmx.vec3.add(tmp.outVelocity, tmp.velocity, tmp.acceleration)
        glmx.vec3.add(tmp.outPosition, tmp.position, tmp.outVelocity)

        for (i=0; i<3; i++) {
          this.attrData.position[n*3+i] = tmp.outPosition[i]
          this.attrData.velocity[n*3+i] = tmp.outVelocity[i]
        }

      } // while END

      for (const bufferName in this.attrBuf) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.attrBuf[bufferName])
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.attrData[bufferName])
      }


      if (this.attrData.position.toString().match('NaN')) {
        console.warn('NaN が出た');
      }
      if (this.attrData.position.indexOf(Infinity) != -1) {
        console.warn('Infinity が出た');
      }
    }

  }
  DHFT2017.Particle = Particle
  DHFT2017.Particle.using = null

})(window.DHFT2017 = window.DHFT2017 || {})

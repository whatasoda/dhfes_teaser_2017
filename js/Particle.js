;((DHFT2017) => {

  const PIFourth = Math.PI / 4
  const PI2 = Math.PI * 2

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
        'pLength', 'pDensity',
        'pPositionX','pPositionY','pPositionZ',
        'pVelocityX','pVelocityY','pVelocityZ',
        'refreshSpan',
      ])

      this.cLength = length
      this.pDensity = parseInt(myRand(...this.ranges.pDensity))
      this.pLength = length * this.pDensity
      this.tStep = 1 / this.pDensity
      this.frame = 0
      this.refreshSpan = parseInt(myRand(...this.ranges.refreshSpan))

      const tmpCV = []
      // i+0,1: CV1, i+2,3: CV2, i+4,5: CV3
      // CV0は[0,0]
      const tmpCVCoef = [[],[]]
      const CV1 = glmx.vec2.create()
      const CV2 = glmx.vec2.create()
      const CV2XYZ = glmx.vec3.create()
      const CV3 = glmx.vec2.create()
      this.getRandomBezierCVOnSphereSuface(CV1, myRand)
      tmpCV.push(...CV1)
      for (let i=0; i<this.cLength; i++) {
        glmx.vec2.set(CV1, tmpCV[i*6], tmpCV[i*6+1])
        this.getRandomBezierCVOnSphereSuface(CV2, myRand)
        this.getRandomBezierCVOnSphereSuface(CV3, myRand)
        this.getValidCV(CV2, CV1, CV2)
        this.getValidCV(CV3, CV2, CV3)
        tmpCVCoef[0].push(
          0,
          3*CV1[0],
          -6*CV1[0] + 3*CV2[0],
          3*CV1[0] - 3*CV2[0] + CV3[0]
        )
        tmpCVCoef[1].push(
          CV1[1],
          2*CV1[1],
          -5*CV1[1] + 3*CV2[1],
          2*CV1[1] - 3*CV2[1] + CV3[1]
        )

        this.SSToXYZ(CV2XYZ, CV2)
        this.rotateSS(CV2XYZ, CV2XYZ, CV3)
        this.XYZtoSS(CV2XYZ, CV1) // nextCV1
        CV1[1] += Math.PI
        CV1[1] %= PI2
        tmpCV.push( ...CV2, ...CV3, ...CV1)
      }
      tmpCV.pop()

      const CVCoef = [
        new Float32Array(tmpCVCoef[0]),
        new Float32Array(tmpCVCoef[1])
      ]


      const tmpPosition = []
      const tmpColor = []
      const tmpLineOrder = []
      const tmpRGB = this.tmp.color
      const ColorSet = DHFT2017.ColorSet[parseInt(myRand(DHFT2017.ColorSet.length))]

      let id4, t
      const T = glmx.vec4.create()
      const C = glmx.vec2.create()
      const tmpXYZ = this.tmp.XYZ
      const tmpQuat = this.tmp.quat
      const current = glmx.vec3.fromValues(0,0,1)
      glmx.vec3.set(tmpXYZ, 0, 1, 0)
      for (let n=0; n<this.pLength; n++) {
        id4 = 4 * parseInt(n / this.pDensity)
        t = this.tStep * (n % this.pDensity)
        glmx.vec4.set(T, 0, t, t*t, t*t*t)

        glmx.vec2.set(C, 0, 0)
        for (let d=0; d<2; d++) for (let i=0; i<4; i++)
          C[d] += CVCoef[d][id4+i] * T[i]
        this.rotateSS(tmpXYZ, tmpXYZ, C)
        glmx.quat.setAxisAngle(tmpQuat, tmpXYZ, 0.3)
        glmx.vec3.transformQuat(current, current, tmpQuat)
        glmx.vec3.normalize(current, current)
        tmpPosition.push(...current)
        const useColor = ColorSet[parseInt(myRand(5))]
        const cNoise = myRand(...this.ranges.cNoise)

        glmx.vec3.set(tmpRGB, useColor[0]+cNoise, useColor[1]+cNoise, useColor[2]+cNoise)
        tmpColor.push( ...tmpRGB )
        if (n)
          tmpLineOrder.push( n-1, n )
      }
      this.positionBase       = new Float32Array(tmpPosition)
      this.attrData = {}
      this.attrData.position  = new Float32Array(tmpPosition)
      this.attrData.color     = new Float32Array(tmpColor)
      this.attrData.radius    = new Float32Array(this.pLength)
      this.attrData.radius.fill(1)

      this.lineOrder        = new Uint16Array(tmpLineOrder)
      this.lineCounts       = new Uint16Array([0,1,2,3,4,5,6])

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

    }


    setCurrent () {
      DHFT2017.Particle.using = this
    }

    createTmp () {
      if (this.tmp)
        return null
      this.tmp = {}
      this.tmp.acceleration = glmx.vec3.create()
      this.tmp.XYZ          = glmx.vec3.create()
      this.tmp.quat         = glmx.quat.create()
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

    getRandomBezierCVOnSphereSuface(out, randomFunc) {
      const CVCubic    = this.tmp.CVCubic    || (this.tmp.CVCubic    = glmx.vec3.create())
      const absCVCubic = this.tmp.absCVCubic || (this.tmp.absCVCubic = glmx.vec3.create())
      const CVSphere   = this.tmp.CVSphere   || (this.tmp.CVSphere   = glmx.vec3.create())
      out = out || glmx.vec2.create()
      glmx.vec3.set(CVCubic, randomFunc(2, -1), randomFunc(2, -1), randomFunc(2, -1))
      glmx.vec3.copy(absCVCubic, CVCubic.map(Math.abs))
      const face = absCVCubic.indexOf( Math.max(...absCVCubic) )
      glmx.vec3.scale(CVCubic, CVCubic, 1 / absCVCubic[face])
      glmx.vec3.set(CVCubic, CVCubic[face], CVCubic[(face+1)%3], CVCubic[(face+2)%3])

      CVCubic[1] *= PIFourth * CVCubic[face]
      CVCubic[2] *= PIFourth * CVCubic[face]
      const [cos1, cos2]  = [Math.cos( CVCubic[1] ), Math.cos( CVCubic[2] )]
      const [sin1, sin2]  = [Math.sin( CVCubic[1] ), Math.sin( CVCubic[2] )]
      CVSphere[face] = CVCubic[0] * cos1 * cos2
      CVSphere[(face+1)%3] = sin1 * sin2
      CVSphere[(face+2)%3] = sin2
      return this.XYZtoSS(out, CVSphere)
    }

    getValidCV (out, from, to) {
      const tmpTo   = this.tmp.to   || (this.tmp.to   = [])
      for (let b=0; b<6; b++)
        tmpTo.push(glmx.vec2.create())
      let closest   = 0
      let closestId = 0
      let distance
      glmx.vec2.copy(tmpTo[0], to)
      glmx.vec2.set(tmpTo[1], PI2 - to[0], to[1] + Math.PI )
      glmx.vec2.set(tmpTo[2], PI2 - to[0], to[1] - Math.PI )
      glmx.vec2.set(tmpTo[3],     - to[0], to[1] + Math.PI )
      glmx.vec2.set(tmpTo[4],     - to[0], to[1] - Math.PI )
      glmx.vec2.set(tmpTo[5],       to[0], to[1] - PI2 )
      for (let b=0; b<6; b++) {
        if ( (distance = glmx.vec2.distance(from, tmpTo[b])) < closest) {
          closest = distance
          closestId = b
        }
      }
      return glmx.vec2.copy(out, tmpTo[closestId])
    }

    SSToXYZ (out, SS) {
      let [sin0, sin1] = [Math.sin(SS[0]), Math.sin(SS[1])]
      let [cos0, cos1] = [Math.cos(SS[0]), Math.cos(SS[1])]
      return glmx.vec2.set(out, sin0*cos1, cos0, sin0+sin1)
    }
    XYZtoSS (out, XYZ) {
      return glmx.vec2.set(out,
        Math.abs( Math.atan2(Math.sqrt(Math.pow(XYZ[0], 2) + Math.pow(XYZ[2], 2)), XYZ[1]) ),
        Math.atan2(XYZ[2], XYZ[0]) + Math.PI
      )
    }

    rotateSS (out, XYZ, SS) {
      const quat = this.tmp.SSQuat || (this.tmp.SSQuat = glmx.quat.create())
      const axis = this.tmp.SSAxis || (this.tmp.SSAxis = glmx.vec3.create())
      let sin1 = Math.sin(SS[1])
      let cos1 = Math.cos(SS[1])
      glmx.vec3.set(axis, -sin1, 0, cos1)
      glmx.quat.setAxisAngle(quat, axis, -SS[0])
      glmx.vec3.transformQuat(out, XYZ, quat)
    }

    calc () {
      const gl = this.gl
      const tmp = this.tmp
      const spot = this.gravSpot
      this.frame++
      let radius, veloMag, posMag, gravMag, rotMag, i
      let n = -1
      let step = 10 * Math.PI /this.pLength
      while (++n < this.pLength) {
        radius = Math.cos((this.frame + n) * step + (Math.sin(( n) * step) * 0.2 + 0.3)) + 1.2
        radius *= Math.min(this.frame, 100) * 0.03
        radius *= Math.cos(Math.cos(this.frame * 0.005) *Math.PI) + 1.1
        radius += 0.5
        if (!DHFT2017.enableAnimate)
          radius = 1
        this.attrData.radius[n] = radius * 10
        // glmx.vec3.set(tmp.position,
        //   this.attrData.position[n*3 + 0],
        //   this.attrData.position[n*3 + 1],
        //   this.attrData.position[n*3 + 2]
        // )
        // glmx.vec3.set(tmp.outPosition, 0, 0, 0)
        // glmx.vec3.set(tmp.velocity,
        //   this.attrData.velocity[n*3 + 0],
        //   this.attrData.velocity[n*3 + 1],
        //   this.attrData.velocity[n*3 + 2]
        // )
        // glmx.vec3.set(tmp.outVelocity, 0, 0, 0)
        // glmx.vec3.set(tmp.color,
        //   this.attrData.color[n*3 + 0],
        //   this.attrData.color[n*3 + 1],
        //   this.attrData.color[n*3 + 2]
        // )
        //
        // veloMag = glmx.vec3.length(tmp.velocity)
        // posMag = glmx.vec3.length(tmp.position)
        //
        // tmp.useSpot[0] = this.useSpot[7*n + 0]
        // tmp.useSpot[1] = this.useSpot[7*n + 1]
        // tmp.useSpot[2] = this.useSpot[7*n + 2]
        // tmp.useSpot[3] = this.useSpot[7*n + 3]
        // tmp.useSpot[4] = this.useSpot[7*n + 4]
        // tmp.useSpot[5] = this.useSpot[7*n + 5]
        // tmp.useSpot[6] = this.useSpot[7*n + 6]
        //
        // for (let i of tmp.useSpot) {
        //   spot.current = this.spotPointer[i]
        //   glmx.vec3.sub(tmp.relativePos, tmp.position, spot.gPosition)
        //   if (i % 2)
        //     glmx.vec3.cross(tmp.rotate, spot.gAxis, tmp.relativePos)
        //   else
        //     glmx.vec3.cross(tmp.rotate, tmp.relativePos, spot.gAxis)
        //
        //   radius = Math.max(glmx.vec3.length(tmp.relativePos), glmx.glMatrix.EPSILON)
        //   gravMag = spot.gMag / Math.min(Math.max( Math.pow(radius, 2), glmx.glMatrix.EPSILON), spot.gFarLimit)
        //   rotMag = Math.sqrt( spot.gMag / Math.min(Math.max(radius, spot.gNearLimit), spot.gFarLimit) ) * glmx.vec3.length(tmp.rotate) / radius
        //
        //   glmx.vec3.normalize(tmp.relativePos, tmp.relativePos)
        //   glmx.vec3.scale(tmp.relativePos, tmp.relativePos, -gravMag)
        //
        //   glmx.vec3.normalize(tmp.rotate, tmp.rotate)
        //   glmx.vec3.scale(tmp.rotate, tmp.rotate, (rotMag - glmx.vec3.dot(tmp.rotate, tmp.velocity) ) * spot.gRotWeight )
        //
        //   glmx.vec3.add(tmp.acceleration, tmp.acceleration, tmp.rotate)
        //   glmx.vec3.add(tmp.acceleration, tmp.acceleration, tmp.relativePos)
        // }
        // glmx.vec3.scale(tmp.acceleration, tmp.acceleration, 0.05)
        //
        // glmx.vec3.add(tmp.outVelocity, tmp.velocity, tmp.acceleration)
        // glmx.vec3.add(tmp.outPosition, tmp.position, tmp.outVelocity)
        //
        // for (i=0; i<3; i++) {
        //   this.attrData.position[n*3+i] = tmp.outPosition[i]
        //   this.attrData.velocity[n*3+i] = tmp.outVelocity[i]
        // }

      } // while END

      gl.bindBuffer(gl.ARRAY_BUFFER, this.attrBuf.radius)
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.attrData.radius)


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

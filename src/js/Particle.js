;((DHFT2017) => {

  const PIFourth = Math.PI / 4
  const PI2 = Math.PI * 2

  class Particle {
    constructor(length, ranges, option = {}) {
      if (!DHFT2017.RendererBase.using)
        return null
      const gl = DHFT2017.RendererBase.using.gl
      this.gl = gl

      this.frame = option.frame || 0
      const myRand = Math.generateRandom(
        option.u || Math.floor(Math.random() * (1 << 30)),
        option.v || Math.floor(Math.random() * (1 << 30)),
        17, 8, 15
      )
      // console.log(`Using Seed Value: [u: ${myRand.u}, v: ${myRand.v}, sequence: ${myRand.x}-${myRand.y}-${myRand.z} ]`)
      DHFT2017.seed = ( ('00000' + myRand.u.toString(32)).slice(-6) + ('00000' + myRand.v.toString(32)).slice(-6) ).toUpperCase()


      this.createTmp()
      this.ranges = ((ranges, props) => {
        for (let prop of props)
          ranges[prop] = new Float32Array(ranges[prop] || [0, 0])
        return ranges
      })( ranges = ranges || {}, [
        'pDensity',
      ])

      this.cLength = length
      this.pDensity = parseInt(myRand(...this.ranges.pDensity))
      this.pLength = length * (this.pDensity - 1)
      this.tStep = 1 / this.pDensity

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
          -CV1[0],
          6*CV1[0],
          -9*CV1[0] + 3*CV2[0],
          3*CV1[0] - 3*CV2[0] + CV3[0]
        )

        this.SSToXYZ(CV2XYZ, CV2)
        CV3[0] *= -1
        this.rotateSS(CV2XYZ, CV2XYZ, CV3)
        CV3[0] *= -1
        this.XYZtoSS(CV1, CV2XYZ) // nextCV1
        CV1[1] += Math.PI
        CV1[1] %= PI2
        CV1[0] %= PI2
        tmpCV.push( ...CV2, ...CV3, ...CV1)
      }
      tmpCV.pop()

      const CVCoef = [
        new Float32Array(tmpCVCoef[0]),
        new Float32Array(tmpCVCoef[1])
      ]


      this.colorSet = new Float32Array( DHFT2017.ColorSet[parseInt(myRand(DHFT2017.ColorSet.length))] )
      this.clearColor = glmx.vec4.create()
      const CC = this.clearColor
      // let c3
      // for (let c=0; c<5; c++) {
      //   c3 = c*3
      //   CC[0] += this.colorSet[c3]
      //   CC[1] += this.colorSet[c3+1]
      //   CC[2] += this.colorSet[c3+2]
      // }
      // glmx.vec3.scale(CC, CC, -0.1)
      // CC[0] += 1
      // CC[1] += 1
      // CC[2] += 1
      // CC[3] = 1
      glmx.vec4.set(CC, 0,0,0x32 / 0xff, 1)
      const useColor     = []

      for (let i=0; i<this.cLength; i++)
        useColor.push( parseInt(myRand(5)) )

      const tmpPosition  = []
      const tmpLineOrder = []
      const tmpId        = []
      const T = glmx.vec4.create()
      const C = glmx.vec2.create()
      const tmpXYZ = this.tmp.XYZ
      const current = glmx.vec3.fromValues(0,0,1)
      const currentBaseSS = glmx.vec2.fromValues(0,0)
      let id, id4, t
      glmx.vec3.set(tmpXYZ, 0, 1, 0)
      for (let n=0; n<this.pLength; n++) {
        id = parseInt(n / (this.pDensity - 1))
        tmpId.push(useColor[id])
        id4 = 4 * id
        t = this.tStep * (n % (this.pDensity - 1))
        glmx.vec4.set(T, 0, t, t*t, t*t*t)

        glmx.vec2.set(C, 0, 0)
        for (let d=0; d<2; d++) for (let i=0; i<4; i++)
          C[d] += CVCoef[d][id4+i] * T[i]
        this.rotateSS(current, tmpXYZ, C)
        this.rotateSS(current, current, currentBaseSS)
        glmx.vec3.normalize(current, current)
        if ( id !== parseInt((n + 1) / this.pDensity) )
          this.XYZtoSS(currentBaseSS, current)
        tmpPosition.push(...current)
      }
      this.attrData = {}
      this.attrData.position  = new Float32Array(tmpPosition)
      this.attrData.radius    = new Float32Array(this.pLength)
      this.attrData.id        = new Float32Array(tmpId)
      this.attrData.radius.fill(1)

      if (!Particle.attrBuf) {
        Particle.attrBuf = {}
        for (const bufferName in this.attrData)
          Particle.attrBuf[bufferName] = gl.createBuffer()
      }
      for (const bufferName in this.attrData) {
          gl.bindBuffer(gl.ARRAY_BUFFER, Particle.attrBuf[bufferName])
          gl.bufferData(gl.ARRAY_BUFFER, this.attrData[bufferName], gl.DYNAMIC_DRAW)
          gl.bindBuffer(gl.ARRAY_BUFFER, null)
      }
    }


    setCurrent () {
      DHFT2017.Particle.using = this
    }

    createTmp () {
      if (this.tmp)
        return null
      this.tmp = {}
      this.tmp.XYZ          = glmx.vec3.create()
      this.tmp.quat         = glmx.quat.create()
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
      glmx.quat.setAxisAngle(quat, axis, SS[0])
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
        radius = Math.cos((this.frame + n) * step + (Math.tan(n * step) * 0.2 + 0.3)) + 1.2
        radius *= (1-Math.cos(Math.min(Math.max((this.frame - 90) * 0.01, 0), 1) * Math.PI)) * 2
        radius *= Math.cos(Math.cos(this.frame * 0.005) * Math.PI) + 1
        radius += 0.5
        this.attrData.radius[n] = radius * 10
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, Particle.attrBuf.radius)
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

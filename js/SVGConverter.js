;((DHFT2017) => {

  const oneThird = 1 / 3
  const tweThird = 2 / 3
  const threeSecond = 3 / 2
  const maxParamMag = 0.99999999

  const bezierValuePointer = DHFT2017.defBynaryEnum({}, `
    position, velocity, speed, acceleration, jerk
  `)
  const BVP = bezierValuePointer

  class BezierPath {
    constructor (x,y,z) {
      this.cvCoord = [] // Control Vertex
      this.coCoord = [] // Coefficient
      for (const arg of arguments)
        if (isNaN(arg))
          return null
        else this.cvCoord.push([arg])
      this.demension = arguments.length
      this.elemCount = 0
    }

    get x () { return this.cvCoord[0] }
    get y () { return this.cvCoord[1] }
    get z () { return this.cvCoord[2] }
    get cpx () { return this.cvCoord[0][this.cvCoord[0].length-1] || 0 } // Current Position X
    get cpy () { return this.cvCoord[1][this.cvCoord[1].length-1] || 0 } // Current Position Y
    get cpz () { return this.cvCoord[2][this.cvCoord[2].length-1] || 0 } // Current Position Z
    get pcx () { return this.cvCoord[0][this.cvCoord[0].length-2] || this.cpx } // Previous Controlpoint X
    get pcy () { return this.cvCoord[1][this.cvCoord[1].length-2] || this.cpy } // Previous Controlpoint Y
    get pcz () { return this.cvCoord[2][this.cvCoord[2].length-2] || this.cpz } // Previous Controlpoint Z

    changeCPtoCoefficient () {
      if (!this.elemCount || this.changed)
        return null
      const CV = this.cvCoord
      const tmpCo = []
      const tmpS = []
      for (let d=0; d<this.demension; d++) {
        this.cvCoord[d] = new Float32Array(this.cvCoord[d])
        tmpCo.push([])
      }
      let p0, p1, p2, p3
      let Ap, Bp, Cp
      let As, Bs, Cs, Ds, Es
      let i3, i4, i5
      for (let i=0; i<this.elemCount; i++) {
        i3 = 3 * i
        i4 = 4 * i
        for (let d=0; d<this.demension; d++) {
          ;[p0, p1, p2, p3] = [CV[d][i3], CV[d][i3+1], CV[d][i3+2], CV[d][i3+3]]
          tmpCo[d].push(
              -p0 + 3*p1 - 3*p2 + p3,
             3*p0 - 6*p1 + 3*p2,
            -3*p0 + 3*p1,
               p0
          )
        }
        ;[As, Bs, Cs, Ds, Es] = [0,0,0,0,0]
        for (let d=0; d<this.demension; d++) {
          ;[Ap, Bp, Cp] = [tmpCo[d][i4], tmpCo[d][i4+1], tmpCo[d][i4+2]]
          As += 9  * Math.pow(Ap, 2)
          Bs += 12 * Ap * Bp
          Cs += 6  * Ap * Cp + 4 * Math.pow(Bp, 2)
          Ds += 4  * Bp * Cp
          Es += Math.pow(Cp, 2)
        }
        tmpS.push(As, Bs, Cs, Ds, Es)
      }
      for (let d=0; d<this.demension; d++)
        this.coCoord[d] = new Float32Array(tmpCo[d])
      this.speed = new Float32Array(tmpS)
      this.maxParam = this.elemCount * maxParamMag
      this.changed = true
    }

    getValues (valuePointer, id, t, out = new Float32Array(6)) {
      const T = [1, t, Math.pow(t, 2), Math.pow(t, 3), Math.pow(t, 4)]
      const [id4, id5] = [id * 4, id * 5]
      let i, vi = -1
      for (let n=0; n<out.length; n++)
        out[n] = 0
      if (valuePointer & bezierValuePointer.position ) for (let d=0; d<this.demension; d++)
        for ( (i=0) || vi++; i<4; i++)
          out[vi] += this.coCoord[d][id4 + i] * T[3-i]
      if (valuePointer & bezierValuePointer.velocity ) for (let d=0; d<this.demension; d++)
        for ( (i=0) || vi++; i<3; i++)
          out[vi] += this.coCoord[id4 + i] * T[2-i] * (3-i)
      if (valuePointer & bezierValuePointer.speed) {
        for ( (i=0) || vi++; i<5; i++)
          out[vi] += this.speed[id5 + i] * T[4-i]
        out[vi] = Math.sqrt(out[vi])
      }
      if (valuePointer & bezierValuePointer.acceleration)
        for ( (i=0) || vi++; i<4; i++)
          out[vi] += this.speed[id5 + i] * T[3-i] * (4-i)
      if (valuePointer & bezierValuePointer.jerk)
        for ( (i=0) || vi++; i<3; i++)
          out[vi] += this.speed[id5 + i] * T[2-i] * (3-i) * (4-i)
      return out
    }

  }

  class SVGConverter {
    constructor (elm) {
      if (typeof elm === 'string')
        elm = document.getElementsByTagName('path')[elm]
      if (!elm instanceof SVGPathElement)
        return null
      let svg = elm.parentNode
      while (!svg instanceof SVGSVGElement)
        svg = svg.parentNode

      this.viewBox            = svg.viewBox.baseVal
      this.viewBox.length     = Math.max(this.viewBox.width, this.viewBox.height)
      this.viewBox.divLength  = 1 / this.viewBox.length
      this.viewBox.coord      = [this.viewBox.x, this.viewBox.y]
      this.tmpIndexContainer  = new Uint8Array( SVGConverter.spec.pathParamCountMax )
      this.tmpPointContainer  = new Float32Array(6)
      this.absParamContainer = new Float32Array(2)
      this.scalarContainer = new Float32Array(1)
      this.bezier = []
      this.convert(elm.getAttribute('d').match( SVGConverter.patterns.commands ))

      const gl = DHFT2017.RendererBase.using.gl
      const result = this.getArrays(BVP.position, false, 5000, true)
      const arrays = result.arrays
      this.svgline = this.svgline || arrays[0]
      this.counts = result.counts
      this.lineBuffer = gl.createBuffer()
      this.colorBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, this.svgline, gl.STATIC_DRAW)
      const tmpColor = []
      for (let i=0; i<this.svgline.length / 2; i++)
        tmpColor[i] = (i % 4) / 4
      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tmpColor), gl.STATIC_DRAW)
    }

    get ap () { // Active Path
      return this.bezier[this.bezier.length-1]
    }

    convert (cmds) {
      const I = this.tmpIndexContainer
      const P = this.tmpPointContainer
      const PPC = SVGConverter.spec.pathParamCount
      let cpx, cpy, pcx, pcy
      let elemCount, n, m, tmpType
      for (let i=0; i<cmds.length; i++) {
        const cmd = cmds[i]
        tmpType = cmd[0]
        const isAbs = tmpType === (tmpType = tmpType.toUpperCase())
        const type = tmpType
        const params = (cmd.match(SVGConverter.patterns.params) || []).map(parseFloat)
        if (
          isNaN(PPC[type])                                     ||
          (PPC[type] || !(elemCount = 1))                      &&
          !(elemCount = Math.floor(params.length / PPC[type]))
        ) continue

        for (n=0; n<elemCount; n++) {
          for (m=0; m<PPC[type]; m++)
            I[m] = n * PPC[type] + m
          const ap = this.ap
          ;[cpx, cpy, pcx, pcy] = ap
            ? [this.ap.cpx, this.ap.cpy, this.ap.pcx, this.ap.pcy]
            : [0,0,0,0]
          switch (type) {
            case 'M': /* x, y */
              isAbs
                ? this.bezier.push( new BezierPath(params[I[0]]    , params[I[1]]    ) )
                : this.bezier.push( new BezierPath(params[I[0]]+cpx, params[I[1]]+cpy) )
              break
            case 'L': /* x, y */
              ;[ P[0], P[1] ] = isAbs
                ? [ params[I[0]]    , params[I[1]]     ]
                : [ params[I[0]]+cpx, params[I[1]]+cpy ]
              ap.x.push(cpx, P[0], P[0])
              ap.y.push(cpy, P[1], P[1])
              ap.elemCount++
              break
            case 'H': /* x */
              ;[P[0], P[1]] = isAbs
                ? [ params[I[0]]    , (params[I[0]]-cpx)*oneThird ]
                : [ params[I[0]]+cpx, (params[I[0]]    )*oneThird ]
              ap.x.push(cpx+P[1], P[0]-P[1], P[0])
              ap.y.push(cpy, cpy, cpy)
              ap.elemCount++
              break
            case 'V':  /* y */
              ;[P[0], P[1]] = isAbs
                ? [ params[I[0]]    , (params[I[0]]-cpy)*oneThird ]
                : [ params[I[0]]+cpy, (params[I[0]]    )*oneThird ]
              ap.x.push(cpx, cpx, cpx)
              ap.y.push(cpy+P[1], P[0]-P[1], P[0])
              ap.elemCount++
              break
            case 'Q': /* x1, y1, x, y */
              ;[ P[0], P[1], P[2], P[3] ] = isAbs
                ? [ params[I[0]]    , params[I[1]]    , params[I[2]]    , params[I[3]]     ]
                : [ params[I[0]]+cpx, params[I[1]]+cpy, params[I[2]]+cpx, params[I[3]]+cpy ]
              ap.x.push( (P[0]- cpx) * tweThird + cpx, (P[0]-P[2]) * tweThird + P[2] )
              ap.y.push( (P[1]- cpy) * tweThird + cpy, (P[1]-P[3]) * tweThird + P[3] )
              ap.elemCount++
              break
            case 'T': /* x, y */
              ;[ P[0], P[1], P[2], P[3] ] = isAbs
                ? [ (cpx-pcx)*threeSecond, (cpy-pcy)*threeSecond, params[I[0]]    , params[I[1]]    ]
                : [ (cpx-pcx)*threeSecond, (cpy-pcy)*threeSecond, params[I[0]]+cpx, params[I[1]]+cpy]
              ap.x.push( (P[0]- cpx) * tweThird + cpx, (P[0]-P[2]) * tweThird + P[2] )
              ap.y.push( (P[1]- cpy) * tweThird + cpy, (P[1]-P[3]) * tweThird + P[3] )
              ap.elemCount++
              break
            case 'C': /* x1, y1, x2, y2, x, y */
              ;[ P[0], P[1], P[2], P[3], P[4], P[5] ] = isAbs
                ? [ params[I[0]]    , params[I[1]]    , params[I[2]]    , params[I[3]]    , params[I[4]]    , params[I[5]]     ]
                : [ params[I[0]]+cpx, params[I[1]]+cpy, params[I[2]]+cpx, params[I[3]]+cpy, params[I[4]]+cpx, params[I[5]]+cpy ]
              ap.x.push(P[0], P[2], P[4])
              ap.y.push(P[1], P[3], P[5])
              ap.elemCount++
              break
            case 'S': /* x2, y2, x, y */
              ;[ P[0], P[1], P[2], P[3] ] = isAbs
                ? [ params[I[0]]    , params[I[1]]    , params[I[2]]    , params[I[3]]     ]
                : [ params[I[0]]+cpx, params[I[1]]+cpy, params[I[2]]+cpx, params[I[3]]+cpy ]
              ap.x.push(pcx, P[0], P[2])
              ap.y.push(pcy, P[1], P[3])
              ap.elemCount++
              break
            // case 'A': /* rx, ry, x-axis-rotation, large-arc-flag, sweep-flag, x, y */
            //   console.log('A');
            //   break
            case 'Z': /* no params */
              ap.x.push(cpx, ap.x[0], ap.x[0])
              ap.y.push(cpy, ap.y[0], ap.y[0])
              ap.elemCount++
              break
            default:
          }
        }
      }

      for (let i=0; i<this.bezier.length; i++) {
        const B = this.bezier[i]
        if (B.elemCount)
          B.changeCPtoCoefficient(this.viewBox)
        else
          this.bezier.splice(i--, 1)
      }

    }


    getAbsParam(pathId, param, isUnitParam) {
      if (!this.bezier[pathId])
        return null
      const B = this.bezier[pathId]
      let tmpT = isUnitParam
        ? B.elemCount * Math.min(param, maxParamMag)
        : Math.min(param, B.maxParam)
      let id = Math.floor(tmpT) //
      this.absParamContainer[0] = id
      this.absParamContainer[1] = tmpT - id
      return this.absParamContainer
    }

    getVectorValue (pointer, pathId, param, isUnitParam = true, outUnitCoord = true, out = new Float32Array(2)) {
      let absParam = this.getAbsParam(pathId, param, isUnitParam)
      if ( !absParam )
        return null
      const B = this.bezier[pathId]
      const VB = this.viewBox
      B.getValues(pointer, absParam[0], absParam[1], out)
      for (let d=0; d<B.demension; d++)
        out[d] = outUnitCoord
          ? ( out[d]-VB.coord[d] ) * VB.divLength
          : out[d]
      return out
    }

    getScalarValue (pointer, pathId, param, isUnitParam = true, outUnitCoord = true) {
      let absParam = this.getAbsParam(pathId, param, isUnitParam)
      if ( !absParam )
        return null
      const B = this.bezier[pathId]
      const VB = this.viewBox
      B.getValues(pointer, absParam[0], absParam[1], this.scalarContainer)
      return outUnitCoord
        ? this.scalarContainer[0] / this.viewBox.length
        : this.scalarContainer[0]
    }

    getPoint (pathId, param, isUnitParam = true, outUnitCoord = true, out = new Float32Array(2)) {
      return this.getVectorValue(bezierValuePointer.position, pathId, param, isUnitParam, outUnitCoord, out)
    }
    getVelocity (pathId, param, isUnitParam = true, outUnitCoord = true, out = new Float32Array(2)) {
      return this.getVectorValue(bezierValuePointer.velocity, pathId, param, isUnitParam, outUnitCoord, out)
    }
    getSpeed (pathId, param, isUnitParam = true, outUnitCoord = true) {
      return this.getScalarValue(bezierValuePointer.speed, pathId, param, isUnitParam, outUnitCoord)
    }
    getAcceleration (pathId, param, isUnitParam = true, outUnitCoord = true) {
      return this.getScalarValue(bezierValuePointer.acceleration, pathId, param, isUnitParam, outUnitCoord)
    }
    getJerk (pathId, param, isUnitParam = true, outUnitCoord = true) {
      return this.getScalarValue(bezierValuePointer.jerk, pathId, param, isUnitParam, outUnitCoord)
    }

    getArrays (pointer, mode, range, outUnitCoord = true) {
      const arrays = []
      const pathElemCounts = []
      if (mode)
        pointer = pointer | BVP.speed
      else {
        let paramLength = 0
        for (const B of this.bezier)
          paramLength += B.elemCount
        range = paramLength / range
      }
      let [v, vC, vPointer] = [0, 0, pointer &  (BVP.position | BVP.velocity)]
      let [s, sC, sPointer] = [2, 0, pointer & ~(BVP.position | BVP.velocity)]
      while ( vPointer >>> v ) if ( (vPointer >>> v++) & 1 && ++vC)
        arrays.push([],[])
      while ( sPointer >>> s ) if ( (sPointer >>> s++) & 1 && ++sC)
        arrays.push([])
      const out = new Float32Array(arrays.length)
      const AP = this.absParamContainer
      const B = this.bezier
      const VB = this.viewBox
      const D = B[0].demension
      let i = 0
      let count = 0
      let shiftStep = 0
      let param = 0
      let n

      const test = new Float32Array(8)
      const csv = []
      while (i < this.bezier.length) {
        if (B[i].elemCount <= param)
          param = shiftStep === 0 &&  (shiftStep = 1)        ? B[i].elemCount
                : shiftStep === 1 && !(shiftStep = 0) && i++ ? 0 : 0
        if ( !this.getAbsParam(i, param, false) )
          break
        B[i].getValues(pointer, AP[0], AP[1], out)

        const id3 = AP[0]*3
        for (let m=0; m<4; m++) {
          test[m] = Math.pow(B[i].cvCoord[0][id3+m] - out[0], 2) + Math.pow(B[i].cvCoord[1][id3+m] - out[1], 2)
        }
        test[4] = test[0] - test[2]
        test[5] = test[3] - test[1]
        test[6] = test[5] + test[4]
        test[7] = test[5] - test[4]
        csv.push(test.join(','))
        // console.log(test);

        param += mode
          ? Math.min(1, Math.max(out[vC] ? range / (out[vC] * VB.divLength) : 1, 0.00001))
          : range

        for (n=0; n<vC; n++) for (let d=0; d<D; d++)
          arrays[n].push( outUnitCoord
            ? out[n*D+d] = ( out[n*D+d]-VB.coord[d] ) * VB.divLength
            : out[n*D+d]
          )
        for (n=0; n<sC; n++)
          arrays[vC+n].push( outUnitCoord
            ? out[vC*D+n] = out[vC*D+n] * VB.divLength
            : out[vC*D+n]
          )
        pathElemCounts[i] = count++
      }
      for (i=0; i<arrays.length; i++)
        arrays[i] = new Float32Array(arrays[i])
      console.log(csv.join('\n'));
      return {counts: pathElemCounts, arrays: arrays}
    }

  }
  SVGConverter.patterns = {}
  SVGConverter.patterns.commands = /[MmLlHhVvQqTtCcSsAaZz][\d\-\.\s,]*/g
  SVGConverter.patterns.params   = /([\d\-\.]+)/g
  SVGConverter.spec = {}
  SVGConverter.spec.pathParamCount = {
    M: 2, L: 2, H: 1, V: 1, Q: 4, T: 2, C: 6, S: 4, A: 7, Z: 0,
  }
  SVGConverter.spec.pathParamCountMax = Object.keys(SVGConverter.spec.pathParamCount).reduce((pv, cv) => { return Math.max(pv, SVGConverter.spec.pathParamCount[cv]) }, 0)
  DHFT2017.SVGConverter = SVGConverter


})(window.DHFT2017 = window.DHFT2017 || {})

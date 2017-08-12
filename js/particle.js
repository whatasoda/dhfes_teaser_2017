;((DHFT2017) => {

  const bufferList = [
    'position',
    'velocity',
    'color',
  ]
  class Particle extends DHFT2017.ShaderBase {


    constructor (gl) {
      super(gl, {
        particle: {vert: DHFT2017.particle.vert, frag: DHFT2017.particle.frag},
      })
      this.buffers = {}
      this.particleParams = {
        position: [],
        velocity: [],
        color: [],
      }
      this.gravSpot = []
      this.gravitySpotRanges = {
        length: [],
        mag: [],
        BufferRadius: [],
        RigidRadius: []
      }
      let tmpBuffer
      for (const bufferName of bufferList) {
        if ( (tmpBuffer = gl.createBuffer()) )
          this.buffers[bufferName] = tmpBuffer
      }
      // gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[bufferName])
      // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrowPosition), gl.DYNAMIC_DRAW)
      // gl.bindBuffer(gl.ARRAY_BUFFER, null)

      // gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vp))
    }


    initializeParticleParams(gl, howMany) {
      const originalRandom = DHFT2017.originalRandom
      // const gravSpotLength = Math.floor(originalRandom() * this.gravitySpotRanges.length[0] + this.gravitySpotRanges.length[1])
      // for (let n=0; n<gravSpotLength; ) {
      //   this.gravSpot[n] = [
      //     /** {X}            */ originalRandom(),
      //     /** {Y}            */ originalRandom(),
      //     /** {Z}            */ originalRandom(),
      //     /** {mag}          */ originalRandom() * this.gravitySpotRanges.mag[0] + this.gravitySpotRanges.mag[1],
      //     /** {BufferRadius} */ originalRandom() * this.gravitySpotRanges.BufferRadius[0] + this.gravitySpotRanges.BufferRadius[1],
      //     /** {RigidRadius}  */ originalRandom() * this.gravitySpotRanges.RigidRadius[0] + this.gravitySpotRanges.RigidRadius[1],
      //   ]
      // }
      for (let n=0; n<howMany; n++) {
        this.particleParams.position.push(
          /** {X} */ originalRandom() * 30 - 15,
          /** {Y} */ originalRandom() * 30 - 15,
          /** {Z} */ originalRandom() * 30 - 15,
        )
        this.particleParams.velocity.push(
          /** {X} */ originalRandom() * 30 - 15,
          /** {Y} */ originalRandom() * 30 - 15,
          /** {Z} */ originalRandom() * 30 - 15,
        )
        this.particleParams.color.push(
          /** {R} */ originalRandom(),
          /** {G} */ originalRandom(),
          /** {B} */ originalRandom(),
          1,
          // /** {A} */ originalRandom(),
        )

      }

      for (const bufferName of bufferList) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[bufferName])
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.particleParams[bufferName]), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
      }
    }

    // getGravAcceleration (out, position) {
    //   const acceleration: Vec3 = glmx.vec3.create()
    //   for (const spot /*:[Vec3(position), number(G*M)]*/ of this.gravSpot) {
    //     glmx.vec3.sub(acceleration, position, spot[0])
    //     let gravMag = spot[1] / Math.pow(glmx.vec3.length(acceleration), 2)
    //     glmx.vec3.normalize(acceleration, acceleration)
    //     glmx.vec3.multiply(acceleration, acceleration, gravMag)
    //     glmx.vec3.sub(out, out, acceleration)
    //   }
    //   glmx.vec3.devide(out, out, this.gravSpot.length)
    //   return out
    // }

    render(gl) {

      try {
        if (DHFT2017.Camera.using) {
          const Camera = DHFT2017.Camera.using
          Camera.aspect = gl.canvas.width / gl.canvas.height
          // let vpMatrix = Camera.vpMatrix
          // let mvpMatrix = glmx.mat4.create()
          const mvpMatrix = Camera.vpMatrix


          // let modelMatrix = glmx.mat4.create() // dummy
          // glmx.mat4.multiply(mvpMatrix, vpMatrix, modelMatrix)
          const particle = this.shaders.particle
          gl.useProgram(particle.prog)
          // const canvasSize = glmx.vec2.fromValues(gl.canvas.width/2,gl.canvas.height/2)
          // const mag = glmx.vec3.distance(pivot, Camera.spherical.positionAxisZInvert)

          // let n = 0
          // const acceleration = glmx.vec3.create()
          // while (n*3 < this.particleParams.position.length) {
          //   getGravAcceleration(acceleration, this.particleParams.position[n])
          //   for (let i in acceleration) {
          //     this.particleParams.position[n*3+i] +=
          //       (this.particleParams.velocity[n*3+i] += acceleration[i])
          //   }
          // }

          // for (const bufferName of bufferList) {
          //   gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[bufferName])
          //   gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vp))
          //   gl.bindBuffer(gl.ARRAY_BUFFER, null)
          // }

          if (particle.locs.attr.position !== undefined) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.particleParams.position), gl.STATIC_DRAW)
            // gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.particleParams.position))
            gl.enableVertexAttribArray(particle.locs.attr.position)
            gl.vertexAttribPointer(particle.locs.attr.position, 3, gl.FLOAT, false, 0, 0)
          }
          if (particle.locs.attr.velocity !== undefined) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.velocity)
            gl.enableVertexAttribArray(particle.locs.attr.velocity)
            gl.vertexAttribPointer(particle.locs.attr.velocity, 3, gl.FLOAT, false, 0, 0)
          }
          if (particle.locs.attr.color !== undefined) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color)
            gl.enableVertexAttribArray(particle.locs.attr.color)
            gl.vertexAttribPointer(particle.locs.attr.color, 4, gl.FLOAT, false, 0, 0)
          }
          gl.uniformMatrix4fv(particle.locs.unif.mvpMatrix, false, mvpMatrix)
          // gl.uniform2fv(uniLocation.window, canvasSize)
          gl.drawArrays(gl.POINTS, 0, 10)


          // gl.bindBuffer(gl.ARRAY_BUFFER, polygons[keys[n]].vertexBuffer)
          // gl.enableVertexAttribArray(attLocation)
          // gl.vertexAttribPointer(attLocation, 3, gl.FLOAT, false, 0, 0)
          // gl.bindBuffer(gl.ARRAY_BUFFER, polygons[keys[n]].normalBuffer)
          // gl.enableVertexAttribArray(nattLocation)
          // gl.vertexAttribPointer(nattLocation, 3, gl.FLOAT, false, 0, 0)
          //
          // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, polygons[keys[n]].indexBuffer)
          //
          // gl.uniformMatrix4fv(uniLocation, false, mvpMatrix)
          // gl.drawElements(gl.TRIANGLES, polygons[keys[n]].indexArray.length, gl.UNSIGNED_SHORT,0)
        }

      } catch (e) {
        console.warn(e)
      }
    }

  }
  DHFT2017.Particle = Particle

})(window.DHFT2017 = window.DHFT2017 || {})

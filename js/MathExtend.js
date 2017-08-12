;((DHFT2017) => {
  function generateRandom(u, v, x, y, z) {
    /**
      u: {seed}
      v: {seed}
      x: {sequence}
      y: {sequence}
      z: {sequence}
    */
    let s1 = u
    let s0 = v
    const Random = function () {
      s1 = u
      s0 = v
      s1 ^= s1 <<  x
      s1 ^= s1 >>> y
      s1 ^= s0
      s1 ^= s0 >>> z
      u = s0
      v = s1
      return ( (u>>>31 ? ~u : u) + (v>>>31 ? ~v : v) ) / 0b11111111111111111111111111111111
    }
    Random.u = u
    Random.v = v
    Random.x = x
    Random.y = y
    Random.z = z
    return Random
  }
  Math.generateRandom = generateRandom
})(window.DHFT2017 = window.DHFT2017 || {})

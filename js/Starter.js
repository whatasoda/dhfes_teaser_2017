;((DHFT2017) => {
  const requestAnimationFrame = (
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame
  )
  const Starter = {

    animate: function () {

      if (
        DHFT2017.RendererBase.using &&
        DHFT2017.Camera.using &&
        DHFT2017.Particle.using
      ) {
        DHFT2017.Particle.using.calc()
        DHFT2017.Camera.using.spherical.alpha += 0.3
        DHFT2017.Camera.using.fovy =
          (Math.pow(Math.sin(DHFT2017.Particle.using.frame * 0.003), 2) + 0.3) * Math.PI / 5

        // DHFT2017.Camera.using.spherical.beta += 1
        // DHFT2017.Camera.using.spherical.gamma += 0.3
        // DHFT2017.RendererBase.using.gl.viewport(0, 0, DHFT2017.RendererBase.using.canvas.width, DHFT2017.RendererBase.using.canvas.height)
        // console.log(DHFT2017.RendererBase.using.canvas.clientWidth);
        // console.log(DHFT2017.RendererBase.using.canvas.clientHeight);
        // DHFT2017.RendererBase.using.gl.viewport(0, 0, DHFT2017.RendererBase.using.canvas.clientWidth, DHFT2017.RendererBase.using.canvas.clientHeight)
        DHFT2017.RendererBase.using.render()
      }
      Starter.currentFrame = requestAnimationFrame(Starter.animate)
    },

    isCurrentFrame: function (target) {
      if (target.frame == Starter.currentFrame)
        return true
      else
        target.frame = Starter.currentFrame
      return false
    }

  }
  DHFT2017.Starter = Starter

})(window.DHFT2017 = window.DHFT2017 || {})

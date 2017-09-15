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
        for (let i=0; i<1; i++)
          DHFT2017.Particle.using.calc()
        // DHFT2017.Particle.using.frame = this.currentFrame || 0
        DHFT2017.Camera.using.aspect = DHFT2017.RendererBase.using.canvas.width / DHFT2017.RendererBase.using.canvas.height
        DHFT2017.Camera.using.spherical.alpha += 0.3
        // DHFT2017.Camera.using.spherical.beta += 0.3
        // DHFT2017.Camera.using.spherical.gamma += 0.3
        DHFT2017.RendererBase.using.gl.viewport(0, 0, DHFT2017.RendererBase.using.canvas.width, DHFT2017.RendererBase.using.canvas.height)
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

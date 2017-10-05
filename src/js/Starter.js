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
        Starter.currentFrame++
        DHFT2017.title.style.opacity = Math.max(Math.min((Starter.currentFrame / DHFT2017.speed - 1.375), 1), 0)
        if (Starter.currentFrame > 5 * DHFT2017.speed - 50 || Starter.currentFrame < 2) {
          DHFT2017.Particle.using.calc()
          DHFT2017.Camera.using.spherical.alpha += 0.3
          DHFT2017.Camera.using.fovy =
            (Math.pow(Math.sin(DHFT2017.Particle.using.frame * 0.003), 2) + 0.3) * Math.PI / 5
        }
        DHFT2017.RendererBase.using.render()

      }
      requestAnimationFrame(Starter.animate)
    },

    isCurrentFrame: function (target) {
      if (target.frame == Starter.currentFrame)
        return true
      else
        target.frame = Starter.currentFrame
      return false
    },

    restart: function () {
      Starter.currentFrame = 0
      DHFT2017.Particle.reset(false)
    }

  }
  Starter.currentFrame = 0
  DHFT2017.Starter = Starter

})(window.DHFT2017 = window.DHFT2017 || {})

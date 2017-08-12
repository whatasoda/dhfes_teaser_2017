;((DHFT2017) => {
  const requestAnimationFrame = (
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame
  )
  const Starter = {

    animate: function () {
      if (DHFT2017.RendererBase.using)
        DHFT2017.RendererBase.using.render()
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

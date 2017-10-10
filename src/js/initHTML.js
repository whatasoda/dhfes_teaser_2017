
;((DHFT2017) => {
  const countDown = document.getElementById('countDown')
  const dateUTC = new Date(2017, 10, 25, 0, 0, 0, 0).getTime() - new Date().getTime()
  const day = 24 * 60 * 60 * 1000
  const remaining = Math.ceil(dateUTC / day)
  countDown.innerHTML = remaining <= 0
    ? '開催中'
    : remaining === 1
      ? '明日開催'
      : remaining + '日後開催'
})(window.DHFT2017 = window.DHFT2017 || {})

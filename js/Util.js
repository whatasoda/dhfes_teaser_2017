;((DHFT2017) => {
  function defEnum (obj, items) {
    let offset = -1
    while (obj[++offset]) {}
    for (let i in items)
      obj[(obj[offset+parseInt(i)] = items[i])] = offset+parseInt(i)
    return obj
  }
  DHFT2017.defEnum = defEnum
})(window.DHFT2017 = window.DHFT2017 || {})

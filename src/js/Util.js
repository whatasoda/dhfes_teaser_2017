;((DHFT2017) => {
  const parseItemsStrPattern = /[^\s,]+/g
  function parseItemsStr (str) {
    return str.match(parseItemsStrPattern) || []
  }
  function defEnum (obj, items) {
    items = Array.isArray(items) ? items : parseItemsStr(items)
    obj = obj || {}
    const offset = obj.__offset__ || 0
    let i = -1
    while (items[++i])
      obj[(obj[i + offset] = items[i])] = i + offset
    obj.__offset__ = i + offset + 1
    return obj
  }
  DHFT2017.defEnum = defEnum
  function defBynaryEnum(obj, items) {
    items = Array.isArray(items) ? items : parseItemsStr(items)
    obj = obj || {}
    const offset = obj.__offset__ || 0
    let i = -1
    while (items[++i] && (i + offset < 32 || console.warn('BynaryEnum cannot have more than 32 items') )) {
      obj[ (obj[1 << (i + offset)] = items[i]) ] = 1 << (i + offset)
      obj[`__${items[i]}_i`] = i + offset
    }
    obj.__offset__ = i + offset + 1
    return obj
  }
  DHFT2017.defBynaryEnum = defBynaryEnum
})(window.DHFT2017 = window.DHFT2017 || {})

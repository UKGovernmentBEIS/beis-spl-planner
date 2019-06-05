function buildError (message, href) {
  return { text: message, href: href }
}

function prettyList (array) {
  switch (array.length) {
    case 0:
      return ''
    case 1:
      return array[0]
    default:
      const finalElement = array.pop()
      return array.join(', ') + ` and ${finalElement}`
  }
}

module.exports = {
  buildError,
  prettyList
}

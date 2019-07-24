function getGaFields (element) {
  return Array.from(element.attributes).reduce((accumulator, attribute) => {
    const match = attribute.name.match(/^data-ga-field-(.*)/)
    if (match) {
      const fieldName = match[1]
      accumulator[fieldName] = attribute.value
    }
    return accumulator
  }, {})
}

function getNatureOfParenthood () {
  const field = document.querySelector('[name=nature-of-parenthood]:checked') ||
                document.querySelector('[name=nature-of-parenthood]')
  return field ? field.value : null
}

module.exports = {
  getNatureOfParenthood,
  getGaFields
}

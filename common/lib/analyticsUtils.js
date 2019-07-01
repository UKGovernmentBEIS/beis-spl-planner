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

function getBirthOrAdoption () {
  const field = document.querySelector('[name=birth-or-adoption]:checked') ||
                document.querySelector('[name=birth-or-adoption]')
  return field ? field.value : null
}

module.exports = {
  getBirthOrAdoption,
  getGaFields
}

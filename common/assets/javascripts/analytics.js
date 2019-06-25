function getGaFields (element) {
  return Array.from(element.attributes).reduce((accumulator, attribute) => {
    if (/data-ga-field-/.test(attribute.name)) {
      accumulator[attribute.name.substring(14)] = attribute.value
    }
    return accumulator
  }, {})
}

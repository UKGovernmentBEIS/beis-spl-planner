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

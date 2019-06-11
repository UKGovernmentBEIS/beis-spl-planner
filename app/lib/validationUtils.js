const delve = require('dlv')

function isYesOrNo (value) {
  return ['yes', 'no'].includes(value)
}

function prettyList (array) {
  switch (array.length) {
    case 0:
      return ''
    case 1:
      return array[0]
    default:
      const finalElement = array[array.length - 1]
      return array.slice(0, -1).join(', ') + ` and ${finalElement}`
  }
}

function validateParentYesNoFields (req, parent, fieldErrorMessages) {
  let isValid = true
  for (const [field, message] of Object.entries(fieldErrorMessages)) {
    const value = delve(req.session.data, [parent, field])
    if (!isYesOrNo(value)) {
      addError(req, field, message, `#${field}-1`)
      isValid = false
    }
  }
  return isValid
}

function addError (req, field, message, href, errorProps) {
  if (!req.session.errors) {
    req.session.errors = {}
  }
  req.session.errors[field] = { text: message, href: href, ...errorProps }
}

module.exports = {
  isYesOrNo,
  prettyList,
  validateParentYesNoFields,
  addError
}

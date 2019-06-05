/*
 * Validators should take req as an argument.
 * If validation is passed, they should return true.
 * If validation is failed they should attach errors to req.session.errors AND return false
*/

const { buildError } = require('./lib/validationUtils')

function birthOrAdoption (req) {
  if (!['birth', 'adoption'].includes(req.session.data['birth-or-adoption'])) {
    req.session.errors = { 'birth-or-adoption': 'Select either birth or adoption' }
    return false
  }
  return true
}

module.exports = {
  birthOrAdoption
}

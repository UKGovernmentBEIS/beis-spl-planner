/*
 * Validators should take req as an argument.
 * If validation is passed, they should return true.
 * If validation is failed they should attach errors to req.session.errors AND return false
*/

const { buildError } = require('./lib/validationUtils')

module.exports = {}

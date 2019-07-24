const { divMod } = require('./mathsUtils')

const base64Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'
const binaryChars = '01'

function getBase64Char (n) {
  return base64Chars[n]
}

function getBase64Index (char) {
  return base64Chars.indexOf(char)
}

function convertBase10ToBase64 (n) {
  return convertBase10ToNewBase(n, 64, base64Chars)
}

function convertBase10ToBinary (n) {
  return convertBase10ToNewBase(n, 2, binaryChars)
}

function convertBase64ToBase10 (n) {
  return n.split('').reverse().reduce((total, digit, idx) => {
    const binaryDigitValue = getBase64Index(digit)
    return total + (binaryDigitValue * 64 ** idx)
  }, 0)
}

function convertBase64ToBinary (n) {
  return convertBase10ToBinary(convertBase64ToBase10(n))
}

module.exports = {
  getBase64Char,
  getBase64Index,
  convertBase10ToBase64,
  convertBase10ToBinary,
  convertBase64ToBase10,
  convertBase64ToBinary
}

function convertBase10ToNewBase (n, newBase, dictionary) {
  let workingNumber = n
  let output = ''
  let base10Digit
  while (workingNumber > 0) {
    [workingNumber, base10Digit] = divMod(workingNumber, newBase)
    output = dictionary[base10Digit] + output
  }
  return output
}

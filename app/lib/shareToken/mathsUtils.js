function divMod (n, modulo) {
  const divisor = Math.trunc(n / modulo)
  const remainder = n - (modulo * divisor)
  return [divisor, remainder]
}

module.exports = {
  divMod
}

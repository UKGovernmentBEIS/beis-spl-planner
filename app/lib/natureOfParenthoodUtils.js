function primaryMinimumWeek (natureOfParenthood) {
  switch (natureOfParenthood) {
    case 'birth':
      return -11
    case 'adoption':
      return -2
    case 'surrogacy':
      return 0
  }
}

module.exports = {
  primaryMinimumWeek
}

// Existing filters can be imported from env using env.getFilter(name)
// See https://mozilla.github.io/nunjucks/api.html#getfilter
module.exports = function (env) {
  function primaryName (data) {
    return data['birth-or-adoption'] === 'birth' ? 'mother' : 'primary adopter'
  }

  function secondaryName (data) {
    return 'partner'
  }

  function currentParentName (data, currentParent) {
    return currentParent === 'primary' ? primaryName(data) : secondaryName(data)
  }

  function isBirth (data) {
    return data['birth-or-adoption'] === 'birth'
  }

  return {
    ...require('./macros/hidden-fields/filters')(env),
    primaryName,
    secondaryName,
    currentParentName,
    isBirth,
    ...require('./macros/hidden-fields/filters')(env)
  }
}

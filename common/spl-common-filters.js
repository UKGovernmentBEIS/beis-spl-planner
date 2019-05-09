// Existing filters can be imported from env using env.getFilter(name)
// See https://mozilla.github.io/nunjucks/api.html#getfilter
module.exports = function (env) {
  function primaryName (data) {
    return data['birth-or-adoption'] === 'birth' ? 'mother' : 'primary adopter'
  }

  function isBirth (data) {
    return data['birth-or-adoption'] === 'birth'
  }

  return {
    primaryName,
    isBirth
  }
}

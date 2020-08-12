module.exports = function generate(body) {
  return new Function(body)()
}

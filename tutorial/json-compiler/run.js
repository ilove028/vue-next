const parse = require('./parse')
const generate = require('./generate')

module.exports = function(ast) {
  return (...args) => {
    const func = generate(parse(ast))
    return func.apply({ require }, args)
  }
}

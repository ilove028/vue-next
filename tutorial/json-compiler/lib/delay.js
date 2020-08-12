const { resolve } = require('path')

module.exports = async function(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

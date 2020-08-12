const delay = require('./delay')

module.exports = async function(fields = [], start, end) {
  await delay(500)
  return [
    {
      id: 1,
      name: 'Mx',
      age: 30
    },
    {
      id: 2,
      name: 'Yx',
      age: 28
    },
    {
      id: 3,
      name: 'Ricky',
      age: 29
    },
    {
      id: 4,
      name: 'Button',
      age: 42
    }
  ]
    .slice(start, end - start)
    .map(item => {
      return Object.keys(item).reduce((pre, current) => {
        if (fields.includes(current)) {
          pre[current] = item[current]
        }
        return pre
      }, {})
    })
}

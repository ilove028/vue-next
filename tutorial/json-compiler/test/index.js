async function test1(a, b) {
  with (this) {
    if (a > b) {
      const result = await require('./lib/add').call(this, a, b)
      return { a: a, b: b, total: result } /* if */
    } else if (a < b) {
      const result = await require('./lib/substract').call(this, a, b)
      return { a: a, b: b, result: result } /* else if */
    } else {
      for (let i = 0; i < 10; i++) {
        await require('./lib/delay').call(this, 5000)
        await require('./lib/log').call(this, i)
        if (i > 3) {
          break /* if */
        } /* for */
      } /* else */
    } /* with */
  }
}

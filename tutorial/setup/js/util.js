const Util = (function(exports) {
  function debounce(fn, ms, ctx) {
    let timeout
    return function(...args) {
      timeout && clearTimeout(timeout)
      setTimeout(() => {
        fn.apply(ctx, args)
      }, ms)
    }
  }

  exports.debounce = debounce

  return exports
})({})

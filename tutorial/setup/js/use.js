const Use = (function(exports) {
  const { ref } = Vue

  function useCount(ms = 1000) {
    const count = ref(0)
    const start = () => {
      const interval = setInterval(() => {
        count.value++
      }, ms)
      return () => {
        clearInterval(interval)
      }
    }
    return { count, start }
  }

  exports.useCount = useCount

  return exports
})({})

const { reactive, computed } = Vue

function useWindow(top, left, width, height) {
  const rectangle = reactive({ top, left, width, height })
  const cmRect = computed(() => ({
    top: `${rectangle.top}px`,
    left: `${rectangle.left}px`,
    width: `${rectangle.width}px`,
    height: `${rectangle.height}px`
  }))

  return {
    render(r) {
      return Vue.h('div', { class: 'window', style: cmRect.value }, [r({})])
    }
  }
}

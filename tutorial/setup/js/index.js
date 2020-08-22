const { createApp, onMounted } = Vue
const { useCount } = Use

const app = createApp({
  template: `
    <suspense>
      <mx-counter />
      <template #fallback>
        <span class="skeleton">Fail</span>
      </template>
    </suspense>
    `
})

app.component('mx-counter', {
  template: '<div>{{ count }}</div>',
  setup() {
    const { count, start } = useCount()
    onMounted(() => {
      const cancel = start()
      setTimeout(() => {
        cancel()
      }, 10000)
    })
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ count })
      }, 50000)
    })
  }
})

app.mount(document.body)

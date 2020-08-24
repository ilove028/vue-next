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

app.component('mx-displayer', {
  template: '<div class="mx-displayer">{{ data }}</div>',
  props: ['data'],
  mounted() {
    console.log('Displayer')
  }
})

app.component('mx-counter', {
  template: '<div><mx-displayer :data="count"></mx-displayer></div>',
  setup() {
    const { count, start } = useCount()
    onMounted(() => {
      console.log('Counter mounted')
      const cancel = start()
      setTimeout(() => {
        cancel()
      }, 10000)
    })
    return { count }
    // return new Promise(resolve => {
    //   setTimeout(() => {
    //     resolve({ count })
    //   }, 50000)
    // })
  }
})

app.mount(document.body)

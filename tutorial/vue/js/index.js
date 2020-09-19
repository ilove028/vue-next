function useAuotIncrement() {
  const count = Vue.ref(0)
  let i = 0
  let interval = null

  Vue.onMounted(() => {
    i++
    if (!interval) {
      interval = setInterval(() => count.value++, 1000)
    }
  })

  Vue.onBeforeUnmount(() => {
    i--
    if (i <= 0) {
      clearInterval(interval)
      interval = null
    }
  })

  return { count }
}

const Counter = {
  template: `<div>{{ count }}</div>`,
  setup() {
    const { count } = useAuotIncrement()
    Vue.onMounted(() => {
      console.log(`Counter mounted`)
    })
    return {
      count
    }
  }
}

const App = {
  template: '<counter v-if="show" />',
  data() {
    return {
      show: true
    }
  },
  methods: {
    toggle() {
      setTimeout(() => {
        this.show = !this.show
        this.toggle()
      }, 5000)
    }
  },
  mounted() {
    console.log(`App mounted`)
    this.toggle()
  }
}

Vue.createApp(App)
  .component('counter', Counter)
  .mount('#app')

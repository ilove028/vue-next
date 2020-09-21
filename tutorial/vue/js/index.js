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
  template: `
    <div>
      <slot :count="count"/>
    </div>
  `,
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
  template: `
    <h1>Static</h1>
    <counter v-slot="{ count }">
      <span>
        Total: {{count}}
      </span>
    </counter>
    <ul>
      <li>1</li>
      <li>2</li>
      <li>3</li>
    </ul>
  `,
  data() {
    return {
      show: true
    }
  },
  methods: {
    toggle() {
      setTimeout(() => {
        this.show = !this.show
        // this.toggle()
      }, 5000)
    }
  },
  mounted() {
    console.log(`App mounted`)
    this.toggle()
  }
}

// TODO
// prop class style
// ref normalizeChildren
// keep alive suspense
Vue.createApp(App)
  .component('counter', Counter)
  .mount('#app')

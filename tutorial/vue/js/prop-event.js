const Child = {
  name: 'Child',
  template: `
    <ul>
      <li v-for="i of list" :key="i.id">
        {{i.text}}
      </li>
    </ul>
  `,
  props: {
    list: {
      type: Array,
      default() {
        return []
      }
    }
  },
  emits: ['click'],
  created() {
    console.log(this.$attrs)
  }
}

const App = {
  template: `
    <button @click="status ? stop() : start()">
      {{ status ? 'Stop' : 'Start' }}
    </button>
    <Child :list="books" @click="() => {}"/>
  `,
  setup() {
    return useLibrary(30 * 1000)
  }
}

function useLibrary(ms = 1000) {
  const { onMounted, onBeforeUnmount, reactive } = Vue
  const books = reactive([])
  let id = Vue.ref(null)

  const importBook = () => {
    books.push({
      id: books.length,
      text: Math.random()
        .toString(16)
        .substr(2)
    })
  }

  const importBookInterval = () => {
    return setInterval(importBook, ms)
  }

  const stop = () => {
    if (id.value) {
      clearInterval(id.value)
      id.value = null
    }
  }

  const start = () => {
    stop()
    id.value = importBookInterval()
  }

  onMounted(() => {
    start()
    onBeforeUnmount(() => {
      stop()
    })
  })

  return { books, start, stop, status: Vue.computed(() => !!id.value) }
}

// keep-alive
// Async component
// animation transition
// directive
// vnode hook vnodeMounted
// teleport
Vue.createApp(App)
  .component(Child.name, Child)
  .mount('#app')

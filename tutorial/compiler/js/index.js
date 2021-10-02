// console.log(Vue.compile(document.getElementById('template').textContent))
;(function (Vue) {
  const { createApp, ref, reactive, compile } = Vue
  const Com1 = {
    template: `
      <div>
        <slot />
      </div>
    `,
    props: {
      modelValue: {
        type: String,
        default: ''
      }
    },
    setup(props, { emit }) {
      return {
        handleInput(e) {
          emit('update:modelValue', e.target.value)
        }
      }
    }
  }
  const App = {
    template: `
      <div v-once>
        <Com1>
          <p>Slot</p>
        </Com1>
        <h1 v-if="title">{{ name }}</h1>
        <span v-for="s of students" :key="s">
          {{ s }}
        </span>
      </div>
    `,
    components: { Com1 },
    setup() {
      const refTitle = ref(true)
      const refName = ref('YY')
      const retStudents = reactive([])

      setInterval(() => {
        refTitle.value = !refTitle.value
        retStudents.push(Math.random().toString(16).substr(2))
      })
      return {
        title: refTitle,
        students: retStudents,
        name: refName,
        handleClick() {}
      }
    }
  }
  console.log(
    compile(
      `
        <div>
          <span>1</span>
          <Com>{{ data }}</Com>
        </div>
      `,
      {
        // hoistStatic: true
      }
    )
  )
  const vm = createApp(App).mount('#app')
  console.log(vm, App, Com1)
})(Vue)

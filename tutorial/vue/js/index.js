// function useAuotIncrement() {
//   const count = Vue.ref(0)
//   let i = 0
//   let interval = null

//   Vue.onMounted(() => {
//     i++
//     if (!interval) {
//       interval = setInterval(() => count.value++, 1000)
//     }
//   })

//   Vue.onBeforeUnmount(() => {
//     i--
//     if (i <= 0) {
//       clearInterval(interval)
//       interval = null
//     }
//   })

//   return { count }
// }

// const Counter = {
//   template: `
//     <div>
//       <slot :count="count"/>
//     </div>
//   `,
//   setup() {
//     const { count } = useAuotIncrement()
//     Vue.onMounted(() => {
//       console.log(`Counter mounted`)
//     })
//     return {
//       count
//     }
//   }
// }

// const App = {
//   template: `
//     <h1 @click="toggle">Static</h1>
//     <counter v-slot="{ count }">
//       <span v-if="count % 2 === 0">
//         Total: {{count}}
//       </span>
//       <span v-else style="color: red">
//         Total: {{count}}
//       </span>
//     </counter>
//     <ul v-once v-if="show">
//       <li v-for="i of list" :key="i.id">
//         <span :title="show">{{i.id}}</span>
//       </li>
//     </ul>
//   `,
//   props: {
//     initShow: {
//       type: Boolean,
//       default: false
//     }
//   },
//   data() {
//     return {
//       show: this.initShow,
//       list: [
//         {
//           id: 1
//         },
//         {
//           id: 2
//         },
//         {
//           id: 3
//         }
//       ]
//     }
//   },
//   methods: {
//     toggle() {
//       this.show = !this.show
//     }
//   },
//   mounted() {
//     console.log(`App mounted`)
//   }
// }

// TODO
// prop class style v-once bind model on
// ref normalizeChildren
// keep alive suspense
// render 闭包引用着hosit 但是啥时运行呢？ 如果是编译好的render
const { ref, h } = Vue
const App = {
  props: {
    useWindow: Boolean
  },
  setup(props) {
    return () => {
      return h(
        'div',
        {
          onVnodeMounted() {
            console.log('Div mounted')
          }
        },
        [
          h('span', {
            onVnodeMounted() {
              console.log('span mounted')
            }
          })
        ]
      )
    }
  }
}
Vue.createApp(App, { useWindow: true }).mount('#app')

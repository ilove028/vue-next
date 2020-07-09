const a = VueReactivity.ref('Mx')
const obj = VueReactivity.reactive({ name: 'Mx' })
const computedB = VueReactivity.computed(() => `${a.value} Say.`)

const sayRef = VueReactivity.customRef((track, trigger) => {
  return {
    get() {
      track()
    },
    set(value) {
      trigger()
    }
  }
})

let effectTask = null
VueReactivity.effect(
  () => {
    console.log(`${computedB.value} ${obj.name}`)
  },
  {
    scheduler(effect) {
      if (!effectTask) {
        effectTask = effect
        Promise.resolve().then(() => {
          effectTask()
          effectTask = null
        })
      }
    }
  }
)

// a.value = 'Button';
// setTimeout(() => {
//   obj.name = 'Ricky'
// });

a.value = 'Button'
console.log('----')
obj.name = 'Ricky'

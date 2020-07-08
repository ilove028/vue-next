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

VueReactivity.effect(() => {
  console.log(computedB.value)
})

// a.value = 'Button';
// setTimeout(() => {
//   obj.name = 'Ricky'
// });

a.value = 'Button'

VueReactivity.stop(computedB)

a.value = 'Ricky'

const refA = VueReactivity.ref('A')
const refB = VueReactivity.ref('B')

function a() {
  refA.value += refB.value
  console.log(++a.count)
}
a.count = 0

function b() {
  refB.value += refA.value
  console.log(++b.count)
}

b.count = 0

VueReactivity.effect(a)

VueReactivity.effect(b)

console.log(`${refA.value} ${refB.value}`)

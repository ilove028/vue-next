// console.log(Vue.compile(document.getElementById('template').textContent))
;(function (Vue) {
  const { createApp } = Vue
  const App = {
    template: `
      <div>
        <span>Static</span>
      </div>
    `
  }

  const vm = createApp(App).mount('#app')
})(Vue)

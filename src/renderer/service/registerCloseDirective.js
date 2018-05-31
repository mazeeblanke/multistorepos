import Vue from 'vue'

Vue.directive('close', {
  bind (el, bindings, vnode) {
    el.addEventListener('click', e => {
      if (e.target === el) {
        vnode.context[bindings.expression]()
      }
    })
  },
  unbind (el, bindings, vnode) {
    el.removeEventListener('click', e => {
      if (e.target === el) {
        vnode.context[bindings.expression]()
      }
    })
  }
})

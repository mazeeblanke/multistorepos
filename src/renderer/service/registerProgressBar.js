import Vue from 'vue'
import VueProgressBar from 'vue-progressbar'

const options = {
  color: '#3273dc',
  failedColor: '#874b4b',
  thickness: '3px',
  transition: {
    speed: '0.2s',
    opacity: '0.6s',
    termination: 300
  },
  autoRevert: true,
  autoFinish: true,
  inverse: false,
  location: 'top'
}

Vue.use(VueProgressBar, options)

import Vue from 'vue'
import VueProgressBar from 'vue-progressbar'

const options = {
  color: '#84a6e5',
  failedColor: '#874b4b',
  thickness: '3px',
  transition: {
    speed: '1.2s',
    opacity: '0.2s',
    termination: 200
  },
  autoRevert: true
}

Vue.use(VueProgressBar, options)
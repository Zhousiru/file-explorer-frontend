import { createApp } from 'vue'

import './style.css'
import '@mdi/font/css/materialdesignicons.css'
import 'normalize.css'

import App from './App.vue'
import router from './router.js'

import axios from 'axios'

const app = createApp(App)
app.use(router)
app.config.globalProperties.$axios = axios
app.mount('#app')

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import axios from 'axios'
import config from './config'
import Qs from 'qs'

const app = createApp(App)

axios.defaults.baseURL = '/api'
app.use(ElementPlus)
app.config.globalProperties.$axios = axios
app.config.globalProperties.$config = config
app.config.globalProperties.$qs = Qs
app.mount('#app')
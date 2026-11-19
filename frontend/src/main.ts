import './assets/main.css'
// Import Swiper styles
import "swiper/css/bundle";
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'
import { initPageTracking } from './composables/usePageTracking'

const app = createApp(App)

app.use(router)
app.use(VueApexCharts as any)
initPageTracking(router)

app.mount('#app')

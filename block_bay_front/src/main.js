import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import axios from "axios";
import VueRouter from "vue-router";
import router from "./router";
import animate from 'animate.css'

Vue.prototype.$axios=axios;
Vue.use(ElementUI);
Vue.use(VueRouter)
Vue.use(animate)
Vue.prototype.$bus = new Vue()
new Vue({
  router,
  el: '#app',
  render: h => h(App)
});

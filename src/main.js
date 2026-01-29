import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import { Cell, DatetimePicker, Popup } from 'vant';
import 'vant/lib/index.css';

Vue.use(ElementUI);
Vue.use(Cell);
Vue.use(DatetimePicker);
Vue.use(Popup);

new Vue({
  el: '#app',
  render: h => h(App)
});
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./common/state/store";
import {Toasted, toasterOptions} from "@/toaster";

import BootstrapVue from "bootstrap-vue";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

import VueResource from "vue-resource";
import {Logger} from "@/common/logging";

import vuescroll from "vuescroll";
import "vuescroll/dist/vuescroll.css";

import "@fortawesome/fontawesome-free/css/all.css";
import "animate.css/animate.min.css";

import VModal from "vue-js-modal";

// use ts-ignore because of missing type definitions for plugin
// @ts-ignore
import {VueHammer} from "vue2-hammer";

Vue.use(VModal);
Vue.use(VueHammer);
Vue.use(vuescroll);
Vue.use(VueResource);
Vue.use(BootstrapVue);
Vue.use(Toasted, toasterOptions);

// TODO: What to do with this?
Vue.config.productionTip = false;

const log = Logger.getNew("main.ts");

const init = () => {
  // @ts-ignore
  registerCallbackVerovioLoaded(() => {
    new Vue({
      router,
      store,
      render: (h) => h(App),
    }).$mount("#app");
  });
};

if (window.cordova !== undefined) {
  log.info("Cordova enviornment detected. Add device listeneres...");
  document.addEventListener("deviceready", () => {
    log.info("Device is Ready, Render!");
    init();
  });
  document.addEventListener("pause", () => log.info("Pause"));
  document.addEventListener("resume", () => log.info("Resume"));
} else {
  log.info("Browser environment without cordova detected. Skip waiting for 'deviceready'");
  init();
}

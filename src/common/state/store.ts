import Vue from "vue";
import Vuex from "vuex";
import liveState from "./live-state";
import localState from "./local-state";
import annotationCreation from "./annotation-creation";
import pointHighlight from "./point-highlight";

import orchestraMode from "./orchestra-mode";
import scoreView from "./score-view";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    orchestraMode,
    scoreView,
    liveState,
    localState,
    annotationCreation,
    pointHighlight,
  },
});

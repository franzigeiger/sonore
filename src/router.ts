import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "login",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "login" */ "./presentation/views/Login.vue"),
    },
    {
      path: "/scoreview",
      name: "scoreview",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "scoreview" */ "./presentation/views/ScoreView.vue"),
    },
    {
      path: "/piecelist",
      name: "piecelist",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "piecelist" */ "./presentation/views/PieceList.vue"),
    },
    {
      path: "/user",
      name: "user",
      component: () => import(/* webpackChunkName: "user" */ "./presentation/views/AddEditUser.vue"),
    },
    {
      path: "/connection",
      name: "connection",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "connection" */ "./presentation/views/settings/Connection.vue"),
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import(/* webpackChunkName: "settings" */ "./presentation/views/settings/Settings.vue"),
    },
    {
      path: "/settings/register",
      name: "register",
      component: () => import(/* webpackChunkName: "register" */ "./presentation/views/settings/RegisterSettings.vue"),
    },
  ],
  
});

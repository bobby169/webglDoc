import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/point',
    name: 'Point',
    component: () => import(/* webpackChunkName: "point" */ '../views/Point.vue')
  },
  {
    path: '/shape',
    name: 'Shape',
    component: () => import(/* webpackChunkName: "shape" */ '../views/Shape.vue')
  },
  {
    path: '/multiAttributeSize',
    name: 'MultiAttributeSize',
    component: () => import(/* webpackChunkName: "multiAttributeSize" */ '../views/MultiAttributeSize.vue')
  },
  {
    path: '/multiAttributeColor',
    name: 'MultiAttributeColor',
    component: () => import(/* webpackChunkName: "multiAttributeColor" */ '../views/MultiAttributeColor.vue')
  },
  {
    path: '/coloredTriangle',
    name: 'ColoredTriangle',
    component: () => import(/* webpackChunkName: "coloredTriangle" */ '../views/ColoredTriangle.vue')
  },
  {
    path: '/triangleFragCoord',
    name: 'TriangleFragCoord',
    component: () => import(/* webpackChunkName: "triangleFragCoord" */ '../views/TriangleFragCoord.vue')
  },
  {
    path: '/texturedQuad',
    name: 'TexturedQuad',
    component: () => import(/* webpackChunkName: "texturedQuad" */ '../views/TexturedQuad.vue')
  },
  {
    path: '/multiTexture',
    name: 'MultiTexture',
    component: () => import(/* webpackChunkName: "multiTexture" */ '../views/MultiTexture.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

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
  },
  {
    path: '/lightedCube',
    name: 'LightedCube',
    component: () => import(/* webpackChunkName: "lightedCube" */ '../views/LightedCube.vue')
  },
  {
    path: '/pointLightedCube',
    name: 'PointLightedCube',
    component: () => import(/* webpackChunkName: "pointLightedCube" */ '../views/PointLightedCube.vue')
  },
  {
    path: '/pointLightedCubePerFragment',
    name: 'PointLightedCubePerFragment',
    component: () => import(/* webpackChunkName: "pointLightedCubePerFragment" */ '../views/PointLightedCubePerFragment.vue')
  },
  {
    path: '/pointLightedSphere',
    name: 'PointLightedSphere',
    component: () => import(/* webpackChunkName: "pointLightedSphere" */ '../views/PointLightedSphere.vue')
  },
  {
    path: '/pointLightedSpherePerFragment',
    name: 'PointLightedSpherePerFragment',
    component: () => import(/* webpackChunkName: "pointLightedSpherePerFragment" */ '../views/PointLightedSpherePerFragment.vue')
  },
  {
    path: '/jointModel',
    name: 'JointModel',
    component: () => import(/* webpackChunkName: "jointModel" */ '../views/JointModel.vue')
  },
  {
    path: '/multiJointModel',
    name: 'MultiJointModel',
    component: () => import(/* webpackChunkName: "multiJointModel" */ '../views/MultiJointModel.vue')
  },
  {
    path: '/multiJointModelSegment',
    name: 'MultiJointModelSegment',
    component: () => import(/* webpackChunkName: "multiJointModelSegment" */ '../views/MultiJointModelSegment.vue')
  },
  {
    path: '/pickObject',
    name: 'PickObject',
    component: () => import(/* webpackChunkName: "pickObject" */ '../views/advance/PickObject.vue')
  },
  {
    path: '/pickFace',
    name: 'PickFace',
    component: () => import(/* webpackChunkName: "pickFace" */ '../views/advance/PickFace.vue')
  },
  {
    path: '/mouseRotateObject',
    name: 'MouseRotateObject',
    component: () => import(/* webpackChunkName: "mouseRotateObject" */ '../views/advance/MouseRotateObject.vue')
  },
  {
    path: '/fog',
    name: 'Fog',
    component: () => import(/* webpackChunkName: "fog" */ '../views/advance/Fog.vue')
  },
  {
    path: '/roundedPoints',
    name: 'RoundedPoints',
    component: () => import(/* webpackChunkName: "roundedPoints" */ '../views/advance/RoundedPoints.vue')
  },
  {
    path: '/blendedTriangles',
    name: 'BlendedTriangles',
    component: () => import(/* webpackChunkName: "blendedTriangles" */ '../views/advance/BlendedTriangles.vue')
  },
  {
    path: '/frameBufferObject',
    name: 'FrameBufferObject',
    component: () => import(/* webpackChunkName: "frameBufferObject" */ '../views/advance/FrameBufferObject.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

<template>
  <div class="home">
    <router-link to="/point" class="link"><cell title="Point" is-link></cell></router-link>
    <router-link to="/shape" class="link"><cell title="Shape" is-link></cell></router-link>
    <router-link to="/multiAttributeSize" class="link"><cell title="MultiAttributeSize" is-link></cell></router-link>
    <router-link to="/multiAttributeColor" class="link"><cell title="MultiAttributeColor" is-link></cell></router-link>
    <router-link to="/coloredTriangle" class="link"><cell title="ColoredTriangle" is-link></cell></router-link>
    <router-link to="/triangleFragCoord" class="link"><cell title="TriangleFragCoord" is-link></cell></router-link>
    <router-link to="/texturedQuad" class="link"><cell title="TexturedQuad" is-link></cell></router-link>
    <router-link to="/multiTexture" class="link"><cell title="MultiTexture" is-link></cell></router-link>
    <router-link to="/lightedCube" class="link"><cell title="LightedCube" is-link></cell></router-link>
    <router-link to="/pointLightedCube" class="link"><cell title="PointLightedCube" is-link></cell></router-link>
    <router-link to="/pointLightedCubePerFragment" class="link"><cell title="PointLightedCubePerFragment" is-link></cell></router-link>
    <router-link to="/pointLightedSphere" class="link"><cell title="PointLightedSphere" is-link></cell></router-link>
    <router-link to="/pointLightedSpherePerFragment" class="link"><cell title="PointLightedSpherePerFragment" is-link></cell></router-link>
    <router-link to="/jointModel" class="link"><cell title="JointModel" is-link></cell></router-link>
  </div>
</template>

<script>
import Cell from '@/components/Cell'

export default {
  name: 'home',
  components: {
    Cell
  }
}
</script>

<style lang="less">
  body {
    background: #fafafa;
  }
  .page-title {
    font-size: 40px;
    margin: 20px auto;
    text-align: center;
    display: block;
    line-height: 1;
  }
  a.link {
    text-decoration: none;
    color: inherit;
  }
</style>

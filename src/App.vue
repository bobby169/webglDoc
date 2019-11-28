<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="less">
  html,body{
    width: 100%;
    height: 100%;
  }
  body{
    margin: 0;
    padding: 0;
  }
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
  }
  #nav {
    a {
      font-weight: bold;
      color: #2c3e50;
      &.router-link-exact-active {
        color: #42b983;
      }
    }
  }
  canvas{
    display: block;
  }
</style>

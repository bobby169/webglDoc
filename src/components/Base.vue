<template>
  <div>
    <canvas ref="canvas" width="400" height="400"></canvas>
  </div>
</template>

<script>
export default {
  name: 'Base',
  mounted () {
    this.gl = this.$refs.canvas.getContext('webgl')
  }
}
</script>

<style scoped>

</style>

<template>
  <div>
    <canvas ref="canvas" width="400" height="400"></canvas>
    <p>&uarr;&darr;: Increase/decrease the fog distance</p>
  </div>
</template>

<script>
import { initShaders } from '../../js/utils'
import Matrix4 from '../../js/Matrix4'
import Vector4 from '../../js/Vector4'

// Vertex shader program
const VSHADER_SOURCE = `
   attribute vec4 aPosition;
   attribute vec4 aColor;
   uniform mat4 uMvpMatrix;
   uniform mat4 uModelMatrix;
   uniform vec4 uEye;
   varying vec4 vColor;
   varying float vDist;
   void main() {
     gl_Position = uMvpMatrix * aPosition;
     vColor = aColor;
     vDist = distance(uModelMatrix * aPosition, uEye);
   }`

// Fragment shader program
const FSHADER_SOURCE = `
   precision mediump float;
   uniform vec3 uFogColor;
   uniform vec2 uFogDist;
   varying vec4 vColor;
   varying float vDist;
   void main() {
     // 雾化因子 = （终点 - 当前点与视点间的距离） / (终点 - 起点)
     float fogFactor = clamp((uFogDist.y - vDist) / (uFogDist.y - uFogDist.x), 0.0, 1.0);
     // 片元颜色 = 物体表面颜色 * 雾化因子 + 雾的颜色 * (1 - 雾化因子)
     // Stronger fog as it gets further: u_FogColor * (1 - fogFactor) + v_Color * fogFactor
     vec3 color = mix(uFogColor, vec3(vColor), fogFactor); // mix: x * (1-z) + y*z
     gl_FragColor = vec4(color, vColor.a);
   }`

export default {
  name: 'Fog',
  methods: {
    init () {
      const gl = this.gl
      const canvas = this.$refs.canvas
      // Initialize shaders
      if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.')
        return
      }
      const n = this.initVertexBuffers()
      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      // gl.enable(gl.DEPTH_TEST)

      const fogColor = new Float32Array([0.137, 0.231, 0.423])
      // 雾化的起点和终点与视点的距离 [起点距离， 终点距离]
      const fogDist = new Float32Array([55, 80])
      // 视点在世界坐标系下的坐标
      const eye = new Float32Array([25, 65, 35, 1.0])

      // Get the storage locations of uniform variables
      const uMvpMatrix = gl.getUniformLocation(gl.program, 'uMvpMatrix')
      const uModelMatrix = gl.getUniformLocation(gl.program, 'uModelMatrix')
      const uEye = gl.getUniformLocation(gl.program, 'uEye')
      const uFogColor = gl.getUniformLocation(gl.program, 'uFogColor')
      const uFogDist = gl.getUniformLocation(gl.program, 'uFogDist')
      if (!uMvpMatrix || !uModelMatrix || !uEye || !uFogColor || !uFogDist) {
        console.log('Failed to get the storage location')
        return
      }

      // Pass fog color, distances, and eye point to uniform variable
      gl.uniform3fv(uFogColor, fogColor) // Colors
      gl.uniform2fv(uFogDist, fogDist) // Starting point and end point
      gl.uniform4fv(uEye, eye) // Eye point

      // 设置背景色，并开启隐藏面消除功能
      gl.clearColor(fogColor[0], fogColor[1], fogColor[2], 1.0) // Color of Fog
      gl.enable(gl.DEPTH_TEST)

      // Pass the model matrix to u_ModelMatrix
      const modelMatrix = new Matrix4()
      modelMatrix.setScale(10, 10, 10)
      gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix.elements)

      // Pass the model view projection matrix to u_MvpMatrix
      const mvpMatrix = new Matrix4()
      mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 1000)
      mvpMatrix.lookAt(eye[0], eye[1], eye[2], 0, 2, 0, 0, 1, 0)
      mvpMatrix.multiply(modelMatrix)
      gl.uniformMatrix4fv(uMvpMatrix, false, mvpMatrix.elements)
      document.onkeydown = (ev) => { this.keydown(ev, n, uFogDist, fogDist) }

      // Clear color and depth buffer
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      // Draw
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)

      const modelViewMatrix = new Matrix4()
      modelViewMatrix.setLookAt(eye[0], eye[1], eye[2], 0, 2, 0, 0, 1, 0)
      modelViewMatrix.multiply(modelMatrix)
      modelViewMatrix.multiplyVector4(new Vector4([1, 1, 1, 1]))
      mvpMatrix.multiplyVector4(new Vector4([1, 1, 1, 1]))
      modelViewMatrix.multiplyVector4(new Vector4([-1, 1, 1, 1]))
      mvpMatrix.multiplyVector4(new Vector4([-1, 1, 1, 1]))
    },
    keydown (ev, n, uFogDist, fogDist) {
      const gl = this.gl
      switch (ev.keyCode) {
        case 38: // Up arrow key -> Increase the maximum distance of fog
          fogDist[1] += 1
          break
        case 40: // Down arrow key -> Decrease the maximum distance of fog
          if (fogDist[1] > fogDist[0]) fogDist[1] -= 1
          break
        default: return
      }
      gl.uniform2fv(uFogDist, fogDist) // Pass the distance of fog
      // Clear color and depth buffer
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      // Draw
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
    },
    initVertexBuffers () {
      const gl = this.gl
      // Create a cube
      //    v6----- v5
      //   /|      /|
      //  v1------v0|
      //  | |     | |
      //  | |v7---|-|v4
      //  |/      |/
      //  v2------v3

      const vertices = new Float32Array([ // Vertex coordinates
        1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, // v0-v1-v2-v3 front
        1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, // v0-v3-v4-v5 right
        1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, 1, // v0-v5-v6-v1 up
        -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, // v1-v6-v7-v2 left
        -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, // v7-v4-v3-v2 down
        1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1 // v4-v7-v6-v5 back
      ])

      const colors = new Float32Array([ // Colors
        0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, // v0-v1-v2-v3 front
        0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, // v0-v3-v4-v5 right
        1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, // v0-v5-v6-v1 up
        1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, // v1-v6-v7-v2 left
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, // v7-v4-v3-v2 down
        0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0 // v4-v7-v6-v5 back
      ])

      const indices = new Uint8Array([ // Indices of the vertices
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // right
        8, 9, 10, 8, 10, 11, // up
        12, 13, 14, 12, 14, 15, // left
        16, 17, 18, 16, 18, 19, // down
        20, 21, 22, 20, 22, 23 // back
      ])

      // Create a buffer object
      const indexBuffer = gl.createBuffer()
      if (!indexBuffer) {
        return -1
      }

      // Write vertex information to buffer object
      if (!this.initArrayBuffer(vertices, 3, gl.FLOAT, 'aPosition')) return -1 // Vertex coordinates
      if (!this.initArrayBuffer(colors, 3, gl.FLOAT, 'aColor')) return -1 // Texture coordinates

      // Write the indices to the buffer object
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

      return indices.length
    },
    initArrayBuffer (data, num, type, attribute) {
      const gl = this.gl
      // Create a buffer object
      const buffer = gl.createBuffer()
      if (!buffer) {
        console.log('Failed to create the buffer object')
        return false
      }
      // Write date into the buffer object
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      // Assign the buffer object to the attribute variable
      const aAttribute = gl.getAttribLocation(gl.program, attribute)
      if (aAttribute < 0) {
        console.log('Failed to get the storage location of ' + attribute)
        return false
      }
      gl.vertexAttribPointer(aAttribute, num, type, false, 0, 0)
      // Enable the assignment to a_attribute variable
      gl.enableVertexAttribArray(aAttribute)
      // Unbind the buffer object
      gl.bindBuffer(gl.ARRAY_BUFFER, null)

      return true
    }
  },
  mounted () {
    this.gl = this.$refs.canvas.getContext('webgl')
    this.init()
  }
}
</script>

<style scoped>

</style>

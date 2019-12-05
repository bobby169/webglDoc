<script>
import Base from '../components/Base'
import { initShaders } from '../js/utils'
import Vector3 from '../js/Vector3'
import Matrix4 from '../js/Matrix4'
// 直接用GLSL着色器语言进行修改
// Vertex shader program
const VSHADER_SOURCE =
    `attribute vec4 aPosition;
     attribute vec4 aColor;
     attribute vec4 aNormal;
     uniform mat4 uMvpMatrix;
     uniform vec3 uLightColor;
     uniform vec3 uLightDirection;
     varying vec4 vColor; // varying(可变的) variable
     void main() {
       gl_Position = uMvpMatrix * aPosition;
       vec3 normal = normalize(aNormal.xyz);
       float nDotL = max(dot(uLightDirection, normal), 0.0);
       vec3 diffuse = uLightColor * aColor.rgb * nDotL;
       vColor = vec4(diffuse, aColor.a);
     }`

// Fragment shader program
const FSHADER_SOURCE =
    `precision mediump float; // Precision qualifier
     varying vec4 vColor; // Receive the data from the vertex shader
     void main() {
       gl_FragColor = vColor;
     }`
export default {
  name: 'Point',
  mixins: [Base],
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

      // 清空绘图区之前的颜色
      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.enable(gl.DEPTH_TEST)

      const uMvpMatrix = gl.getUniformLocation(gl.program, 'uMvpMatrix')
      const uLightColor = gl.getUniformLocation(gl.program, 'uLightColor')
      const uLightDirection = gl.getUniformLocation(gl.program, 'uLightDirection')
      if (!uMvpMatrix || !uLightColor || !uLightDirection) {
        console.log('Failed to get the storage location')
        return
      }

      gl.uniform3f(uLightColor, 1.0, 1.0, 1.0)
      const lightDirection = new Vector3([0.5, 3.0, 4.0])
      lightDirection.normalize()
      gl.uniform3fv(uLightDirection, lightDirection.elements)
      const mvpMatrix = new Matrix4()
      mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100)
      mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)
      gl.uniformMatrix4fv(uMvpMatrix, false, mvpMatrix.elements)

      // Clear <canvas>
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)

      // 画一条线
      // gl.drawArrays(gl.LINES, 0, 2)

      // 画一条系列相连的线
      // gl.drawArrays(gl.LINE_STRIP, 0, 4)

      // 画一条系列相连且首尾相连的线
      // gl.drawArrays(gl.LINE_LOOP, 0, 4)

      // 画一个三角形
      // gl.drawArrays(gl.TRIANGLES, 0, 3)

      // 画一个矩形
      // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      // 一系列三角形组成类似扇形的图形
      // gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
      // gl.drawArrays(gl.POINTS, 0, 3)
    },
    initVertexBuffers () {
      const gl = this.gl

      // 绘制三个顶点的坐标位置
      // const vertices = new Float32Array([
      //   0.0, 0.5, -0.5, -0.5, 0.5, -0.5
      // ])

      // 三个点的大小
      // const sizes = new Float32Array([
      //   10.0, 20.0, 30.0 // Point size
      // ])

      // 顶点坐标和颜色
      // const verticesColors = new Float32Array([
      //   0.0, 0.5, 1.0, 0.0, 0.0, // 第一个点
      //   -0.5, -0.5, 0.0, 1.0, 0.0, // 第二个点
      //   0.5, -0.5, 0.0, 0.0, 1.0 // 第三个点
      // ])

      // Create a cube
      //    v6----- v5
      //   /|      /|
      //  v1------v0|
      //  | |     | |
      //  | |v7---|-|v4
      //  |/      |/
      //  v2------v3
      const vertices = new Float32Array([ // Coordinates
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // v0-v1-v2-v3 front
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // v0-v3-v4-v5 right
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0 // v4-v7-v6-v5 back
      ])

      const colors = new Float32Array([ // Colors
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v1-v2-v3 front
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v3-v4-v5 right
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v5-v6-v1 up
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v1-v6-v7-v2 left
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v7-v4-v3-v2 down
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0 // v4-v7-v6-v5 back
      ])

      const normals = new Float32Array([ // Normal
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // v0-v1-v2-v3 front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0 // v4-v7-v6-v5 back
      ])

      // Indices of the vertices
      const indices = new Uint8Array([
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // right
        8, 9, 10, 8, 10, 11, // up
        12, 13, 14, 12, 14, 15, // left
        16, 17, 18, 16, 18, 19, // down
        20, 21, 22, 20, 22, 23 // back
      ])

      // Write the vertex property to buffers (coordinates, colors and normals)
      if (!this.initArrayBuffer('aPosition', vertices, 3, gl.FLOAT)) return -1
      if (!this.initArrayBuffer('aColor', colors, 3, gl.FLOAT)) return -1
      if (!this.initArrayBuffer('aNormal', normals, 3, gl.FLOAT)) return -1

      // Create a buffer object
      // 步骤一： 创建缓冲区对象
      // const vertexBuffer = gl.createBuffer()
      // const sizeBuffer = gl.createBuffer()
      const indexBuffer = gl.createBuffer()
      // 使用多个缓冲区对象向着色器传递多种数据，比较适合数据量不大的情况。当程序中的复杂三维图形
      // 具有成千上万个顶点时，维护所有的顶点数据是很困难的。一般会把顶点坐标和尺寸数据打包在同一个
      // 缓冲区对象中，并通过某种机制分别访问缓冲区对象中不同种类的数据。

      // Bind the buffer object to target
      // 步骤二：将缓冲区对象绑定在target上
      // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      // Write date into the buffer object
      // gl.bufferData(gl.ARRAY_BUFFER, vertices_triangles, gl.STATIC_DRAW);
      // 步骤三：将顶点坐标数据写入缓冲区对象
      // gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

      return indices.length
    },
    initArrayBuffer (attribute, data, num, type) {
      const gl = this.gl
      const buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      const aAttribute = gl.getAttribLocation(gl.program, attribute)
      if (aAttribute < 0) {
        console.log('Failed to get the storage location of ' + attribute)
        return false
      }
      gl.vertexAttribPointer(aAttribute, num, type, false, 0, 0)
      gl.enableVertexAttribArray(aAttribute)
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
      return true
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style scoped lang="less">

</style>

<script>
import Base from '../components/Base'
import { initShaders } from '../js/utils'
// 直接用GLSL着色器语言进行修改
// Vertex shader program
const VSHADER_SOURCE =
    `attribute vec4 aPosition;
     attribute vec4 aColor;
     varying vec4 vColor; // varying(可变的) variable
     void main() {
       gl_Position = aPosition;
       gl_PointSize = 10.0;
       vColor = aColor; // Pass the data to the fragment shader 从顶点着色器向片元着色器传递颜色数据
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

      // Initialize shaders
      if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.')
        return
      }

      this.initVertexBuffers()

      // 清空绘图区之前的颜色
      gl.clearColor(0.0, 0.0, 0.0, 1.0)

      // Clear <canvas>
      gl.clear(gl.COLOR_BUFFER_BIT)

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
      gl.drawArrays(gl.POINTS, 0, 3)
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
      const verticesColors = new Float32Array([
        0.0, 0.5, 1.0, 0.0, 0.0, // 第一个点
        -0.5, -0.5, 0.0, 1.0, 0.0, // 第二个点
        0.5, -0.5, 0.0, 0.0, 1.0 // 第三个点
      ])

      // Create a buffer object
      // 步骤一： 创建缓冲区对象
      // const vertexBuffer = gl.createBuffer()
      // const sizeBuffer = gl.createBuffer()
      const vertexColorBuffer = gl.createBuffer()
      // 使用多个缓冲区对象向着色器传递多种数据，比较适合数据量不大的情况。当程序中的复杂三维图形
      // 具有成千上万个顶点时，维护所有的顶点数据是很困难的。一般会把顶点坐标和尺寸数据打包在同一个
      // 缓冲区对象中，并通过某种机制分别访问缓冲区对象中不同种类的数据。

      // Bind the buffer object to target
      // 步骤二：将缓冲区对象绑定在target上
      // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer)
      // Write date into the buffer object
      // gl.bufferData(gl.ARRAY_BUFFER, vertices_triangles, gl.STATIC_DRAW);
      // 步骤三：将顶点坐标数据写入缓冲区对象
      // gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
      gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW)

      const FSIZE = verticesColors.BYTES_PER_ELEMENT // 得到每个元素所占字节数
      // 获取由name参数指定的attribute变量的存储地址
      const aPosition = gl.getAttribLocation(gl.program, 'aPosition')
      // 将数据(v0,v1,v2,v3)传递由location参数指定的attribute变量
      // 步骤四：将缓冲区对象分配给对应的attribute变量
      // gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, FSIZE * 5, 0)
      // 开启attribute变量
      gl.enableVertexAttribArray(aPosition)

      // gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer)
      // gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW)

      const aColor = gl.getAttribLocation(gl.program, 'aColor')
      // gl.vertexAttribPointer(aPointSize, 1, gl.FLOAT, false, 0, 0)
      gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2)
      gl.enableVertexAttribArray(aColor)
      // gl.bindBuffer(gl.ARRAY_BUFFER, null)
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style scoped lang="less">

</style>

<script>
import Base from '../components/Base'

// 直接用GLSL着色器语言进行修改
// Vertex shader program
const VSHADER_SOURCE =
  `attribute vec4 aPosition; // attribute variable
   uniform vec4 uTranslation;
    void main() {
      // gl_Position = aPosition;
      gl_Position = aPosition + uTranslation;
      gl_PointSize = 10.0;
    }`

// Fragment shader program
const FSHADER_SOURCE =
  `precision mediump float;
     uniform vec4 uFragColor;
     void main() {
         gl_FragColor = uFragColor;
     }`

export default {
  name: 'Point',
  mixins: [Base],
  methods: {
    init () {
      const gl = this.gl

      // 创建顶点着色器对象
      const vertShader = gl.createShader(gl.VERTEX_SHADER)
      // 向着色器对象中填充着色器程序的源代码
      gl.shaderSource(vertShader, VSHADER_SOURCE)
      // 编译着色器
      gl.compileShader(vertShader)

      // 创建片元着色器对象
      const fragShader = gl.createShader(gl.FRAGMENT_SHADER)
      gl.shaderSource(fragShader, FSHADER_SOURCE)
      gl.compileShader(fragShader)

      // 创建程序对象
      const shaderProgram = gl.createProgram()
      gl.program = shaderProgram
      // 为程序对象分配着色器
      gl.attachShader(shaderProgram, vertShader)
      gl.attachShader(shaderProgram, fragShader)

      // 连接程序对象
      gl.linkProgram(shaderProgram)
      // 使用程序对象
      gl.useProgram(shaderProgram)

      // var vertices_triangles = new Float32Array([
      //     0, 0.5,   -0.5, -0.5,   0.5, -0.5
      // ]);

      const verticesTrianglesStrip = new Float32Array([
        -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5
      ])

      // Create a buffer object
      const vertexBuffer = gl.createBuffer()

      // Bind the buffer object to target
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
      // Write date into the buffer object
      // gl.bufferData(gl.ARRAY_BUFFER, vertices_triangles, gl.STATIC_DRAW);
      gl.bufferData(gl.ARRAY_BUFFER, verticesTrianglesStrip, gl.STATIC_DRAW)

      // 获取由name参数指定的attribute变量的存储地址
      const aPosition = gl.getAttribLocation(gl.program, 'aPosition')
      // 将数据(v0,v1,v2,v3)传递由location参数指定的attribute变量
      gl.vertexAttrib3f(aPosition, 0.0, 0.0, 0.0)

      const uFragColor = gl.getUniformLocation(gl.program, 'uFragColor')
      // gl.uniform4f(uFragColor, 0.0, 1.0, 0.0, 1.0);//绿色
      gl.uniform4f(uFragColor, 1.0, 0.0, 0.0, 1.0)// 红色
      // 平移
      this.translate(gl)

      // Assign the buffer object to aPosition variable
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

      // Enable the assignment to aPosition variable
      gl.enableVertexAttribArray(aPosition)

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
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
    },
    translate (gl) {
      // Pass the translation distance to the vertex shader
      const uTranslation = gl.getUniformLocation(gl.program, 'uTranslation')
      let Tx = 0.5; let Ty = 0.1; let Tz = 0.0
      gl.uniform4f(uTranslation, Tx, Ty, Tz, 0.0)
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style scoped lang="less">

</style>

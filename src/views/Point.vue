<script>
import Base from '../components/Base'

// 直接用GLSL着色器语言进行修改
const VSHADER_SOURCE =
  `void main() {
      gl_Position = vec4(0.0, 0.0, 0.0, 1.0); // Set the vertex coordinates of the point
      gl_PointSize = 50.0;                   // Set the point size
    }`

const FSHADER_SOURCE =
  `void main() {
       gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0); // Set the point color
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

      // 获取由name参数指定的attribute变量的存储地址
      // let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
      // 将数据(v0,v1,v2,v3)传递由location参数指定的attribute变量
      // gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);

      // let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
      // gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);//绿色
      // gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);//红色

      // 清空绘图区之前的颜色
      gl.clearColor(0.0, 0.0, 0.0, 1.0)

      // Clear <canvas>
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Draw a point
      gl.drawArrays(gl.POINTS, 0, 1)
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style scoped lang="less">

</style>

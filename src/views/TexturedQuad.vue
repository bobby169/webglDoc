<script>
import Base from '../components/Base'
import { initShaders } from '../js/utils'
// 直接用GLSL着色器语言进行修改
// Vertex shader program
// 顶点着色器中接收顶点的纹理坐标，光栅化后传递给片元着色器
const VSHADER_SOURCE =
    `attribute vec4 aPosition;
     attribute vec2 aTexCoord;
     varying vec2 vTexCoord;
     void main() {
       gl_Position = aPosition;
       vTexCoord = aTexCoord;
     }`

// Fragment shader program
const FSHADER_SOURCE =
    `precision mediump float; // Precision qualifier
     uniform sampler2D uSampler; // 取样器，用来接收纹理图像
     varying vec2 vTexCoord; // 纹理坐标：顶点之间片元的纹理坐标会在光栅化的过程中内插出来
     void main() {
       gl_FragColor = texture2D(uSampler, vTexCoord); // 片元着色器从纹理图像上获取纹素的颜色
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

      this.initTextures()
      this.initVertexBuffers()

      // 清空绘图区之前的颜色
      gl.clearColor(0.0, 0.0, 0.0, 1.0)

      // Clear <canvas>
      // gl.clear(gl.COLOR_BUFFER_BIT)

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
      // gl.drawArrays(gl.TRIANGLES, 0, 3)
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
      const verticesTexCoords = new Float32Array([
        // 顶点坐标，纹理坐标
        -0.5, 0.5, 0.0, 1.0,
        -0.5, -0.5, 0.0, 0.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0
      ])

      // Create a buffer object
      // 步骤一： 创建缓冲区对象
      const vertexTexCoorBuffer = gl.createBuffer()
      // const sizeBuffer = gl.createBuffer()
      // const vertexColorBuffer = gl.createBuffer()
      // 使用多个缓冲区对象向着色器传递多种数据，比较适合数据量不大的情况。当程序中的复杂三维图形
      // 具有成千上万个顶点时，维护所有的顶点数据是很困难的。一般会把顶点坐标和尺寸数据打包在同一个
      // 缓冲区对象中，并通过某种机制分别访问缓冲区对象中不同种类的数据。

      // Bind the buffer object to target
      // 步骤二：将缓冲区对象绑定在target上
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoorBuffer)
      // gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer)
      // Write date into the buffer object
      // gl.bufferData(gl.ARRAY_BUFFER, vertices_triangles, gl.STATIC_DRAW);
      // 步骤三：将顶点坐标数据写入缓冲区对象
      gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW)
      // gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW)

      const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT // 得到每个元素所占字节数
      // 获取由name参数指定的attribute变量的存储地址
      const aPosition = gl.getAttribLocation(gl.program, 'aPosition')
      // 将数据(v0,v1,v2,v3)传递由location参数指定的attribute变量
      // 步骤四：将缓冲区对象分配给对应的attribute变量
      // gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, FSIZE * 4, 0)
      gl.enableVertexAttribArray(aPosition)

      // gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer)
      // gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW)

      // 将纹理坐标分配给aTexCoord并开启
      const aTexCoord = gl.getAttribLocation(gl.program, 'aTexCoord')
      // gl.vertexAttribPointer(aPointSize, 1, gl.FLOAT, false, 0, 0)
      gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2)
      gl.enableVertexAttribArray(aTexCoord)

      // Unbind the buffer object
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
    },
    initTextures () {
      const gl = this.gl
      const texture = gl.createTexture() // 创建纹理对象以存储纹理图像
      // 获取USampler的存储位置
      const uSampler = gl.getUniformLocation(gl.program, 'uSampler')
      const image = new Image()
      image.onload = () => {
        this.loadTexture(texture, uSampler, image)
      }
      image.src = require('@/assets/sky.jpg')
    },
    loadTexture (texture, uSampler, image) {
      const gl = this.gl
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1) // Flip the image's y axis 对纹理图像进行y轴反转
      // Enable texture unit0 开启0号纹理单元，可以开启8张gl.TEXTURE7
      gl.activeTexture(gl.TEXTURE0)
      // Bind the texture object to the target 向target绑定纹理对象（gl.TEXTURE_2D二维纹理、gl.TEXTURE_CUBE_MAP立方体纹理）
      gl.bindTexture(gl.TEXTURE_2D, texture)

      // Set the texture parameters 配置纹理参数
      // gl.TEXTURE_MAG_FILTER放大方法，默认为gl.LINEAR
      // gl.TEXTURE_MIN_FILTER，默认为gl.NEAREST_MIPMAP_LINEAR 金字塔
      // gl.TEXTURE_WRAP_S 水平填充方法，默认为gl.REPEAT
      // gl.TEXTURE_WRAP_T 垂直填充方法，默认为gl.REPEAT
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      // Set the texture image 配置纹理图像，将纹理图像存储在了WebGL系统中的纹理对象中
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)

      // Set the texture unit 0 to the sampler 将0号纹理传递给片元着色器
      gl.uniform1i(uSampler, 0)

      gl.clear(gl.COLOR_BUFFER_BIT) // Clear <canvas>

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4) // Draw the rectangle
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style scoped lang="less">

</style>

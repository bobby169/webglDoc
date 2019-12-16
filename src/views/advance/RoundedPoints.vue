<script>
import Base from '../../components/Base'
import { initShaders } from '../../js/utils'
const VSHADER_SOURCE = `
  attribute vec4 aPosition;
  void main() {
    gl_Position = aPosition;
    gl_PointSize = 50.0;
  }
`
const FSHADER_SOURCE = `
  precision mediump float;
  void main() {
    // gl_PointCoord 片元在被绘制的（圆点内）的坐标
    float d = distance(gl_PointCoord, vec2(0.5, 0.5)); // 圆圈半经，点中心坐标是（0.5, 0.5）
    if(d < 0.5) {
      // 保留圆圈内的片元
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    } else {
      discard; // 去掉圆圈外的片元
    }
  }
`

export default {
  name: 'RoundedPoints',
  mixins: [Base],
  methods: {
    init () {
      const gl = this.gl

      if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.')
        return
      }
      const n = this.initVertexBuffers()
      // Specify the color for clearing <canvas>
      gl.clearColor(0, 0, 0, 1)

      // Clear <canvas>
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Draw three points
      gl.drawArrays(gl.POINTS, 0, n)
    },
    initVertexBuffers () {
      const gl = this.gl
      const vertices = new Float32Array([
        0, 0.5, -0.5, -0.5, 0.5, -0.5
      ])

      const n = 3

      // Create a buffer object
      const vertexBuffer = gl.createBuffer()
      if (!vertexBuffer) {
        console.log('Failed to create the buffer object')
        return -1
      }

      // Bind the vertex buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
      // Write date into the buffer object
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

      // Assign the buffer object to the attribute variable
      const aPosition = gl.getAttribLocation(gl.program, 'aPosition')
      if (aPosition < 0) {
        console.log('Failed to get the storage location of aPosition')
        return -1
      }
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

      // Unbind the buffer object
      gl.bindBuffer(gl.ARRAY_BUFFER, null)

      // Enable the assignment to a_Position variable
      gl.enableVertexAttribArray(aPosition)

      return n
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<script>
import Base from '../../components/Base'
import Matrix4 from '../../js/Matrix4'
import { initShaders } from '../../js/utils'
const VSHADER_SOURCE = `
  attribute vec4 aPosition;
  attribute vec4 aColor;
  uniform mat4 uViewMatrix;
  uniform mat4 uProjMatrix;
  varying vec4 vColor;
  void main() {
    gl_Position = uProjMatrix * uViewMatrix * aPosition;
    vColor = aColor;
  }
`
const FSHADER_SOURCE = `
  precision mediump float;
  varying vec4 vColor;
  void main() {
    gl_FragColor = vColor;
  }
`
let gEyeX = 0.20
let gEyeY = 0.25
let gEyeZ = 0.25
export default {
  name: 'BlendedTriangles',
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

      // Enable alpha blending
      gl.enable(gl.BLEND)
      // Set blending function
      // gl.blendFunc(src_factor, dst_factor)
      // <混合后颜色> = <源颜色> * src_factor + <目标颜色> * dst_factor
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      // get the storage locations of u_ViewMatrix and u_ProjMatrix
      const uViewMatrix = gl.getUniformLocation(gl.program, 'uViewMatrix')
      const uProjMatrix = gl.getUniformLocation(gl.program, 'uProjMatrix')
      if (!uViewMatrix || !uProjMatrix) {
        console.log('Failed to get the storage location of uViewMatrix and/or uProjMatrix')
        return
      }

      // Create the view projection matrix
      const viewMatrix = new Matrix4()
      // Register the event handler to be called on key press
      window.onkeydown = (ev) => {
        this.keydown(ev, n, uViewMatrix, viewMatrix)
      }

      // Create Projection matrix and set to u_ProjMatrix
      const projMatrix = new Matrix4()
      projMatrix.setOrtho(-1, 1, -1, 1, 0, 2)
      gl.uniformMatrix4fv(uProjMatrix, false, projMatrix.elements)

      // Draw
      this.draw(n, uViewMatrix, viewMatrix)
    },
    initVertexBuffers () {
      const gl = this.gl
      const verticesColors = new Float32Array([
        // Vertex coordinates and color(RGBA)
        0.0, 0.5, -0.4, 0.4, 1.0, 0.4, 0.4, // The back green one
        -0.5, -0.5, -0.4, 0.4, 1.0, 0.4, 0.4,
        0.5, -0.5, -0.4, 1.0, 0.4, 0.4, 0.4,

        0.5, 0.4, -0.2, 1.0, 0.4, 0.4, 0.4, // The middle yerrow one
        -0.5, 0.4, -0.2, 1.0, 1.0, 0.4, 0.4,
        0.0, -0.6, -0.2, 1.0, 1.0, 0.4, 0.4,

        0.0, 0.5, 0.0, 0.4, 0.4, 1.0, 0.4, // The front blue one
        -0.5, -0.5, 0.0, 0.4, 0.4, 1.0, 0.4,
        0.5, -0.5, 0.0, 1.0, 0.4, 0.4, 0.4
      ])
      const n = 9

      // Create a buffer object
      const vertexColorbuffer = gl.createBuffer()
      if (!vertexColorbuffer) {
        console.log('Failed to create the buffer object')
        return -1
      }

      // Write the vertex information and enable it
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer)
      gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW)

      const FSIZE = verticesColors.BYTES_PER_ELEMENT

      const aPosition = gl.getAttribLocation(gl.program, 'aPosition')
      if (aPosition < 0) {
        console.log('Failed to get the storage location of aPosition')
        return -1
      }
      gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, FSIZE * 7, 0)
      gl.enableVertexAttribArray(aPosition)

      const aColor = gl.getAttribLocation(gl.program, 'aColor')
      if (aColor < 0) {
        console.log('Failed to get the storage location of aColor')
        return -1
      }
      gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, FSIZE * 7, FSIZE * 3)
      gl.enableVertexAttribArray(aColor)

      // Unbind the buffer object
      gl.bindBuffer(gl.ARRAY_BUFFER, null)

      return n
    },
    keydown (ev, n, uViewMatrix, viewMatrix) {
      if (ev.keyCode === 39) { // The right arrow key was pressed
        gEyeX += 0.01
      } else
      if (ev.keyCode === 37) { // The left arrow key was pressed
        gEyeX -= 0.01
      } else return
      this.draw(n, uViewMatrix, viewMatrix)
    },
    draw (n, uViewMatrix, viewMatrix) {
      const gl = this.gl
      // Set the matrix to be used for to set the camera view
      viewMatrix.setLookAt(gEyeX, gEyeY, gEyeZ, 0, 0, 0, 0, 1, 0)

      // Pass the view projection matrix
      gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix.elements)

      // Clear <canvas>
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      // Draw the rectangle
      gl.drawArrays(gl.TRIANGLES, 0, n)
    }
  },
  mounted () {
    this.init()
  }
}
</script>

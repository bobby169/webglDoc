<script>
import Base from '../../components/Base'
import { initShaders } from '../../js/utils'
import Matrix4 from '../../js/Matrix4'

// Vertex shader program
const VSHADER_SOURCE = `
   attribute vec4 aPosition;
   attribute vec4 aColor;
   uniform mat4 uMvpMatrix;
   uniform bool uClicked; // Mouse is pressed
   varying vec4 vColor;
   void main() {
     gl_Position = uMvpMatrix * aPosition;
     if(uClicked) { // Draw in red if mouse is pressed
       vColor = vec4(1.0, 0.0, 0.0, 1.0);
     } else {
       vColor = aColor;
     }
   }`

// Fragment shader program
const FSHADER_SOURCE = `
   precision mediump float;
   varying vec4 vColor;
   void main() {
     gl_FragColor = vColor;
   }`

const ANGLE_STEP = 20.0 // Rotation angle (degrees/second)
let gCurrentAngle = 0.0 // Current rotation angle
let gMvpMatrix = new Matrix4() // Model view projection matrix
let last = Date.now()

export default {
  name: 'PickFace',
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
      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.enable(gl.DEPTH_TEST)

      // Get the storage locations of uniform variables
      const uMvpMatrix = gl.getUniformLocation(gl.program, 'uMvpMatrix')
      const uClicked = gl.getUniformLocation(gl.program, 'uClicked')
      if (!uMvpMatrix || !uClicked) {
        console.log('Failed to get the storage location of uniform variable')
      }

      // Calculate the view projection matrix
      const viewProjMatrix = new Matrix4()
      viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0)
      viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)

      // Pass false to u_Clicked
      gl.uniform1i(uClicked, 0)

      // Register the event handler
      canvas.onmousedown = (ev) => { // Mouse is pressed
        let x = ev.clientX
        let y = ev.clientY
        let rect = ev.target.getBoundingClientRect()
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
          // If pressed position is inside <canvas>, check if it is above object
          const xInCanvas = x - rect.left
          const yInCanvas = rect.bottom - y
          const picked = this.check(n, xInCanvas, yInCanvas, gCurrentAngle, uClicked, viewProjMatrix, uMvpMatrix)
          if (picked) alert('The cube was selected! ')
        }
      }

      const tick = () => { // Start drawing
        gCurrentAngle = this.animate(gCurrentAngle)
        this.draw(n, gCurrentAngle, viewProjMatrix, uMvpMatrix)
        requestAnimationFrame(tick, canvas)
      }
      tick()
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
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // v0-v1-v2-v3 front
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // v0-v3-v4-v5 right
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0 // v4-v7-v6-v5 back
      ])

      const colors = new Float32Array([ // Colors
        0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, // v0-v1-v2-v3 front
        0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69, // v0-v3-v4-v5 right
        0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, // v0-v5-v6-v1 up
        0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61, // v1-v6-v7-v2 left
        0.27, 0.58, 0.82, 0.27, 0.58, 0.82, 0.27, 0.58, 0.82, 0.27, 0.58, 0.82, // v7-v4-v3-v2 down
        0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93 // v4-v7-v6-v5 back
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

      // Create a buffer object
      const indexBuffer = gl.createBuffer()
      if (!indexBuffer) {
        return -1
      }

      // Write vertex information to buffer object
      if (!this.initArrayBuffer(vertices, gl.FLOAT, 3, 'aPosition')) return -1 // Coordinate Information
      if (!this.initArrayBuffer(colors, gl.FLOAT, 3, 'aColor')) return -1 // Color Information
      // if (!this.initArrayBuffer(faces, gl.UNSIGNED_BYTE, 1, 'aFace')) return -1// Surface Information

      // Unbind the buffer object
      gl.bindBuffer(gl.ARRAY_BUFFER, null)

      // Write the indices to the buffer object
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

      return indices.length
    },
    check (n, x, y, currentAngle, uClicked, viewProjMatrix, uMvpMatrix) {
      const gl = this.gl
      let picked = false
      gl.uniform1i(uClicked, 1) // Pass true to u_Clicked
      this.draw(n, currentAngle, viewProjMatrix, uMvpMatrix) // Draw cube with red
      // Read pixel at the clicked position
      const pixels = new Uint8Array(4) // Array for storing the pixel value
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

      // 像素测是否为红色255
      if (pixels[0] === 255) { // The mouse in on cube if R(pixels[0]) is 255
        picked = true
      }

      // 如果注释则立方体为红色
      gl.uniform1i(uClicked, 0) // Pass false to u_Clicked(rewrite the cube)
      this.draw(n, currentAngle, viewProjMatrix, uMvpMatrix) // Draw the cube

      return picked
    },
    draw (n, currentAngle, viewProjMatrix, uMvpMatrix) {
      const gl = this.gl
      // Caliculate The model view projection matrix and pass it to u_MvpMatrix
      gMvpMatrix.set(viewProjMatrix)
      gMvpMatrix.rotate(currentAngle, 1.0, 0.0, 0.0) // Rotate appropriately
      gMvpMatrix.rotate(currentAngle, 0.0, 1.0, 0.0)
      gMvpMatrix.rotate(currentAngle, 0.0, 0.0, 1.0)
      gl.uniformMatrix4fv(uMvpMatrix, false, gMvpMatrix.elements)

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT) // Clear buffers
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0) // Draw
    },
    animate (angle) {
      const now = Date.now() // Calculate the elapsed time
      const elapsed = now - last
      last = now
      // Update the current rotation angle (adjusted by the elapsed time)
      const newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0
      return newAngle % 360
    },
    initArrayBuffer (data, type, num, attribute) {
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

      return true
    }

  },
  mounted () {
    this.init()
  }
}
</script>

<style scoped>

</style>

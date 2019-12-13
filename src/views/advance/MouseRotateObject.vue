<script>
import Base from '../../components/Base'
import { initShaders } from '../../js/utils'
import Matrix4 from '../../js/Matrix4'

// Vertex shader program
const VSHADER_SOURCE = `
   attribute vec4 aPosition;
   attribute vec2 aTexCoord;
   uniform mat4 uMvpMatrix;
   varying vec2 vTexCoord;
   void main() {
     gl_Position = uMvpMatrix * aPosition;
     vTexCoord = aTexCoord;
   }`

// Fragment shader program
const FSHADER_SOURCE = `
   precision mediump float;
   uniform sampler2D uSampler;
   varying vec2 vTexCoord;
   void main() {
     gl_FragColor = texture2D(uSampler, vTexCoord);
   }`

const gMvpMatrix = new Matrix4()

export default {
  name: 'MouseRotateObject',
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
      if (!uMvpMatrix) {
        console.log('Failed to get the storage location of uniform variable')
      }

      // Calculate the view projection matrix
      const viewProjMatrix = new Matrix4()
      viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0)
      viewProjMatrix.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)
      const currentAngle = [0.0, 0.0]
      this.initEventHandlers(canvas, currentAngle)

      // Set texture
      if (!this.initTextures()) {
        console.log('Failed to intialize the texture.')
        return
      }

      const tick = () => { // Start drawing
        this.draw(n, viewProjMatrix, uMvpMatrix, currentAngle)
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

      const texCoords = new Float32Array([ // Texture coordinates
        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v1-v2-v3 front
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, // v0-v3-v4-v5 right
        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, // v0-v5-v6-v1 up
        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v1-v6-v7-v2 left
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, // v7-v4-v3-v2 down
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0 // v4-v7-v6-v5 back
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
      if (!this.initArrayBuffer(vertices, 3, gl.FLOAT, 'aPosition')) return -1 // Vertex coordinates
      if (!this.initArrayBuffer(texCoords, 2, gl.FLOAT, 'aTexCoord')) return -1 // Texture coordinates

      // Unbind the buffer object
      gl.bindBuffer(gl.ARRAY_BUFFER, null)

      // Write the indices to the buffer object
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

      return indices.length
    },
    initEventHandlers (canvas, currentAngle) {
      let dragging = false // Dragging or not
      let lastX = -1
      let lastY = -1 // Last position of the mouse

      canvas.onmousedown = function (ev) { // Mouse is pressed
        let x = ev.clientX
        let y = ev.clientY
        // Start dragging if a moue is in <canvas>
        let rect = ev.target.getBoundingClientRect()
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
          lastX = x
          lastY = y
          dragging = true
        }
      }

      canvas.onmouseup = function (ev) { dragging = false } // Mouse is released

      canvas.onmousemove = function (ev) { // Mouse is moved
        let x = ev.clientX
        let y = ev.clientY
        if (dragging) {
          let factor = 100 / canvas.height // The rotation ratio
          let dx = factor * (x - lastX)
          let dy = factor * (y - lastY)
          // Limit x-axis rotation angle to -90 to 90 degrees
          currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0)
          currentAngle[1] = currentAngle[1] + dx
        }
        lastX = x
        lastY = y
      }
    },
    draw (n, viewProjMatrix, uMvpMatrix, currentAngle) {
      const gl = this.gl
      // Caliculate The model view projection matrix and pass it to u_MvpMatrix
      gMvpMatrix.set(viewProjMatrix)
      gMvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0) // Rotation around x-axis
      gMvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0) // Rotation around y-axis
      gl.uniformMatrix4fv(uMvpMatrix, false, gMvpMatrix.elements)

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT) // Clear buffers
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0) // Draw
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

      return true
    },
    initTextures () {
      const gl = this.gl
      // Create a texture object
      const texture = gl.createTexture()
      if (!texture) {
        console.log('Failed to create the texture object')
        return false
      }

      // Get the storage location of u_Sampler
      const uSampler = gl.getUniformLocation(gl.program, 'uSampler')
      if (!uSampler) {
        console.log('Failed to get the storage location of uSampler')
        return false
      }

      // Create the image object
      const image = new Image()
      if (!image) {
        console.log('Failed to create the image object')
        return false
      }
      // Register the event handler to be called when image loading is completed
      image.onload = () => { this.loadTexture(texture, uSampler, image) }
      // Tell the browser to load an Image
      image.src = require('@/assets/sky.jpg')

      return true
    },
    loadTexture (texture, uSampler, image) {
      const gl = this.gl
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1) // Flip the image Y coordinate
      // Activate texture unit0
      gl.activeTexture(gl.TEXTURE0)
      // Bind the texture object to the target
      gl.bindTexture(gl.TEXTURE_2D, texture)

      // Set texture parameters
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      // Set the image to texture
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)

      // Pass the texure unit 0 to u_Sampler
      gl.uniform1i(uSampler, 0)
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style scoped>

</style>

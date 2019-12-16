<script>
import Base from '../../components/Base'
import Matrix4 from '../../js/Matrix4'
import { initShaders } from '../../js/utils'
const VSHADER_SOURCE = `
  attribute vec4 aPosition;
  attribute vec2 aTexCoord;
  uniform mat4 uMvpMatrix;
  varying vec2 vTexCoord;
  void main() {
    gl_Position = uMvpMatrix * aPosition;
    vTexCoord = aTexCoord;
  }
`
const FSHADER_SOURCE = `
  precision mediump float;
  uniform sampler2D uSampler;
  varying vec2 vTexCoord;
  void main() {
    gl_FragColor = texture2D(uSampler, vTexCoord);
  }
`
const OFFSCREEN_WIDTH = 256
const OFFSCREEN_HEIGHT = 256
// Coordinate transformation matrix
const gModelMatrix = new Matrix4()
const gMvpMatrix = new Matrix4()
const ANGLE_STEP = 30 // The increments of rotation angle (degrees)

let last = Date.now() // Last time that this function was called

export default {
  name: 'FrameBufferObject',
  mixins: [Base],
  methods: {
    init () {
      const gl = this.gl
      const canvas = this.$refs.canvas

      if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.')
        return
      }

      // Get the storage location of attribute variables and uniform variables
      const program = gl.program // Get program object
      program.aPosition = gl.getAttribLocation(program, 'aPosition')
      program.aTexCoord = gl.getAttribLocation(program, 'aTexCoord')
      program.uMvpMatrix = gl.getUniformLocation(program, 'uMvpMatrix')
      if (program.aPosition < 0 || program.aTexCoord < 0 || !program.uMvpMatrix) {
        console.log('Failed to get the storage location of aPosition, aTexCoord, uMvpMatrix')
        return
      }

      // Set the vertex information
      const cube = this.initVertexBuffersForCube()
      const plane = this.initVertexBuffersForPlane()
      if (!cube || !plane) {
        console.log('Failed to set the vertex information')
        return
      }

      // Set texture
      const texture = this.initTextures()
      if (!texture) {
        console.log('Failed to intialize the texture.')
        return
      }

      // Initialize framebuffer object (FBO)
      const fbo = this.initFramebufferObject()
      if (!fbo) {
        console.log('Failed to intialize the framebuffer object (FBO)')
        return
      }

      // Enable depth test
      gl.enable(gl.DEPTH_TEST)
      // gl.enable(gl.CULL_FACE) // 开启消隐功能，不绘制背面

      const viewProjMatrix = new Matrix4() // Prepare view projection matrix for color buffer
      viewProjMatrix.setPerspective(30, canvas.width / canvas.height, 1.0, 100.0)
      viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)

      const viewProjMatrixFBO = new Matrix4() // Prepare view projection matrix for FBO
      viewProjMatrixFBO.setPerspective(30.0, OFFSCREEN_WIDTH / OFFSCREEN_HEIGHT, 1.0, 100.0)
      viewProjMatrixFBO.lookAt(0.0, 2.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)

      // Start drawing
      let currentAngle = 0.0 // Current rotation angle (degrees)
      const tick = () => {
        currentAngle = this.animate(currentAngle) // Update current rotation angle
        this.draw(canvas, fbo, plane, cube, currentAngle, texture, viewProjMatrix, viewProjMatrixFBO)
        window.requestAnimationFrame(tick, canvas)
      }
      tick()
    },
    initVertexBuffersForCube () {
      const gl = this.gl
      // Create a cube
      //    v6----- v5
      //   /|      /|
      //  v1------v0|
      //  | |     | |
      //  | |v7---|-|v4
      //  |/      |/
      //  v2------v3

      // Vertex coordinates
      const vertices = new Float32Array([
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // v0-v1-v2-v3 front
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // v0-v3-v4-v5 right
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0 // v4-v7-v6-v5 back
      ])

      // Texture coordinates
      const texCoords = new Float32Array([
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

      const o = {} // Create the "Object" object to return multiple objects.

      // Write vertex information to buffer object
      o.vertexBuffer = this.initArrayBufferForLaterUse(vertices, 3, gl.FLOAT)
      o.texCoordBuffer = this.initArrayBufferForLaterUse(texCoords, 2, gl.FLOAT)
      o.indexBuffer = this.initElementArrayBufferForLaterUse(indices, gl.UNSIGNED_BYTE)
      if (!o.vertexBuffer || !o.texCoordBuffer || !o.indexBuffer) return null

      o.numIndices = indices.length

      // Unbind the buffer object
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

      return o
    },
    initVertexBuffersForPlane () {
      const gl = this.gl
      // Create face
      //  v1------v0
      //  |        |
      //  |        |
      //  |        |
      //  v2------v3

      // Vertex coordinates
      const vertices = new Float32Array([
        1.0, 1.0, 0.0, -1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0 // v0-v1-v2-v3
      ])

      // Texture coordinates
      const texCoords = new Float32Array([1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0])

      // Indices of the vertices
      const indices = new Uint8Array([0, 1, 2, 0, 2, 3])

      const o = {} // Create the "Object" object to return multiple objects.

      // Write vertex information to buffer object
      o.vertexBuffer = this.initArrayBufferForLaterUse(vertices, 3, gl.FLOAT)
      o.texCoordBuffer = this.initArrayBufferForLaterUse(texCoords, 2, gl.FLOAT)
      o.indexBuffer = this.initElementArrayBufferForLaterUse(indices, gl.UNSIGNED_BYTE)
      if (!o.vertexBuffer || !o.texCoordBuffer || !o.indexBuffer) return null

      o.numIndices = indices.length

      // Unbind the buffer object
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

      return o
    },
    initArrayBufferForLaterUse (data, num, type) {
      const gl = this.gl
      const buffer = gl.createBuffer()
      if (!buffer) {
        console.log('Failed to create the buffer object')
        return null
      }
      // Write date into the buffer object
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

      // Store the necessary information to assign the object to the attribute variable later
      buffer.num = num
      buffer.type = type

      return buffer
    },
    initElementArrayBufferForLaterUse (data, type) {
      const gl = this.gl
      // Create a buffer object
      const buffer = gl.createBuffer()
      if (!buffer) {
        console.log('Failed to create the buffer object')
        return null
      }
      // Write date into the buffer object
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW)

      buffer.type = type

      return buffer
    },
    initTextures () {
      const gl = this.gl
      const texture = gl.createTexture() // Create a texture object
      if (!texture) {
        console.log('Failed to create the Texture object')
        return null
      }

      // Get storage location of u_Sampler
      const uSampler = gl.getUniformLocation(gl.program, 'uSampler')
      if (!uSampler) {
        console.log('Failed to get the storage location of uSampler')
        return null
      }

      const image = new Image() // Create image object
      if (!image) {
        console.log('Failed to create the Image object')
        return null
      }
      // Register the event handler to be called when image loading is completed
      image.onload = function () {
        // Write image data to texture object
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1) // Flip the image Y coordinate
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        // Pass the texure unit 0 to u_Sampler
        gl.uniform1i(uSampler, 0)

        gl.bindTexture(gl.TEXTURE_2D, null) // Unbind the texture object
      }

      // Tell the browser to load an Image
      image.src = require('@/assets/sky.jpg')

      return texture
    },
    initFramebufferObject () {
      const gl = this.gl
      let framebuffer, texture, depthBuffer

      // Define the error handling function
      const error = function () {
        if (framebuffer) gl.deleteFramebuffer(framebuffer)
        if (texture) gl.deleteTexture(texture)
        if (depthBuffer) gl.deleteRenderbuffer(depthBuffer)
        return null
      }

      // Create a frame buffer object (FBO) 创建帧缓冲区对象
      framebuffer = gl.createFramebuffer()
      if (!framebuffer) {
        console.log('Failed to create frame buffer object')
        return error()
      }

      // Create a texture object and set its size and parameters
      texture = gl.createTexture() // Create a texture object
      if (!texture) {
        console.log('Failed to create texture object')
        return error()
      }
      gl.bindTexture(gl.TEXTURE_2D, texture) // Bind the object to target
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      framebuffer.texture = texture // Store the texture object

      // Create a renderbuffer object and Set its size and parameters
      depthBuffer = gl.createRenderbuffer() // Create a renderbuffer object 创建渲染缓冲区对象
      if (!depthBuffer) {
        console.log('Failed to create renderbuffer object')
        return error()
      }
      // 绑定渲染缓冲区并设置其尺寸
      gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer) // Bind the object to target
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT)

      // Attach the texture and the renderbuffer object to the FBO
      // 将纹理对象关联到帧缓冲区对象
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
      // 将texture指定的纹理对象关联到绑定在target目标上帧缓冲区
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
      // 将渲染缓冲区对象关联到帧缓冲区对象
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)

      // Check if FBO is configured correctly
      // 检查帧缓冲区的配置
      const e = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
      if (gl.FRAMEBUFFER_COMPLETE !== e) {
        console.log('Frame buffer object is incomplete: ' + e.toString())
        return error()
      }

      // Unbind the buffer object
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.bindTexture(gl.TEXTURE_2D, null)
      gl.bindRenderbuffer(gl.RENDERBUFFER, null)

      return framebuffer
    },
    draw (canvas, fbo, plane, cube, angle, texture, viewProjMatrix, viewProjMatrixFBO) {
      const gl = this.gl
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo) // Change the drawing destination to FBO
      gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT) // Set a viewport for FBO

      gl.clearColor(0.2, 0.2, 0.4, 1.0) // Set clear color (the color is slightly changed)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT) // Clear FBO

      this.drawTexturedCube(gl.program, cube, angle, texture, viewProjMatrixFBO) // Draw the cube

      // 切换绘制目标为颜色缓冲区
      gl.bindFramebuffer(gl.FRAMEBUFFER, null) // Change the drawing destination to color buffer
      // 将视窗设置为canvas的尺寸
      gl.viewport(0, 0, canvas.width, canvas.height) // Set the size of viewport back to that of <canvas>

      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT) // Clear the color buffer

      this.drawTexturedPlane(gl.program, plane, angle, fbo.texture, viewProjMatrix) // Draw the plane
    },
    drawTexturedCube (program, o, angle, texture, viewProjMatrix) {
      const gl = this.gl
      // Calculate a model matrix
      gModelMatrix.setRotate(20.0, 1.0, 0.0, 0.0)
      gModelMatrix.rotate(angle, 0.0, 1.0, 0.0)

      // Calculate the model view project matrix and pass it to u_MvpMatrix
      gMvpMatrix.set(viewProjMatrix)
      gMvpMatrix.multiply(gModelMatrix)
      gl.uniformMatrix4fv(program.uMvpMatrix, false, gMvpMatrix.elements)

      this.drawTexturedObject(program, o, texture)
    },
    drawTexturedPlane (program, o, angle, texture, viewProjMatrix) {
      const gl = this.gl
      // Calculate a model matrix
      gModelMatrix.setTranslate(0, 0, 1)
      gModelMatrix.rotate(20.0, 1.0, 0.0, 0.0)
      gModelMatrix.rotate(angle, 0.0, 1.0, 0.0)

      // Calculate the model view project matrix and pass it to u_MvpMatrix
      gMvpMatrix.set(viewProjMatrix)
      gMvpMatrix.multiply(gModelMatrix)
      gl.uniformMatrix4fv(program.uMvpMatrix, false, gMvpMatrix.elements)

      this.drawTexturedObject(program, o, texture)
    },
    drawTexturedObject (program, o, texture) {
      const gl = this.gl
      // Assign the buffer objects and enable the assignment
      this.initAttributeVariable(program.aPosition, o.vertexBuffer) // Vertex coordinates
      this.initAttributeVariable(program.aTexCoord, o.texCoordBuffer) // Texture coordinates

      // Bind the texture object to the target
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)

      // Draw
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer)
      gl.drawElements(gl.TRIANGLES, o.numIndices, o.indexBuffer.type, 0)
    },
    initAttributeVariable (aAttribute, buffer) {
      const gl = this.gl
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.vertexAttribPointer(aAttribute, buffer.num, buffer.type, false, 0, 0)
      gl.enableVertexAttribArray(aAttribute)
    },
    animate (angle) {
      const now = Date.now() // Calculate the elapsed time
      const elapsed = now - last
      last = now
      // Update the current rotation angle (adjusted by the elapsed time)
      const newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0
      return newAngle % 360
    }
  },
  mounted () {
    this.init()
  }
}
</script>

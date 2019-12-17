<script>
import Base from '../../components/Base'
import Matrix4 from '../../js/Matrix4'
import { createProgram } from '../../js/utils'

const SHADOW_VSHADER_SOURCE = `
  attribute vec4 aPosition;
  uniform mat4 uMvpMatrix;
  void main() {
    gl_Position = uMvpMatrix * aPosition;
  }
`
const SHADOW_FSHADER_SOURCE = `
  precision mediump float;
  void main() {
    gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 0.0);
  }
`
const VSHADER_SOURCE = `
  attribute vec4 aPosition;
  attribute vec4 aColor;
  uniform mat4 uMvpMatrix;
  uniform mat4 uMvpMatrixFromLight;
  varying vec4 vPositionFromLight;
  varying vec4 vColor;
  void main() {
    gl_Position = uMvpMatrix * aPosition;
    vPositionFromLight = uMvpMatrixFromLight * aPosition;
    vColor = aColor;
  }
`

const FSHADER_SOURCE = `
  precision mediump float;
  uniform sampler2D uShadowMap;
  varying vec4 vPositionFromLight;
  varying vec4 vColor;
  void main(){
    vec3 shadowCoord = (vPositionFromLight.xyz / vPositionFromLight.w) / 2.0 + 0.5;
    vec4 rgbaDepth = texture2D(uShadowMap, shadowCoord.xy);
    float depth = rgbaDepth.r;
    float visibility = (shadowCoord.z > depth + 0.005) ? 0.7 : 1.0;
    gl_FragColor = vec4(vColor.rgb * visibility, vColor.a);
  }
`

const OFFSCREEN_WIDTH = 2048
const OFFSCREEN_HEIGHT = 2048
const LIGHT_X = 0; const LIGHT_Y = 7; const LIGHT_Z = 2 // Position of the light source
// Coordinate transformation matrix
const gModelMatrix = new Matrix4()
const gMvpMatrix = new Matrix4()
const ANGLE_STEP = 30 // The increments of rotation angle (degrees)

let last = Date.now() // Last time that this function was called

export default {
  name: 'Shadow',
  mixins: [Base],
  methods: {
    init () {
      const gl = this.gl
      const canvas = this.$refs.canvas

      // Initialize shaders for generating a shadow map
      const shadowProgram = createProgram(gl, SHADOW_VSHADER_SOURCE, SHADOW_FSHADER_SOURCE)
      shadowProgram.aPosition = gl.getAttribLocation(shadowProgram, 'aPosition')
      shadowProgram.uMvpMatrix = gl.getUniformLocation(shadowProgram, 'uMvpMatrix')
      if (shadowProgram.aPosition < 0 || !shadowProgram.uMvpMatrix) {
        console.log('Failed to get the storage location of attribute or uniform variable from shadowProgram')
        return
      }

      // Initialize shaders for regular drawing
      const normalProgram = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE)
      normalProgram.aPosition = gl.getAttribLocation(normalProgram, 'aPosition')
      normalProgram.aColor = gl.getAttribLocation(normalProgram, 'aColor')
      normalProgram.uMvpMatrix = gl.getUniformLocation(normalProgram, 'uMvpMatrix')
      normalProgram.uMvpMatrixFromLight = gl.getUniformLocation(normalProgram, 'uMvpMatrixFromLight')
      normalProgram.uShadowMap = gl.getUniformLocation(normalProgram, 'uShadowMap')
      if (normalProgram.aPosition < 0 || normalProgram.aColor < 0 || !normalProgram.uMvpMatrix ||
          !normalProgram.uMvpMatrixFromLight || !normalProgram.uShadowMap) {
        console.log('Failed to get the storage location of attribute or uniform variable from normalProgram')
        return
      }

      // Set the vertex information
      const triangle = this.initVertexBuffersForTriangle()
      const plane = this.initVertexBuffersForPlane()
      if (!triangle || !plane) {
        console.log('Failed to set the vertex information')
        return
      }

      // Initialize framebuffer object (FBO)
      const fbo = this.initFramebufferObject()
      if (!fbo) {
        console.log('Failed to initialize frame buffer object')
        return
      }
      gl.activeTexture(gl.TEXTURE0) // Set a texture object to the texture unit
      gl.bindTexture(gl.TEXTURE_2D, fbo.texture)

      // Set the clear color and enable the depth test
      gl.clearColor(0, 0, 0, 1)
      gl.enable(gl.DEPTH_TEST)

      const viewProjMatrixFromLight = new Matrix4() // Prepare a view projection matrix for generating a shadow map
      viewProjMatrixFromLight.setPerspective(70.0, OFFSCREEN_WIDTH / OFFSCREEN_HEIGHT, 1.0, 100.0)
      viewProjMatrixFromLight.lookAt(LIGHT_X, LIGHT_Y, LIGHT_Z, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)

      const viewProjMatrix = new Matrix4() // Prepare a view projection matrix for regular drawing
      viewProjMatrix.setPerspective(45, canvas.width / canvas.height, 1.0, 100.0)
      viewProjMatrix.lookAt(0.0, 7.0, 9.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)

      let currentAngle = 0.0 // Current rotation angle (degrees)
      const mvpMatrixFromLightT = new Matrix4() // A model view projection matrix from light source (for triangle)
      const mvpMatrixFromLightP = new Matrix4() // A model view projection matrix from light source (for plane)
      const tick = () => {
        currentAngle = this.animate(currentAngle)

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo) // Change the drawing destination to FBO
        gl.viewport(0, 0, OFFSCREEN_HEIGHT, OFFSCREEN_HEIGHT) // Set view port for FBO
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT) // Clear FBO

        gl.useProgram(shadowProgram) // Set shaders for generating a shadow map
        // Draw the triangle and the plane (for generating a shadow map)
        this.drawTriangle(shadowProgram, triangle, currentAngle, viewProjMatrixFromLight)
        mvpMatrixFromLightT.set(gMvpMatrix) // Used later
        this.drawPlane(shadowProgram, plane, viewProjMatrixFromLight)
        mvpMatrixFromLightP.set(gMvpMatrix) // Used later

        gl.bindFramebuffer(gl.FRAMEBUFFER, null) // Change the drawing destination to color buffer
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT) // Clear color and depth buffer

        gl.useProgram(normalProgram) // Set the shader for regular drawing
        gl.uniform1i(normalProgram.uShadowMap, 0) // Pass 0 because gl.TEXTURE0 is enabledする
        // Draw the triangle and plane ( for regular drawing)
        gl.uniformMatrix4fv(normalProgram.uMvpMatrixFromLight, false, mvpMatrixFromLightT.elements)
        this.drawTriangle(normalProgram, triangle, currentAngle, viewProjMatrix)
        gl.uniformMatrix4fv(normalProgram.uMvpMatrixFromLight, false, mvpMatrixFromLightP.elements)
        this.drawPlane(normalProgram, plane, viewProjMatrix)

        window.requestAnimationFrame(tick, canvas)
      }
      tick()
    },
    drawTriangle (program, triangle, angle, viewProjMatrix) {
      // Set rotate angle to model matrix and draw triangle
      gModelMatrix.setRotate(angle, 0, 1, 0)
      this.draw(program, triangle, viewProjMatrix)
    },
    drawPlane (program, plane, viewProjMatrix) {
      // Set rotate angle to model matrix and draw plane
      gModelMatrix.setRotate(-45, 0, 1, 1)
      this.draw(program, plane, viewProjMatrix)
    },
    draw (program, o, viewProjMatrix) {
      const gl = this.gl
      this.initAttributeVariable(program.aPosition, o.vertexBuffer)
      if (program.aColor !== undefined) { // If a_Color is defined to attribute
        this.initAttributeVariable(program.aColor, o.colorBuffer)
      }

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer)

      // Calculate the model view project matrix and pass it to u_MvpMatrix
      gMvpMatrix.set(viewProjMatrix)
      gMvpMatrix.multiply(gModelMatrix)
      gl.uniformMatrix4fv(program.uMvpMatrix, false, gMvpMatrix.elements)

      gl.drawElements(gl.TRIANGLES, o.numIndices, gl.UNSIGNED_BYTE, 0)
    },
    initAttributeVariable (aAttribute, buffer) {
      const gl = this.gl
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.vertexAttribPointer(aAttribute, buffer.num, buffer.type, false, 0, 0)
      gl.enableVertexAttribArray(aAttribute)
    },
    initVertexBuffersForPlane () {
      const gl = this.gl
      // Create a plane
      //  v1------v0
      //  |        |
      //  |        |
      //  |        |
      //  v2------v3

      // Vertex coordinates
      const vertices = new Float32Array([
        3.0, -1.7, 2.5, -3.0, -1.7, 2.5, -3.0, -1.7, -2.5, 3.0, -1.7, -2.5 // v0-v1-v2-v3
      ])

      // Colors
      const colors = new Float32Array([
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0
      ])

      // Indices of the vertices
      const indices = new Uint8Array([0, 1, 2, 0, 2, 3])

      const o = {} // Utilize Object object to return multiple buffer objects together

      // Write vertex information to buffer object
      o.vertexBuffer = this.initArrayBufferForLaterUse(vertices, 3, gl.FLOAT)
      o.colorBuffer = this.initArrayBufferForLaterUse(colors, 3, gl.FLOAT)
      o.indexBuffer = this.initElementArrayBufferForLaterUse(indices, gl.UNSIGNED_BYTE)
      if (!o.vertexBuffer || !o.colorBuffer || !o.indexBuffer) return null

      o.numIndices = indices.length

      // Unbind the buffer object
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

      return o
    },
    initVertexBuffersForTriangle () {
      const gl = this.gl
      // Create a triangle
      //       v2
      //      / |
      //     /  |
      //    /   |
      //  v0----v1

      // Vertex coordinates
      const vertices = new Float32Array([-0.8, 3.5, 0.0, 0.8, 3.5, 0.0, 0.0, 3.5, 1.8])
      // Colors
      const colors = new Float32Array([1.0, 0.5, 0.0, 1.0, 0.5, 0.0, 1.0, 0.0, 0.0])
      // Indices of the vertices
      const indices = new Uint8Array([0, 1, 2])

      const o = {} // Utilize Object object to return multiple buffer objects together

      // Write vertex information to buffer object
      o.vertexBuffer = this.initArrayBufferForLaterUse(vertices, 3, gl.FLOAT)
      o.colorBuffer = this.initArrayBufferForLaterUse(colors, 3, gl.FLOAT)
      o.indexBuffer = this.initElementArrayBufferForLaterUse(indices, gl.UNSIGNED_BYTE)
      if (!o.vertexBuffer || !o.colorBuffer || !o.indexBuffer) return null

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

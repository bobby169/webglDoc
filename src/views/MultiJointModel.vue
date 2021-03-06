<template>
  <div>
    <canvas ref="canvas" width="400" height="400"></canvas>
    <p>&larr;&rarr;: arm1 rotation,&uarr;&darr;: joint1 rotation, xz: joint2(wrist) rotation, cv: finger rotation</p>
  </div>
</template>

<script>
import { initShaders } from '../js/utils'
import Matrix4 from '../js/Matrix4'
const VSHADER_SOURCE =
    `attribute vec4 aPosition;
     attribute vec4 aNormal;
     uniform mat4 uMvpMatrix;
     uniform mat4 uNormalMatrix;
     varying vec4 vColor;
     void main() {
        gl_Position = uMvpMatrix * aPosition;
        vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));
        vec4 color = vec4(1.0, 0.4, 0.0, 1.0);
        vec3 normal = normalize((uNormalMatrix * aNormal).xyz);
        float nDotL = max(dot(normal, lightDirection), 0.0);
        vColor = vec4(color.rgb * nDotL + vec3(0.1), color.a);
     }`

const FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 vColor;
    void main() {
      gl_FragColor = vColor;
    }
`
const ANGLE_STEP = 3.0
let gModelMatrix = new Matrix4() // 坐标变换矩阵
let gMvpMatrix = new Matrix4()
let gNormalMatrix = new Matrix4()
let gMatrixStack = []
let gArm1Angle = -90.0
let gJoint1Angle = 0.0
let gJoint2Angle = 0.0
let gJoint3Angle = 0.0

// <p>&larr;&rarr;: arm1 rotation,&uarr;&darr;: joint1 rotation, xz: joint2(wrist) rotation, cv: finger rotation</p>

export default {
  name: 'JointModel',
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

      const uMvpMatrix = gl.getUniformLocation(gl.program, 'uMvpMatrix')
      const uNormalMatrix = gl.getUniformLocation(gl.program, 'uNormalMatrix')
      if (!uMvpMatrix || !uNormalMatrix) {
        console.log('Failed to get the storage location')
      }

      // 计算视图投影矩阵
      const viewProjMatrix = new Matrix4()
      viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0)
      viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)
      document.onkeydown = (ev) => {
        this.keydown(ev, n, viewProjMatrix, uMvpMatrix, uNormalMatrix)
      }
      this.draw(n, viewProjMatrix, uMvpMatrix, uNormalMatrix)
    },
    keydown (ev, n, viewProjMatrix, uMvpMatrix, uNormalMatrix) {
      switch (ev.keyCode) {
        case 40: // Up arrow key -> the positive rotation of joint1 around the z-axis
          if (gJoint1Angle < 135.0) gJoint1Angle += ANGLE_STEP
          break
        case 38: // Down arrow key -> the negative rotation of joint1 around the z-axis
          if (gJoint1Angle > -135.0) gJoint1Angle -= ANGLE_STEP
          break
        case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
          gArm1Angle = (gArm1Angle + ANGLE_STEP) % 360
          break
        case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
          gArm1Angle = (gArm1Angle - ANGLE_STEP) % 360
          break
        case 90: // 'ｚ'key -> the positive rotation of joint2
          gJoint2Angle = (gJoint2Angle + ANGLE_STEP) % 360
          break
        case 88: // 'x'key -> the negative rotation of joint2
          gJoint2Angle = (gJoint2Angle - ANGLE_STEP) % 360
          break
        case 86: // 'v'key -> the positive rotation of joint3
          if (gJoint3Angle < 60.0) gJoint3Angle = (gJoint3Angle + ANGLE_STEP) % 360
          break
        case 67: // 'c'key -> the nagative rotation of joint3
          if (gJoint3Angle > -60.0) gJoint3Angle = (gJoint3Angle - ANGLE_STEP) % 360
          break
        default: return // Skip drawing at no effective action
      }
      this.draw(n, viewProjMatrix, uMvpMatrix, uNormalMatrix)
    },
    initVertexBuffers () {
      const gl = this.gl

      // Coordinates（Cube which length of one side is 1 with the origin on the center of the bottom)
      const vertices = new Float32Array([
        0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.5, // v0-v1-v2-v3 front
        0.5, 1.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, 0.5, 1.0, -0.5, // v0-v3-v4-v5 right
        0.5, 1.0, 0.5, 0.5, 1.0, -0.5, -0.5, 1.0, -0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 up
        -0.5, 1.0, 0.5, -0.5, 1.0, -0.5, -0.5, 0.0, -0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
        -0.5, 0.0, -0.5, 0.5, 0.0, -0.5, 0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
        0.5, 0.0, -0.5, -0.5, 0.0, -0.5, -0.5, 1.0, -0.5, 0.5, 1.0, -0.5 // v4-v7-v6-v5 back
      ])

      // Normal
      const normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // v0-v1-v2-v3 front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // v0-v3-v4-v5 right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, // v7-v4-v3-v2 down
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0 // v4-v7-v6-v5 back
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

      // Write the vertex property to buffers (coordinates and normals)
      if (!this.initArrayBuffer('aPosition', vertices, gl.FLOAT, 3)) return -1
      if (!this.initArrayBuffer('aNormal', normals, gl.FLOAT, 3)) return -1

      // Unbind the buffer object
      gl.bindBuffer(gl.ARRAY_BUFFER, null)

      // Write the indices to the buffer object
      const indexBuffer = gl.createBuffer()
      if (!indexBuffer) {
        console.log('Failed to create the buffer object')
        return -1
      }
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

      return indices.length
    },
    initArrayBuffer (attribute, data, type, num) {
      const gl = this.gl
      // Create a buffer object
      var buffer = gl.createBuffer()
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
      // Enable the assignment of the buffer object to the attribute variable
      gl.enableVertexAttribArray(aAttribute)

      return true
    },
    draw (n, viewProjMatrix, uMvpMatrix, uNormalMatrix) {
      const gl = this.gl

      // Clear color and depth buffer
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      // Draw a base
      const baseHeight = 2.0
      gModelMatrix.setTranslate(0.0, -12.0, 0.0)
      this.drawBox(n, 10.0, baseHeight, 10.0, viewProjMatrix, uMvpMatrix, uNormalMatrix)

      // Arm1
      const arm1Length = 10.0
      gModelMatrix.translate(0.0, baseHeight, 0.0) // Move onto the base
      gModelMatrix.rotate(gArm1Angle, 0.0, 1.0, 0.0) // Rotate around the y-axis
      this.drawBox(n, 3.0, arm1Length, 3.0, viewProjMatrix, uMvpMatrix, uNormalMatrix) // Draw

      // Arm2
      const arm2Length = 10.0
      gModelMatrix.translate(0.0, arm1Length, 0.0) // Move to joint1
      gModelMatrix.rotate(gJoint1Angle, 0.0, 0.0, 1.0) // Rotate around the z-axis
      this.drawBox(n, 4.0, arm2Length, 4.0, viewProjMatrix, uMvpMatrix, uNormalMatrix) // Draw

      // A palm
      const palmLength = 2.0
      gModelMatrix.translate(0.0, arm2Length, 0.0) // Move to palm
      gModelMatrix.rotate(gJoint2Angle, 0.0, 1.0, 0.0) // Rotate around the y-axis
      this.drawBox(n, 2.0, palmLength, 6.0, viewProjMatrix, uMvpMatrix, uNormalMatrix) // Draw

      // Move to the center of the tip of the palm
      gModelMatrix.translate(0.0, palmLength, 0.0)

      // Draw finger1
      this.pushMatrix(gModelMatrix)
      gModelMatrix.translate(0.0, 0.0, 2.0)
      gModelMatrix.rotate(gJoint3Angle, 1.0, 0.0, 0.0) // Rotate around the x-axis
      this.drawBox(n, 1.0, 2.0, 1.0, viewProjMatrix, uMvpMatrix, uNormalMatrix)
      gModelMatrix = this.popMatrix()

      // Draw finger2
      gModelMatrix.translate(0.0, 0.0, -2.0)
      gModelMatrix.rotate(-gJoint3Angle, 1.0, 0.0, 0.0) // Rotate around the x-axis
      this.drawBox(n, 1.0, 2.0, 1.0, viewProjMatrix, uMvpMatrix, uNormalMatrix)
    },
    drawBox (n, width, height, depth, viewProjMatrix, uMvpMatrix, uNormalMatrix) {
      const gl = this.gl

      this.pushMatrix(gModelMatrix) // Save the model matrix
      // Scale a cube and draw
      gModelMatrix.scale(width, height, depth)
      // Calculate the model view project matrix and pass it to u_MvpMatrix
      gMvpMatrix.set(viewProjMatrix)
      gMvpMatrix.multiply(gModelMatrix)
      gl.uniformMatrix4fv(uMvpMatrix, false, gMvpMatrix.elements)
      // Calculate the normal transformation matrix and pass it to u_NormalMatrix
      gNormalMatrix.setInverseOf(gModelMatrix)
      gNormalMatrix.transpose()
      gl.uniformMatrix4fv(uNormalMatrix, false, gNormalMatrix.elements)
      // Draw
      gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
      gModelMatrix = this.popMatrix() // Retrieve the model matrix
    },
    pushMatrix (m) {
      const m2 = new Matrix4(m)
      gMatrixStack.push(m2)
    },
    popMatrix () {
      return gMatrixStack.pop()
    }
  },
  mounted () {
    this.gl = this.$refs.canvas.getContext('webgl')
    this.init()
  }
}
</script>

<style scoped>

</style>

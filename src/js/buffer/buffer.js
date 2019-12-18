import GL from '../core/gl'
export default class Buffer {
  constructor (data, object = {}) {
    const { gl, buffers } = GL
    this.glBuffer = gl.createBuffer()
    // Write data into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    Object.assign(this.glBuffer, object)

    if (data instanceof Float32Array) {
      this.arrayBuffer = data.buffer
    } else if (data instanceof ArrayBuffer) {
      this.arrayBuffer = data
    }

    buffers.add(this)
  }

  delete () {
    const { gl, buffers } = GL
    buffers.delete(this)

    gl.deleteBuffer(this.glBuffer)
  }
}

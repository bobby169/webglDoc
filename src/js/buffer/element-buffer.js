import GL from '../core/gl'
export default class ElementBuffer {
  constructor (data, object = {}) {
    const { gl, buffers } = GL
    this.glBuffer = gl.createBuffer()
    // Write data into the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    Object.assign(this.glBuffer, object)

    if (data instanceof Uint32Array || data instanceof Uint16Array) {
      if (data instanceof Uint32Array) {
        this.u32 = true
      }
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

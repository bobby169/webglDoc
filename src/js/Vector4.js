export default class Vector4 {
  constructor (option) {
    const v = new Float32Array(4)
    if (option && typeof option === 'object') {
      v[0] = option[0]; v[1] = option[1]; v[2] = option[2]; v[3] = option[3]
    }
    this.elements = v
  }
}

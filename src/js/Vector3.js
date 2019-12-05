
export default class Vector3 {
  constructor (option) {
    const v = new Float32Array(3)
    if (option && typeof option === 'object') {
      v[0] = option[0]; v[1] = option[1]; v[2] = option[2]
    }
    this.elements = v
  }

  /**
   * 归一化
   * @returns {Vector3}
   */
  normalize () {
    const v = this.elements
    const c = v[0]
    const d = v[1]
    const e = v[2]
    let g = Math.sqrt(c * c + d * d + e * e)
    if (g) {
      if (g === 1) { return this }
    } else {
      v[0] = 0; v[1] = 0; v[2] = 0
      return this
    }
    g = 1 / g
    v[0] = c * g
    v[1] = d * g
    v[2] = e * g
    return this
  }
}

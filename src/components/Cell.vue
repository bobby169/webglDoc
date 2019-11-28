<template>
  <div class="cell">
    <span class="cell-mask" v-if="isLink"></span>
    <div class="cell-wrapper">
      <label class="cell-title">
        <slot name="icon">
          <i v-if="icon" class="mintui" :class="'mintui-' + icon"></i>
        </slot>
        <slot name="title">
          <span class="cell-text" v-text="title"></span>
          <span v-if="label" class="cell-label" v-text="label"></span>
        </slot>
      </label>
      <div class="cell-value">
        <slot>
          <span v-text="value"></span>
        </slot>
      </div>
    </div>
    <i v-if="isLink" class="cell-allow-right"></i>
  </div>
</template>

<script>
/**
 * mt-cell
 * @module components/cell
 * @desc 单元格
 * @param {string} [icon] - 图标，提供 more, back，或者自定义的图标（传入不带前缀的图标类名，最后拼接成 .mintui-xxx）
 * @param {string} [title] - 标题
 * @param {string} [label] - 备注信息
 * @param {boolean} [is-link=false] - 可点击的链接
 * @param {string} [value] - 右侧显示文字
 * @param {slot} - 同 value, 会覆盖 value 属性
 * @param {slot} [title] - 同 title, 会覆盖 title 属性
 * @param {slot} [icon] - 同 icon, 会覆盖 icon 属性，例如可以传入图片
 *
 * @example
 * <mt-cell title="标题文字" icon="back" is-link value="描述文字"></mt-cell>
 * <mt-cell title="标题文字" icon="back">
 *   <div slot="value">描述文字啊哈</div>
 * </mt-cell>
 */
export default {
  name: 'cell',
  props: {
    icon: String,
    title: String,
    label: String,
    isLink: Boolean,
    value: String
  },
  data () {
    return {}
  }
}
</script>

<style lang="less">
  .cell {
    background-color: #fff;
    box-sizing: border-box;
    color: inherit;
    min-height: 86px;
    display: block;
    overflow: hidden;
    position: relative;
    text-decoration: none;

    .cell-mask:after {
      background-color: #000;
      content: " ";
      opacity: 0;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      position: absolute;
    }

    .cell-left {
      position: absolute;
      height: 100%;
      left: 0;
      -webkit-transform: translate3d(-100%,0,0);
      transform: translate3d(-100%,0,0);
    }

    .cell-wrapper {
      background-image: -webkit-linear-gradient(top,#d9d9d9,#d9d9d9 50%,#0000 0);
      background-image: linear-gradient(180deg,#d9d9d9,#d9d9d9 50%,#0000 0);
      background-size: 120% 2px;
      background-repeat: no-repeat;
      background-position: 0 0;
      background-origin: content-box;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      box-sizing: border-box;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      font-size: 32px;
      line-height: 1;
      min-height: inherit;
      overflow: hidden;
      padding: 0 20px;
      width: 100%;
    }

    .cell-title {
      -webkit-box-flex: 1;
      -ms-flex: 1;
      flex: 1;

      .cell-text{
        vertical-align: middle;
      }

      .cell-label {
        color: #888;
        display: block;
        font-size: 28px;
        margin-top: 14px;
      }
    }

    .cell-value.is-link {
      margin-right: 24px;
    }

    .cell-value {
      color: #888;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
    }

    .cell-right {
      position: absolute;
      height: 100%;
      right: 0;
      top: 0;
      -webkit-transform: translate3d(100%,0,0);
      transform: translate3d(100%,0,0);
    }

    .cell-allow-right:after {
      border: 4px solid #c8c8cd;
      border-bottom-width: 0;
      border-left-width: 0;
      content: " ";
      top: 50%;
      right: 30px;
      position: absolute;
      width: 5px;
      height: 5px;
      -webkit-transform: translateY(-50%) rotate(45deg);
      transform: translateY(-50%) rotate(45deg);
    }
  }
</style>

<template>
  <el-tooltip
    :disabled="!isOverflow"
    :content="text"
    placement="top"
    effect="dark"
  >
    <div
      ref="text"
      class="truncate"
      :style="{ '--line-clamp': lineClamp }"
      @mouseenter="checkOverflow"
    >
      {{ text }}
    </div>
  </el-tooltip>
</template>

<script>
export default {
  name: 'OverflowTooltip',
  props: {
    text: {
      type: String,
      required: true,
    },
    lineClamp: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      isOverflow: false,
    };
  },
  methods: {
    checkOverflow() {
      const textElement = this.$refs.text;
      if (textElement) {
        // isContentOverflow an custom properties
        const isContentOverflow =
          textElement.scrollHeight > textElement.clientHeight ||
          textElement.scrollWidth > textElement.clientWidth;
        this.isOverflow = isContentOverflow;
      }
    },
  },
};
</script>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: var(--line-clamp, 1);
}
</style>
<template>
    <g>
        <!-- 定义箭头 -->
        <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"
                markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L7,3 Z" :fill="lineColor" />
            </marker>
        </defs>

        <!-- 连线（带箭头） -->
        <path :d="pathData" :stroke="lineColor" stroke-width="1.5" fill="none" marker-end="url(#arrow)" />

        <!-- 
            使用 foreignObject 嵌入HTML, 并实现自定义tooltip
        -->
        <foreignObject :x="textPosition.x - 25" :y="textPosition.y - 25" width="50" height="20" 
                     :transform="`rotate(${correctedAngle}, ${textPosition.x}, ${textPosition.y})`" style="overflow: visible;">
            
            <div class="line-text-wrapper" 
                 @mouseover="showTooltip = true" 
                 @mouseleave="showTooltip = false"
                 xmlns="http://www.w3.org/1999/xhtml">
                
                <div ref="textContent" class="line-text-content" :style="{ color: fontColor }">
                    {{ line.text }}
                </div>

                <!-- 自定义 Tooltip, 仅当文本溢出时显示 -->
                <div v-if="showTooltip && isTextOverflowing" class="custom-tooltip-container">
                    <div class="custom-tooltip-content">
                        {{ line.text }}
                    </div>
                </div>
            </div>

        </foreignObject>
    </g>
</template>

<script>
export default {
    name: 'SimpleLine',
    props: {
        link: {
            type: Object,
            required: true
        },
        line: {
            type: Object,
            default: () => ({
                text: ''
            })
        },
        lineColor: {
            type: String,
            default: '#aaaaaa'
        },
        fontColor: {
            type: String,
            default: '#aaaaaa'
        }
    },
    data() {
        return {
            showTooltip: false,
            isTextOverflowing: false // 文本是否溢出
        };
    },
    watch: {
        'line.text': {
            // 当文本变化时，检查是否溢出
            handler() {
                // 使用 nextTick 确保 DOM 更新完毕
                this.$nextTick(() => {
                    const textElement = this.$refs.textContent;
                    if (textElement) {
                        // 如果内容的滚动宽度大于可见宽度，则表示文本被截断
                        this.isTextOverflowing = textElement.scrollWidth > textElement.clientWidth;
                    }
                });
            },
            immediate: true // 立即执行一次，以处理初始文本
        }
    },
    computed: {
        /** 连线路径 **/
        pathData() {
            const fx = this.link.fromNode.x + 50;
            const fy = this.link.fromNode.y + 50;
            const tx = this.link.toNode.x + 50;
            const ty = this.link.toNode.y + 50;

            const dx = tx - fx;
            const dy = ty - fy;
            const len = Math.sqrt(dx * dx + dy * dy);

            if (len === 0) {
                return 'M 0 0';
            }

            const offset = 40;
            const ratio = (len - offset) / len;
            const nx = fx + dx * ratio;
            const ny = fy + dy * ratio;

            return `M ${fx} ${fy} L ${nx} ${ny}`;
        },
        /** 连线中点 **/
        textPosition() {
            const fx = this.link.fromNode.x + 50;
            const fy = this.link.fromNode.y + 50;
            const tx = this.link.toNode.x + 50;
            const ty = this.link.toNode.y + 50;
            return {
                x: (fx + tx) / 2,
                y: (fy + ty) / 2
            };
        },
        /** 计算连线角度 **/
        angle() {
            const fx = this.link.fromNode.x + 50;
            const fy = this.link.fromNode.y + 50;
            const tx = this.link.toNode.x + 50;
            const ty = this.link.toNode.y + 50;
            const rad = Math.atan2(ty - fy, tx - fx);
            return (rad * 180) / Math.PI;
        },
        /** 校正后的角度，确保文本始终朝上 **/
        correctedAngle() {
            let angle = this.angle;
            if (angle < -90) {
                angle = angle + 180;
            } else if (angle > 90) {
                angle = angle - 180;
            }
            return angle;
        }
    }
};
</script>

<style scoped>
.line-text-wrapper {
    position: relative;
    cursor: pointer;
}

.line-text-content {
    width: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    font-size: 12px;
    line-height: 20px;
}

.custom-tooltip-container {
    position: absolute;
    z-index: 100;
    bottom: 20px; 
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
}

.custom-tooltip-content {
    background-color: #303133;
    color: white;
    padding: 8px 10px;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 12px;
    line-height: 1.2;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    position: relative;
}

.custom-tooltip-content::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: #303133 transparent transparent transparent;
}
</style>
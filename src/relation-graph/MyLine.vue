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
        <foreignObject :x="textPosition.x - 25" :y="textPosition.y - 18" width="50" height="20" 
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
            handler() {
                this.$nextTick(() => {
                    const textElement = this.$refs.textContent;
                    if (textElement) {
                        this.isTextOverflowing = textElement.scrollWidth > textElement.clientWidth;
                    }
                });
            },
            immediate: true
        }
    },
    computed: {
        // 提取起点坐标
        startPoint() {
            return {
                x: this.link.fromNode.x + 50,
                y: this.link.fromNode.y + 50,
            };
        },
        // 提取终点坐标
        endPoint() {
            return {
                x: this.link.toNode.x + 50,
                y: this.link.toNode.y + 50,
            };
        },
        /** 连线路径 **/
        pathData() {
            const { x: fx, y: fy } = this.startPoint;
            const { x: tx, y: ty } = this.endPoint;

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
            return {
                x: (this.startPoint.x + this.endPoint.x) / 2,
                y: (this.startPoint.y + this.endPoint.y) / 2
            };
        },
        /** 计算并校正角度，确保文本始终朝上 **/
        correctedAngle() {
            const dx = this.endPoint.x - this.startPoint.x;
            const dy = this.endPoint.y - this.startPoint.y;
            const rad = Math.atan2(dy, dx);
            let angle = (rad * 180) / Math.PI;

            // 当角度超出-90~90度范围时，翻转180度
            if (angle < -90) {
                angle += 180;
            } else if (angle > 90) {
                angle -= 180;
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

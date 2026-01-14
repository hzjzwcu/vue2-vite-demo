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
        <foreignObject :x="textPosition.x - 100" :y="textPosition.y - (hasPart2 ? 40 : 20)" :width="200" :height="hasPart2 ? 45 : 25"
                     :transform="`rotate(${angle}, ${textPosition.x}, ${textPosition.y})`" style="overflow: visible;">
            
            <div v-if="line.data && line.data.part1" class="line-text-wrapper" 
                 @mouseover="showTooltip1 = true" 
                 @mouseleave="showTooltip1 = false"
                 xmlns="http://www.w3.org/1999/xhtml">
                
                <div ref="textContent1" class="line-text-content" :style="{ color: fontColor }">
                    {{ line.data.part1 }}
                </div>

                <div v-if="showTooltip1 && isTextOverflowing1" class="custom-tooltip-container">
                    <div class="custom-tooltip-content">
                        {{ line.data.part1 }}
                    </div>
                </div>
            </div>

            <div v-if="line.data && line.data.part2" class="line-text-wrapper" 
                 @mouseover="showTooltip2 = true" 
                 @mouseleave="showTooltip2 = false"
                 xmlns="http://www.w3.org/1999/xhtml">
                
                <div ref="textContent2" class="line-text-content" :style="{ color: fontColor }">
                    {{ line.data.part2 }}
                </div>

                <div v-if="showTooltip2 && isTextOverflowing2" class="custom-tooltip-container">
                    <div class="custom-tooltip-content">
                        {{ line.data.part2 }}
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
            showTooltip1: false,
            isTextOverflowing1: false, // 文本是否溢出
            showTooltip2: false,
            isTextOverflowing2: false, // 文本是否溢出
        };
    },
    watch: {
        'line.data': {
            handler() {
                this.$nextTick(() => {
                    if (this.line.data && this.line.data.part1) {
                        const textElement1 = this.$refs.textContent1;
                        if (textElement1) {
                            this.isTextOverflowing1 = textElement1.scrollWidth > textElement1.clientWidth;
                        }
                    }
                    if (this.line.data && this.line.data.part2) {
                        const textElement2 = this.$refs.textContent2;
                        if (textElement2) {
                            this.isTextOverflowing2 = textElement2.scrollWidth > textElement2.clientWidth;
                        }
                    }
                });
            },
            deep: true,
            immediate: true
        }
    },
    computed: {
        hasPart2() {
            return !!(this.line.data && this.line.data.part2);
        },
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
        angle() {
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
    width: 200px;
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

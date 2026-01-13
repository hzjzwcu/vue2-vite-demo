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

        <!-- 沿线方向的两行文字 -->
        <text :x="textPosition.x" :y="textPosition.y" :fill="fontColor" font-size="12" text-anchor="middle"
            dominant-baseline="middle" :transform="`rotate(${angle}, ${textPosition.x}, ${textPosition.y})`">
            <tspan v-if="line.text" :x="textPosition.x" dy="-6">{{ line.text }}</tspan>
            <tspan v-if="line.data?.part1" :x="textPosition.x" dy="-6">{{ line.data?.part1 }}</tspan>
            <tspan v-if="line.data?.part2" :x="textPosition.x" dy="14">{{ line.data?.part2 }}</tspan>
        </text>
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
                text1: '',
                text2: ''
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

            // 节点半径假设为 40，可根据 RelationGraph 节点大小调整
            const offset = 40;

            const ratio = (len - offset) / len;

            const nx = fx + dx * ratio;
            const ny = fy + dy * ratio;

            // 从节点中心到目标节点边缘画线
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
        }
    }
};
</script>

<style scoped>
text {
    pointer-events: none;
}
</style>

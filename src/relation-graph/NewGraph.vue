<template>
    <div style="height: calc(100vh - 50px)">
        <RelationGraph ref="seeksRelationGraph" :options="graphOptions">
            <MyLine v-if="line.isHide === false" slot="line" slot-scope="{line, link, relationGraph}" :line="line"
                :link="link" :relation-graph="relationGraph" />
        </RelationGraph>
    </div>
</template>

<script>
import RelationGraph from "relation-graph";
import MyLine from "./MyLine.vue";

export default {
    name: "NewGraph",
    components: { RelationGraph, MyLine },
    data() {
        return {
            graphOptions: {
                moveToCenterWhenRefresh: false,
                zoomToFitWhenRefresh: true,
                layout: { layoutName: "circle" },
            }
        };
    },
    mounted() {
        this.showSeeksGraph();
    },
    methods: {
        showSeeksGraph() {
            const data = {
                rootId: "N3",
                nodes: [
                    { id: "N3", text: "Node 三" },
                    { id: "N4", text: "Node 4" },
                    { id: "N5", text: "Node 5" },
                    { id: "N6", text: "Node 6" }
                ],
                lines: [
                    { from: "N3", to: "N4", data: { part1: "这是一个比较短的连线文本" } },
                    { from: "N4", to: "N5", data: { part1: "这是一个非常非常非常非常非常非常非常非常非常非常非常长的连线文本2，应该会超出200px的限制" } },
                    { from: "N5", to: "N6", data: { part1: "连线文本3-1", part2: "连线文本3-2" } },
                    { from: "N6", to: "N3", data: { part1: "长文本4-1，测试一下多行溢出情况，希望能成功显示完整", part2: "长文本4-2，这是第二行测试文本，看会不会溢出" } }
                ]
            };
            this.$refs.seeksRelationGraph.setJsonData(data, graph => {
                console.log("Graph initialized:", graph);
            });
        }
    }
};
</script>

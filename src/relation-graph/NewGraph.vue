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
                    { from: "N3", to: "N4", text: "连线" },
                    { from: "N4", to: "N5", text: "连线文本2" },
                    { from: "N5", to: "N6", data: { part1: "连线文本3-1", part2: "连线文本3-2" } },
                    { from: "N6", to: "N3", text: "连线文本4" }
                ]
            };
            this.$refs.seeksRelationGraph.setJsonData(data, graph => {
                console.log("Graph initialized:", graph);
            });
        }
    }
};
</script>

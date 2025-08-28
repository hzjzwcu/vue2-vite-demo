<template>
  <div v-if="show" ref="chart" class="tree-chart"></div>
</template>

<script>
import * as d3 from "d3";
import { cloneDeep } from "lodash";
import { selectCropRelationData } from "../assets/mockapi";

export default {
  data() {
    return {
      dataset: [],
      chart: null,
      g: null,
      svg: null,
      root: null,
      tree: null,
      width: 0,
      height: 0,
      duration: 400,
      show: true,
      selectNode: null,
    };
  },
  computed: {
    theme() {
      return "white";
    },
  },
  mounted() {
    this.getData();
  },
  methods: {
    // 获取数据
    async getData() {
      const queryBody = {
        rootCustNo: "1",
        relationClsGrp: "",
        sourceCustNo: "",
        amtU: "01",
      };
      const res = await selectCropRelationData(queryBody);
      const dataset = {
        id: "root",
        parentId: null,
        label: "root",
        isPlain: true,
        clickable: false,
        class: "lvl1",
        rootCustNo: "1",
        isLeaf: "0",
        linkPathDirection: "I",
        relationClsGrp: "1",
        relationClsName: "股东",
        relationClsNo: "1",
        targetCustNo: "11",
        targetCustName: "11",
        targetCustType: "Crop",
        children: [
          {
            id: "1",
            parentId: "root",
            label: "股东",
            isPlain: true,
            clickable: false,
            class: "lvl2",
            rootCustNo: "",
            isLeaf: "0",
            linkPathDirection: "I",
            relationClsGrp: "1",
            relationClsName: "股东",
            relationClsNo: "1",
            targetCustNo: "1",
            targetCustName: "1",
            targetCustType: "Crop",
            children: res.data["1"].map((d) => ({
              ...d,
              class: "lvl3",
              id: d.targetCustNo,
              parentId: "1",
              label: d.targetCustName,
              isPlain: false,
              clickable: true,
              rootCustNo: "",
              relationClsGrp: "1",
            })),
          },
          {
            id: "2",
            parentId: "root",
            label: "对外投资",
            isPlain: true,
            clickable: false,
            class: "lvl2",
            rootCustNo: "1",
            isLeaf: "0",
            linkPathDirection: "I",
            relationClsGrp: "2",
            relationClsName: "对外投资",
            relationClsNo: "2",
            targetCustNo: "2",
            targetCustName: "2",
            targetCustType: "Crop",
            children: res.data["2"].map((d) => ({
              ...d,
              class: "lvl3",
              parentId: "2",
              id: d.targetCustNo,
              label: d.targetCustName,
              isPlain: false,
              clickable: true,
              rootCustNo: "1",
              relationClsGrp: "2",
            })),
          },
          {
            id: "3",
            parentId: "root",
            label: "授信集团关系",
            isPlain: true,
            clickable: false,
            class: "lvl2",
            rootCustNo: "1",
            isLeaf: "0",
            linkPathDirection: "I",
            relationClsGrp: "3",
            relationClsName: "授信集团关系",
            relationClsNo: "3",
            targetCustNo: "3",
            targetCustName: "3",
            targetCustType: "Crop",
            children: res.data["3"].map((d) => ({
              ...d,
              class: "lvl3",
              id: d.targetCustNo,
              parentId: "3",
              label: d.targetCustName,
              isPlain: false,
              clickable: true,
              rootCustNo: "1",
              relationClsGrp: "3",
            })),
          },
          {
            id: "4",
            parentId: "root",
            label: "重要人员",
            isPlain: true,
            clickable: false,
            class: "lvl2",
            rootCustNo: "1",
            isLeaf: "0",
            linkPathDirection: "I",
            relationClsGrp: "4",
            relationClsName: "重要人员",
            relationClsNo: "4",
            targetCustNo: "4",
            targetCustName: "4",
            targetCustType: "Crop",
            children: res.data["4"].map((d) => ({
              ...d,
              class: "lvl3",
              id: d.targetCustNo,
              parentId: "4",
              label: d.targetCustName,
              isPlain: false,
              clickable: true,
              rootCustNo: "1",
              relationClsGrp: "4",
            })),
          },
        ],
      };
      this.dataset = dataset;
      if (this.root) {
        this.show = false;
        d3.selectAll("*").remove();
        this.g = null;
        this.svg = null;
        this.root = null;
        this.tree = null;
        this.selectNode = null;
      }
      this.$nextTick(() => {
        this.show = true;
        setTimeout(() => {
          const dom = this.$refs.chart;
          this.width = dom.offsetWidth;
          this.height = dom.offsetHeight;
          this.initTreeGraph();
        });
      });
    },
    // 初始化树节点
    initTreeGraph() {
      const margin = { top: 20, right: 200, bottom: 20, left: 20 }; // 限制画布尺寸
      const width = this.width - margin.left - margin.right;
      const height = this.height - margin.top - margin.bottom;
      // 初始化svg和group
      this.svg = d3
        .select(this.$refs.chart)
        .style("font-family", "宋体")
        .style("font-size", "12px")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .attr("font-size", "12px");
      this.g = this.svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top}) scale(1)`);
      // 缩放
      const zoomHandle = d3
        .zoom()
        .scaleExtent([0.5, 2])
        .on("zoom", (e) => {
          this.svg.select("g").attr("transform", e.transform);
        });
      // 调用缩放器
      this.svg
        .call(zoomHandle)
        .call(zoomHandle.translateBy, width / 2 - 200, height / 2) // 初始化平移位置
        .on("dbclick.zoom", null); // 禁用双击缩放
      this.tree = d3.tree().size([width, height]); // 创建布局
      // 处理数据
      this.dealData();
    },
    // 使用d3转换数据结构
    dealData(nodes) {
      this.root = d3.hierarchy(this.dataset); // 转换数据
      // 开始布局
      if (this.tree && this.root) {
        this.tree(this.root);
      }
      this.root.descendants().forEach((d) => {
        d.id = d.data.id;
        const maxShowChildren = 5;
        if (d.children?.length > maxShowChildren) {
          d.expandChildren = d.children.slice(maxShowChildren);
          const expandNode = cloneDeep(d.children[maxShowChildren]);
          expandNode.id = `expand_${d.data.id}`;
          expandNode.parent = d;
          expandNode.children = null;
          expandNode._children = null;
          expandNode.data = {
            ...d.data,
            id: `expand_${d.data.id}`,
            parentId: d.data.id,
            name: `更多(${d.expandChildren.length})`,
            isExpandButton: true,
            lvl: "expand",
          };
          d.children = d.children.slice(0, maxShowChildren);
          d.children.push(expandNode);
        }
        d._children = d.children; // 存储未展开的节点
        // if (d.depth >= 2) {
        //   d.children = null; // 横向超过2层收起
        // }
      });
      this.updateGraph(this.root);
    },
    // 绘制节点
    updateGraph(source) {
      if (!this.root) return;

      // 重新布局
      this.tree(this.root);

      // === 控制左右展开 ===
      this.root.children?.forEach((child, i) => {
        if (i < 2) {
          child.y = child.depth * 180; // 向右
        } else {
          child.y = -child.depth * 180; // 向左
        }
      });

      // 递归修正子节点方向
      this.root.each((d) => {
        if (d.depth > 1 && d.parent) {
          if (d.parent.y < 0) {
            d.y = -d.depth * 180; // 父节点在左侧，保持左侧
          } else {
            d.y = d.depth * 180; // 父节点在右侧，保持右侧
          }
        }
      });

      const nodes = this.root.descendants();
      const links = this.root.links();

      // ==== 节点处理 ====
      const node = this.g
        .selectAll("g.gNode")
        .data(nodes, (d) => d.id || (d.id = ++this.i));

      const nodeEnter = node
        .enter()
        .append("g")
        .attr("id", (d) => `g${d.data.id}`)
        .attr("class", "gNode")
        .attr("transform", () => {
          const obj = { x: source?.x0 || 0, y: source?.y0 || 0 };
          return `translate(${obj.y},${obj.x})`;
        })
        .on("click", (e, d) => {
          d.children = d.children ? null : d._children;
          this.updateGraph(d);
        });

      // 🔴 在这里调用
      nodeEnter.each((d, i, nodes) => {
        this.drawNode(d); // 先画矩形和文字
        this.drawCircle(d); // 再画加减号
      });

      node
        .merge(nodeEnter)
        .transition()
        .duration(this.duration)
        .attr("transform", (d) => `translate(${d.y},${d.x})`);

      node
        .exit()
        .transition()
        .duration(this.duration)
        .attr("transform", () => {
          const obj = { x: source?.x || 0, y: source?.y || 0 };
          return `translate(${obj.y},${obj.x})`;
        })
        .remove();

      // ==== 连线处理 ====
      const link = this.g
        .selectAll("path.gLink")
        .data(links, (d) => d.target.id);

      const linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", "gLink")
        .attr("d", () => {
          const obj = { x: source?.x0 || 0, y: source?.y0 || 0 };
          return this.diagonal({ source: obj, target: obj });
        })
        .attr("fill", "none")
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1.5);

      link
        .merge(linkEnter)
        .transition()
        .duration(this.duration)
        .attr("d", this.diagonal);

      link
        .exit()
        .transition()
        .duration(this.duration)
        .attr("d", () => {
          const obj = { x: source?.x || 0, y: source?.y || 0 };
          return this.diagonal({ source: obj, target: obj });
        })
        .remove();

      // 保存旧位置，方便过渡动画
      nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    },
    // 加减号点击事件
    onCollapse(d) {
      const { id } = d.data;
      // 没有子节点
      if (!d.children && !d._children) {
        return;
      }
      d.children = d.children ? null : d._children; // 切换子节点显示状态
      const verticalLine = d3.select(
        `#g${id} .node-circle .node-circle-vertical`
      );
      const strokeWidth = d.children ? 0 : 2;
      verticalLine
        .transition()
        .duration(this.duration)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", strokeWidth);
      this.updateGraph(d); // 更新节点
    },
    // 展开更多按钮点击事件
    onClickExpand(d) {
      const parent = d.parent;
      const maxShowChildren = 5;
      parent.children.push(...parent.expandChildren);
      parent.children.slice(maxShowChildren, 1);
      this.updateGraph(parent); // 更新节点
    },
    // 节点点击事件
    onClickNode(d) {
      if (d.data.clickable) {
        this.$emit("select", d);
        this.selectNode = d;
        this.root.descendants().forEach((node) => {
          this.updateNodeColor(node); // 更新节点颜色样式
        });
      }
    },
    // 更新节点颜色
    updateNodeColor(d) {
      const { isPlain, id } = d.data;
      const { text, bg, border } = this.getNodeColor(d);
      if (isPlain) {
        d3.select(`#borderPath${id}`)
          .style("fill", border)
          .style("stroke", border);
        d3.select(`#border${id}`).style("fill", bg).style("stroke", border);
        d3.select(`#label${id}`).style("fill", text);
      } else {
        d3.select(`#border${id}`).style("fill", bg);
        d3.select(`#label${id}`).style("fill", text);
      }
    },
    // 获取节点颜色配置
    getNodeColor(d) {
      const colorMap = {
        white: {
          lvl1: { text: "#ffffff", bg: "#bcbec2", border: "none" },
          lvl1_plain: { text: "#ffffff", bg: "#bcbec2", border: "none" },
          lvl2: { text: "#ffffff", bg: "#bcbec2", border: "none" },
          lvl2_plain: { text: "#ffffff", bg: "#bcbec2", border: "none" },
          lvl3: { text: "#ffffff", bg: "#bcbec2", border: "none" },
          lvl3_plain: { text: "#ffffff", bg: "#bcbec2", border: "none" },
          expand: { text: "#666666", bg: "#ffffff", border: "none" },
          select: { text: "#666666", bg: "#ffffff", border: "none" },
          select_plain: { text: "#666666", bg: "#ffffff", border: "none" },
        },
        black: {
          lvl1: { text: "#ffffff", bg: "#bcbec2", border: "none" },
          lvl1_plain: { text: "#ffffff", bg: "#bcbec2", border: "none" },
          lvl2: { text: "#ffffff", bg: "#bcbec2", border: "none" },
          lvl2_plain: { text: "#ffffff", bg: "#bcbec2", border: "none" },
          lvl3: { text: "#ffffff", bg: "#bcbec2", border: "none" },
          lvl3_plain: { text: "#ffffff", bg: "#bcbec2", border: "none" },
          expand: { text: "#666666", bg: "#ffffff", border: "none" },
          select: { text: "#666666", bg: "#ffffff", border: "none" },
          select_plain: { text: "#666666", bg: "#ffffff", border: "none" },
        },
      };
      let lvl = d.data.class;
      const isSelect = this.selectNode?.data?.id === d.data.id;
      if (isSelect) {
        lvl = d.data.isPlain ? "select_plain" : "select";
      }
      const res = colorMap[this.theme][lvl] || {};
      return res;
    },
    // 绘制节点
    drawNode(d) {
      try {
        const { id, isExpandButton, clickable, isPlain } = d;
        const nodeClass = isExpandButton ? "expand-block" : "node-block";
        const hoverClass = clickable ? "hover" : "not-allow";
        // 获取文本内容计算宽高
        const g = d3.select(`#g${id}`);
        const text = g
          .append("text")
          .attr("id", `label${id}`)
          .attr("class", `${hoverClass} ${nodeClass}`)
          .attr("x", (dt) => 0)
          .attr("y", (dt) => 5)
          .text((dt) => dt.data.label)
          .style("fill", "#666666");
        // 文本边界框
        const bbox = text.node().getBBox();
        const paddingTopBottom = 8; // 上下内边距
        const paddingLeftRight = 15; // 左右内边距
        let borderWidth = "0px";
        if (isPlain) {
          borderWidth = "1px";
          g.append("path")
            .attr("id", `borderPath${id}`)
            .attr("class", `${hoverClass} ${nodeClass}`)
            .attr("d", (dt) => {
              const x = bbox.x - paddingLeftRight;
              const y = bbox.y - paddingTopBottom;
              const width = 5;
              const height = bbox.height + 2 * paddingTopBottom;
              const radius = 3;
              return `
              M ${x + radius} ${y}
              L ${x + width} ${y}
              L ${x + width} ${y + height}
              L ${x + radius} ${y + height}
              Q ${x} ${y + height} ${x} ${y + height - radius}
              L ${x} ${y + radius}
              Q ${x} ${y} ${x + radius} ${y}
              `;
            })
            .style("fill", "#ffffff")
            .style("stroke", "#666666") //节点边框颜
            .style("stroke-width", 1); //节点边框宽度
        }
        //添加矩形框作为节点背景
        g.insert("rect", "text")
          .attr("id", `border${id}`)
          .attr("class", `${nodeClass} ${hoverClass}`)
          .attr("x", bbox.x - paddingLeftRight)
          .attr("y", bbox.y - paddingTopBottom)
          .attr("width", bbox.width + 2 * paddingLeftRight)
          .attr("height", bbox.height + 2 * paddingTopBottom)
          .style("fill", "#ffffff") // 节点背景颜色
          .style("stroke", "#") // 节点边框颜色
          .style("stroke-width", borderWidth) //节点边框宽度
          .attr("rx", 3) // 节点圆角
          .attr("ry", 3);
        this.updateNodeColor(d);
      } catch (err) {
        console.log("drawNode err", err);
      }
    },
    // 绘制节点展开收起按钮
    drawCircle(d) {
      try {
        const { id, label } = d.data;
        const textWidth = this.getTextWidth(label);
        let gMark = d3
          .select(`#g${id}`)
          .append("g")
          .attr("class", "node-circle hover")
          .attr("stroke", "#ffffff");
        // 调整按钮坐标
        const offsetX = 30 + textWidth;
        gMark
          .append("circle")
          .attr("class", "node-circle")
          .attr("fill", "none")
          .attr("r", 8)
          .attr("fill", "#4669ec")
          .attr("cx", offsetX);
        const padding = 4;
        // 该加减号的横纵线条路径位置
        gMark
          .append("path")
          .attr("class", "node-circle")
          .attr("d", `m ${-padding + offsetX} 0 l ${2 * padding} 0`) // 横线
          .attr("fill", "#ffffff")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 2); //线条宽度
        const strokeWidth = d.children ? 0 : 2;
        gMark
          .append("path")
          .attr("class", "node-circle")
          .attr("d", `m ${offsetX}-${padding} l 0 ${2 * padding}`) //坚线
          .attr("stroke-width", strokeWidth)
          .attr("class", "node-circle-vertical")
          .attr("fill", "#ffffff")
          .attr("stroke", "#ffffff");
      } catch (error) {
        console.log("drawcircle err", error);
      }
    },
    // 绘制斜对角线
    diagonal({ source, target }) {
      try {
        let s = source;
        let d = target;
        return `
          M ${s.y} ${s.x}
          L ${(s.y + d.y) / 2} ${s.x},
          L ${(s.y + d.y) / 2} ${d.x},
          ${d.y} ${d.x}
        `;
      } catch (error) {
        console.log("diagonal error", error);
      }
    },
    //计算文字宽度
    getTextWidth(text) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      context.font = "12px 宋体";
      return context.measureText(text).width;
    },
  },
};
</script>

<style>
.tree-chart {
  width: 100%;
  height: 800px;
}
</style>
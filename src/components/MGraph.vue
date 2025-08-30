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
        .call(zoomHandle.translateBy, width / 2, height / 2) // 初始化平移位置
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
        if (d.depth >= 2) {
          d.children = null; // 横向超过2层收起
        }
      });
      this.updateGraph(this.root);
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
        const { id, isPlain } = d;
        const g = d3.select(`#g${id}`);

        // 防止重复渲染
        g.selectAll("*").remove();

        const paddingTopBottom = 8;
        const paddingLeftRight = 15;

        // 临时插入文本测量宽度
        const text = g
          .append("text")
          .attr("id", `label${id}`)
          .attr("y", 5)
          .text((dt) => dt.data.label)
          .style("fill", "#666666");

        const bbox = text.node().getBBox();
        const textWidth = bbox.width;
        const nodeWidth = textWidth + 2 * paddingLeftRight;
        const nodeHeight = bbox.height + 2 * paddingTopBottom;

        d.nodeWidth = nodeWidth;
        d.nodeHeight = nodeHeight;

        let rectX, textX, textAnchor;
        if (d.data.id === "root") {
          // root 节点居中
          rectX = -nodeWidth / 2;
          textX = 0; // 文本水平居中
          textAnchor = "middle";
        } else {
          // 左右节点保持原逻辑
          rectX = d.y < 0 ? -nodeWidth : -paddingLeftRight;
          textX = rectX + paddingLeftRight;
          textAnchor = "start";
        }

        text.attr("x", textX).attr("text-anchor", textAnchor); // root 居中

        g.insert("rect", "text")
          .attr("id", `border${id}`)
          .attr("x", rectX)
          .attr("y", bbox.y - paddingTopBottom)
          .attr("width", nodeWidth)
          .attr("height", nodeHeight)
          .style("fill", "#ffffff")
          .style("stroke", "#") // 如需边框可改
          .attr("rx", 3)
          .attr("ry", 3);

        this.updateNodeColor(d);
      } catch (err) {
        console.log("drawNode err", err);
      }
    },
    // 绘制节点旁边的加减号
    // 替换 drawCircle
    drawCircle(d) {
      try {
        const { id, label, isLeaf } = d.data;
        if (id === "root" || isLeaf === "1") return;

        // 确保有 nodeWidth（如果没有就回退到文本测量）
        const paddingLeftRight = 15;
        const gap = 12; // 矩形和圆之间的间距
        const nodeW =
          d.nodeWidth || this.getTextWidth(label) + 2 * paddingLeftRight;

        // 清理可能已有的按钮（防止重复）
        d3.select(`#g${id}`).selectAll(".node-circle").remove();

        let gMark = d3
          .select(`#g${id}`)
          .append("g")
          .attr("class", "node-circle hover")
          .attr("stroke", "#ffffff");

        // 当 d.y < 0（左侧），我们把按钮放到矩形的更左边（负方向），
        // 否则放到矩形右边（正方向）
        const offsetX =
          d.y < 0 ? -(nodeW + gap) : nodeW - paddingLeftRight + gap;

        gMark
          .append("circle")
          .attr("class", "node-circle")
          .attr("fill", "#4669ec")
          .attr("r", 8)
          .attr("cx", offsetX);

        const padding = 4;
        gMark
          .append("path")
          .attr("class", "node-circle")
          .attr("d", `m ${-padding + offsetX} 0 l ${2 * padding} 0`)
          .attr("fill", "#ffffff")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 2);

        const strokeWidth = d.children ? 0 : 2;
        gMark
          .append("path")
          .attr("class", "node-circle")
          .attr("d", `m ${offsetX}-${padding} l 0 ${2 * padding}`)
          .attr("stroke-width", strokeWidth)
          .attr("class", "node-circle-vertical")
          .attr("fill", "#ffffff")
          .attr("stroke", "#ffffff");
      } catch (error) {
        console.log("drawcircle err", error);
      }
    },
    // ==== 绘制连接线（折线 + 箭头） ====
    diagonal({ source: s, target: t }) {
      try {
        if (!s || !t) return "";

        // 与 drawNode 保持一致的常量
        const PADDING_LR = 15; // 文本左右内边距
        const GAP = 12; // 矩形与加号之间的 gap
        const BTN_R = 8; // 加号圆半径
        const EXTRA = 6; // 额外安全间距
        const MIN_BRANCH = 36; // 最小延伸距离

        // 如果还没测到 nodeWidth，就兜底
        const nodeW =
          s.nodeWidth ||
          (s.data && s.data.label
            ? this.getTextWidth(s.data.label) + 2 * PADDING_LR
            : 80);

        // --- 计算相对于 group 原点的局部坐标 ---
        const rectLeftRel = s.y < 0 ? -nodeW : -PADDING_LR;
        const rectRightRel = rectLeftRel + nodeW;
        const circleCenterRel =
          s.y < 0 ? -(nodeW + GAP) : nodeW - PADDING_LR + GAP;
        const maxExtent = Math.max(
          Math.abs(rectLeftRel),
          Math.abs(rectRightRel),
          Math.abs(circleCenterRel) + BTN_R
        );
        const branchDist = Math.max(maxExtent + EXTRA, MIN_BRANCH);

        // 根据子节点方向决定左右符号
        const dir = t.y >= 0 ? 1 : -1;
        const xBranch = s.y + dir * branchDist;

        // ---- 折线路径 ----
        const path = [
          `M ${s.y},${s.x}`,
          `H ${xBranch}`,
          `V ${t.x}`,
          `H ${t.y}`,
        ].join(" ");

        // ---- 计算箭头位置（最后一条水平线） ----
        t._arrow = {
          x1: xBranch,
          y1: t.x,
          x2: t.y,
          y2: t.x,
          direction: t.data?.linkPathDirection === "I" ? "end" : "start",
        };

        return path;
      } catch (e) {
        console.error("diagonal error", e);
        return "";
      }
    },

    // ==== 更新树图 ====
    updateGraph(source) {
      if (!this.root) return;

      // 重新布局节点
      this.tree.nodeSize([40, 370])(this.root);

      const nodes = this.root.descendants();
      const links = this.root.links();

      // ==== 控制左右展开 ====
      if (this.root.children) {
        const leftTree = [];
        const rightTree = [];

        this.root.children.forEach((child, i) => {
          if (i < 2) rightTree.push(child); // 前两个右边
          else leftTree.push(child); // 后两个左边
        });

        const leftMiddleOffset = (leftTree[0].x + leftTree.at(-1).x) / 2;
        const rightMiddleOffset = (rightTree[0].x + rightTree.at(-1).x) / 2;

        const leftDepth =
          d3.max(leftTree, (node) =>
            d3.max(node.descendants(), (d) => d.depth)
          ) || 0;
        const rightDepth =
          d3.max(rightTree, (node) =>
            d3.max(node.descendants(), (d) => d.depth)
          ) || 0;
        const maxDepth = Math.max(leftDepth, rightDepth);

        const availableWidth = 400;
        const hGap = availableWidth / (maxDepth || 1);

        leftTree.forEach((node) => {
          node.descendants().forEach((d) => {
            d.y = -d.depth * hGap;
            d.x -= leftMiddleOffset;
          });
        });

        rightTree.forEach((node) => {
          node.descendants().forEach((d) => {
            d.y = d.depth * hGap;
            d.x -= rightMiddleOffset;
          });
        });
      }

      // ==== 绘制节点 ====
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

      nodeEnter.each((d) => {
        this.drawNode(d);
        this.drawCircle(d);
      });

      node
        .merge(nodeEnter)
        .each((d) => {
          this.drawCircle(d);
        })
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

      // ==== 连线处理（箭头 + 文本） ====
      const link = this.g
        .selectAll("path.gLink")
        .data(links, (d) => d.target.id);
      const linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", "gLink")
        .attr("fill", "none")
        .attr("stroke", "#ddd")
        .attr("stroke-width", 1.5)
        .attr("d", () => {
          const obj = { x: source?.x0 || 0, y: source?.y0 || 0 };
          return this.diagonal({ source: obj, target: obj });
        });

      // 定义箭头 marker（只需一次）
      if (this.svg.select("defs marker#arrow").empty()) {
        this.svg
          .append("defs")
          .append("marker")
          .attr("id", "arrow")
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 5)
          .attr("refY", 0)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M0,-5L10,0L0,5")
          .attr("fill", "#ddd");
      }

      link
        .merge(linkEnter)
        .transition()
        .duration(this.duration)
        .attr("d", (d) => this.diagonal(d))
        .attr("marker-end", (d) =>
          d.target._arrow?.direction === "end" ? "url(#arrow)" : null
        )
        .attr("marker-start", (d) =>
          d.target._arrow?.direction === "start" ? "url(#arrow)" : null
        );

      link
        .exit()
        .transition()
        .duration(this.duration)
        .attr("d", () => {
          const obj = { x: source?.x || 0, y: source?.y || 0 };
          return this.diagonal({ source: obj, target: obj });
        })
        .remove();

      // ==== 连线文本处理 ====
      const linkText = this.g
        .selectAll("text.link-text")
        .data(links, (d) => d.target.id);
      const linkTextEnter = linkText
        .enter()
        .append("text")
        .attr("class", "link-text")
        .attr("dy", -2)
        .style("font-size", 12)
        .style("fill", "#666")
        .attr("text-anchor", "middle")
        .text((d) => {
          if (!d.target.data.relationClsName) return "";
          const name = d.target.data.relationClsName;
          if (name.length <= 4) return name;
          return name.match(/.{1,4}/g).join("\n");
        });

      linkText
        .merge(linkTextEnter)
        .transition()
        .duration(this.duration)
        .attr("x", (d) =>
          d.target._arrow
            ? (d.target._arrow.x1 + d.target._arrow.x2) / 2
            : (d.source.y + d.target.y) / 2
        )
        .attr("y", (d) =>
          d.target._arrow ? d.target._arrow.y1 : (d.source.x + d.target.x) / 2
        );

      linkText.exit().remove();

      // ==== 保存旧位置 ====
      nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
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
export const treeConfig = Object.freeze({
  nodeWidth: 180,
  nodeHeight: 18,
  /**折线转折点位置比例 */
  linkTuringPointRatio(d: any) {
    if (d.depth === 1) return 1 / 2;
    return 2 / 3;
  },
  animationDuration: 500,
  // animationDurationFast: 200,// 设置wrapper的动画速度，会导致展开收起的动画也变，很奇怪
  className: {
    svg: 'tree-svg',
    rootGroup: 'main-group',
    linksGroup: 'links-group',
    nodesGroup: 'nodes-group',
    nodeGroup: 'node',
    linkGroup: 'node-link',
  },
} as const);

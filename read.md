d3 tree 实现双向动画树总结
原创
已于 2024-12-10 13:28:03 修改
·
2.8k 阅读
·

3
·
 10
·
CC 4.0 BY-SA版权
文章标签：
#动画
#javascript

使用d3.js 实现双向tree，并实现节点展开收起动画。

使用svg 绘制。

效果图


d3
 d3可与快速选择批量的节点。类似jquery一样可选择元素并更改其属性值。

选择节点并设置属性
import * as D3 from 'd3';
let svg = D3.select('.tree')
  .attr("width", 800)
  .attr("height", 600)
  .attr("class", "d3-tree")
javascript
运行
 添加子节点
svg.append('g')
javascript
运行
append函数返回了添加节点的引用，因此，后面继续链式调用.attr() 则为在g 元素上进行操作。

移除选中的节点
svg.selectAll('g').remove();
javascript
运行
 selectAll 会将满足选择器条件的节点选中，后面链式调用remove() 方法，表示将这些选中的节点移除。

不像document.querySelectAll 一样返回一个数组，再遍历移除。d3 链式调用作用于其选中的集合。这也是我感觉比较好的地方。

d3.tree
是给树形结构的对象加上x,y,depth 属性。

默认状态下。

根节点位置计算为（0,0）
子节点垂直向下。
const treeLayout = D3.tree<TreeData>()
    .nodeSize([treeConfig.nodeHeight, treeConfig.nodeWidth]) // 设置tree节点的大小
    .separation((a, b) => {
      // 根据是否为同一父节点设置节点距离比例
      return a.parent === b.parent ? 1 : 2;
    });
javascript
运行
它计算出来的是密集树，nodeSize 就是下面图的蓝色区域，不影响布局。黄点为最总计算出的坐标。

separation 方法用来控制节点间的间距。回调中判断相同父节点的间距为1(也就是没有距离)，不同父节点间距离为两倍。

节点间没有间距
节点间没有间距
 
不同父节点间为1倍间距
 此时，d3 tree 的配置已经好了。（转为横向后面再说）

接着就需要将树形结构的对象传入，treeLayout，使其生成坐标。

普通的数据类型是不行了。必须要将数据源使用D3.hierarchy(data)进行包装。

D3.hierarchy 
比方我的源数据data是这样



D3.hierarchy(data) 转换后

 

可以看到所有数据都被包了一层，添加了一些属性，depth，height，parent，原数据都被装入data属性中。

之后使用这个包装过的数据，调用treeLayout 即可计算出树节点的位置信息。

const nodes = treeLayout(hierarchyData)
javascript
运行
 

这样每个节点就有x,y坐标了

变为横向树
 实际上就是把x,y 互换位置。这样树图就变成横向了。

nodes.each(a => {
  [a.x, a.y] = [a.y, a.x]; // 旋转90度
});
javascript
运行
each 方法也是d3自带的，用于遍历树的方法，否则自己遍历也可以。

 变为左右两侧树
其先将树右边的上半部分x值取反。



此时需要将左右侧树居中

居中计算方式为，y坐标点 - (children[0] + children.at(-1))/2

所以左侧树的数据务必要在数组的一端。如children:[{left},{left},{right},{right}]; 或children:[{right},{right},{left},{left}];

否则就会导致左右不对称了。

下面是分割树的代码：

/**将树分成左右两边，横坐标置反 */
export function separateTree(nodes: HierarchyPointNode<TreeData>) {
  const leftTree: HierarchyPointNode<TreeData>[] = [];
  const rightTree: HierarchyPointNode<TreeData>[] = [];
  nodes.children?.forEach(child => {
    if (child.data.align === 'left') leftTree.push(child);
    else rightTree.push(child);
  });
  // 左右树分开，并垂直居中
  const leftMiddleOffset = leftTree.length > 1 ? (leftTree[0].y + leftTree.at(-1)!.y) / 2 : leftTree[0]?.y || 0;
  leftTree.forEach(a => {
    a.descendants().forEach(b => {
      b.x = -b.x;
      b.y -= leftMiddleOffset;
    });
  });
  const rightMiddleOffset = rightTree.length > 1 ? (rightTree[0].y + rightTree.at(-1)!.y) / 2 : rightTree[0]?.y || 0;
  rightTree.forEach(a => {
    a.descendants().forEach(b => {
      b.y -= rightMiddleOffset; // 垂直居中
    });
  });
}
TypeScript
运行
此时数据准备好就可以开始绘制节点了。

绘制节点
 const allNodesGroup = this.#$nodeGroup
      .selectAll('.' + treeConfig.className.nodeGroup)
      .data(this.#nodes.descendants(), (d: any) => keyGen(d.data, this.key))
      .join(
        enter => enter ,
        update => update,
        exit => exit 
        },
      )
      .attr('class','.' + treeConfig.className.nodeGroup );
javascript
运行
selectAll 函数将返回满足指定选择器的集合。

data 入参为nodes.descendants(), descendants 意为“后代”的意思。第二个参数理解为唯一id。

注：回调参数d 的类型 hierarchy对象类型，因此用d.data访问源数据。

其实就是将nodes 的树形结构展平为一维数组结构了。

这里使用data 方法，就可以在selectAll 找不到的时候，生成节点。data的第二个参数为唯一键。这个唯一键用于标识下面join函数中新节点：enter，更新的节点：update，移除的节点：exit。

重新组织语言。。。

首先根据selectAll函数得到节点（当然第一次为空），与data函数中的节点做diff比较。有点像vue这样的虚拟dom的感觉，比较后，d3就能判断哪些节点是新的，哪些节点是被移除的了，我们只需要改变数据源，之后再在entry，exit回调中对这些动作的节点做操作即可。（这里不说更新是因为我没用到，也不知道什么时候会进入update回调）

join函数的返回为enter 回调的返回。

因此我在enter回调中新增节点。比如

enter => {
  const g = enter.append('g');
  const rootNodes = g.filter(node => node.depth === 0);
  const parentNodes = g.filter(node => node.data.nodeType === 'parent');
  const moreNodes = g.filter(node => node.data.nodeType === 'more');
  const leafNodes = g.filter(node => !node.data.nodeType);
  const lineTextNodes = g.filter(node => Boolean(node.data.lineText));
  addRootNode.call(this, rootNodes);
  addParentNode.call(this, parentNodes);
  addMoreNode.call(this, moreNodes);
  addLeafNode.call(this, leafNodes);
  addLineText.call(this, lineTextNodes);
  return g;
},
javascript
运行
这里我将每个节点都包一层g标签，创建节点的过程都抽出成函数了。

用添加叶子节点的函数举例子：

export function addLeafNode(this: Tree, d3Selection: NodeSelection) {
  const fObj = filterNotVisibleNode
    .call(this, d3Selection)
    .append('foreignObject')
    .attr('width', leafNodeWidth)
    .attr('height', leafNodeHeight)
    .attr('class', 'leaf-node-wrapper')
    .attr('transform', d => {
      return `translate(-${d.x < 0 ? leafNodeWidth : 0},-${leafNodeHeight / 2})`;
    })
    .on('click', (e, d) => {
      this.dispatchEvent('leafClick', d.data, d);
    });
  fObj
    .append('xhtml:div')
    .attr('class', 'leaf-node')
    .attr('title', d => d.data.name)
    .style('text-align', d => d.x < 0 && 'right') // 左侧树，右对齐
    .append('xhtml:span')
    .attr('class', 'node-text')
    .text(d => d.data.name);
  return fObj;
}
TypeScript
运行
绘制节点由于借用html DOM的文字排版能力。这里创建了ForeignObject元素，用于在svg中插入html元素。再借助transform 微调节点到正确位置。

绘制连接线
this.#$linkGroup
  .selectAll('.' + treeConfig.className.linkGroup)
  .data(this.#nodes.links(), (d: any) => keyGen(d.target.data, this.key)) 
...
javascript
运行
和绘制节点类似，不同的是这里data中传入了nodes.links() 。

这个方法将nodes的树形结构展平并将每个节点变为{ source, target }对象的形式。比如source 为root节点，target为连接的节点。

用descendents()也可以，因为每个节点都可通过parent的方式访问父节点信息，不同的是，要额外处理根节点的情况，因为parent == null。

使用links() 函数更方便。

既然知道sourceNode ，targetNode 的位置信息，就可以使用svg 的path标签绘制连接线了。

连接线的转折点我选择定在开始结束位置的1/2处。

折叠和展开节点
为节点添加点击事件。我把可展开的节点记做“parent”。

节点元素.on('click', (e, d) => {
 
});
javascript
运行
上面提到，我这里标的回调参数d，其类型为hierarchy类型。因此对节点乃至树的信息具有完整的访问权限。

折叠节点就是将原d.children中的内容保存到自定义的一个属性中比如d._children。这样下次渲染树的时候就不会渲染其子节点了。同时，这些节点也被join函数识别成为exit的节点。

因此需要在node和link 的exit 的回调中，将这些节点移除。

exit => {
    exit.remove();
}
javascript
运行
折叠展开动画
动画的实现方式均遵循FLIP(First, Last, Invert, Play)动画技术，即在位置发生改变后，在改变后的那一时刻，通过transform 移动到原来的位置，再通过transition播放动画，将元素从刚才的位置移动到现在的位置。这里不过多讨论此技术。

因此基于这种动画模式来说，在元素位置变动后，知道这个元素之前的位置，就十分重要了。

首先看收起节点

收起节点动画
在收起的节点中保存父节点的位置信息。

在join的exit回调用，通过动画更新节点的位置。

由于节点的位置在收起后有可能发生改变，因此，就需要在树节点位置更新后再获取父节点的位置。这里就在exit回调用获取父节点位置。

其次，考虑节点不只有一级的，点一级节点后，2级，3级，4级...所有下面的节点都要移动到点击的这个节点上。

exit => {
  // 节点移除，收起动画
  exit
    .filter((d: any) => !d.transition)
    .transition()
    .duration(treeConfig.animationDuration)
    .attr('opacity', 0)
    .attr('transform', (d: any) => {
      const position = parentPositionStore.getPosition(d, d.exitToParent).join(',');
      return `translate(${position})`;
    })
    .remove();
},
javascript
运行
根据这个思路，在点击一个节点时，将其所有子节点的移动目标设置为当前节点。

如下

toggleNode(d: any) {
  if (d.depth !== 0) {
    if (d.children && !d._children) {
      // 需要收起
      eachChildren(d.children, (child: any) => {
        child.exitToParent = keyGen(d.data, this.key); // 表明
      });
      d._children = d.children;
      delete d.children;
    } else if (d._children) {
      // 展开
     ...
    }
  }
}
javascript
运行
 eachChildren 是我封装的，用于遍历树节点的方法。

可以看到，在每个子节点上都标记了需要收起到的节点的id (exitToParent)

回到上面exit回调的代码，

position 的位置从当前位置向上找，直到找到exitToParent记录的id的节点。

实现方式为while 循环，d.parent 一层层向上找。

因此，考虑到节点深且多的画，每个节点都走这个逻辑就可能会有性能问题。

为解决这个问题，我用上面代码中使用的parentPositionStore做了Map缓存。

展开节点动画
展开节点相对收起来说更顺利一些，步骤为

在所有后代节点中记录点击节点的位置信息。
在join函数的entry回调中移动到记录的位置信息。
删除记录的位置信息。
toggleNode(d: any) {
  if (d.depth !== 0) {
    if (d.children && !d._children) {
      // 需要收起
      //...
    } else if (d._children) {
      // 展开
      d.lineStartPosition = [d.x, d.y];
      d.children = d._children;
      eachChildren(d.children, (child: any) => {
        child.nodeStartPosition = [d.x, d.y]; // 动画开始位置
        child.lineStartPosition = [d.x, d.y]; // 动画开始位置
      });
      delete d._children;
    }
  }
}
javascript
运行
这里也记录了连接线节点的动画位置信息。

对于节点来说，在刚才的nodes.join() 的entry回调中，没有设置节点的位置。而是重新选中所有需要动画的节点，根据FLIP动画规则，通过transform移动到节点动画开始位置。

再将所有节点通过动画移动到实际的位置。

allNodesGroup
  .filter((d: any) => d.nodeStartPosition)
  .attr('opacity', 0)
  .attr('transform', (d: any) => {
    const transform = `translate(${d.nodeStartPosition[0]}, ${d.nodeStartPosition[1]})`;
    delete d.nodeStartPosition;
    return transform;
  });
// 节点展开动画
allNodesGroup
  .transition()
  .duration(treeConfig.animationDuration)
  .attr('opacity', 1)
  .attr('transform', d => `translate(${d.x},${d.y})`);
}
javascript
运行
同时用opacity 做0-1的透明度渐变。

若节点没有nodeStartPosition 属性，则节点位置(transform)不变，则不会有动画效果。

这里补充一下，所有节点我都是在root节点(0,0) 位置生成，通过transform移动到实际位置的。

展开收起连接线
和展开收起节点方式大体类似。

添加查看更多节点
鉴于产品需求，当叶子节点超过5个时，其余叶子节点收起并展示为“查看更多”节点。

这个效果和展开收起节点的方案基本一致

children.slice 多余叶子节点。
添加“查看更多”节点。
“查看更多”节点的depth,heigth,parent属性要保持与当前兄弟叶子节点相同。
将节点保存到一个临时属性中。
点击展开后，从临时属性中恢复节点信息到children，
移除“查看更多”节点
多余节点保存进临时变量的操作，我在通过D3.hierarchy(data)转换数据之后就进行了。

点击查看更多节点代码：

/** 点击查看更多 */
showMore(d: HierarchyPointNode<TreeData>) {
  const { parent } = d;
  if (!parent) return;
  // 去除"查看更多"节点
  parent.children = parent.children?.slice(0, -1);
  (d as any).transition = 'fadeOut'; // 节点动画临时变为 渐出
  eachChildren((d as any).moreData, (child: any) => {
    child.nodeStartPosition = [d.x, d.y]; //新节点从父节点移出
    child.lineStartPosition = [parent.x, parent.y, d.x, d.y]; // 曲线开始与结束位置
  });
  parent.children?.push(...(d as any).moreData);
  delete (d as any).moreData;
}
TypeScript
运行
这里需要注意的是展开更多的动画了。

我希望效果和节点展开是不一样的，展开的节点不能从它的父节点飞出来吧。

所以我做了特殊判断，加了transition属性用于区分。同时曲线动画开始结束位置不再从其父节点展开了，所以lineStartPosition 传递了4个值。分别是[startx,starty,endx,endy]（曲线两端坐标）

同时“展开更多”此节点会进入join的exit回调，这个节点的移除动画也要做相应调整。

这里不过多赘述。

高亮节点
实现如下效果



主要关注的逻辑如下:

命中叶子节点，需要将整条链路都高亮。
命中节点父节点已被收起时要主动展开。
命中的叶子节点在“查看更多”中时，也需要主动展开。
/**
 * 高亮
 * @param id
 */
highlightNode(ids: string[] | string = []) {
  if (typeof ids === 'string') ids = [ids];
  if (!ids.length) {
    this.resetHighlight();
    this.renderTree();
    return;
  }
 
  const highlightHelper = new HighlightHelper({
    highlightKeyName: 'highlight',
    highlightRule: node => ids.includes(keyGen(node.data, this.key)) && node.data.nodeType !== 'more',
  });
  this.#highlightMode = highlightHelper.setHighlightFlag(this.#nodes); // 增加高亮标记
 
  const expandStack = highlightHelper.getExpandStack();
  // 从根节点开始一步步展开
  let n: any;
  while ((n = expandStack.pop())) {
    if (n._children) this.toggleNode(n); // 展开节点
    if (n.moreData) this.showMore(n); // 展开“查看更多”
  }
  this.updateTreeNodePosition();
  this.renderTree();
}
TypeScript
运行
由于从叶子节点往根节点依次展开会有问题，所以我先记录了需要展开的顺序，并从根节点往叶子节点展开；

其中HighlightHelper主要为给节点增加高亮的class类，代码略多，就抽离出去了。

HighlightHelper.prototype.getExpandStack 得到需要展开的节点数组。

缩放与拖拽
直接使用d3.zoom 的封装。

这里要注意的是，我在svg标签上使用d3.zoom，发现鼠标点击事件被停止冒泡了。

其次关于调用d3.zoom.scaleBy/translateBy 等等方法，第一个参数务必传当时监听的对象。

比如

this.#$svg.call(this.#$zoom as any);
this.#$zoom.scaleBy(this.#$svg.transition().duration(200) as any, num);
TypeScript
运行
 否则zoom不会保存调用这种方式后的位置信息。一旦拖拽，滚动，就会从上次的位置开始。

大数据优化
根据前端表格虚拟滚动的经验，数图也可以将可视区外的节点隐藏。

方案为：

拖动或缩放后。
remove所有节点和连接线。
entry 节点的时候，计算每个节点的x,y坐标，把不在可视区中的数据过滤。
重绘树图。
对于节点是否在可视区的判断，只需要简单判断节点所处的坐标是否在svg盒子外即可。

需要注意的是连接线(link)的判断。逻辑为：link有一部分在可视区内就需要展示连接线。

这时候需要知道link的开始坐标(x1, y1)和结束坐标(x2, y2)。以x方向上的坐标进行举例：

使线段最左侧 < 容器最右侧，线段最右侧 > 容器最左侧。符合该条件就表示此线段的x部分与容器x部分有重合。

判断y方向的是否进入可视区同理。

应该有更好的优化方案。在不删除所有节点的情况下。

d3.zoom.on('end'),会在zoom动作结束后触发。

但是这个该死的zoom又停止冒泡了点击事件。之前在节点上on('click' 的这些事件都失效了，改成on('mousedown' 才行。这个还未弄清楚有没有更好的方式。
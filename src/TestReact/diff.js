// 核心是比较新旧节点，找到差异更新差异。将虚拟dom转真实dom并挂载相应节点。
/**
○ 类型不同时，不再进行比较。直接使用新的 virtual dom 对象 生成新的 dom 对象。最后使用新的dom对象替换旧的dom对象。
  ■ const newElement = createDomElement(vDom);  oldDom.parentNode.replaceChild(newElement, oldDom);
○ 类型相同时：【元素节点，还是文本节点】
  ■ 元素节点比较：比较元素属性是否相同。然后递归子节点也进行一样的比较。
    ● 不同时：更新元素节点属性。创建元素节点 virtual dom 对应的真实dom. document.createElement('元素标签名')
    ● 不管是文本节点还是元素节点，都判断是否有子节点：
      ○ 有的话递归子节点。【这个操作无法中断，递归直到结束。react 16版本前的 diff 算法的核心问题就在这里。递归子节点无法中断。如果节点存在子节点会一直递归直到结束。假如页面内容复杂，嵌套深，浏览器又是单线程执行机制，当递归节点的时候用户有交互或者页面有动画效果无法及时响应，可能用户体验不好，也可能存在页面掉帧甚至卡顿的情况。fiber针对这个核心问题做了改进。将更新分成若干个小任务。】
  ■ 文本节点比较：比较文本内容是否相同。不同时更新文本内容。创建文本节点 virtual dom 对应的的真实dom。document.createTextNode('文本')
  ■ 子节点比较： 子节点数量如果不同并且旧节点 virtual dom 的子节点数量更多时，进行删除节点操作。【此时有key属性可以减少dom操作】
  何时进行新增节点操作？？
*/

// 插入，移动，删除

// 没有key时的比较
const patchUnkeyChildren = (oldVdom, vDom) => {
  c1 = oldVdom.childNodes || EMPTY_ARR
  c2 = vDom.childNodes || EMPTY_ARR
  const oldLength = c1.length
  const newLength = vDom.length
  const commonLength = Math.min(oldLength, newLength);
  let i
  for (i = 0; i < commonLength; i++) { /* 依次遍历新老vnode进行patch */
    patch(c1[i], c2[i]);
  }
  if (oldLength > newLength) { /* 老vnode 数量大于新的vnode，删除多余的节点 */
    // removeChildren(c1, parentComponent, parentSuspense, true, commonLength)
  } else {
    /* 老vnode 数量小于新的vnode，创造新的节点 */
    // createChildren(c2, parentComponent,)
  }
}
// 有key时的比较
const patchKeyedChildren = () => {
  /* 从头对比找到有相同的节点 patch ，发现不同，立即跳出*/
  while (i <= e1 && i <= e2) {
    const n1 = c1[i]
    const n2 = (c2[i] = optimized
      ? cloneIfMounted(c2[i] as VNode)
      : normalizeVNode(c2[i]))
      /* 判断key ，type是否相等 */
    if (isSameVNodeType(n1, n2)) {
      patch(
        n1,
        n2,
        container, 
        parentAnchor,
        parentComponent,
        parentSuspense,
        isSVG,
        optimized
      )
    } else {
      break
    }
    i++
  }
}

const diff = (vDom, container, oldVdom) => {
  const oldComponent = oldVdom && oldVdom.component;
  // 转成普通类型的 virtual dom。
  if (!oldVdom) {
    // 1. 当旧节点不存在时，说明属于新增内容，直接创建真实dom
    mountElement(vDom, container, oldDom); //vDom -> dom -> 挂载
  } else if (typeof vDom.type === 'function') {
    // 函数组件或者类组件类型的 virtual dom
    if (isSameComponent(vDom, oldComponent)) {
      // 同一个组件，更新组件   TODO: ?
    } else {
      if (vDom.type !== oldVdom.type) {
        // 类型不同时,不再进行比较。
        // 替换整个组件下的所有子节点。
      } else {
        // 类型相同时，比较 virtual DOM tree。
        if(shouldComponentUpdate(vDom)) {// 对于同一类型的组件，有可能其 Virtual DOM 没有任何变化
          //  ■ 将函数组件类型的 virtual dom -> 普通类型的 virtual dom- nextVirtualDOM
          //  ■ 将类组件类型的 virtual dom -> 普通类型的 virtual dom- nextVirtualDOM

          // TODO: ? class/component / jsx virtual dom 数据结构
          diff(nextVirtualDOM, container, oldVdom); // 【diff】
        }
      }
    }
  } else if (typeof vDom.type !== 'function') {
    // 普通类型的 virtual dom
    if (vDom.type !== oldVdom.type) {
      // 类型不同时
      // 不再进行比较。1. 使用新的 virtual dom 对象 生成新的 dom 对象。2. 使用新的dom对象替换旧的dom对象。
      const newElement = createDomElement(vDom); // 根据虚拟dom创建真实dom对象并返回。
      oldVdom.parentNode.replaceChild(newElement, oldVdom);
    } else {
      // 类型相同时：

      /**
       * 当节点处于同一层级时，React diff 提供了三种节点操作，分别为：插入【新的对象老集合中没有】、移动[老节点有新的类型] 和 删除 [老节点在，但内容不同；老节点不在]。
       */

      let el = oldVdom.el;
      if (vDom.type === 'text') {
        // 文本节点： 如果文本节点内容不同时更新内容
        updateTextNode(el, vDom, oldDOM);
      } else {
        // 元素节点：更新元素节点属性。
        // 遍历元素节点的属性key，获取新旧节点的属性值进行比对。不同时setAttribute()更新。
        // 如果新的元素节点对应的属性值不存在，说明元素属性被删除。remoteAttribute()
        updateNodeElement(el, vDom, oldDOM);
      }

      // 第一层比对在上面已经完成了。递归子元素进行下一层的比对
      // 1. 将拥有key属性的子元素放置在一个单独的对象中
      let keyedElements = {};
      for (let i = 0, len = oldVdom.childNodes.length; i < len; i++) {
        let domElement = oldVdom.childNodes[i];
        if (domElement.nodeType === 1) {// 元素类型
          // 如果有key的话
          let key = domElement.getAttribute('key');
          if (key) keyedElements[key] = domElement;
        }
      }
      //【使用key可以减少dom操作，提高性能】
      let hasNoKey = Object.keys(keyedElements).length === 0; // 判断当前节点的子元素是否存在key
      if (hasNoKey) {
        // 没有key,递归对比子节点  【diff】
        // patchUnkeyChildren(oldVdom, vDom);
        vDom.children.forEach((child, i) => {
          diff(child, oldVdom, oldVdom.childNodes[i]);
        });
      } else {
        // 有key, 循环 virtualDOM 的子元素 获取子元素的 key 属性，
        vDom.children.forEach((child, i) => {
          let key = child.props.key;
          // 进行插入或者新增操作
          if (key) {
            let domElement = keyedElements[key];
            if (domElement) {
              // 插入
              if (
                oldVdom.childNodes[i] &&
                oldVdom.childNodes[i] !== domElement
              ) {
                oldVdom.insertBefore(domElement, oldVdom.childNodes[i]);
              }
            } else {
              // 新增元素
              mountElement(child, oldVdom, oldVdom.childNodes[i]);
            }
          }
        });
      }

      // 统一删除节点    TODO： 删除。找到对应的key节点删除
      let oldChildNodes = oldVdom.childNodes; // 获取旧节点
      // 旧节点的子节点数量 > 新节点的子节点数量，说明删除了节。找到对应的节点删除
      if (oldChildNodes.length > vDom.children.length) {
        if (hasNoKey) {
          // 没有key
          // 有节点需要被删除
          for (
            let i = oldChildNodes.length - 1;
            i > vDom.children.length - 1;
            i--
          ) {
            // 是否真实删除？ 这里不能直接删除。
            removeNode(oldChildNodes[i]); // 删除 (旧节点数量 - 新节点数量) 个节点
          }
        } else {
          // 有key
          // 通过key属性删除节点
          for (let i = 0; i < oldChildNodes.length; i++) {
            let oldChild = oldChildNodes[i];
            let oldChildKey = oldChild._virtualDOM.props.key;
            let found = false;
            for (let n = 0; n < vDom.children.length; n++) {
              // 排除不用删除的节点
              if (oldChildKey === vDom.children[n].props.key) {
                found = true;
                break;
              }
            }
            if (!found) {
              removeNode(oldChild);
            }
          }
        }
      }
      // 类型相同时的处理结束
    }
  }
};

export default diff;

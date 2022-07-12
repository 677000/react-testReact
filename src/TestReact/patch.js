function patch(oldVnode: Vnode | Element, vnode: VNode): Vnode {
  let el = oldVnode.el; // 真实dom
  // 1. 对比新旧节点之前判断传进来的是 vnode 还是 element。不是vnode就转成vnode.
  if (!isVnode(oldVnode)) oldVnode = transferVnode(oldVnode);
  // 2.对比新旧节点是否相同节点 key & sel
  if (sameVnode(oldVnode, vnode)) {
    // 如果两个节点完全相同，不用比较不用处理直接return
    if (oldVnode === vnode) return;
    // 如果节点相同，判断是文本节点还是元素节点
    if (textVnode(vnode)) {
      // 文本节点。
      createTextVnode(el, vnode, oldVnode); // 根据vnode创建真实dom，更新文本内容
    } else {
      // 元素节点
      createSelVnode(el, vnode, oldVnode); // 更新当前元素节点的属性

      // 节点比较视频解析： https://www.bilibili.com/video/BV1b5411V7i3?from=search&seid=10479892515502817729&spm_id_from=333.337.0.0

      // 比较子节点。没有key时。
      if (
        oldVnod.children &&
        vnode.children &&
        oldVnode.children !== vnode.children
      ) {
        // 如果两者都有子节点，则比较子节点  updateChildren(el, oldVnod.children, vnode.children);具体比较的内容-->视频传送
        // https://www.bilibili.com/video/BV1b5411V7i3?from=search&seid=10479892515502817729&spm_id_from=333.337.0.0
        // 【递归】遍历元素节点的子节点
        vnode.children.forEach((child, i) => {
          patch(oldVnode.children[i], child);
        });
      } else if (vnode.children) {
        // 如果oldVnode没有子节点而Vnode有, 新增
        createEle(vnode.children);
      } else if (oldVnod.childre) {
        // 如果oldVnode有子节点而Vnode没有，则删除
        api.removeChildren(el);
      }
      // 元素节点逻辑结束
    }
  } else {
    // 如果不是相同节点。直接删除旧节点内容，将新节点内容渲染到真实DOM
    parentdom = getParentDom(oldDom); // 获取旧节点 dom 元素的父元素
    olddomSibling = getSiblingDom(oldDom); // 获取旧节点的兄弟节点
    vnodeDom = createElm(vnode); // 创建新节点 vnode 对应的 DOM 元素
    if (parentdom !== null) {
      insertBefore(vnodeDom, parentdom, olddomSibling); // 在兄弟节点之前插入真实dom到父节点下。
      removeVnodes(parentdom, [oldVnode], 0, 0); // 移除旧节点所对应的 dom 元素
    }
    oldDom = null;
  }
  return vnode; // 返回的节点作为下一次处理的旧节点
}

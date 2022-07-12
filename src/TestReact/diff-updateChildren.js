function updateChildren(nextNestedChildrenElements, transaction, context) {
  var prevChildren = this._renderedChildren; // 老
  var nextChildren = this._reconcilerUpdateChildren(
    prevChildren,
    nextNestedChildrenElements,
    transaction,
    context
  );
  if (!nextChildren && !prevChildren) return;
  var name;
  var lastIndex = 0;
  var nextIndex = 0;
  for (name in nextChildren) {
    //遍历新的
    if (!nextChildren.hasOwnProperty(name)) {
      continue;
    }
    var prevChild = prevChildren && prevChildren[name];
    var nextChild = nextChildren[name];
    if (prevChild === nextChild) {
      // 如果新旧节点相同。
      // 移动节点
      this.moveChild(prevChild, nextIndex, lastIndex);
      lastIndex = Math.max(prevChild._mountIndex, lastIndex);
      prevChild._mountIndex = nextIndex;
    } else {
      if (prevChild) {
        // 只存在旧节点，新节点不存在
        lastIndex = Math.max(prevChild._mountIndex, lastIndex);
        // 删除节点
        this._unmountChild(prevChild);
      }
      // 初始化并创建节点
      this._mountChildAtIndex(nextChild, nextIndex, transaction, context);
    }
    nextIndex++;
  }
  for (name in prevChildren) {
    // 新的遍历完还要遍历老的，是因为老的可能存在需要删除的节点
    // 遍历老的
    if (
      prevChildren.hasOwnProperty(name) &&
      !(nextChildren && nextChildren.hasOwnProperty(name))
    ) {
      // 老的有，新的没有-->删除老节点
      this._unmountChild(prevChildren[name]);
    }
  }
  this._renderedChildren = nextChildren;
}

// 移动节点
function moveChild(child, toIndex, lastIndex) {
  if (child._mountIndex < lastIndex) {
    this.prepareToManageChildren();
    enqueueMove(this, child._mountIndex, toIndex);
  }
}
// 创建节点
function createChild(child, mountImage) {
  this.prepareToManageChildren();
  enqueueInsertMarkup(this, mountImage, child._mountIndex);
}
// 删除节点
function removeChild(child) {
  this.prepareToManageChildren();
  enqueueRemove(this, child._mountIndex);
}

function _unmountChild(child) {
  this.removeChild(child);
  child._mountIndex = null;
}

function _mountChildAtIndex(child, index, transaction, context) {
  var mountImage = ReactReconciler.mountComponent(
    child,
    transaction,
    this,
    this._nativeContainerInfo,
    context
  );
  child._mountIndex = index;
  this.createChild(child, mountImage);
}

// 创建任务队列
const createTaskQueue = () => {
  const taskQueue = [];
  return {
    /** 向任务队列中添加任务 */
    push: (item) => taskQueue.push(item),
    /** 从任务队列中获取任务。先进先出原则，第一个就是即将要处理的任务 */
    pop: () => taskQueue.shift(),
    /** 判断任务队列中是否还有任务 */
    isEmpty: () => taskQueue.length === 0,
  };
};
function createDOMElement(virtualDOM) {
  let newElement = null;
  if (virtualDOM.type === 'text') {
    // 文本节点
    newElement = document.createTextNode(virtualDOM.props.textContent);
  } else {
    // 元素节点
    newElement = document.createElement(virtualDOM.type);
    updateNodeElement(newElement, virtualDOM);
  }
  return newElement;
}
// 将children对象转数组
const transferArray = (arg) => (Array.isArray(arg) ? arg : [arg]);
// 获取dom： 普通dom 所对应的 dom 对象 或者组件所对应的组件实例对象
const createStateNode = (fiber) => {
  if (fiber.tag === 'host_component') {
    return createDOMElement(fiber);
  } else {
    return createReactInstance(fiber);
  }
};
// host_root | host_component | class_component | function_component
// 判断fiber对象的类型：普通节点还是根节点，类组件还是函数组件
const getTag = (vdom) => {
  if (typeof vdom.type === 'string') {
    return 'host_component';
  } else if (Object.getPrototypeOf(vdom.type) === Component) {
    return 'class_component';
  } else {
    return 'function_component';
  }
};
/** 从任务队列中获取任务 */
const getFirstTask = () => {
  const task = taskQueue.pop();
  if (task.from === 'class_component') {
    const root = getRoot(task.instance);
    task.instance.__fiber.partialState = task.partialState;
    return {
      props: root.props,
      stateNode: root.stateNode,
      tag: 'host_root',
      effects: [],
      child: null,
      alternate: root,
    };
  }
  // 返回最外层节点的fiber对象
  return {
    props: task.props,
    stateNode: task.dom, // 存储当前节点所对应的dom对象
    tag: 'host_root', // host_root | host_component | class_component | function_component
    effects: [], // 存储fiber对象。 阶段二时遍历的就是它
    child: null, // 子级fiber
    alternate: task.dom.__rootFiberContainer, // 备份的fiber对象，用来作比较
  };
};

// 阶段2 dom更新。这个过程是一次性执行完的，不会打断。循环任务队列，批量的更新真实的DOM。空闲时执行
const commitAllWork = (fiber) => {
  // 循环 effets 数组 构建 DOM 节点树
  fiber.effects.forEach((item) => {
    if (item.tag === 'class_component') {
      item.stateNode.__fiber = item;
    }
    if (item.effectTag === 'delete') {
      item.parent.stateNode.removeChild(item.stateNode);
    } else if (item.effectTag === 'update') {
      if (item.type === item.alternate.type) {
        // 节点类型相同
        updateNodeElement(item.stateNode, item, item.alternate);
      } else {
        // 节点类型不同，直接替换
        item.parent.stateNode.replaceChild(
          item.stateNode,
          item.alternate.stateNode
        );
      }
    } else if (item.effectTag === 'placement') {
      // 新增节点， 向页面中追加节点
      let fiber = item; // 当前要追加的子节点
      let parentFiber = item.parent; // 当前要追加的子节点的父级
      // 如果是组件父级，不能直接追加真实DOM节点
      while (
        parentFiber.tag === 'class_component' ||
        parentFiber.tag === 'function_component'
      ) {
        parentFiber = parentFiber.parent;
      }
      // 如果子节点是普通节点，将子节点dom追加到父级dom
      if (fiber.tag === 'host_component') {
        parentFiber.stateNode.appendChild(fiber.stateNode);
      }
    }
  });
  // 备份旧的 fiber 节点对象
  fiber.stateNode.__rootFiberContainer = fiber;
};

// 阶段1 的前期准备
const taskQueue = createTaskQueue(); // 创建任务队列
let subTask = null; //  要执行的子任务
let pendingCommit = null; // 提交的标识

// 阶段1: 构建fiber对象 (父级fiber, 子级fiber)
const reconcileChildren = (fiber, children) => {
  /** newFiber = {
        type,
        props,
        sibling,
        tag,// 标记节点是类组件还是函数组件，是根节点还是普通节点
        effects,// 包含当前节点以及子节点fiber对象的effects数组。数组中存储的是fiber对象
        effectTag,// 标记当前fiber对象渲染成真实dom时需要处理的操作。更新，删除，新增。。。
        parent,// 当前节点的父级。因为effect数组中不存在树结构关系。通过父级，兄弟，child来重新构建树结构
        alternate,// 备份的 fiber 对象
        stateNode,// 存储节点所对应的dom对象
      }; */
  // children 可能是element, 也可能是数组，将children 转换成数组
  const arrChildren = transferArray(children);
  let index = 0;
  let numElements = arrChildren.length;
  let childVirtualDom = null; // 子节点的 virtualDOM 对象
  let newFiber = null; // 子节点 virtualDOM 对象 对应的 fiber 对象
  let prevFiber = null; // 上一个兄弟 fiber 对象
  let alternate = null; // 备份fiber对象，用来作比较
  // 如果当前fiber对象有备份的fiber，判断fiber是否有子节点。有的话，将子节点作为新的备份
  if (fiber.alternate && fiber.alternate.child) {
    alternate = fiber.alternate.child;
  }
  while (index < numElements || alternate) {
    childVirtualDom = arrChildren[index]; // 子级 virtualDOM 对象
    // 比对当前 virtual dom 和 备份的 fiber对象即 oldVirtualDom
    // 给fiber对象打上标记。具体要执行的操作
    if (!childVirtualDom && alternate) {
      //如果备份有数据但是当前节点无数据-删除
      // 删除操作
      alternate.effectTag = 'delete'; // 标记
      fiber.effects.push(alternate); // 放到任务队列中
    } else if (childVirtualDom && alternate) {
      // 更新操作
      newFiber = {
        type: childVirtualDom.type,
        props: childVirtualDom.props,
        tag: getTag(childVirtualDom), // 根据virtual dom 对象，获取fiber对象的类型；标记是类组件还是函数组件/根节点还是普通节点
        effects: [],
        effectTag: 'update',
        parent: fiber,
        alternate,
      };
      if (childVirtualDom.type === alternate.type) {
        // 类型相同 比对virtual dom
        newFiber.stateNode = alternate.stateNode; // 存储当前节点所对应的dom对象：普通节点->dom对象 || 组件->存储组件所对应的实例对象
      } else {
        // 类型不同时，创建 fiber 对象所对应的 dom 对象
        newFiber.stateNode = createStateNode(newFiber);
      }
    } else if (childVirtualDom && !alternate) {
      // 初始渲染
      // 子级 fiber 对象
      newFiber = {
        type: childVirtualDom.type,
        props: childVirtualDom.props,
        tag: getTag(childVirtualDom),
        effects: [],
        effectTag: 'placement',
        parent: fiber,
      };
      // 为fiber节点添加DOM对象或组件实例对象
      newFiber.stateNode = createStateNode(newFiber);
    }

    if (index === 0) fiber.child = newFiber;
    // 如果是第一个子节点，才是父节点的子节点。
    else if (childVirtualDom) prevFiber.sibling = newFiber; // 否则是第一个子节点下的兄弟节点

    if (alternate && alternate.sibling) alternate = alternate.sibling;
    else alternate = null;

    prevFiber = newFiber; // 更新
    index++;
  }
};

// 执行任务--> 根据 virtual dom 对象给每一个节点构建 fiber 对象，返回新的任务
const executeTask = (fiber) => {
  /** 1. 构建子级任务
    2. 构建同级任务
    3. 寻找父级，父级的同级，构建同级。。。 & 收集子级的effects数组合并到父级
    4. 最终回退到根节点。 **/

  // 构建子级fiber对象 reconcileChildren(fiber, fiber.props.children)
  reconcileChildren(fiber, fiber.props.children);

  // 如果当前fiber对象存在子级 返回子级 ---> 这样会先构建好所有的子节点fiber走到底
  if (fiber.child) return fiber.child;

  let currentFiber = fiber;
  while (currentFiber.parent) {
    // 返回父级之前，往父级fiber对象的 effects 数组中，合并当前fiber对象的 effects 数组,最终根节点合并到所有fiber对象的数组
    currentFiber.parent.effects = currentFiber.parent.effects.concat(
      currentFiber.effects.concat([currentFiber])
    );
    // 如果当前fiber对象存在同级 返回同级 构建同级和同级的子级
    if (currentFiber.sibling) {
      return currentFiber.sibling;
    }
    // 如果同级不存在 返回到父级 看父级是否有同级 最终回退到根节点。
    currentFiber = currentFiber.parent;
  }
  // 如果父级退到了根节点，说明fiber对象构建结束了。可以进入阶段2了。将对象传递给 pendingCommit
  pendingCommit = currentFiber;
};

// 执行任务
const workLoop = (deadline) => {
  // 如果子任务不存在 就去获取子任务
  if (!subTask) {
    subTask = getFirstTask();
  }
  // 如果任务存在并且浏览器有空余时间就执行任务
  while (subTask && deadline.timeRemaining() > 1) {
    // 执行完任务会返回一个新任务。存在新任务又会进入while循环，等待浏览器空闲时间继续执行。知道构建完所有fiber对象
    // 1, 先构建根节点fiber,判断节点是否有子级，返回子级，构建子节点fiber。判断。。。
    // 2. 判断节点是否有同级节点。返回同级，构建同级。判断。。。
    // 3. 如果不存在同级了，退回到父级，判断父级是否存在同级，。。。
    // 4. 最终退回到根节点。整棵树构建完成。阶段1完成。标记可以执行阶段2 commit
    // 构建完所有fiber后，将所有 fiber 对象存储到最外层 fiber 对象的 effects 数组中。为阶段2遍历数组做准备
    subTask = executeTask(subTask);
  }

  // 可以执行阶段2 commit, 进入阶段2，阶段2一次性执行，不会中断。为什么？
  if (pendingCommit) {
    commitAllWork(pendingCommit); // 遍历effects数组，通过fiber对象获取真实dom。
  }
};

// 调度任务
const performTask = (deadline) => {
  workLoop(deadline);
  /**
   * 任务被中断后，又继续执行时，判断任务subTask是否存在,存在说明任务还没执行完就被中断了，继续执行
   * 判断任务队列中是否还存在没被执行的任务。如果存在的话，还需要在浏览器空闲时继续执行
   * 再一次告诉浏览器在空闲的时间执行任务
   */
  if (subTask || !taskQueue.isEmpty()) {
    requestIdleCallback(performTask);
  }
};

export const render = (element, rootdom) => {
  /**
   * 当触发更新时，React不会立即开始更新任务。而是将需要更新的任务打上标记添加到任务队列中。
   * 调用浏览器的 requestIdleCallback，当主线程空闲时才执行

  * 1. 向任务队列中添加任务
  * 2. 指定在浏览器空闲时执行任务 */
  console.log(element, rootdom);
  //  任务就是通过 vdom 对象 构建 fiber 对象
  taskQueue.push({
    rootdom,
    props: { children: element },
  });

  requestIdleCallback(performTask);
};

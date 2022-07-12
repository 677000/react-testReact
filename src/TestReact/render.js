// render 转换 virtual dom 对象为真实 dom 对象
import diff from './diff/diff';
// import createTaskQueue from './fiber/createTaskQueue';

const render = (vDom, container, oldVdom = container.firstChild) => {
  // console.group();
  // console.log(
  //   '函数组件类型的vDom, container, oldVdom',
  //   vDom,
  //   container,
  //   oldVdom
  // );
  // console.groupEnd();
  diff(vDom, container, oldVdom);
};

// const taskQueue = createTaskQueue();

// const render = (element, rootdom) => {
//   /**
//    * 当触发更新时，React不会立即开始更新任务。而是将需要更新的任务打上标记添加到任务队列中。
//    * 调用浏览器的 requestIdleCallback，当主线程空闲时才执行

//   * 1. 向任务队列中添加任务
//   * 2. 指定在浏览器空闲时执行任务 */
//   console.log(element, rootdom);
//   //  任务就是通过 vdom 对象 构建 fiber 对象
//   taskQueue.push({
//     rootdom,
//     props: { children: element },
//   });

//   requestIdleCallback(performTask);
// };

export default render;

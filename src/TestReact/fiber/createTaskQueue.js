const createTaskQueue = () => {
  const taskQueue = [];
  return {
    push: (task) => taskQueue.push(task),
    pop: () => taskQueue.shift(), // 删除数组中第一个元素并返回第一个元素。【先进先出原则，先进任务队列的任务先执行。】
  };
};

export default createTaskQueue;

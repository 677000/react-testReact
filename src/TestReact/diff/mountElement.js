import mountJsxElement from './mountJsxElement'; // 将普通类型的 virtual dom -> turly dom
import mountCompElement from './mountCompElement';

// 将 virtual dom 转真实 dom 并更新

const mountElement = (virtualDOM, container, oldDOM) => {
  if (virtualDOM && typeof virtualDOM.type === 'function') {
    console.log(
      '组件类型的 virtual dom -> 普通类型的 virtual dom===',
      virtualDOM
    );
    mountCompElement(virtualDOM, container, oldDOM);
  } else {
    console.log('普通类型的 virtual dom -> 真实 dom===', virtualDOM);
    mountJsxElement(virtualDOM, container, oldDOM);
  }
};

export default mountElement;

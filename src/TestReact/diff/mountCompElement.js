// 组件类型的virtual dom -> 普通类型的virtual dom -> 真实dom
import mountJsxElement from './mountJsxElement'; //普通类型的virtual dom -> 真实dom

const mountCompElement = (virtualDOM, container, oldDOM) => {
  // 判断是类组件还是函数组件[原型上存在render说明是类组件]
  // console.log(virtualDOM.__proto__.render);
  let compVirtualDom = null;
  let component = null;
  if (
    virtualDOM.type &&
    virtualDOM &&
    typeof virtualDOM.type === 'function' &&
    !(virtualDOM.prototype && virtualDOM.prototype.render)
  ) {
    // 函数组件
    // console.log('是函数组件，获取virtual dom');
    compVirtualDom = virtualDOM.type(virtualDOM.props || {}); // 函数组件的type是一个函数， 返回的就是 virtual dom.
  } else {
    // console.log('是类组件，获取virtual dom');
    // compVirtualDom = new virtualDOM.type(virtualDOM.props || {});
    // component = nextVirtualDOM.component;
  }

  // console.log('组件类型的virtualDom 处理后的 virtual Dom===', compVirtualDom);
  // 如果函数/类组件内还嵌套了组件。type函数返回的还是一个函数，而不是virtual dom.再将这个组件类型的 vietual dom -> 普通类型的 virtual dom.
  if (typeof compVirtualDom.type === 'function') {
    mountCompElement(compVirtualDom, container, oldDOM);
  } else {
    // 普通类型的 virtual dom -> 真实 dom
    mountJsxElement(compVirtualDom, container, oldDOM);
  }
  if (component) {
    component.componentDidMount();
    if (component.props && component.props.ref) {
      component.props.ref(component);
    }
  }
};

export default mountCompElement;

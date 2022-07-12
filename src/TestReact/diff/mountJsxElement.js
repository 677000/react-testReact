import mountElement from './mountElement';
import addAttributes from './addAttributes';
// 普通类型的 virtual dom -> 真实 dom，挂载到节点。

// import createDOMElement from './createDOMElement';
// import unmountNode from './unmountNode';

// export default function mountJsxElement(virtualDOM, container, oldDOM) {
//   let newElement = createDOMElement(virtualDOM);
//   // 将转换之后的DOM对象放置在页面中
//   if (oldDOM) {
//     container.insertBefore(newElement, oldDOM);
//   } else {
//     container.appendChild(newElement);
//   }
//   // 判断旧的DOM对象是否存在 如果存在 删除
//   if (oldDOM) {
//     unmountNode(oldDOM);
//   }

//   // 获取类组件实例对象
//   let component = virtualDOM.component;
//   // 如果类组件实例对象存在
//   if (component) {
//     // 将DOM对象存储在类组件实例对象中
//     component.setDOM(newElement);
//   }
// }

const mountJsxElement = (vDom, container) => {
  let jsxElement = null;
  if (!vDom.type) {
    console.log('文本节点');
    jsxElement = document.createTextNode(vDom.props.children);
  } else {
    console.log('元素节点===', vDom);
    jsxElement = document.createElement(vDom.type);
    // 创建真实dom元素后，为元素节点添加属性
    addAttributes(jsxElement, vDom);

    // 递归创建子节点 不能中断.直到递归结束。
    // console.log(vDom);
    if (vDom.type) {
      // console.log(vDom);
      if (vDom.props && vDom.props.children) {
        if (typeof vDom.props.children === 'string') {
          jsxElement = document.createTextNode(vDom.props.children);
        } else {
          // console.log('子节点为 children 数组===', vDom);
          vDom.props.children.forEach((child) => {
            mountElement(child, jsxElement);
          });
        }
      }
    }
    // console.log(jsxElement);
    container.appendChild(jsxElement);
  }

  // virtual dom -> true dom 的时候，将元素所对应的 virtual dom 返回
  jsxElement._virtualDom = vDom;
};

export default mountJsxElement;

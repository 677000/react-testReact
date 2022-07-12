// 创建真实dom元素后，为元素节点添加属性
const addAttributes = (trueElement, vDom) => {
  // console.log('addAttributes', vDom);
  const addAttributesArr = Object.keys(vDom.props).filter(
    (item) => item !== 'children'
  );
  addAttributesArr.forEach((attr) => {
    // console.log(attr);
    const attrValue = vDom.props[attr]; // trueElement.attributes[attr]
    if (attr.slice(0, 2) === 'on') {
      // 判断是否是事件属性
      // console.log(attr);
      // console.log(attr.slice(2).toLowerCase());
      const eventName = attr.slice(2).toLowerCase();
      trueElement.addEventListener(eventName, attrValue);
    } else if (attr === 'value' || attr === 'checked') {
      trueElement[attr] = attrValue;
    } else if (attr === 'class' || attr === 'className') {
      trueElement.setAttribute('class', attrValue);
    } else {
      trueElement.setAttribute(attr, attrValue);
    }
  });
  // console.log('添加属性后的元素', trueElement);
};

export default addAttributes;

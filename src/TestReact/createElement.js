export default function createElement(type, props, ...children) {
  // console.log(type, props, ...children); 创建真实dom对应的虚拟dom
  const childElements = [].concat(...children).reduce((result, child) => {
    if (child !== false && child !== true && child !== null) {
      if (child instanceof Object) {
        result.push(child);
      } else result.push(createElement('text', { textContent: child }));
    }
    return result;
  });
  // console.log('createElement');
  return {
    types,
    props: Object.assign({ children: childElements }, props),
    // children: childVdom,
  };
}

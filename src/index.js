import React from 'react';
// import ReactDOM from "react-dom";
import TestReact from './TestReact';
import './style.css';
import App from './App'; // 函数类型的dom
// import render from './TestReact/fiber';

// class BComp extends TestReact.Component {
//   constructor(props) {
//     super(props);
//   }
//   render() {
//     return (
//       <div>
//         <p>我是类组件</p>
//       </div>
//     );
//   }
// }

// const App = () => {
//   return (
//     // 普通类型
//     <div id="root">
//       我是text节点
//       <h1 class="h1title">react 使用jsx来描述用户界面</h1>
//       <p>通过React.createElement 在创建真实dom的同时会创建对应的虚拟dom :)</p>
//       <h1 style={{ fontSize: '30px' }}>我是第二个h :)</h1>
//       <div onClick={() => alert('点击')}>点击事件 :)</div>
//       <div>
//         我是子节点下的text节点
//         <h1>嵌套节点下的h</h1>
//         <p>嵌套节点下的p :)</p>
//       </div>
//     </div>
//   );
// };

// const jsx = <div>hi react fiber</div>;
// render(<App />, document.getElementById('root'));
TestReact.render(<App />, document.getElementById('root'));
// <App />
// App

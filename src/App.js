import React from 'react';
import './style.css';

const GrandComp = () => {
  return (
    <div id="grand-component">
      <h1>我是嵌套的孙子组件</h1>
      <span> ❄️ 💗 😊 🐶</span>
    </div>
  );
};

const SonComp = () => {
  return <GrandComp />;
};

export default function App() {
  return (
    <div id="component-root">
      <h1>我是根级函数组件</h1>
      <button>我是按钮</button>
      <span>❤️</span>
      <SonComp />
      <span>我是span节点</span>
      {/* 我是文本节点 */}
    </div>
  );
}

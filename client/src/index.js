import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Browser loads index.html, then this JS runs and tells React
// to render <App /> into the #root DOM element 
const root = ReactDOM.createRoot(document.getElementById('root'));  //Find the <div> in the DOM whose id is root.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


// #root is a normal HTML div element in public/index.html 
// React takes over and uses as the starting point for rendering the entire app.






// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

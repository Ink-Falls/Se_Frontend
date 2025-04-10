// index.js

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";

if (process.env.NODE_ENV === "production") {
  console.log = () => {}; // Disable console.log in production
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

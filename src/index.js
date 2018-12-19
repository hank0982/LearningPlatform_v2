import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { CookiesProvider } from "react-cookie";
import registerServiceWorker from "./registerServiceWorker";
import "semantic-ui-css/semantic.min.css";

// ReactDOM renders the 'App component' to the real DOM
ReactDOM.render(
  <CookiesProvider>
    <App />
  </CookiesProvider>,
  document.getElementById("root")
);
registerServiceWorker();

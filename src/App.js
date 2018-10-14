import React, { Component } from "react";
import Home from "./pages/Home";
import GameStart from "./pages/GameStart";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import FirebaseHandler from "./firebase/handleFirebase";
import { addLocaleData, IntlProvider } from "react-intl";

const elLocaleData = require("react-intl/locale-data/el");
addLocaleData(elLocaleData);

/*
  TODO: extract texts from components to support i18n
*/
class App extends Component {
  constructor(props) {
    super(props);
    this.firebaseHandler = new FirebaseHandler();
  }
  render() {
    return (
      <IntlProvider locale="en" messages={null}>
        <BrowserRouter>
          <Switch>
            <Route
              path="/"
              exact
              render={() => <Home firebase={this.firebaseHandler} />}
            />
            <Route
              path="/game_start"
              exact
              render={() => <GameStart firebase={this.firebaseHandler} />}
            />
          </Switch>
        </BrowserRouter>
      </IntlProvider>
    );
  }
}

export default App;

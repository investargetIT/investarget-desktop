import React from 'react';
import { Router, Route } from 'dva/router';
import IndexPage from './routes/IndexPage';
import Products from './routes/Products'
import Users from "./routes/Users.js";
import Login from './components/Login.js'

function RouterConfig({ history, app }) {
  const baseUrl = app.lang ? ('/' + app.lang) : ''
  return (
    <Router history={history}>
      <Route path={ baseUrl + "/" } component={IndexPage} />
      <Route path={ baseUrl + "/products" } component={Products} />
      <Route path={ baseUrl + "/users" } component={Users} />
      <Route path={ baseUrl + "/login" } component={Login} />
    </Router>
  );
}

export default RouterConfig;

import React from 'react';
import { Router, Route } from 'dva/router';
import IndexPage from './routes/IndexPage';
import Products from './routes/Products'
import Users from "./routes/Users.js";
import Login from './components/Login.js'
import InvestorList from "./routes/InvestorList.js";
import Register from './routes/Register'

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Route path="/" component={IndexPage} />
      <Route path="/products" component={Products} />
      <Route path="/users" component={Users} />
      <Route path="/login" component={Login} />
      <Route path="/app/investor/list" component={InvestorList} />
      <Route path="/register" component={Register} />
    </Router>
  );
}

export default RouterConfig;

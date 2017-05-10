import React from 'react';
import { Router, Route } from 'dva/router';
import IndexPage from './routes/IndexPage';
import Products from './routes/Products'
import Users from "./routes/Users.js";
import Login from './components/Login.js'
import InvestorList from "./routes/InvestorList.js";
import Register from './routes/Register'
import Home from './routes/Home'

import RecommendFriends from "./routes/RecommendFriends.js";

import RecommendProjects from "./routes/RecommendProjects.js";

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/app" component={IndexPage} />
      <Route path="/app/products" component={Products} />
      <Route path="/app/users" component={Users} />
      <Route path="/app/investor/list" component={InvestorList} />
      <Route path="/recommend_friends" component={RecommendFriends} />
      <Route path="/recommend_projects" component={RecommendProjects} />
    </Router>
  );
}

export default RouterConfig;

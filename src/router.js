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

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

function Container(props) {
  const isPathAllowed = /\/(recommend_friends|recommend_projects)/

  return (
    <ReactCSSTransitionGroup
        transitionName="transitionWrapper"
        component="div"
        className="transitionWrapper"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}>
        <div key={props.location.pathname}
              className={ isPathAllowed.test(props.location.pathname) ? '' : 'disabled' }
              style={{position:"absolute", width: "100%", height: "100%", overflow: "scroll", opacity: 1, backgroundColor: '#fff'}}>
            {
                props.children
            }
        </div>
    </ReactCSSTransitionGroup>
  )
}


function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <div component={Container}>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/app" component={IndexPage} />
        <Route path="/app/products" component={Products} />
        <Route path="/app/users" component={Users} />
        <Route path="/app/investor/list" component={InvestorList} />
        <Route path="/recommend_friends" component={RecommendFriends} />
        <Route path="/recommend_projects" component={RecommendProjects} />
      </div>
    </Router>
  );
}

export default RouterConfig;

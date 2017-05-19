import React from 'react'
import { Router, Route } from 'dva/router'
import IndexPage from './routes/IndexPage'
import Login from './components/Login.js'
import InvestorList from "./routes/InvestorList.js"
import Register from './routes/Register'
import Home from './routes/Home'
import AddOrganization from "./routes/AddOrganization.js"
import OrganizationList from "./routes/OrganizationList.js"


function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/app" component={IndexPage} />
      <Route path="/app/investor/list" component={InvestorList} />
      <Route path="/app/organization/add" component={AddOrganization} />
      <Route path="/app/organization/list" component={OrganizationList} />
    </Router>
  )
}

export default RouterConfig

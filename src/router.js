import React from 'react'
import { Router, Route } from 'dva/router'
import IndexPage from './routes/IndexPage'
import Login from './components/Login.js'
import UserList from "./routes/UserList.js"
import Register from './routes/Register'
import Home from './routes/Home'
import AddOrganization from "./routes/AddOrganization.js"
import OrganizationList from "./routes/OrganizationList.js"
import { URI_1, URI_2, URI_3, URI_4, URI_5, URI_6, URI_7, URI_8, URI_9, URI_10, URI_11, URI_12, URI_13 } from './constants'
import AddUser from './routes/AddUser.js'
import LogList from './routes/LogList'
import ModifyPwd from './routes/ModifyPwd'

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/app" component={IndexPage} />
      <Route path={URI_6} component={UserList} />
      <Route path="/app/user/add" component={AddUser} />
      <Route path="/app/organization/add" component={AddOrganization} />
      <Route path={URI_3} component={OrganizationList} />
      <Route path={URI_11} component={LogList} />
      <Route path={URI_9} component={ModifyPwd} />
    </Router>
  )
}

export default RouterConfig

import React from 'react'
import { Router, Route } from 'dva/router'
import IndexPage from './routes/IndexPage'
import Login from './components/Login.js'
import UserList from "./routes/UserList.js"
import Register from './routes/Register'
import Home from './routes/Home'
import AddOrganization from "./routes/AddOrganization.js"
import OrganizationList from "./routes/OrganizationList.js"
import AddProject from './routes/AddProject'
import { URI_1, URI_2, URI_3, URI_4, URI_5, URI_6, URI_7, URI_8, URI_9, URI_10, URI_11, URI_12, URI_13, URI_14 } from './constants'
import AddUser from './routes/AddUser.js'
import LogList from './routes/LogList'
import ModifyPwd from './routes/ModifyPwd'
import BasicInfo from './routes/BasicInfo'
import PermList from './routes/PermList'
import DataRoomList from './routes/DataRoomList'
import EditOrganization from './routes/EditOrganization'
import OrganizationDetail from './routes/OrganizationDetail'
import EditProject from './routes/EditProject'
import ProjectList from './routes/ProjectList'

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/app" component={IndexPage} />
      <Route path={URI_6} component={UserList} />
      <Route path="/app/user/add" component={AddUser} />
      <Route path="/app/organization/list" component={OrganizationList} />
      <Route path="/app/organization/add" component={AddOrganization} />
      <Route path="/app/organization/edit/:id" component={EditOrganization} />
      <Route path="/app/organization/:id" component={OrganizationDetail} />
      <Route path={URI_11} component={LogList} />
      <Route path={URI_9} component={ModifyPwd} />
      <Route path={URI_10} component={BasicInfo} />
      <Route path="/app/project/list" component={ProjectList} />
      <Route path="/app/project/add" component={AddProject} />
      <Route path="/app/project/edit/:id" component={EditProject} />
      <Route path={URI_14} component={PermList} />
      <Route path={URI_7} component={DataRoomList} />

    </Router>
  )
}

export default RouterConfig

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
import DataRoom from './routes/DataRoom'
import EditOrganization from './routes/EditOrganization'
import OrganizationDetail from './routes/OrganizationDetail'
import EditProject from './routes/EditProject'
import ProjectList from './routes/ProjectList'
import ProjectListRecommend from './routes/ProjectListRecommend'
import ProjectListFavor from './routes/ProjectListFavor'
import ProjectListInterest from './routes/ProjectListInterest'
import ProjectListPublished from './routes/ProjectListPublished'
import ProjectDetail from './routes/ProjectDetail'
import TimelineList from './routes/TimelineList'
import DataRoomList from './routes/DataRoomList'
import EmailList from './routes/EmailList'
import EmailDetail from './routes/EmailDetail'
import EditUser from './routes/EditUser'
import UserDetail from './routes/UserDetail'
import EditTimeline from './routes/EditTimeline'
import TimelineDetail from './routes/TimelineDetail'
import InboxList from './routes/InboxList'
import AddDataRoom from './routes/AddDataRoom'
import AddTimeline from './routes/AddTimeline'
import AddMarketPlace from './routes/AddMarketPlace'
import EditMarketPlace from './routes/EditMarketPlace'
import MarketPlaceDetail from './routes/MarketPlaceDetail'
import MyInvestor from './routes/MyInvestor'
import RecommendProject from './routes/RecommendProject'
import SelectUserToPosition from './routes/SelectUserToPosition'

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
      <Route path="/app/organization/selectuser" component={SelectUserToPosition} />
      <Route path="/app/organization/edit/:id" component={EditOrganization} />
      <Route path="/app/organization/:id" component={OrganizationDetail} />
      <Route path={URI_11} component={LogList} />
      <Route path={URI_9} component={ModifyPwd} />
      <Route path={URI_10} component={BasicInfo} />
      <Route path="/app/projects/list" component={ProjectList} />
      <Route path="/app/projects/list/recommend" component={ProjectListRecommend} />
      <Route path="/app/projects/list/favor" component={ProjectListFavor} />
      <Route path="/app/projects/list/interest" component={ProjectListInterest} />
      <Route path="/app/projects/published" component={ProjectListPublished} />
      <Route path="/app/projects/add" component={AddProject} />
      <Route path="/app/projects/edit/:id" component={EditProject} />
      <Route path="/app/projects/recommend/:id" component={RecommendProject} />
      <Route path="/app/projects/:id" component={ProjectDetail} />
      <Route path={URI_14} component={PermList} />
      <Route path="/app/dataroom/list" component={DataRoomList} />
      <Route path="/app/dataroom/detail" component={DataRoom} />
      <Route path="/app/timeline/list" component={TimelineList} />
      <Route path="/app/email/list" component={EmailList} />
      <Route path="/app/email/detail" component={EmailDetail} />
      <Route path="/app/user/edit/:id" component={EditUser} />
      <Route path="/app/user/:id" component={UserDetail} />
      <Route path="/app/timeline/add" component={AddTimeline} />
      <Route path="/app/timeline/edit/:id" component={EditTimeline} />
      <Route path="/app/timeline/:id" component={TimelineDetail} />
      <Route path={URI_8} component={InboxList} />
      <Route path="/app/dataroom/add" component={AddDataRoom} />
      <Route path="/app/marketplace/add" component={AddMarketPlace} />
      <Route path="/app/marketplace/edit/:id" component={EditMarketPlace} />
      <Route path="/app/marketplace/:id" component={MarketPlaceDetail} />
      <Route path={URI_12} component={MyInvestor} />
    </Router>
  )
}

export default RouterConfig

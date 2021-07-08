import React from 'react';
import { Router, Route, Switch } from 'dva/router';
import Home from './routes/Home';
import Login from './components/Login.js';
import ResetPassword from './routes/ResetPassword';
import Register1 from './routes/Register1';
import Register from './routes/Register';
import Dashboard from './routes/Dashboard';
import ProjectLibrary from './routes/ProjectLibrary';
import OrganizationList from "./routes/OrganizationList.js";
import OrgExportList from './routes/OrgExportList';
import ProjectList from './routes/ProjectList';
import ProjectCostDetail from './routes/ProjectCostDetail';
import PermList from './routes/PermList';
import LogList from './routes/LogList';
// import UserList from "./routes/UserList.js"
// import OrgUserList from './routes/OrgUserList.js'
// import AddOrganization from "./routes/AddOrganization.js"
// import AddProject from './routes/AddProject'
import { URI_1, URI_2, URI_3, URI_4, URI_5, URI_6, URI_7, URI_8, URI_9, URI_10, URI_11, URI_12, URI_13, URI_14 } from './constants'
// import AddUser from './routes/AddUser.js'

// import ModifyPwd from './routes/ModifyPwd'
// import BasicInfo from './routes/BasicInfo'
// import DataRoom from './routes/DataRoom'
// import EditOrganization from './routes/EditOrganization'
// import OrgDetail from './routes/OrgDetail'
// import EditProject from './routes/EditProject'
// import ProjectListRecommend from './routes/ProjectListRecommend'
// import ProjectListFavor from './routes/ProjectListFavor'
// import ProjectListInterest from './routes/ProjectListInterest'
// import ProjectListPublished from './routes/ProjectListPublished'
// import ProjectDetail from './routes/ProjectDetail'
// import OrgBdTableList from './routes/OrgBdTableList';
// import DataRoomList from './routes/DataRoomList'
// import EmailList from './routes/EmailList'
// import EmailDetail from './routes/EmailDetail'
// import EditUser from './routes/EditUser'
// import UserDetail from './routes/UserDetail'
// import EditTimeline from './routes/EditTimeline'
// import TimelineDetail from './routes/TimelineDetail'
// import InboxList from './routes/InboxList'
// import AddDataRoom from './routes/AddDataRoom'
// import AddTimeline from './routes/AddTimeline'
// import AddMarketPlace from './routes/AddMarketPlace'
// import EditMarketPlace from './routes/EditMarketPlace'
// import MarketPlaceDetail from './routes/MarketPlaceDetail'
// import MyInvestor from './routes/MyInvestor'
// import MyTrader from './routes/MyTrader'
// import RecommendProject from './routes/RecommendProject'
// import SelectUserToPosition from './routes/SelectUserToPosition'
// import AccessDenied from './routes/AccessDenied'
// import SelectTraderToRelation from './routes/SelectTraderToRelation'
// import Agreement from './routes/Agreement'
// import ProjectLibraryItem from './routes/ProjectLibraryItem'
// import ProjectBDList from './routes/ProjectBDList'
// import AddProjectBD from './routes/AddProjectBD'
// import EditProjectBD from './routes/EditProjectBD'
// import WxMessage from './routes/WxMessage'
// import Schedule from './routes/Schedule'
// import ScheduleList from './routes/ScheduleList'
// import RecommendFriends from './components/RecommendFriends';
// import RecommendProjects from './components/RecommendProjects';
// import OrgBDList from './routes/OrgBDList';
// import AddOrgBD from './routes/AddOrgBD';
// import NewOrgBD from './routes/NewOrgBD';
// import NewOrgBDNext from './routes/NewOrgBDNext';
// import TraderDetail from './routes/TraderDetail';
// import MeetingBDList from './routes/MeetingBDList';
// import AddMeetingBD from './routes/AddMeetingBD';
// import CompanyDataRoomList from './routes/CompanyDataRoomList';
// import CompanyDataRoomDetail from './routes/CompanyDataRoomDetail';
// import OrgBDProjList from './routes/OrgBDProjList';
// import AddReport from './routes/AddReport';
// import ReportList from './routes/ReportList';
// import ReportDetail from './routes/ReportDetail';
// import EditReport from './routes/EditReport';
// import AddOKR from './routes/AddOKR';
// import OKRList from './routes/OKRList';
// import EditOKR from './routes/EditOKR';
// import InternOnlineTest from './routes/InternOnlineTest';
// import ProjectReport from './routes/ProjectReport';

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/password" component={ResetPassword} />
        <Route path="/register1" component={Register1} />
        <Route path="/register" component={Register} />
        <Route path="/app/projects/library" component={ProjectLibrary} />
        <Route path="/app/organization/list" component={OrganizationList} />
        <Route path="/app/org/export" component={OrgExportList} />
        <Route path="/app/projects/list" component={ProjectList} />
        <Route path="/app/projects/cost/:id" component={ProjectCostDetail} />
        <Route path={URI_14} component={PermList} />
        <Route path={URI_11} component={LogList} />
        {/* <Route path="/recommend-friends" component={RecommendFriends} />
        <Route path="/recommend-projects" component={RecommendProjects} />
        <Route path="/403" component={AccessDenied} />
        <Route path="/app/orguser/list" component={OrgUserList} />
        <Route path={URI_6} component={UserList} />
        <Route path="/app/user/add" component={AddUser} />
        <Route path="/app/organization/add" component={AddOrganization} />
        <Route path="/app/organization/selectuser" component={SelectUserToPosition} />
        <Route path="/app/organization/edit/:id" component={EditOrganization} />
        <Route path="/app/organization/:id" component={OrgDetail} />
        <Route path={URI_9} component={ModifyPwd} />
        <Route path={URI_10} component={BasicInfo} />
        <Route path="/app/projects/library/:id" component={ProjectLibraryItem} />
        <Route path="/app/projects/bd" component={ProjectBDList} />
        <Route path="/app/projects/bd/add" component={AddProjectBD} />
        <Route path="/app/projects/bd/edit/:id" component={EditProjectBD} />
        <Route path="/app/projects/list/recommend" component={ProjectListRecommend} />
        <Route path="/app/projects/list/favor" component={ProjectListFavor} />
        <Route path="/app/projects/list/interest" component={ProjectListInterest} />
        <Route path="/app/projects/published" component={ProjectListPublished} />
        <Route path="/app/projects/add" component={AddProject} />
        <Route path="/app/projects/edit/:id" component={EditProject} />
        <Route path="/app/projects/recommend/:id" component={RecommendProject} />
        <Route path="/app/projects/:id" component={ProjectDetail} />
        <Route path="/app/dataroom/project/list" component={DataRoomList} />
        <Route path="/app/dataroom/company/list" component={CompanyDataRoomList} />
        <Route path="/app/dataroom/detail" component={DataRoom} />
        <Route path="/app/dataroom/company/detail" component={CompanyDataRoomDetail} />
        <Route path="/app/timeline/list" component={OrgBdTableList} />
        <Route path="/app/email/list" component={EmailList} />
        <Route path="/app/email/detail/:id" component={EmailDetail} />
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
        <Route path={URI_13} component={MyTrader} />
        <Route path="/app/trader/add" component={SelectTraderToRelation} />
        <Route path="/app/agreement" component={Agreement} />
        <Route path="/app/wxmsg" component={WxMessage} />
        <Route path="/app/schedule" component={Schedule} />
        <Route path="/app/schedule/list" component={ScheduleList} />
        <Route path="/app/org/bd" component={OrgBDList} />
        <Route path="/app/org/newbd" component={NewOrgBDNext} />
        <Route path="/app/orgbd/add" component={NewOrgBD} />
        <Route path="/app/trader/:id" component={TraderDetail} />
        <Route path="/app/meeting/bd" component={MeetingBDList} />
        <Route path="/app/meetingbd/add" component={AddMeetingBD} />
        <Route path="/app/orgbd/project/list" component={OrgBDProjList} />
        <Route path="/app/report/add" component={AddReport} />
        <Route path="/app/report/list" component={ReportList} />
        <Route path="/app/report/:id" component={ReportDetail} />
        <Route path="/app/report/edit/:id" component={EditReport} />
        <Route path="/app/okr/add" component={AddOKR} />
        <Route path="/app/okr/list" component={OKRList} />
        <Route path="/app/okr/edit/:id" component={EditOKR} />
        <Route path="/app/online-test" component={InternOnlineTest} />
        <Route path="/app/project-report" component={ProjectReport} /> */}
        <Route path="/app" component={Dashboard} />
      </Switch>
    </Router>
  )
}

export default RouterConfig

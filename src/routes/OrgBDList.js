import React from 'react';
import { 
  i18n, 
  timeWithoutHour, 
  time, 
  handleError, 
  hasPerm, 
  getUserInfo, 
} from '../utils/util';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';
import OrgBDListComponent from '../components/OrgBDListComponent';
import { Button, Breadcrumb } from 'antd';
import { Link } from 'dva/router';

export default class OrgBDList extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      isProj: true,
      showBlacklist: false,
      displayContent: true,
    };
  }

  handleProjChange = () => {
    this.setState({ displayContent: false }, () => this.setState({ displayContent: true }));
  }

  render() {
    let isAdd = false;
    return (
      <LeftRightLayoutPure
        location={this.props.location} 
        name={i18n('menu.organization_bd') + (isAdd ? " / 查看BD": "")} 
        title={i18n('menu.bd_management')}
        // action={
        //   isAdd ? { name: '返回机构看板', link: '/app/org/bd' }
        //     : (hasPerm('BD.manageOrgBD') ? { name: i18n('add_orgbd'), link: '/app/orgbd/add' } : undefined)
        // }
        right={this.state.isProj ? <Button onClick={() => this.setState({ showBlacklist: true })}>添加黑名单</Button> : null}
      >

        <Breadcrumb style={{ marginLeft: 20, marginBottom: 20 }} className="remove-on-mobile">
          <Breadcrumb.Item>
            <Link to="/app">首页</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>投后管理</Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/app/orgbd/project/list">机构BD</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>机构看板</Breadcrumb.Item>
        </Breadcrumb>

        <Breadcrumb style={{ marginLeft: 20, marginBottom: 20 }} className="only-on-mobile">
          <Breadcrumb.Item>首页</Breadcrumb.Item>
          <Breadcrumb.Item>投后管理</Breadcrumb.Item>
          <Breadcrumb.Item>机构BD</Breadcrumb.Item>
          <Breadcrumb.Item>机构看板</Breadcrumb.Item>
        </Breadcrumb>

        {this.state.displayContent &&
          <OrgBDListComponent
            editable
            location={this.props.location}
            pagination={true}
            showBlacklistModal={this.state.showBlacklist}
            onCloseBlacklistModal={() => this.setState({ showBlacklist: false })}
            onProjChange={this.handleProjChange}
            onProjExistChange={isProj => this.setState({ isProj })}
          />
        }
      </LeftRightLayoutPure>)
  }

}


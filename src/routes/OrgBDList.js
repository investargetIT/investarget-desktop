import React from 'react';
import { 
  i18n, 
  timeWithoutHour, 
  time, 
  handleError, 
  hasPerm, 
  getUserInfo, 
} from '../utils/util';
import LeftRightLayout from '../components/LeftRightLayout';
import OrgBDListComponent from '../components/OrgBDListComponent';
import { Button } from 'antd';

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
      <LeftRightLayout 
        location={this.props.location} 
        name={i18n('menu.organization_bd') + (isAdd ? " / 查看BD": "")} 
        title={i18n('menu.bd_management')}
        // action={
        //   isAdd ? { name: '返回机构看板', link: '/app/org/bd' }
        //     : (hasPerm('BD.manageOrgBD') ? { name: i18n('add_orgbd'), link: '/app/orgbd/add' } : undefined)
        // }
        right={this.state.isProj ? <Button onClick={() => this.setState({ showBlacklist: true })}>添加黑名单</Button> : null}
      >
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
      </LeftRightLayout>)
  }

}


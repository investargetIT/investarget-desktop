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

export default class OrgBDList extends React.Component {
  
  constructor(props) {
    super(props);
  }

  render() {
    let isAdd = false;
    return (
      <LeftRightLayout 
        location={this.props.location} 
        name={i18n('menu.organization_bd') + (isAdd ? " / 查看BD": "")} 
        title={i18n('menu.bd_management')}
        action={
          this.props.editable ? (
              isAdd ? { name: '返回机构BD', link: '/app/org/bd' }
              : (hasPerm('BD.manageOrgBD') ? { name: i18n('add_orgbd'), link: '/app/orgbd/add' } : undefined)
            ) : null
          }>
        <OrgBDListComponent editable location={this.props.location} pagination={true}/>
      </LeftRightLayout>)
  }

}


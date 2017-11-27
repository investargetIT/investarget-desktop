import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';
import { i18n } from '../utils/util';
import * as api from '../api';

class OrgBdList extends React.Component {
  
  componentDidMount() {
    api.getOrgBdList()
    .then(result => echo(result))
  }

  render () {
    return (
        <LeftRightLayout location={this.props.location} title={i18n('menu.project_bd')} action={{ name: i18n('project_bd.add_project_bd'), link: "/app/projects/bd/add" }}>
        </LeftRightLayout>
    )
  }
}

export default OrgBdList;
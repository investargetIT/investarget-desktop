import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';

class ReportList extends React.Component {
  render() {
    const { location } = this.props;
    return  (
    <LeftRightLayout location={location} title="周报列表">
    </LeftRightLayout>
    );
  }
}

export default ReportList;

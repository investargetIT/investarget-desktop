import React from 'react';
import LeftRightLayoutPure from '../components/LeftRightLayoutPure';

class Dashboard extends React.Component {
  render() {
    return (
      <LeftRightLayoutPure location={this.props.location}>
        <h1>Dashboard</h1>
      </LeftRightLayoutPure>
    );
  }
}

export default Dashboard;

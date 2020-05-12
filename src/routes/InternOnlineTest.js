import React from 'react';
import LeftRightLayout from '../components/LeftRightLayout';

export default class InternOnlineTest extends React.Component {

  // constructor(props) {
  //   super(props);
  // }

  render() {
    return (
      <LeftRightLayout location={this.props.location} title="笔试">
        <h2>笔试</h2>
      </LeftRightLayout>
    );
  }

}


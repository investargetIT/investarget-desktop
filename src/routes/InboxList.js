import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'

class InboxList extends React.Component {
  render () {
    return (
      <LeftRightLayout location={this.props.location}>
        <h1>消息列表</h1>
      </LeftRightLayout>          
    )
  }
}

export default InboxList
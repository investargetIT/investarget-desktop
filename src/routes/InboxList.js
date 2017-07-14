import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { Pagination } from 'antd'

const leftContainerStyle = {
  width: '50%',
  minHeight: 360,
  float: 'left',
  borderRight: '1px solid rgb(236, 236, 235)'
}

const rightContainerStyle = {
  width: '50%',
  minHeight: 360,
  marginLeft: '50%',
}

const headerStyle = {
  fontSize: 18,
  lineHeight: 2.4,
  textAlign: 'center',
  borderBottom: '1px solid rgb(236, 236, 235)'
}

const titleStyle = {
  padding: '14px 20px',
  fontSize: 13,
  borderBottom: '1px solid rgb(236, 236, 235)',
  cursor: 'pointer'
}

const background = 'rgb(236, 235, 235)'

const activeTitleStyle = { ...titleStyle, background }

const data = [
  {
    id: 1,
    title: '有投资人收藏了您的项目，New investors have followed your project',
    detail: '发送时间： 2017-06-07 15:59\n\n投资人刘璐收藏了您的先锋项目：妇科癌症的领先治疗技术项目 。请及时登录联系投资人。Investor liu lu followed Project Project PIONEER: Breakthrough Technology for Gynecological Cancers. Please log in and take the chance to contact the investor as soon as possible.'
  },
  {
    id: 2,
    title: '有投资人收藏了您的项目，New investors have followed your project',
    detail: '发送时间： 2011-07-07 15:59\n\n投资人刘璐大叔藏了您的先锋项目：妇科癌症的领先治疗技术项目 。请及时登录联系投资人。Investor liu lu followed Project Project PIONEER: Breakthrough Technology for Gynecological Cancers. Please log in and take the chance to contact the investor as soon as possible.'
  },
  {
    id: 3,
    title: '有投资人收藏了您的项目，New investors have followed your project',
    detail: '发送时间： 2011-07-07 15:59\n\n投资人刘璐大叔藏了您的先锋项目：妇科癌症的领先治疗技术项目 。请及时登录联系投资人。Investor liu lu followed Project  to contact the investor as soon as possible.'
  },
  {
    id: 4,
    title: '有投资人收藏了您的项目，New investors have followed your project',
    detail: '发送时间： 2011-07-07 15:59\n\n投资人刘璐大叔藏了您的先锋项目：妇科癌症的领先治疗技术项目 。请及时登录联系投资人。Investor liu lu followed Project Project PIONEER: Breakthrough Technology for Gynecological Cancers. Please log in and take the chance to contact the investor as soon as possible.'
  },
  {
    id: 5,
    title: '有投资人收藏了您的项目，New investors have followed your project',
    detail: '发送时间： 2011-07-07 15:59\n\n投资人刘璐大叔藏了您的先锋项目：妇科癌症的领先治疗技术项目 。请及时登录联系投资人。Investor liu lu followed Project Project PIONEER: Breakthrough Technology for Gynecog in and take the chance to contact the investor as soon as possible.'
  },
  {
    id: 6,
    title: '有投资人收藏了您的项目，New investors have followed your project',
    detail: '发送时间： 2017-06-07 15:59\n\n投资人刘璐收藏了您的先锋项目：妇科癌症的领先治疗技术项目 。请及时登录联系投资人。Investor liu lu followed Project Project PIONEER: Breakthrough Technology for Gynecological Cancers. Please log in and take the chance to contact the investor as soon as possible.'
  },
  {
    id: 7,
    title: '有投资人收藏了您的项目，New investors have followed your project',
    detail: '发送时间： 2011-07-07 15:59\n\n投资人刘璐大叔藏了您的先锋项目：妇科癌症的领先治疗技术项目 。请及时登录联系投资人。Investor liu lu followed Project Project PIONEER: Breakthrough Technology for Gynecological Cancers. Please log in and take the chance to contact the investor as soon as possible.'
  },
  {
    id: 8,
    title: '有投资人收藏了您的项目，New investors have followed your project',
    detail: '发送时间： 2011-07-07 15:59\n\n投资人刘璐大叔藏了妇科癌症的领先治疗技术项目 。请及时登录联系投资人。Investor liu lu followed Project Project PIONEER: Breakthrough Technology for Gynecological Cancers. Please log in and take the chance to contact the investor as soon as possible.'
  },
  {
    id: 9,
    title: '有投资人收藏了您的项目，New investors have followed your project',
    detail: '发送时间： 2011-07-07 15:59\n\n投资人刘璐大叔藏了您的先锋项目：妇科癌症的领先治疗技术项目 。请及时登录联系投资人。Investor liu l Project Project PIONEER: Breakthrough Technology for Gynecological Cancers. Please log in and take the chance to contact the investor as soon as possible.'
  },
  {
    id: 10,
    title: '有投资人收藏了您的项目，New investors have followed your project',
    detail: '发送时间： 2011-07-07 15:59\n\n投资人刘璐大叔藏了您的先锋项目：妇科癌症的领先治疗技术项目 。请及时登录联系投资人。Investor liu lu fo Project PIONEER: Breakthrough Technology for Gynecological Cancers. Please log in and take the chance to contact the investor as soon as possible.'
  },
]

class InboxList extends React.Component {
  constructor(props) {
    super(props)

    this.state = { 
      data: data,
      currentId: 1
    }
  }

  handleItemClicked(id) {
    this.setState({ currentId: id })
  }

  render () {
    return (
      <LeftRightLayout 
        style={{ background: 'white', overflow: 'auto' }} 
        location={this.props.location}>

        <div style={leftContainerStyle}>
          
          <div style={headerStyle}>消息列表</div>

          <div><ul>
            {this.state.data.map(m => <li onClick={this.handleItemClicked.bind(this, m.id)} key={m.id} style={m.id === this.state.currentId ? activeTitleStyle : titleStyle}>{m.title}</li>)}
          </ul></div>

          <div style={{ padding: 20, textAlign: 'center' }}>
            <Pagination
              total={100}
              current={2}
              pageSize={10} />
          </div>

        </div>

        <div style={rightContainerStyle}>
          
          <div style={headerStyle}>消息详情</div>

          <div style={{ padding: '30px 14px', fontSize: 13, lineHeight: 1.8 }}>
            { this.state.data.filter(f => f.id === this.state.currentId)[0].detail
              .split('\n').map((item, key) => <span key={key}>{item}<br /></span>) }
          </div>

        </div>

      </LeftRightLayout>
    )
  }
}

export default InboxList
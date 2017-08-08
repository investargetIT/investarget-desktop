import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'


const titleStyle = {
  padding: '8px 0'
}
const avatarStyle = {
  display: 'inline-block',
  width: '40px',
  height: '40px',
  borderRadius: '100%',
  verticalAlign: 'middle',
  border: 0,
}


class TimelineView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
    }
  }

  getAllTimeline = () => {
    const param = { proj: this.props.projId, page_size: 10000 }
    api.getTimeline(param).then(result => {
      const timelineList = result.data.data
      const list = timelineList.map(item => {
        return {
          investor: item.investor,
          status: item.transationStatu.transationStatus.index,
        }
      })
      this.setState({ list })
    })
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['transactionStatus'] })
    this.getAllTimeline()
  }

  render() {
    const { transactionStatus }  = this.props

    return (
      <div>
        {
          transactionStatus.map(status => {
            const list = this.state.list.filter(item => item.status == status.index)
            return (
              <div key={status.id}>
                <h3 style={titleStyle}>{'step' + status.index + ' ' + status.name}</h3>
                <div className="clearfix">
                  {
                    list.map(item => {
                      return (
                        <Link key={item.investor.id} to={'/app/user/' + item.investor.id} target="_blank">
                          <img style={avatarStyle} src={item.investor.photourl} alt="" />
                        </Link>
                      )
                    })
                  }
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }
}


function mapStateToProps(state) {
  const { transactionStatus } = state.app
  return { transactionStatus }
}

export default connect(mapStateToProps)(TimelineView)

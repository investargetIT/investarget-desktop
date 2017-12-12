import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { Button,Popover } from 'antd'
import styles from './TimelineView.css'
import classNames from 'classnames'
import { i18n } from '../utils/util'

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

      <div className={styles['timeline']}>

        <div className={styles["timeline-line"]}></div>
         
        {
          transactionStatus.map((status, index) => {
            const list = this.state.list.filter(item => item.status == status.index)
            console.log(list)
            const step = index + 1
            const odd = step % 2 // 奇偶
            const colorList = ['#FD8B3B', '#2AA0AE', '#5649B9', '#F94545', '#0B87C1', '#F5C12D', '#EB090A', '#2AA0AE', '#855DC7', '#FF9B25', '#10458F']
            const color = colorList[index]
            const borderStyle = odd ? {borderTop: `3px solid ${color}`} : {borderRight: `3px solid ${color}`}
            return (
            <div key={status.id} className={classNames(styles["timeline-item"], 'clearfix')}>
                
                <div className={styles["timeline-badge"] + ' ' + styles["line-padding"]}>
                    <img src={`/images/timeline${step}.png`} />
                </div>
                <div className={styles["timeline-panel"]} >
                  <div className={styles["timeline-header"]}>
                      <div className={styles["timeline-title"]}>
                        {step}.{status.name}
                      </div>                                          
                      {list.length?<ViewInvestors investors={list}/>:null}                     
                  </div>
                </div>
              </div>
            )
            //   <div key={status.id} className={classNames(styles["timeline-item"], {[styles["inverted"]]: !odd}, 'clearfix')}>
            //     <div className={styles["timeline-datetime"]}>
            //         <span className={styles["timeline-time"]}>
            //           step{step}
            //         </span>
            //     </div>
            //     <div className={styles["timeline-badge"] + ' ' + styles["line-padding"]}>
            //         <img src={`/images/step${step}.png`} />
            //     </div>
            //     <div className={styles["timeline-panel"]} style={borderStyle}>
            //       <div className={styles["timeline-header"]}>
            //           <span className={styles["timeline-title"]}>
            //             {status.name}
            //           </span>
            //       </div>
            //       <div className={styles["timeline-body"] + ' clearfix'}>
            //         {
            //           list.map(item => {
            //             return (
            //               <div key={item.investor.id} className={styles["investor-box"]}>
            //                 <Link to={'/app/user/' + item.investor.id} target="_blank">
            //                   <img style={avatarStyle} src={item.investor.photourl} alt="" />
            //                 </Link>
            //               </div>
            //             )
            //           })
            //         }
            //       </div>
            //     </div>
            //   </div>
            // )
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

class ViewInvestors extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      visible:false,
      list:props.investors,
    }
  }

  handleVisibleChange = (visible) => {
    this.setState({ visible });
  }
  
  render(){  
    const blueTriangle={width:0,height:0,border:'5px solid transparent',borderTopColor:'#3573fd',top:'40%',right:'-10px',position:'absolute'}
    const investorStyle={maxWidth:'230px'}
    const imgStyle={width:'30px',height:'30px',margin:'4px'}
    return(

      <Popover
        content={ this.state.list.map(item=> <img key={item.investor.id} style={imgStyle} src={item.investor.photourl} />)}
        overlayStyle={investorStyle}
        placement="right"
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
      >
        <div style={{float:'right',marginRight:'20px',position:'relative'}}>
          <a type="primary"><div id="triangle" style={blueTriangle} ></div></a>
          <div style={{float:'right',marginRight:'10px'}}>{i18n('project.view_investor')}</div>                        
        </div>
        
      </Popover>
    )
  }
}

export default connect(mapStateToProps)(TimelineView)

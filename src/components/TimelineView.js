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
      showInvestorStep: null,
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
                      {list.length?<ViewInvestors isShowInvestor={this.state.showInvestorStep === step} investors={list} onShowInvestorBtnClicked={() => this.setState({ showInvestorStep: step })}/>:null}                     
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
  
  popoverContent(investor) {
    return (
      <div style={{minWidth: 100, textAlign: 'center'}} >
        <div style={{marginBottom: 4}}><img style={{ width: 30, height: 30 }} src={investor.photourl} /></div>
        <div style={{fontSize: 12, lineHeight: '16px'}}>{investor.username}</div>
        <div style={{fontSize: 12, lineHeight: '16px'}}>{investor.title && investor.title.name}</div>
      </div>
    )
  }

  render(){  
    const blueTriangle={width:0,height:0,border:'5px solid transparent',borderTopColor:'#3573fd',top:'40%',right:'-10px',position:'absolute'}
    const investorStyle={maxWidth:'230px'}
    const imgStyle={width:'30px',height:'30px',margin:'4px'}
    return(

      // <Popover
      //   className="custom-pop"
      //   content={ this.state.list.map(item=> <img key={item.investor.id} style={imgStyle} src={item.investor.photourl} />)}
      //   overlayStyle={investorStyle}
      //   placement="bottom"
      //   trigger="click"
      //   visible={this.state.visible}
      //   onVisibleChange={this.handleVisibleChange}
      // >
        <div  style={{float:'right',marginRight:'20px',position:'relative', cursor: 'pointer'}}>
          <a type="primary"><div onClick={this.props.onShowInvestorBtnClicked} id="triangle" style={blueTriangle} ></div></a>
          <div style={{float:'right',marginRight:'10px'}}>
          <div onClick={this.props.onShowInvestorBtnClicked}>{i18n('project.view_investor')}</div>
            {this.props.isShowInvestor ?
              <div style={{ position: 'absolute', width: this.state.list.length > 4 ? 200 : 'inherit', zIndex: 99 }}>
                <div style={{border: '1px solid rgb(203, 204, 205)'}}>
                {this.state.list.map(item => 
                <Popover key={item.investor.id} content={this.popoverContent(item.investor)}>
                <img key={item.investor.id} style={imgStyle} src={item.investor.photourl} />
                </Popover>
                )}
                </div>
              </div>
              : null}
          </div>                        
        </div>
        
      // </Popover>
    )
  }
}

export default connect(mapStateToProps)(TimelineView)

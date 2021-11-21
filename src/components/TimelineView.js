import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { Button,Popover } from 'antd'
import styles from './TimelineView.css'
import classNames from 'classnames'
import { i18n, hasPerm, getCurrentUser, requestAllData } from '../utils/util'

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
    this.orgBdRes = [];
  }

  getAllTimeline = () => {
    const param = { proj: this.props.projId, page_size: 100 }
    requestAllData(api.getTimelineBasic, param, 100).then(result => {
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
    // this.getAllTimeline()
    this.props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
    api.getSource('orgbdres').then(res => {
      this.orgBdRes = res.data;
      this.getAllOrgBD();
    })
  }

  getAllOrgBD = async () => {
    const params = {
      proj: this.props.projId,
      page_size: 100,
      response: this.orgBdRes.map(m => m.id)
    };
    if (!hasPerm('BD.manageOrgBD')) {
      params.manager = getCurrentUser();
    }
    const res = await requestAllData(api.getOrgBdList, params, 100);
    const { data: list } = res.data;
    this.setState({ list });
  }

  findRelatedStatusName = tranStatusName => {
    switch (tranStatusName) {
      case '获取项目概要':
        return '正在看前期资料';
      case '获取投资备忘录':
        return '已见面';
      case '签署保密协议':
        return '已签NDA';
      case 'Teaser Received':
        return 'Received';
      case 'CIM Received':
        return 'Teaser Received';
      default:
        return tranStatusName;
    }
  }

  render() {
    const { transactionStatus, orgbdres }  = this.props
    return (

      <div className={styles['timeline']}>

        <div className={styles["timeline-line"]}></div>
         
        {
          transactionStatus.map((status, index) => {
            const list = this.state.list.filter(item => {
              const response = orgbdres.filter(f => f.id === item.response);
              if (response.length === 0) return false;
              const curRes = response[0];
              return curRes.name === this.findRelatedStatusName(status.name);
            })
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
  const { transactionStatus, orgbdres } = state.app
  return { transactionStatus, orgbdres }
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
                <Popover key={item.id} content={this.popoverContent({
                  photourl: item.userinfo && item.userinfo.photourl,
                  username: item.username,
                  title: item.usertitle,
                })}>
                <img key={item.id} style={imgStyle} src={item.userinfo && item.userinfo.photourl} />
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
export { ViewInvestors };

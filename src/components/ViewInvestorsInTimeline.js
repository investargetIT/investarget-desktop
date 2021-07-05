import React from 'react';
import { Popover } from 'antd';
import { i18n } from '../utils/util';

class ViewInvestorsInTimeline extends React.Component{
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
        
    )
  }
}
export default ViewInvestorsInTimeline;
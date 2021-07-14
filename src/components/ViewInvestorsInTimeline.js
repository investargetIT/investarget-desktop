import React from 'react';
import {
  Popover,
  Button,
} from 'antd';
import {
  DownOutlined,
} from '@ant-design/icons';

const imgStyle = {
  width: '30px',
  height: '30px',
  margin: '4px',
};

class ViewInvestorsInTimeline extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      list: props.investors.sort(function (a, b) {
        return new Date(a.createdtime) - new Date(b.createdtime);
      }),
    };
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

  timelineInvestors = () => {
    return (
      <div style={{ display: 'block', width: this.state.list.length > 4 ? 200 : 'inherit', zIndex: 99 }}>
        <div style={{ border: '1px solid rgb(203, 204, 205)' }}>
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
    );
  }

  render() {
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ color: '#989898' }}>{this.state.list && this.state.list.length > 0 && this.state.list[0].createdtime.slice(0, 10)}</div>
        {/* <Popover
          className="custom-pop"
          content={this.timelineInvestors()}
          placement="bottom"
          trigger="click"
        > */}
          <Button size="small" type="link" onClick={this.props.onShowInvestorBtnClicked}><DownOutlined /></Button>
        {/* </Popover> */}
      </div>
    );
  }

}

export default ViewInvestorsInTimeline;
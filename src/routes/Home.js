import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { Radio, Button } from 'antd'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { i18n, isLogin } from '../utils/util'
import favicon from 'favicon.js'

const RadioGroup = Radio.Group

const options = [
  { label: <img style={{ height: 36, verticalAlign: 'middle' }} src="/images/investarget_new_new_logo.png" />, value: 1 },
  { label: <img style={{ height: 24, verticalAlign: 'middle' }} src="/images/autospace.png" />, value: 2 },
  { label: <img style={{ height: 24, verticalAlign: 'middle' }} src="/images/aura_logo.png" />, value: 3 },
  { label: <img style={{ height: 40, verticalAlign: 'middle' }} src="/images/logo_delova_biotech.png" />, value: 4 },
  { label: <img style={{ height: 40, verticalAlign: 'middle' }} src="/images/logo_hongyun.jpg" />, value: 5 },
]
let source

class Home extends React.Component {

  onChange = (e) => {
    source = e.target.value
  }

  onClick = () => {
    localStorage.setItem('source', source)
    // switch(source) {
    //   case 1:
    //     // favicon.change('/images/page_logo.png', '多维海拓 Investarget')
    //     document.title = '多维海拓 Investarget';
    //     break;
    //   case 2:
    //     // favicon.change('/images/autospace.ico', '车创 AutoSpace')
    //     document.title = '汽车·创新港';
    //     break;
    //   default:
    //     // favicon.change('/images/page_logo.png', '多维海拓 Investarget')
    // }
    // this.props.dispatch(routerRedux.push('/login'))
    window.location.href = '/login';
  }

  constructor(props) {
    super(props);

    if(isLogin()) {
      this.props.dispatch(routerRedux.push('/app'))
    } else {
      this.setSource();
      if (localStorage.getItem('source')) {
        window.location.href = '/login';
      }
    }
  }

  setSource() {
    switch (window.location.host) {
      case 'saas.investarget.com':
        localStorage.setItem('source', 1);
        break;
      case 'saastest.investarget.com':
        localStorage.setItem('source', 1);
        break;
      case 'pro.investarget.com':
        localStorage.setItem('source', 1);
        break; 
      case '192.168.2.209:8000':
        localStorage.setItem('source', 1);
        break;
      case '192.168.2.201:8000':
          localStorage.setItem('source', 1);
          break;
      case '39.107.14.53:802':
        localStorage.setItem('source', 2);
        break;
      case 'aura.investarget.com':
        localStorage.setItem('source', 3);
        break;
      case 'delovabio.investarget.com':
        localStorage.setItem('source', 4);
        break;
      case 'redcloudbio.investarget.com':
        localStorage.setItem('source', 5);
        break;
    }
  }

  render() {
    return (
    <div style={{ padding: 20 }}>
      <h1>{i18n('common.choose')}</h1>
      <RadioGroup onChange={this.onChange} options={options} />
      <div style={{ marginTop: 20 }}>
        <Button onClick={this.onClick} type="primary">{i18n('common.confirm')}</Button>
      </div>
    </div>
    );
  }
}

export default connect()(Home)

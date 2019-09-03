import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'
import { Radio, Button } from 'antd'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { i18n, isLogin } from '../utils/util'
import favicon from 'favicon.js'

const RadioGroup = Radio.Group

const options = [
  { label: <img style={{ height: 24, verticalAlign: 'middle', background: '#10458F' }} src="/images/investarget.png" />, value: 1 },
  { label: <img style={{ height: 24, verticalAlign: 'middle' }} src="/images/autospace.png" />, value: 2 },
  { label: <img style={{ height: 24, verticalAlign: 'middle' }} src="/images/aura_logo.png" />, value: 3 },
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

  componentDidMount() {
    if(isLogin()) {
      this.props.dispatch(routerRedux.push('/app'))
    }
  }

  render() {
    return <LeftRightLayout location={this.props.location}>
      <h1>{i18n('common.choose')}</h1>
      <RadioGroup onChange={this.onChange} options={options} />
      <div style={{ marginTop: 20 }}>
        <Button onClick={this.onClick} type="primary">{i18n('common.confirm')}</Button>
      </div>
    </LeftRightLayout>
  }
}

export default connect()(Home)

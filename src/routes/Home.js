import React from 'react'
import MainLayout from '../components/MainLayout'
import { Radio, Button } from 'antd'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import { i18n, isLogin } from '../utils/util'

const RadioGroup = Radio.Group

const options = [
  { label: <img style={{ height: 24, verticalAlign: 'middle', background: '#10458F' }} src="/images/investarget.png" />, value: 1 },
  { label: <img style={{ height: 24, verticalAlign: 'middle' }} src="/images/autospace.png" />, value: 2 },
]
let source

class Home extends React.Component {

  onChange = (e) => {
    source = e.target.value
  }

  onClick = () => {
    localStorage.setItem('source', source)
    this.props.dispatch(routerRedux.push('/login'))
  }

  componentDidMount() {
    if(isLogin()) {
      this.props.dispatch(routerRedux.push('/app'))
    }
  }

  render() {
    return <MainLayout location={this.props.location}>
      <h1>{i18n('common.choose')}</h1>
      <RadioGroup onChange={this.onChange} options={options} />
      <div style={{ marginTop: 20 }}>
        <Button onClick={this.onClick} type="primary">{i18n('common.confirm')}</Button>
      </div>
    </MainLayout>
  }
}

export default connect()(Home)

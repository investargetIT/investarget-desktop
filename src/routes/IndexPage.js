import React from 'react'
import { connect } from 'dva'
import MainLayout from '../components/MainLayout'
import { Button, Icon, Card, Col, Popconfirm } from 'antd'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

function SelectedContent(props) {

  const selectedStyle = {
    display: props.selected ? 'block' : 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4,
  }

  return (
    <div style={{ position: 'relative', margin: 10 }} onClick={props.onClick.bind(null, props.name)}>
      {props.children}
      <div style={selectedStyle}></div>
    </div>
  )
}

const data = [
  {name: 'Page A', uv: 4000, pv: 2400, amt: 2400},
  {name: 'Page B', uv: 3000, pv: 1398, amt: 2210},
  {name: 'Page C', uv: 2000, pv: 9800, amt: 2290},
  {name: 'Page D', uv: 2780, pv: 3908, amt: 2000},
  {name: 'Page E', uv: 1890, pv: 4800, amt: 2181},
  {name: 'Page F', uv: 2390, pv: 3800, amt: 2500},
  {name: 'Page G', uv: 3490, pv: 4300, amt: 2100},
]

function SimpleLineChart(props) {
  return (
    <Card
      title="SimpleLineChart"
      bordered={false}
      extra={
        <Popconfirm title="Confirm to delete?" onConfirm={props.onClose.bind(null, 'simple_line_chart')}>
          <Icon style={{ cursor: "pointer" }} type="close" />
        </Popconfirm>
      }
      style={{ margin: '10px 0 0 10px' }}>
      <LineChart style={{ margin: '0 auto' }} width={600} height={300} data={data}
        margin={{top: 5, right: 30, left: 20, bottom: 5}}>
        <XAxis dataKey="name"/>
        <YAxis/>
        <CartesianGrid strokeDasharray="3 3"/>
        <Tooltip/>
        <Legend />
        <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{r: 8}}/>
        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
      </LineChart>
    </Card>
  )
}

const barData = [
  {name: 'Page A', uv: 4000, pv: 2400, amt: 2400},
  {name: 'Page B', uv: 3000, pv: 1398, amt: 2210},
  {name: 'Page C', uv: 2000, pv: 9800, amt: 2290},
  {name: 'Page D', uv: 2780, pv: 3908, amt: 2000},
  {name: 'Page E', uv: 1890, pv: 4800, amt: 2181},
  {name: 'Page F', uv: 2390, pv: 3800, amt: 2500},
  {name: 'Page G', uv: 3490, pv: 4300, amt: 2100},
]

function SimpleBarChart(props) {
  return (
    <Card title="SimpleBarChart" bordered={false} style={{ margin: '10px 0 0 10px' }} extra={
      <Popconfirm title="Confirm to delete?" onConfirm={props.onClose.bind(null, 'simple_bar_chart')}>
        <Icon style={{ cursor: "pointer" }} type="close" />
      </Popconfirm>
    }>
    <BarChart style={{ margin: '0 auto' }} width={600} height={300} data={barData}
      margin={{top: 5, right: 30, left: 20, bottom: 5}}>
      <XAxis dataKey="name"/>
      <YAxis/>
      <CartesianGrid strokeDasharray="3 3"/>
      <Tooltip/>
      <Legend />
      <Bar dataKey="pv" fill="#8884d8" />
      <Bar dataKey="uv" fill="#82ca9d" />
    </BarChart>
  </Card>
  )
}

class IndexPage extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      widgets: ['simple_line_chart', 'simple_bar_chart'],
      selectedWidgets: [],
      selectMode: false,
    }

    this.closeCard = this.closeCard.bind(this)
    this.handleWidgetClicked = this.handleWidgetClicked.bind(this)
    this.addWidgetButtonClicked = this.addWidgetButtonClicked.bind(this)
    this.confirmAddWidgets = this.confirmAddWidgets.bind(this)
  }

  closeCard(widgetName) {
    const index = this.state.widgets.indexOf(widgetName)
    if (index > -1) {
      const newWidgetList = this.state.widgets.slice()
      newWidgetList.splice(index, 1)
      this.setState({widgets: newWidgetList})
    }
  }

  handleWidgetClicked(name) {
    const index = this.state.selectedWidgets.indexOf(name)
    const widgets = this.state.selectedWidgets.slice()
    if (index > -1) {
      widgets.splice(index, 1)
    } else {
      widgets.push(name)
    }
    this.setState({ selectedWidgets: widgets })
  }

  addWidgetButtonClicked() {
    this.setState({selectMode: !this.state.selectMode})
  }

  confirmAddWidgets() {
    this.setState({
      selectMode: false,
      widgets: this.state.widgets.concat(this.state.selectedWidgets),
      selectedWidgets: []
    })
  }

  render() {
    return (
      <MainLayout location={location} style={{}}>

        <Col span={16}>

          { this.state.widgets.includes('simple_line_chart') ? <SimpleLineChart onClose={this.closeCard} /> : null }
          { this.state.widgets.includes('simple_bar_chart') ? <SimpleBarChart onClose={this.closeCard} /> : null }

          { this.state.widgets.includes('card_title_3') ?
          <Card title="Card title 3" bordered={false} style={{ margin: '10px 0 0 10px' }}>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
          </Card> : null }

        </Col>

        <Col span={8}>

          { this.state.widgets.includes('card_title_4') ?
          <Card title="Card title 4" bordered={false} style={{ margin: '10px 0 0 10px' }} extra={
      <Popconfirm title="Confirm to delete?" onConfirm={this.closeCard.bind(null, 'card_title_4')}>
        <Icon style={{ cursor: "pointer" }} type="close" />
      </Popconfirm>
          }>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
          </Card> : null }

          { this.state.widgets.includes('card_title_5') ?
          <Card title="Card title 5" bordered={false} style={{ margin: '10px 0 0 10px' }}>
            <p>Card content</p>
            <p>Card content</p>
          </Card> : null }

          { this.state.widgets.includes('card_title_6') ?
          <Card title="Card title 6" bordered={false} style={{ margin: '10px 0 0 10px' }}>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
          </Card> : null }

          <Card bordered={false} style={{ margin: '10px 0 0 10px' }}>
            <Button onClick={this.addWidgetButtonClicked}>Add Widget</Button>
          </Card>

        </Col>

        <div style={{ display: this.state.selectMode ? 'block': 'none', position: 'fixed', top: 0, bottom: 0, right: 0, width: 300,  background: '#CCC', overflow: 'auto' }}>

          { !this.state.widgets.includes('simple_line_chart') ? <SimpleLineChart onClose={this.closeCard} /> : null }
          { !this.state.widgets.includes('simple_bar_chart') ? <SimpleBarChart onClose={this.closeCard} /> : null }

          { !this.state.widgets.includes('card_title_3') ?
          <SelectedContent selected={this.state.selectedWidgets.includes("card_title_3")}  name="card_title_3" onClick={this.handleWidgetClicked}>
              <Card title="Card title 3" bordered={false}>
            <p>Card content</p>
            <p>Card content</p>
            <p>Card content</p>
        </Card></SelectedContent> : null }

          { !this.state.widgets.includes('card_title_4') ?
          <SelectedContent selected={this.state.selectedWidgets.includes("card_title_4")}  name="card_title_4" onClick={this.handleWidgetClicked}>
            <Card title="Card title 4" bordered={false}>
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
          </SelectedContent> : null }

          { !this.state.widgets.includes('card_title_5') ?
          <SelectedContent selected={this.state.selectedWidgets.includes("card_title_5")}  name="card_title_5" onClick={this.handleWidgetClicked}>
            <Card title="Card title 5" bordered={false}>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
          </SelectedContent> : null }

          { !this.state.widgets.includes('card_title_6') ?
          <SelectedContent selected={this.state.selectedWidgets.includes("card_title_6")}  name="card_title_6" onClick={this.handleWidgetClicked}>
            <Card title="Card title 6" bordered={false}>
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
              <p>Card content</p>
            </Card>
          </SelectedContent> : null }

          <div style={{ margin: 10, textAlign: 'center' }}>
            <Button type="primary" onClick={this.confirmAddWidgets}>确定</Button>
            <Button style={{ marginLeft: 10 }} onClick={this.addWidgetButtonClicked}>取消</Button>
          </div>

        </div>

      </MainLayout>
    )
  }
}

export default connect()(IndexPage)

import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { Button, Icon, Card, Col, Popconfirm, Pagination, Carousel, Row } from 'antd'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { i18n, handleError, time } from '../utils/util'
import createG2 from '../g2-react';
import { Stat, Frame } from 'g2';
import data1 from '../diamond.json';
import data2 from '../top2000.json';
import data3 from '../populationByAge.json';
import LeftRightLayout from '../components/LeftRightLayout'
import * as api from '../api';

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

class News extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
    }
  }

  getNews = () => {
    api.getWxMsg({ isShow: true }).then(result => {
      this.setState({ list: result.data.data })
    }).catch(error => {
      handleError(error)
    })
  }

  componentDidMount() {
    this.getNews()
    // 60s 刷新一次
    this.timer = setInterval(() => {
      api.getWxMsg({ isShow: true }).then(result => {
        this.setState({ list: [] }, () => {
          this.setState({ list: result.data.data })
        })
      })
    }, 60000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  render() {
    return (
      <Card title={i18n('market_news')} bordered={false} extra={
        <div style={{fontSize: 16}}>
          <Link to="/app/wxmsg">
            <Icon style={{ cursor: "pointer", marginRight: 8 }} type="edit" />
          </Link>
          <Popconfirm title="Confirm to delete?" onConfirm={this.props.onClose.bind(null, 'news')}>
            <Icon style={{ cursor: "pointer" }} type="close" />
          </Popconfirm>
        </div>
      }>
        {this.state.list.length > 0 ? (
          <Carousel vertical={true} autoplay={true} dots={false}>
            {this.state.list.map(item => {
              return <div key={item.id} style={{height:100,overflow:'scroll'}}><p style={{fontSize:13}}>{item.content}</p></div>
            })}
          </Carousel>
        ) : <div style={{height:100}}><p style={{fontSize:13}}>{i18n('no_news')}</p></div>}
      </Card>
    )
  }
}


class IndexPage extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      widgets: ['news', 'simple_line_chart', 'simple_bar_chart'],
      selectedWidgets: [],
      selectMode: false,
      investEvent: null,
      investRound: null,
      investAddr: null,
      investDegree: null,
    }

    this.closeCard = this.closeCard.bind(this)
    this.handleWidgetClicked = this.handleWidgetClicked.bind(this)
    this.addWidgetButtonClicked = this.addWidgetButtonClicked.bind(this)
    this.confirmAddWidgets = this.confirmAddWidgets.bind(this)
  }

  componentDidMount () {
    // Trigger resize event directly doesn't work unless wrap it with `setTimeout`
    // I don't know why
    // setTimeout(() => window.dispatchEvent(new Event('resize')), 100);

    const allReq = [
      api.getStatisticalData('com'),
      api.getStatisticalData('evecat'),
      api.getStatisticalData('everound'),
      api.getStatisticalData('eveaddr'),
    ];

    Promise.all(allReq)
    .then(result => {

      const investDegree = [];
      for (var key in result[0].data) {
        if (result[0].data.hasOwnProperty(key) && key !== '企业服务' && key !== '电子商务') {
          var value = result[0].data[key];
          var item = {
            "name": key,
            "y": value,
            "x": result[1].data[key],
            "z": value,
          }
          investDegree.push(item);
        }
      }

      const investEvent = [];
      for (var key in result[1].data) {
        if (result[1].data.hasOwnProperty(key)) {
          var value = result[1].data[key];
          var item = {
            "industry": key,
            "number": value
          }
          investEvent.push(item);
        }
      }
      const investRound = [];
      for (var key in result[2].data) {
        if (result[2].data.hasOwnProperty(key)) {
          var value = result[2].data[key];
          var item = {...value, year: key}
          investRound.push(item);
        }
      }
      const investAddr = [];
      for (var key in result[3].data) {
        if (result[3].data.hasOwnProperty(key)) {
          var value = result[3].data[key];
          var item = {
            "name": key,
            "value": value
          }
          investAddr.push(item);
        }
      }
      investAddr.sort( (a, b) => b.value - a.value);
      this.setState({ investEvent, investAddr: investAddr.slice(0, 6), investRound, investDegree });
    });
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
      <LeftRightLayout location={this.props.location} title="Dashboard">

        <Row style={{ height: 150, overflow: 'hidden' }}>
          <Col span={6} style={{ height: '100%' }}>
          <div style={{ height: 130, margin: 10, backgroundColor: 'rgb(41, 174, 154)', overflow: 'hidden' }}>
          <img style={{ background: '#10458F', width: 200, margin: 'auto', verticalAlign: 'middle' }} src="/images/investor_stat.png" />
          </div>
          </Col>
          <Col span={3} style={{ height: '100%' }}>
          <div style={{ height: 130, margin: '10px 5px', backgroundColor: 'rgb(239, 172, 87)', overflow: 'hidden' }}>
          <img style={{ width: 80, marginTop: 20 }} src="/images/calendar.png" />
          </div>
          </Col>
          <Col span={3} style={{ height: '100%'  }}>
          <div style={{ height: 130, margin: '10px 5px', backgroundColor: 'rgb(215, 84, 82)', overflow: 'hidden' }}>
          <img style={{ width: 80, marginTop: 20 }} src="/images/time.png" />
          </div>
          </Col>
          <Col span={12}>
        <News onClose={this.closeCard} />
        </Col>
        </Row>

        <Row>
          <Col span={12}>
            { this.state.investEvent ? <InvestBarChart data={this.state.investEvent} /> : null }
          </Col>
          <Col span={12}>
            { this.state.investRound ? <PopulationByAge data={ this.state.investRound} /> : null }
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            { this.state.investDegree ? <IndustryDegree data={this.state.investDegree} /> : null }
          </Col>
          <Col span={12}>
            { this.state.investAddr ? <EventArea data={this.state.investAddr} /> : null }
          </Col>
        </Row>

      </LeftRightLayout>
    )
  }
}

function EventArea(props) {

  const data1 = [
    {name: 'Microsoft Internet Explorer', value: 56.33 },
    {name: 'Chrome', value: 24.03},
    {name: 'Firefox', value: 10.38},
    {name: 'Safari',  value: 4.77},
    {name: 'Opera', value: 0.91},
    {name: 'Proprietary or Undetectable', value: 0.2}
  ];

  const Pie = createG2(chart => {
    chart.coord('theta', {
      radius: 0.8
    });
    chart.legend(false);
    chart.tooltip({
      title: null,
      map: {
        value: 'value'
      }
    });
    chart.intervalStack().position(Stat.summary.percent('value'))
    .color('name', ['rgb(243, 137, 96)', 'rgb(89, 164, 175)', 'green', 'blue', 'yellow', 'cyan'])
    .label('name*..percent',function(name, percent){
      percent = (percent * 100).toFixed(2) + '%';
      return name + ' ' + percent;
    });
    chart.render();
  });

  return (
    <Pie
    data={props.data}
    width= {500}
    height={400}
    plotCfg={ {
      margin: [100, 100, 100, 10],
    }}
    forceFit={true}
  />
  );

}

function InvestBarChart(props) {
  const Chart = createG2(chart => {
    chart.axis('industry',{
      title: null
    });
    chart.axis('number',{
      title: null
    });
    chart.coord('rect');
    chart.interval().position('industry*number').color('rgb(245, 137, 91)');
    chart.render();
  });

  var data = [
    {"industry":"北京市","number":19612368},
    {"industry":"天津市","number":12938693},
    {"industry":"河北省","number":71854210},
    {"industry":"山西省","number":27500000},
    {"industry":"内蒙古自治区","number":24706291},
    {"industry":"辽宁省","number":43746323},
    {"industry":"吉林省","number":27452815},
    {"industry":"黑龙江省","number":38313991},
    {"industry":"上海市","number":23019196},
  ];
  data = props.data;
  var frame = new Frame(data);
  frame = Frame.sortBy(frame, function(obj1, obj2) {
    return obj2['number'] - obj1['number'];
  });
  return (
    <div>
      <Chart
      data={frame }
      width={500}
      height={400}
      plotCfg={
        {margin: [20, 60, 80, 80]}
      } forceFit={true} />
</div>
  );

}

function PopulationByAge(props) {
  const Chart = createG2(chart => {
    chart.legend({
      position: 'bottom'
    });
    chart.axis('year', {
      title: null
    });
    chart.axis('投资事件数量', {
      title: '投资事件数量',
      // titleOffset: 75,
      formatter: function(val) {
        return val / 1000 + 'K';
      },
      position: 'right'
    });
    chart.coord('rect').transpose();
    chart.intervalStack()
      .position('year*投资事件数量')
      .color('轮次', ['#98ABC5', '#8A89A6', '#7B6888', '#6B486B', '#A05D56', '#D0743C', '#FF8C00'])
      ;
    chart.render();
  });

  var frame1 = new Frame(props.data);
  frame1 = Frame.combinColumns(frame1,["A+轮","A轮","B+轮","B轮","C+轮","C轮","D+轮","D轮"],'投资事件数量','轮次','year');
  return (
    <div>
    <Chart
      data={frame1}
      width={600}
      height={400}
      plotCfg={{
        margin: [30, 20, 90, 80],
        }}
          // 绘图区域背景设置}
      forceFit={true} />
</div>
  )
}

function IndustryDegree(props) {
  const data = [
    { x: 95, y: 95, z: 13.8, name: 'BE', country: 'Belgium' },
    { x: 86.5, y: 102.9, z: 14.7, name: 'DE', country: 'Germany' },
    { x: 80.8, y: 91.5, z: 15.8, name: 'FI', country: 'Finland' },
    { x: 80.4, y: 102.5, z: 12, name: 'NL', country: 'Netherlands' },
    { x: 80.3, y: 86.1, z: 11.8, name: 'SE', country: 'Sweden' },
    { x: 78.4, y: 70.1, z: 16.6, name: 'ES', country: 'Spain' },
    { x: 74.2, y: 68.5, z: 14.5, name: 'FR', country: 'France' },
    { x: 73.5, y: 83.1, z: 10, name: 'NO', country: 'Norway' },
    { x: 71, y: 93.2, z: 24.7, name: 'UK', country: 'United Kingdom' },
    { x: 69.2, y: 57.6, z: 10.4, name: 'IT', country: 'Italy' },
    { x: 68.6, y: 20, z: 16, name: 'RU', country: 'Russia' },
    { x: 65.5, y: 126.4, z: 35.3, name: 'US', country: 'United States' },
    { x: 65.4, y: 50.8, z: 28.5, name: 'HU', country: 'Hungary' },
    { x: 63.4, y: 51.8, z: 15.4, name: 'PT', country: 'Portugal' },
    { x: 64, y: 82.9, z: 31.3, name: 'NZ', country: 'New Zealand' }
  ];

  const Chart = createG2(chart => {
    chart.col('x', {
      alias: '事件数量', // 定义别名
      // tickInterval: 5, // 自定义刻度间距
      // nice: false, // 不对最大最小值优化
      // max: 96, // 自定义最大值
      // min: 62 // 自定义最小值
    });
    chart.col('y', {
      alias: '公司数量',
      // tickInterval: 50,
      // nice: false,
      // max: 165,
      // min: 0
    });
    chart.col('z', {
      alias: '公司数量'
    });
    // 开始配置坐标轴
    chart.axis('x', {
      // formatter: function(val) {
      //   return val + ' gr'; // 格式化坐标轴显示文本
      // },
      grid: {
        line: {
          stroke: '#d9d9d9',
          lineWidth: 1,
          lineDash: [2,2]
        }
      }
    });
    chart.axis('y', {
      // titleOffset: 80, // 设置标题距离坐标轴的距离
      // formatter: function(val) {
      //   if (val > 0) {
      //     return val + ' gr';
      //   }
      // }
    });
    chart.legend(false);
    chart.tooltip({
      map: {
        title: 'name'
      }
    });
    chart.point().position('x*y').size('z', 40, 10).label('name*name', {
      offset:0, // 文本距离图形的距离
      label: {
        fill: '#000',
        fontWeight: 'bold', // 文本粗细
        shadowBlur: 5, // 文本阴影模糊
        shadowColor: '#fff' // 阴影颜色
      },
    }).color('#3182bd').opacity(0.5).shape('circle').tooltip('x*y*z');
    // chart.guide().tag([65, 'min'], [65, 'max'], 'Safe fat intake 65g/day');
    // chart.guide().tag(['min', 50], ['max', 50], 'Safe sugar intake 50g/day');
    chart.render();
  });

  return (
    <div>
      <Chart
        data={props.data}
        width={700}
        height={400}
        plotCfg={ {
            margin: [20, 80, 90, 80],
            background: {
              stroke: '#ccc', // 边颜色
              lineWidth: 1, // 边框粗细
            } // 绘图区域背景设置
          }}
        forceFit={true} />
</div>
  );
}

export default connect()(IndexPage)

import React from 'react'
import { Calendar, Modal, DatePicker, TimePicker, Select, Input, Checkbox, Form, Row, Col, Button, Popconfirm } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { handleError, time } from '../utils/util'
import * as api from '../api'
import styles from './Schedule.css'
const Option = Select.Option
import { SelectNumber } from '../components/ExtraInput'
import moment from 'moment'

import ScheduleForm from '../components/ScheduleForm'

function mapPropsToFields(props) {
  return props.data
}
const AddScheduleForm = Form.create()(ScheduleForm)
const EditScheduleForm = Form.create({ mapPropsToFields })(ScheduleForm)

const eventTitleStyle = {
  float: 'right',
  fontSize: '12px',
  fontWeight: 'normal',
  marginLeft: 8,
}


class Schedule extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      total: 0,
      list: [],
      event: {},
      visibleAdd: false,
      visibleEvent: false,
      visibleEdit: false,
      selectedDate: null,
    }
  }

  getListData = (value) => {
    const date = value.format('YYYY-MM-DD')
    return this.state.list.filter(item => {
      return item.scheduledtime.slice(0,10) == date
    })
  }

  dateCellRender = (value) => {
    const listData = this.getListData(value);
    return (
      <ul className="events">
        {
          listData.map(item => (
            <li className={styles['event']} key={item.id} onClick={this.handleClickEvent.bind(this, item.id)}>
              {item.comments}
            </li>
          ))
        }
      </ul>
    );
  }

  handleClickEvent = (id, e) => {
    e.stopPropagation()
    const event = this.state.list.filter(item => item.id == id)[0] || {}
    this.setState({visibleEvent:true, event })
    this.eventEl = e.target
    this.eventEl.classList.add('event-selected')
  }

  getMonthData = (value) => {
    //
  }

  monthCellRender = (value) => {
    const num = this.getMonthData(value);
    return num ? (
      <div className="notes-month">
        <section>{num}</section>
        <span>Backlog number</span>
      </div>
    ) : null;
  }

  onPanelChange = (date, mode) => {

  }

  onSelect = (date, dateString) => {
    this.setState({ visibleAdd: true, selectedDate: date })
  }

  getEvents = () => {
    api.getSchedule().then(result => {
      var { count: total, data: list } = result.data
      list.sort((a, b) => {
        return new Date(a.scheduledtime) - new Date(b.scheduledtime)
      })
      this.setState({ total, list })
    }).catch(error => {
      handleError(error)
    })
  }

  addEvent = () => {
    this.addForm.validateFields((err, values) => {
      if (!err) {
        let param = toData(values)
        api.addSchedule(param).then(result => {
          this.setState({ visibleAdd: false })
          this.getEvents()
        }).catch(error => {
          this.setState({ visibleAdd: false })
          handleError(error)
        })
      }
    })
  }

  editEvent = () => {
    this.editForm.validateFields((err, values) => {
      if (!err) {
        let param = toData(values)
        let id = this.state.event.id
        api.editSchedule(id, param).then(result => {
          this.setState({ visibleEdit: false })
          this.getEvents()
        }).catch(error => {
          this.setState({ visibleEdit: false })
          handleError(error)
        })
      }
    })
  }

  deleteEvent = () => {
    let id = this.state.event.id
    api.deleteSchedule(id).then(result => {
      this.setState({ visibleEvent: false })
      this.getEvents()
    }).catch(error => {
      this.setState({ visibleEvent: false })
      handleError(error)
    })
  }

  showEditModal = () => {
    this.setState({ visibleEdit: true, visibleEvent: false })
  }

  handleRef = (inst) => {
    if (inst) {
      this.addForm = inst.props.form
    }
  }

  handleRef2 = (inst) => {
    if (inst) {
      this.editForm = inst.props.form
    }
  }

  componentDidMount() {
    this.getEvents()
  }

  render() {
    const modalStyle = {
    }
    const maskStyle = {
      backgroundColor: 'rgba(0,0,0,.38)',
    }

    const { visibleAdd, visibleEdit, visibleEvent, selectedDate  } = this.state

    const eventTitle = (
      <div style={{marginRight:32}}>
        活动
        <Popconfirm title="确定删除吗?" onConfirm={this.deleteEvent}>
          <a href="javascript:void(0)" style={eventTitleStyle}>删除</a>
        </Popconfirm>
        <a href="javascript:void(0)" style={eventTitleStyle} onClick={this.showEditModal}>修改</a>
      </div>
    )

    return (

      <MainLayout location={this.props.location}>
        <PageTitle title="日程安排" />

        <Calendar
          dateCellRender={this.dateCellRender}
          monthCellRender={this.monthCellRender}
          onPanelChange={this.onPanelChange}
          onSelect={this.onSelect}
        />

        <Modal
          title="新建活动"
          visible={visibleAdd}
          onOk={this.addEvent}
          onCancel={() => { this.setState({ visibleAdd: false }) }}
          style={modalStyle}
          maskStyle={maskStyle}
        >
          { visibleAdd ? <AddScheduleForm wrappedComponentRef={this.handleRef} isAdd date={selectedDate} /> : null }
        </Modal>

        <Modal
          title={eventTitle}
          visible={visibleEvent}
          onCancel={() => { this.setState({ visibleEvent: false, event: {} }); this.eventEl.classList.remove('event-selected'); }}
          maskStyle={maskStyle}
          footer={null}
        >
          <Event {...this.state.event} />
        </Modal>

        <Modal
          title="修改活动"
          visible={visibleEdit}
          onOk={this.editEvent}
          onCancel={() => { this.setState({ visibleEdit: false, event: {} }) }}
          maskStyle={maskStyle}
        >
          <EditScheduleForm wrappedComponentRef={this.handleRef2} data={toFormData(this.state.event)} />
        </Modal>
      </MainLayout>
    )
  }
}



export default Schedule


function toData(formData) {
  var data = {...formData}
  data['scheduledtime'] = data['scheduledtime'].format('YYYY-MM-DDTHH:mm:ss')
  return data
}

function toFormData(data) {
  var formData = {
    comments: data.comments,
    scheduledtime: moment(data.scheduledtime),
    address: data.address,
    proj: data.proj,
    user: data.user && data.user.id,
  }
  for (let prop in formData) {
    formData[prop] = { value: formData[prop] }
  }
  return formData
}

function Event(props) {
  return (
    <div>
      <Field title="标题：" content={props.comments} />
      <Field title="时间：" content={props.scheduledtime ? time(props.scheduledtime + props.timezone) : ''} />
      <Field title="地址：" content={props.address} />
      <Field title="项目：" content={props.projtitle} />
      <Field title="投资人：" content={props.user && props.user.username} />
    </div>
  )
}


const rowStyle = {
  // borderBottom: '1px dashed #eee',
  padding: '8px 0',
  fontSize: '13px',
}
const leftStyle = {

}
const rightStyle = {
  overflow: 'hidden',
}

const Field = (props) => {
  return (
    <Row style={rowStyle} gutter={24}>
      <Col span={6} style={leftStyle}>
        <div style={{textAlign: 'right'}}>{props.title}</div>
      </Col>
      <Col span={18} style={rightStyle}>
        <div>{props.content}</div>
      </Col>
    </Row>
  )
}

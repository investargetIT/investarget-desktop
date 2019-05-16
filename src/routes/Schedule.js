import React from 'react'
import { Calendar, Modal, DatePicker, TimePicker, Select, Input, Checkbox, Form, Row, Col, Button, Popconfirm } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import { handleError, time, i18n, getCurrentUser } from '../utils/util'
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
      selectedDate: moment(),
      mode: 'month',
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
            <li className={styles['event-type' + (item.type ? `-${item.type}` : '-3')]} key={item.id} onClick={this.handleClickEvent.bind(this, item.id)}>
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
    //
  }

  onPanelChange = (date, mode) => {
    this.setState({ mode, selectedDate: date }, () => mode === 'month' ? this.getEvents() : undefined);
  }

  onSelect = date => {
    if (this.state.mode == 'month' && date.diff(moment(), 'days') >= 0) {
      this.setState({ visibleAdd: true, selectedDate: date.startOf('hour') })
    } else {
      this.setState({ selectedDate: date });
    }
  }

  getEvents = () => {
    api.getSchedule({ 
      createuser: getCurrentUser(), 
      page_size: 100, 
      date: this.state.selectedDate.format('YYYY-MM-DD'),
    })
    .then(result => {
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
        window.echo('param', param);
        return;
        api.getUserSession()
          .then(() => api.addSchedule(param)) // 如果是视频会议还需要调这个接口吗？
          .then(() => {
            if (param.type === 4) {
              const body = {
                startDate: param.scheduledtime,
                duration: 20, // 目前没有设置的地方
                title: param.comments,
                agenda: 'Test', // 没有设置的地方
                password: '123456', // 同样没有设置的地方
              };
              return api.addWebexMeeting(body);
            }
          })
          .then(result => {
            this.hideAddModal()
            this.getEvents()
          })
          .catch(error => {
            this.hideEditModal()
            handleError(error)
          });
      }
    })
  }

  editEvent = () => {
    this.editForm.validateFields((err, values) => {
      if (!err) {
        let param = toData(values)
        let id = this.state.event.id
        api.editSchedule(id, param).then(result => {
          this.hideEditModal()
          this.getEvents()
        }).catch(error => {
          this.hideEditModal()
          handleError(error)
        })
      }
    })
  }

  deleteEvent = () => {
    let id = this.state.event.id
    api.deleteSchedule(id).then(result => {
      this.hideEventModal()
      this.getEvents()
    }).catch(error => {
      this.hideEventModal()
      handleError(error)
    })
  }

  hideAddModal = () => {
    this.setState({ visibleAdd: false })
  }

  hideEventModal = () => {
    this.setState({ visibleEvent: false });
    this.eventEl.classList.remove('event-selected')
  }

  showEditModal = () => {
    this.setState({ visibleEvent: false })
    this.eventEl.classList.remove('event-selected')
    this.setState({ visibleEdit: true })
  }

  hideEditModal = () => {
    this.setState({ visibleEdit: false, event: {} })
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
        {i18n('schedule.event')}
        <Popconfirm title={i18n('delete_confirm')} onConfirm={this.deleteEvent}>
          <a href="javascript:void(0)" style={eventTitleStyle}>{i18n('common.delete')}</a>
        </Popconfirm>
        { moment(this.state.event.scheduledtime + this.state.event.timezone) < moment().startOf('day') ? null : 
        <a href="javascript:void(0)" style={eventTitleStyle} onClick={this.showEditModal}>{i18n('common.edit')}</a>
        }
      </div>
    )
    return (

      <LeftRightLayout location={this.props.location} title={i18n('schedule.my_schedule')}>

        <Calendar
          dateCellRender={this.dateCellRender}
          monthCellRender={this.monthCellRender}
          onPanelChange={this.onPanelChange}
          onSelect={this.onSelect}
          value={selectedDate}
        />

        <div style={{ display: 'flex' }}>
          <div>会议类型：</div>
          <div style={{ width: 20, height: 20, backgroundColor: 'rgb(230, 168, 47)' }}></div>
          <div style={{ marginLeft: 5 }}>路演会议</div>
          <div style={{ marginLeft: 20, width: 20, height: 20, backgroundColor: 'rgb(66, 175, 149)' }}></div>
          <div style={{ marginLeft: 5 }}>约见公司</div>
          <div style={{ marginLeft: 20, width: 20, height: 20, backgroundColor: 'rgb(95, 163, 246)' }}></div>
          <div style={{ marginLeft: 5 }}>约见投资人</div>
          <div style={{ marginLeft: 20, width: 20, height: 20, backgroundColor: 'red' }}></div>
          <div style={{ marginLeft: 5 }}>视频会议</div>
        </div>

        <Modal
          title={i18n('schedule.add_event')}
          visible={visibleAdd}
          onOk={this.addEvent}
          onCancel={this.hideAddModal}
          style={modalStyle}
          maskStyle={maskStyle}
        >
          { visibleAdd ? 
            <AddScheduleForm 
              wrappedComponentRef={this.handleRef} 
              isAdd 
              date={selectedDate}
              country={{ label: 'China', value: 42 }}
            /> 
          : null }
        </Modal>

        <Modal
          title={eventTitle}
          visible={visibleEvent}
          onCancel={this.hideEventModal}
          maskStyle={maskStyle}
          footer={null}
        >
          <Event {...this.state.event} />
        </Modal>

        <Modal
          title={i18n('schedule.edit_event')}
          visible={visibleEdit}
          onOk={this.editEvent}
          onCancel={this.hideEditModal}
          maskStyle={maskStyle}
        >
          <EditScheduleForm wrappedComponentRef={this.handleRef2} data={toFormData(this.state.event)} />
        </Modal>
      </LeftRightLayout>
    )
  }
}



export default Schedule


function toData(formData) {
  var data = {...formData}
  data['scheduledtime'] = data['scheduledtime'].format('YYYY-MM-DDTHH:mm:ss')
  if (!['中国', 'China'].includes(formData.country.label)) {
    data['location'] = null;
  }
  data.country = formData.country.value;
  return data
}

function toFormData(data) {
  var formData = {
    comments: data.comments,
    scheduledtime: data.scheduledtime && moment(data.scheduledtime),
    country: data.country && {label:data.country.country, value:data.country.id, areaCode:data.country.areaCode},
    location: data.location &&data.location.id,
    address: data.address,
    proj: data.proj && data.proj.id,
    user: data.user && data.user.id,
    type: data.type || 3,
  }
  for (let prop in formData) {
    formData[prop] = { value: formData[prop] }
  }
  return formData
}

function Event(props) {
  return (
    <div>
      <Field title={i18n('schedule.title')} content={props.comments} />
      <Field title={i18n('schedule.schedule_time')} content={props.scheduledtime ? time(props.scheduledtime + props.timezone) : ''} />
      <Field title={i18n('user.country')} content={props.country&&props.country.country} />
      {props.location?<Field title={i18n('schedule.area')} content={props.location.name} />:null}
      <Field title={i18n('schedule.address')} content={props.address} />
      <Field title={i18n('schedule.project')} content={props.projtitle} />
      <Field title={i18n('schedule.investor')} content={props.user && props.user.username} />
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

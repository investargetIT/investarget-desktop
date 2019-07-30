import React from 'react'
import { Calendar, Modal, DatePicker, TimePicker, Select, Input, Checkbox, Form, Row, Col, Button, Popconfirm } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'

import { handleError, time, i18n, getCurrentUser, getUserInfo } from '../utils/util'
import * as api from '../api'
import styles from './Schedule.css'
const Option = Select.Option
import { SelectNumber } from '../components/ExtraInput'
import moment from 'moment'

import ScheduleForm from '../components/ScheduleForm'

function mapPropsToFields(props) {
  return props.data
}
function onValuesChange(props, values) {
  window.echo('props', props);
  window.echo('values', values);
  if (values.proj) {
    props.onProjChange(values.proj);
  }
}
function mapAddPropsToFields(props) {
  window.echo('map to fields', props);
  return props.data;
}
const AddScheduleForm = Form.create({ onValuesChange, mapPropsToFields: mapAddPropsToFields })(ScheduleForm);
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
      list: [],
      event: {},
      visibleAdd: false,
      visibleEvent: false,
      visibleEdit: false,
      selectedDate: props.location.query.date ? moment(props.location.query.date) : moment(),
      mode: 'month',
      proj: undefined, // 新增时选中的项目
      oldSelectedProj: undefined, // 新增时原来选中的项目
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
      let callback = undefined;
      if (date.month() !== this.state.selectedDate.month()) {
        callback = this.getEvents;
      }
      this.setState({ visibleAdd: true, selectedDate: date.startOf('hour') }, callback);
    } else {
      this.setState({ selectedDate: date });
    }
  }

  getEvents = () => {
    window.echo(this.props.location.query.mid);
    // 加载前后三个月的日程
    const lastMonth = this.state.selectedDate.clone().subtract(1, 'M');
    const nextMonth = this.state.selectedDate.clone().add(1, 'M');
    const requestThreeMonthsSchedule = [lastMonth, this.state.selectedDate, nextMonth].map(m => api.getSchedule({
      manager: getCurrentUser(), 
      page_size: 100, 
      date: m.format('YYYY-MM-DD'),
    }));
    Promise.all(requestThreeMonthsSchedule)
    .then(result => {
      const list = result.reduce((prev, curr) => prev.concat(curr.data.data), []);
      list.sort((a, b) => {
        return new Date(a.scheduledtime) - new Date(b.scheduledtime)
      })
      let visibleEvent = false;
      let event = {};
      if (this.props.location.query.mid) {
        const meetingId = this.props.location.query.mid;
        const relatedEvent = list.filter(f => f.meeting && f.meeting.id === parseInt(meetingId, 10));
        if (relatedEvent.length > 0) {
          visibleEvent = true;
          event = relatedEvent[0];
        }
      } else if (this.props.location.query.eventId) {
        const eventId = this.props.location.query.eventId;
        const relatedEvent = list.filter(f => f.id === parseInt(eventId, 10));
        if (relatedEvent.length > 0) {
          visibleEvent = true;
          event = relatedEvent[0];
        }
      }
      this.setState({ list, visibleEvent, event });
    }).catch(error => {
      handleError(error)
    })
  }

  addEvent = () => {
    this.addForm.validateFields((err, values) => {
      if (!err) {
        let param = toData(values)
        this.addEventAsync(param)
          .then(result => {
            this.hideAddModal()
            this.getEvents()
          })
          .catch(handleError);
      }
    })
  }

  addEventAsync = async (param) => {
    const body = { ...param, title: param.comments };
    await api.getUserSession();
    const meetingResult = await api.addSchedule([body]);
    if (param.type === 4) {
      const { id: meeting, meetingKey } = meetingResult.data[0].meeting;
      const attendee = this.formatAttendee(param);
      const userBody = attendee.map(m => ({ ...m, meeting, meetingKey }));
      await api.addWebexUser(userBody);

      // 为在库里的参会人创建日程
      const existAttendees = attendee.filter(f => f.user !== undefined && f.user !== getCurrentUser());
      const attendeeBody = existAttendees.map(m => ({ ...body, manager: m.user, meeting }));
      await api.getUserSession();
      await api.addSchedule(attendeeBody);
    }
  }

  formatAttendee = param => {
    const existAttendees = param['investor-attendee'].concat(param['trader-attendee']).map(m => {
      const user = parseInt(m.key, 10);
      const nameAndEmail = m.label.split('\n');
      const name = nameAndEmail[0];
      const email = nameAndEmail[1];
      return { user, name, email };
    });
    const manualAttendees = Object.keys(param).filter(f => f.startsWith('name')).map(m => {
      const name = param[m];
      const emailKey = `email-${m.split('-')[1]}`;
      const email = param[emailKey];
      return { name, email };
    });
    const currentUser = getUserInfo();
    const meetingHost = {
      user: currentUser.id,
      name: currentUser.username,
      email: currentUser.email,
      meetingRole: true,
    };
    return existAttendees.concat(meetingHost, manualAttendees);
  }

  editEvent = () => {
    this.editForm.validateFields((err, values) => {
      if (!err) {
        if (values.type !== 4) {
          let param = toData(values)
          let id = this.state.event.id
          api.editSchedule(id, param).then(result => {
            this.hideEditModal()
            this.getEvents()
          }).catch(error => {
            this.hideEditModal()
            handleError(error)
          })
        } else {
          const meetingID = this.state.event.meeting.id;
          const startDate = values.scheduledtime.format('YYYY-MM-DDTHH:mm:ss');
          const { password, duration, comments: title } = values;
          const body = { password, duration, title, startDate };
          api.editWebexMeeting(meetingID, body).then(result => {
            this.hideEditModal()
            this.getEvents()
          }).catch(error => {
            this.hideEditModal()
            handleError(error)
          })
        }
      }
    })
  }

  /**
   * 删除日程，现在的逻辑是这样的
   * 如果是非视频会议日程正常删除
   * 如果是视频会议日程且当前用户是参会人，也是正常删除
   * 如果是视频会议日程且当前用户是主持人，调用删除会议接口，服务端应该会把相关日程、参会人员等一起删除
   */
  deleteEventAsync = async () => {
    if (this.state.event.type === 4 && this.state.event.createuser.id === getCurrentUser()) {
      const meetingID = this.state.event.meeting.id;
      await api.deleteWebexMeeting(meetingID);
    } else {
      const scheduleID = this.state.event.id;
      await api.deleteSchedule(scheduleID);
    }
  }

  deleteEvent = () => {
    this.deleteEventAsync()
      .then(this.getEvents)
      .catch(handleError)
      .finally(this.hideEventModal);
  }

  hideAddModal = () => {
    this.setState({ visibleAdd: false, proj: undefined, oldSelectedProj: undefined });
  }

  hideEventModal = () => {
    this.setState({ visibleEvent: false });
    if (this.eventEl) {
      this.eventEl.classList.remove('event-selected');
    }
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

  handleProjChange = (projID) => {
    api.getProjDetail(projID)
      .then((response) => {
        if (!response.data.email) return;
        this.setState({
          proj: {
            id: projID,
            contactUsername: response.data.contactPerson,
            contactEmail: response.data.email,
          },
          oldSelectedProj: this.state.proj,
        });
      });
  }

  setAddFormData() {
    let maxKey = 0;
    let keys = [];
    if (this.addForm && this.addForm.getFieldValue('keys')) {
      keys = this.addForm.getFieldValue('keys');
      maxKey = keys.length > 0 ? Math.max(...keys) : 0;
      const originValues = this.addForm.getFieldsValue();
      const data = {};
      for (let prop in originValues) {
        data[prop] = { value: originValues[prop] };
      }

      // 剔除原来选中的项目的联系人姓名和邮箱
      if (this.state.oldSelectedProj) {
        const oldContact = Object.keys(originValues)
          .filter(f => f.startsWith('email'))
          .map(m => {
            const key = m.split('-')[1]; 
            return {
              email: originValues[m],
              key,
            };
          })
          .filter(f => f.email === this.state.oldSelectedProj.contactEmail);
        if (oldContact.length > 0) {
          keys = keys.filter(f => f !== oldContact[0].key);
        }
      }

      // 增加现在新选中的项目的联系人姓名和邮箱
      if (this.state.proj) {
        data.keys = { value: keys.concat(`${maxKey + 1}`) };
        data[`name-${maxKey + 1}`] = { value: this.state.proj.contactUsername };
        data[`email-${maxKey + 1}`] = { value: this.state.proj.contactEmail };
      }
      return data;
    }
  }

  isEventEditable = () => {
    if (moment(this.state.event.scheduledtime + this.state.event.timezone) < moment().startOf('day')){
      return false;
    }
    const isMeetingSchedule = this.state.event.type === 4;
    const isCurrentUserAttendee = isMeetingSchedule && this.state.event.createuser.id !== getCurrentUser();
    if (isCurrentUserAttendee) {
      return false;
    }
    return true;
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
        { this.isEventEditable() && 
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
          <div style={{ marginLeft: 20, width: 20, height: 20, backgroundColor: '#EF5350' }}></div>
          <div style={{ marginLeft: 5 }}>视频会议</div>
        </div>

        {visibleAdd &&
        <Modal
          title={i18n('schedule.add_event')}
          visible={visibleAdd}
          onOk={this.addEvent}
          onCancel={this.hideAddModal}
          style={modalStyle}
          maskStyle={maskStyle}
          maskClosable={false}
        >
          { visibleAdd ? 
            <AddScheduleForm 
              wrappedComponentRef={this.handleRef} 
              isAdd 
              date={selectedDate}
              country={{ label: 'China', value: 42 }}
              onProjChange={this.handleProjChange}
              data={this.setAddFormData()}
            /> 
          : null }
        </Modal>
        }

        {visibleEvent &&
        <Modal
          title={eventTitle}
          visible={visibleEvent}
          onCancel={this.hideEventModal}
          maskStyle={maskStyle}
          footer={null}
        >
          <Event {...this.state.event} />
        </Modal>
        }

        <Modal
          title={i18n('schedule.edit_event')}
          visible={visibleEdit}
          onOk={this.editEvent}
          onCancel={this.hideEditModal}
          maskStyle={maskStyle}
          maskClosable={false}
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
  if (!['中国', 'China'].includes(formData.country && formData.country.label)) {
    data['location'] = null;
  }
  data.country = formData.country && formData.country.value;
  return data
}

function toFormData(data) {
  window.echo('dddata', data);
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
  if (data.type === 4 && data.meeting) {
    formData.password = data.meeting.password;
    formData.duration = data.meeting.duration;
  }
  for (let prop in formData) {
    formData[prop] = { value: formData[prop] }
  }
  return formData
}

class Event extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      attendees: '',
      currentAttendee: {
        name: '',
        email: '',
        meetingRole: false,
      },
    };
  }
  componentDidMount() {
    if (this.props.type === 4 && this.props.meeting) {
      api.getWebexUser({ meeting: this.props.meeting.id })
        .then(data => {
          const content = data.data.data.map(m => `${m.name} ${m.email}`).join('\n');
          const currentAttendee = data.data.data.filter(f => f.user === getCurrentUser())[0];
          this.setState({ attendees: content, currentAttendee });
        });
    }
  }

  getWID = (url) => {
    const wid = url.match(/WID=(.*)&/)[1];
    return wid;
  }

  getPW = (url) => {
    const pw = url.match(/PW=(.*)/)[1];
    return pw;
  }

  render() {
    const isHost = this.state.currentAttendee.meetingRole;
    const props = this.props;
    return (
      <div>
        <Field title={i18n('schedule.title')} content={props.comments} />
        <Field title={i18n('schedule.schedule_time')} content={props.scheduledtime ? time(props.scheduledtime + props.timezone) : ''} />
        {props.type !== 4 && <Field title={i18n('user.country')} content={props.country && props.country.country} />}
        {props.location ? <Field title={i18n('schedule.area')} content={props.location.name} /> : null}
        <Field title={i18n('schedule.address')} content={props.address} />
        <Field title={i18n('schedule.project')} content={props.projtitle} />
        {props.type !== 4 || !props.meeting ?
          <Field title={i18n('schedule.investor')} content={props.user && props.user.username} />
          :
          <div>
            <Field title="会议密码" content={props.meeting.password} />
            <Field title="持续时间" content={`${props.meeting.duration}分钟`} />
            <Field title="参会人" content={this.state.attendees} />
            {props.manager === props.meeting.createuser && <Field title="主持人密钥" content={props.meeting.hostKey} />}
            <Field title="音频连接" content="4006140081 China2(400)" />
            <Field title="会议号" content={`<span style="color: red;font-weight: bold">${props.meeting.meetingKey}</span>`} />
            {props.meeting.status && props.meeting.status.status !== 0 && <div>
              {isHost ?
                <Field title="会议日程" content={`<a target="_blank" href="${props.meeting.url_host}">${props.meeting.url_host}</a>`} />
                :
                <Field title="会议日程" content={`<a target="_blank" href="${props.meeting.url_attendee}">${props.meeting.url_attendee}</a>`} />
              }
              {isHost ?
                <Row><Col span={6} /><Col span={18}><a target="_blank" href={`/webex.html?wid=${this.getWID(props.meeting.url)}&pw=${this.getPW(props.meeting.url)}&mk=${props.meeting.meetingKey}`}><Button size="large" type="primary">启动会议</Button></a></Col></Row>
                :
                <Row><Col span={6} /><Col span={18}><a target="_blank" href={`https://investarget.webex.com.cn/investarget/m.php?AT=JM&MK=${props.meeting.meetingKey}&AN=${this.state.currentAttendee.name}&AE=${this.state.currentAttendee.email}`}><Button size="large" type="primary">加入会议</Button></a></Col></Row>
              }
            </div>}
          </div>
        }
      </div>
    );
  }
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
        <div dangerouslySetInnerHTML={{ __html: props.content && props.content.replace(/\n/g, '<br>') }} />
      </Col>
    </Row>
  )
}

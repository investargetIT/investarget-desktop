import React from 'react'
import { 
  Table, 
  Pagination,
  Modal,
  DatePicker,
  Input,
  Form,
  Upload,
  Icon,
  Button,
} from 'antd';
import { Link } from 'dva/router'
import { BasicFormItem } from '../components/Form';
import moment from 'moment';
import LeftRightLayout from '../components/LeftRightLayout';
import { baseUrl } from '../utils/request';
import {
  SelectExistUser,
  SelectExistProject,
  CascaderCountry,
  SelectOrganizatonArea,
  SelectAllUser,
} from '../components/ExtraInput';
import { Search2 } from '../components/Search'
import { 
  hasPerm, 
  i18n, 
  handleError, 
  time,
  getUserInfo,
} from '../utils/util';
import * as api from '../api'
import { PAGE_SIZE_OPTIONS } from '../constants';

const tableStyle = { marginBottom: '24px' }
const paginationStyle = { marginBottom: '24px', textAlign: 'right' }
const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none',whiteSpace: 'nowrap'}

class ScheduleToMeetingBDForm extends React.Component {
  onChange = info => {
    if (info.file.status === 'done') {
      if (info.fileList.length > 1) {
        info.fileList.splice(0, 1)
        this.props.removeFileAPI().then(data => {
          this.props.onUploadFile(info.file)
        })
      } else {
        this.props.onUploadFile(info.file)
      }
      info.fileList[0].url = info.fileList[0].response.result.url
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  }

  render() {
    const countryObj = this.props.form.getFieldValue('country');
    return (
      <Form>

        <BasicFormItem label="联系人" name="bduser" valueType="number">
          <SelectExistUser />
        </BasicFormItem>

        <BasicFormItem name="meet_date" label="会议时间" valueType="object">
          <DatePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
        </BasicFormItem>

        <BasicFormItem label={i18n('schedule.project')} name="proj" valueType="number">
          <SelectExistProject />
        </BasicFormItem>

        <BasicFormItem 
          label={i18n('user.country')} 
          name="country" 
          valueType="object" 
          getValueFromEvent={(id, detail) => detail}
        >
          <CascaderCountry size="large" isDetail />
        </BasicFormItem>

        {['中国', 'China'].includes(countryObj && countryObj.label) ? 
        <BasicFormItem label={i18n('project_bd.area')} name="location" valueType="number">
          <SelectOrganizatonArea showSearch />
        </BasicFormItem>
        : null }

        <BasicFormItem label={i18n('project_bd.manager')} name="manager" valueType="number">
          <SelectAllUser type="trader" />
        </BasicFormItem>

      </Form>
    )
  }
}
function mapPropsToFields(props){
	return {
    bduser:{value:props.data.user && props.data.user.id},
    proj:{value:props.data.proj && props.data.proj.id},
    meet_date:{value:moment(props.data.scheduledtime)},
    country: {value:props.data.country && {label:props.data.country.country, value:props.data.country.id, areaCode:props.data.country.areaCode}},
    location: {value:props.data.location && props.data.location.id},
    manager: {value:props.data.createuser.id},
	}
} 
const EditScheduleToMeetingBDForm = Form.create({mapPropsToFields})(ScheduleToMeetingBDForm)

function toData(formData) {
  var data = {...formData}
  data['meet_date'] = data['meet_date'].format('YYYY-MM-DDTHH:mm:ss')
  if (!['中国', 'China'].includes(formData.country.label)) {
    data['location'] = null;
  }
  data.country = formData.country.value;
  return data
}

class ScheduleList extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      search: null,
      total: 0,
      list: [],
      page: 1,
      pageSize: getUserInfo().page || 10,
      loading: false,
      sort:undefined,
      desc:undefined,
      showModal: false,
      activeSchedule: null,
      confirmLoading: false,
    }
  }

  handleSearch = (search) => {
    this.setState({ search }, this.getSchedule)
  }

  handleChangePage = (page) => {
    this.setState({ page }, this.getSchedule)
  }

  handleChangePageSize = (current, pageSize) => {
    this.setState({ page: 1, pageSize }, this.getSchedule)
  }

  getSchedule = () => {
    this.setState({ loading: true })
    const { search, page, pageSize, sort, desc } = this.state
    const param = { search, page_index: page, page_size: pageSize, sort, desc }
    api.getSchedule(param).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }).catch(error => {
      handleError(error)
      this.setState({ loading: false })
    })
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      { 
        sort: sorter.columnKey, 
        desc: sorter.order ? sorter.order === 'descend' ? 1 : 0 : undefined,
      }, 
      this.getSchedule
    );
  }

  componentDidMount() {
    this.getSchedule()
  }

  showModal(record) {
    this.setState({ showModal: true, activeSchedule: record });
  }

  handleRef = (inst) => {
    if (inst) {
      this.form = inst.props.form
    }
  }

  handleConfirm = () => {
    this.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ confirmLoading: true });
        const body = toData(values);
        this.transferScheduleToMeetingBD(body)
          .catch(error => handleError(error))
          .finally(() => this.setState({ confirmLoading: false, showModal:false }, this.getSchedule));
      }
    })
  }

  transferScheduleToMeetingBD = async body => {
    if (body.bduser) {
      const reqUser = await api.getUserInfo(body.bduser);
      if (reqUser.data.org) {
        body.org = reqUser.data.org.id;
      }
    }
    await api.addMeetingBD(body);
    await api.deleteSchedule(this.state.activeSchedule.id);
    Modal.success({
      title: '已成功地转移到会议BD',
      content: '请前往会议BD列表进行查看',
    });
  }

  render() {
    const { total, list, loading, page, pageSize, search, activeSchedule, showModal } = this.state
    const columns = [
      {title: i18n('schedule.schedule_time'), dataIndex: 'scheduledtime', render: (text, record) => {
        return time(text + record.timezone)
      },key:'scheduledtime', sorter:true},
      {title: i18n('schedule.creator'), dataIndex: 'createuser.username', key:'createuser', sorter:true},
      {title: i18n('schedule.project'), dataIndex: 'projtitle', render: (text, record) => {
        return record.proj ? <Link to={'/app/projects/' + record.proj.id} >{text}</Link> :{text}
      }, key:'projtitle', sorter:true},
      {title: i18n('schedule.investor'), dataIndex: 'user.username', render: (text, record) => {
        return record.user ? (
          <Link to={'/app/user/' + record.user.id} target="_blank">{text}</Link>
        ) : null
      },key:'user', sorter:true},
      {title: i18n('schedule.title'), dataIndex: 'comments', key:'comments', sorter:true},
      {title: i18n('user.country'), dataIndex: 'country.country', key:'country', sorter:true}, 
      {title: i18n('schedule.area'), dataIndex: 'location.name', key:'location', sorter:true},
      {title: i18n('schedule.address'), dataIndex: 'address', key:'address', sorter:true},
      {
        title: i18n('meeting_bd.operation'), 
        render: (text, record) => <button style={buttonStyle} onClick={this.showModal.bind(this,record)}>转移到会议BD</button>,
      },
    ]
    return (
      <LeftRightLayout location={this.props.location} title={i18n('schedule.schedule_list')}>
        <div style={{ marginBottom: '24px' }} className="clearfix">
          <Search2 style={{ width: 250,float:'right' }} defaultValue={search} onSearch={this.handleSearch} placeholder={[i18n('schedule.creator_name'), i18n('schedule.creator_mobile')].join(' / ')} />
        </div>
        <Table
          onChange={this.handleTableChange}
          style={tableStyle}
          rowKey={record => record.id}
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={false} />

        <Pagination
          style={paginationStyle}
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={this.handleChangePage}
          showSizeChanger
          onShowSizeChange={this.handleChangePageSize}
          showQuickJumper
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />

        { showModal ? 
        <Modal
          title="转移到会议BD"
          visible={true}
          onOk={this.handleConfirm}
          onCancel={() => this.setState({ showModal: false })}
          confirmLoading={this.state.confirmLoading}
        >
          <EditScheduleToMeetingBDForm
            wrappedComponentRef={this.handleRef}
            data={activeSchedule}
          />
        </Modal>
        : null }

      </LeftRightLayout>
    )
  }
}

export default ScheduleList

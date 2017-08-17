import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n, getGroup, hasPerm } from '../utils/util'

import { Input, Icon, Table, Button, Pagination, Popconfirm, Modal } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { ProjectListFilter } from '../components/Filter'
import { Search2 } from '../components/Search'

import AuditProjectModal from '../components/AuditProjectModal'


class ProjectList extends React.Component {
  constructor(props) {
    super(props)

    const setting = this.readSetting()
    const filters = setting ? setting.filters : ProjectListFilter.defaultValue
    const search = setting ? setting.search : null
    const page = setting ? setting.page : 1
    const pageSize = setting ? setting.pageSize: 10

    this.state = {
      filters,
      search,
      page,
      pageSize,
      total: 0,
      list: [],
      loading: false,

      visible: false,
      id: null,
      currentStatus: null,
      status: null,
      sendEmail: false,
      confirmLoading: false,
    }
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getProject)
  }

  handleReset = (filters) => {
    this.setState({ filters, page: 1 }, this.getProject)
  }

  handleSearch = (search) => {
    this.setState({ search, page: 1 }, this.getProject)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getProject)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getProject)
  }

  // 特殊处理
  handleFinancialFilter = (filters) => {
    var data = { ...filters }
    if (data['netIncome_USD_F'] == ProjectListFilter.defaultValue['netIncome_USD_F'] &&
        data['netIncome_USD_T'] == ProjectListFilter.defaultValue['netIncome_USD_T'] )
    {
      delete data['netIncome_USD_F']
      delete data['netIncome_USD_T']
    }
    if (data['grossProfit_F'] == ProjectListFilter.defaultValue['grossProfit_F'] &&
        data['grossProfit_T'] == ProjectListFilter.defaultValue['grossProfit_T'] )
    {
      delete data['grossProfit_F']
      delete data['grossProfit_T']
    }
    return data
  }

  getProject = () => {
    const { filters, search, page, pageSize } = this.state
    const params = { ...this.handleFinancialFilter(filters), search, page_index: page, page_size: pageSize }
    if (!hasPerm('usersys.as_admin')) {
      params['projstatus'] = [4, 6, 7, 8] // 非管理员只能查看终审发布之后的项目
    }
    this.setState({ loading: true })
    api.getProj(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
    this.writeSetting()
  }

  handleDelete = (id) => {
    this.setState({ loading: true })
    api.deleteProj(id).then(result => {
      this.getProject()
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  // audit project modal

  openAuditProjectModal = (id, status) => {
    this.setState({ visible: true, id, currentStatus: status, status, sendEmail: false })
  }

  handleStatusChange = (status) => {
    this.setState({ status })
  }

  handleSendEmailChange = (sendEmail) => {
    this.setState({ sendEmail })
  }

  handleConfirmAudit = () => {
    const { id, status, sendEmail } = this.state
    this.setState({ confirmLoading: true })
    api.editProj(id, { projstatus: status, isSendEmail: sendEmail }).then(result => {
      this.setState({ visible: false, confirmLoading: false })
      this.getProject()
    }, error => {
      this.setState({ visible: false, confirmLoading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error,
      })
    })
  }

  handleCancelAudit = () => {
    this.setState({ visible: false })
  }



  writeSetting = () => {
    const { filters, search, page, pageSize } = this.state
    const data = { filters, search, page, pageSize }
    localStorage.setItem('ProjectList', JSON.stringify(data))
  }

  readSetting = () => {
    var data = localStorage.getItem('ProjectList')
    return data ? JSON.parse(data) : null
  }

  componentDidMount() {
    this.getProject()
  }

  render() {
    const { location } = this.props
    const { total, list, loading, page, pageSize, filters, search, visible, currentStatus, status, sendEmail, confirmLoading } = this.state

    const columns = [
      {
        title: '图片',
        key: 'image',
        render: (text, record) => {
          const industry = record.industries && record.industries[0]
          const imgUrl = industry ? industry.url : 'defaultUrl'
          return (
            <img src={imgUrl} style={{width: '80px', height: '50px'}} />
          )
        }
      },
      {
        title: '名称',
        key: 'title',
        render: (text, record) => {
          if (record.action.get) {
            return record.ismarketplace ?
              <Link to={'/app/marketplace/' + record.id}>{record.projtitle}</Link> :
              <Link to={'/app/projects/' + record.id}>{record.projtitle}</Link>
          } else {
            return record.projtitle
          }
        }
      },
      {
        title: '地区',
        key: 'country',
        render: (text, record) => {
          const country = record.country
          const countryName = country ? country.country : ''
          let imgUrl = country && country.key && country.url
          if (country && !imgUrl) {
            const parentCountry = this.props.country.filter(f => f.id === country.parent)[0]
            if (parentCountry && parentCountry.url) {
              imgUrl = parentCountry.url
            }
          }
          return (
            <span style={{display: 'flex', alignItems: 'center'}}>
              { imgUrl ? <img src={imgUrl} style={{width: '20px', height: '14px', marginRight: '4px'}} /> : null }
              <span>{countryName}</span>
            </span>
          )
        }
      },
      {
        title: '交易规模',
        key: 'transactionAmount',
        render: (text, record) => {
          const transactionAmount = record.transactionAmount
          return transactionAmount || 'N/A'
        }
      },
      {
        title: '当前状态',
        key: 'projstatus',
        render: (text, record) => {
          const status = record.projstatus
          const statusName = status ? status.name : ''
          return statusName
        }
      }
    ]
    if (hasPerm('usersys.as_admin')) {
      columns.push({
        title: '是否隐藏',
        key: 'isHidden',
        render: (text, record) => {
          return record.isHidden ? '已隐藏' : '未隐藏'
        }
      })
    }
    columns.push({
        title: '操作',
        key: 'action',
        render: (text, record) => {
          return record.ismarketplace ? (
            <span>
              <Button size="small" disabled={!hasPerm('proj.admin_changeproj')} onClick={this.openAuditProjectModal.bind(this, record.id, record.projstatus.id)}>修改状态</Button>
              &nbsp;
              <Link to={'/app/marketplace/edit/' + record.id}>
                <Button disabled={!record.action.change} size="small" >{i18n("edit")}</Button>
              </Link>
              &nbsp;
              <Popconfirm title="Confirm to delete?" onConfirm={this.handleDelete.bind(null, record.id)}>
                <Button type="danger" disabled={!record.action.delete} size="small">{i18n("delete")}</Button>
              </Popconfirm>
            </span>
          ) : (
            <span>
              <Button size="small" disabled={!hasPerm('proj.admin_changeproj')} onClick={this.openAuditProjectModal.bind(this, record.id, record.projstatus.id)}>修改状态</Button>
              &nbsp;
              <Link href={"/app/projects/recommend/" + record.id} target="_blank">
                <Button size="small" disabled={!(record.projstatus.id >= 4 && record.projstatus.id < 7) || !(hasPerm('usersys.as_admin') || hasPerm('usersys.as_trader'))}>推荐</Button>
              </Link>
              &nbsp;
              <Link href={"/app/timeline/add?projId=" + record.id} target="_blank">
                <Button size="small" disabled={!(record.projstatus.id >= 4 && record.projstatus.id < 7) || !(hasPerm('timeline.admin_addline') || hasPerm('timeline.user_addline'))}>创建时间轴</Button>
              </Link>
              &nbsp;
              <Link target="_blank" to={'/app/dataroom/add?projectID=' + record.id}>
                <Button size="small" disabled={!(record.projstatus.id >= 4 && record.projstatus.id < 7) || !(hasPerm('dataroom.admin_adddataroom') || hasPerm('dataroom.user_adddataroom'))}>创建DataRoom</Button>
              </Link>
              &nbsp;
              <Link to={'/app/projects/edit/' + record.id}>
                <Button disabled={!record.action.change} size="small" >{i18n("edit")}</Button>
              </Link>
              &nbsp;
              <Popconfirm title="Confirm to delete?" onConfirm={this.handleDelete.bind(null, record.id)}>
                <Button type="danger" disabled={!record.action.delete} size="small">{i18n("delete")}</Button>
              </Popconfirm>
            </span>
          )
        }
    })

    return (
      <MainLayout location={location}>
        {
          (hasPerm('proj.admin_addproj') || hasPerm('proj.user_addproj')) ?
            <PageTitle title="平台项目" actionLink="/app/projects/add" actionTitle="新增项目" /> :
            <PageTitle title="平台项目" />
        }

        <ProjectListFilter defaultValue={filters} onSearch={this.handleFilt} onReset={this.handleReset} />

        <div style={{ marginBottom: '16px' }} className="clearfix">
          <Search2 defaultValue={search} placeholder="项目名称" style={{ width: 200, float: 'left' }} onSearch={this.handleSearch} />
        </div>

        <Table
          columns={columns}
          dataSource={list}
          rowKey={record=>record.id}
          loading={loading}
          pagination={false}
        />

        <div style={{ margin: '16px 0' }} className="clearfix">
          <Pagination
            style={{ float: 'right' }}
            total={total}
            current={page}
            pageSize={pageSize}
            onChange={this.handlePageChange}
            showSizeChanger
            onShowSizeChange={this.handlePageSizeChange}
            showQuickJumper
          />
        </div>

        <AuditProjectModal
          visible={visible}
          currentStatus={currentStatus}
          status={status}
          sendEmail={sendEmail}
          confirmLoading={confirmLoading}
          onStatusChange={this.handleStatusChange}
          onSendEmailChange={this.handleSendEmailChange}
          onOk={this.handleConfirmAudit}
          onCancel={this.handleCancelAudit}
        />

      </MainLayout>
    )
  }
}

function mapStateToProps(state) {
  const { country } = state.app
  return { country }
}


export default connect(mapStateToProps)(ProjectList)

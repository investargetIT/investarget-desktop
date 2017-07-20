import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n } from '../utils/util'

import { Input, Icon, Table, Button, Pagination, Popconfirm, Modal } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { ProjectListFilter } from '../components/Filter'
import {
  RadioTrueOrFalse,
  CheckboxCurrencyType,
  SelectProjectStatus,
} from '../components/ExtraInput'
const Search = Input.Search

import AuditProjectModal from '../components/AuditProjectModal'





class ProjectList extends React.Component {
  constructor(props) {
    super(props)
  }

  auditProject = (id, status) => {
    this.auditProjectModal.setData(id, status)
  }

  handleAfterAudit = () => {
    this.props.dispatch({ type: 'projectList/get' })
  }

  handleDelete = (id) => {
    this.props.dispatch({ type: 'projectList/delete', payload: id })
  }


  handleFilterChange = (key, value) => {
    if (Array.isArray(key)) {
      key.forEach((item, index) => {
        this.props.dispatch({ type: 'projectList/setFilter', payload: { [item]: value[index] } })
      })
    } else {
      this.props.dispatch({ type: 'projectList/setFilter', payload: { [key]: value } })
    }
  }

  handleFilt = () => {
    this.props.dispatch({ type: 'projectList/filt' })
  }

  handleReset = () => {
    this.props.dispatch({ type: 'projectList/reset' })
  }

  handleSearchChange = (e) => {
    const search = e.target.value
    this.props.dispatch({ type: 'projectList/setField', payload: { search } })
  }

  handleSearch = (search) => {
    this.props.dispatch({ type: 'projectList/search' })
  }

  handlePageChange = (page, pageSize) => {
    this.props.dispatch({ type: 'projectList/changePage', payload: page })
  }

  handleShowSizeChange = (current, pageSize) => {
    this.props.dispatch({ type: 'projectList/changePageSize', payload: pageSize })
  }

  render() {
    const { location, total, list, loading, page, pageSize, filter, search } = this.props
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
          return record.projtitle
        }
      },
      {
        title: '国家',
        key: 'country',
        render: (text, record) => {
          const country = record.country
          const countryName = country ? country.country : ''
          const imgUrl = country ? ('https://o79atf82v.qnssl.com/' + country.key) : ''
          return (
            <span><img src={imgUrl} style={{width: '20px', height: '14px'}} />{countryName}</span>
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
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <span>
            <Button size="small" onClick={this.auditProject.bind(this, record.id, record.projstatus.id)}>审核</Button>
            &nbsp;
            <Button size="small">时间轴</Button>
            <Link to={'/app/projects/' + record.id}>
              <Button disabled={!record.action.get} size="small" >{i18n("view")}</Button>
            </Link>
            &nbsp;
            <a target="_blank" href={'/app/dataroom/create?projectID=' + record.id}>
              <Button size="small" disabled={!this.props.permissions.includes('dataroom.user_adddataroom')}>创建DataRoom</Button>
            </a>
            <Link to={'/app/projects/edit/' + record.id}>
              <Button disabled={!record.action.change} size="small" >{i18n("edit")}</Button>
            </Link>
            &nbsp;
            <Popconfirm title="Confirm to delete?" onConfirm={this.handleDelete.bind(null, record.id)}>
              <Button type="danger" disabled={!record.action.delete} size="small">{i18n("delete")}</Button>
            </Popconfirm>
          </span>
        )
      },
    ]
    
    return (
      <MainLayout location={location}>
        <PageTitle title="平台项目" actionLink="/app/projects/add" actionTitle="新增项目" />
        <ProjectListFilter value={filter} onChange={this.handleFilterChange} onSearch={this.handleFilt} onReset={this.handleReset} />

        <div style={{marginBottom: '16px'}}>
          <Search value={search} onChange={this.handleSearchChange} placeholder="项目名称" style={{width: 200}} onSearch={this.handleSearch} />
        </div>

        <Table
          columns={columns}
          dataSource={list}
          rowKey={record=>record.id}
          loading={loading}
          pagination={false}
        />

        <Pagination
          className="ant-table-pagination"
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={this.handlePageChange}
          showSizeChanger
          onShowSizeChange={this.handleShowSizeChange}
          showQuickJumper
        />

        <AuditProjectModal afterAudit={this.handleAfterAudit} ref={inst => { this.auditProjectModal = inst }} />

      </MainLayout>
    )
  }
}


function mapStateToProps(state) {
  return { ...state.projectList, loading: state.loading.effects['projectList/get'], permissions: state.currentUser.permissions }
}

export default connect(mapStateToProps)(ProjectList)

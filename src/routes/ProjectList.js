import React from 'react'
import { Link } from 'dva/router'
import { i18n, showError, getGroup, hasPerm } from '../utils/util'

import { Input, Icon, Table, Button, Pagination, Popconfirm, Modal } from 'antd'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'
import { ProjectListFilter } from '../components/Filter'
import { Search2 } from '../components/Search'

import AuditProjectModal from '../components/AuditProjectModal'

const group = getGroup()
const isInvestor = group == 1


class ProjectList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      filters: null,
      search: null,
      page: 1,
      pageSize: 10,
      total: 0,
      list: [],
      loading: false,
    }
  }

  handleFiltersChange = (filters) => {
    this.setState({ filters })
  }

  handleFilt = (filters) => {
    this.setState({ filters, page: 1 }, this.getProject)
  }

  handleReset = () => {
    this.setState({ filters: null, page: 1 }, this.getProject)
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

  getProject = () => {
    const { filters, search, page, pageSize } = this.state
    const params = { ...filters, search, page_index: page, page_size: pageSize }
    this.setState({ loading: true })
    api.getProj(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ total, list, loading: false })
    }, error => {
      this.setState({ loading: false })
      showError(error.message)
    })
  }

  auditProject = (id, status) => {
    this.auditProjectModal.setData(id, status)
  }

  handleAfterAudit = () => {
    this.getProject()
  }

  handleDelete = (id) => {
    this.setState({ loading: true })
    api.deleteProj(id).then(result => {
      this.getProject()
    }, error => {
      this.setState({ loading: false })
      showError(error.message)
    })
  }


  componentDidMount() {
    this.getProject()
  }

  render() {
    const { location } = this.props
    const { total, list, loading, page, pageSize, filters, search } = this.state

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
        title: '国家',
        key: 'country',
        render: (text, record) => {
          const country = record.country
          const countryName = country ? country.country : ''
          const imgUrl = country ? ('https://o79atf82v.qnssl.com/' + country.key) : ''
          return (
            <span style={{display: 'flex', alignItems: 'center'}}>
              <img src={imgUrl} style={{width: '20px', height: '14px', marginRight: '4px'}} />
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
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          return record.ismarketplace ? (
            <span>
              <Button size="small" disabled={isInvestor} onClick={this.auditProject.bind(this, record.id, record.projstatus.id)}>修改状态</Button>
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
              <Button size="small" disabled={isInvestor} onClick={this.auditProject.bind(this, record.id, record.projstatus.id)}>修改状态</Button>
              &nbsp;
              <Link href={"/app/projects/recommend/" + record.id} target="_blank">
                <Button size="small" disabled={isInvestor}>推荐</Button>
              </Link>
              &nbsp;
              <Link href={"/app/timeline/add?projId=" + record.id} target="_blank">
                <Button size="small" disabled={isInvestor}>创建时间轴</Button>
              </Link>
              &nbsp;
              <Link target="_blank" to={'/app/dataroom/add?projectID=' + record.id}>
                <Button size="small" disabled={isInvestor}>创建DataRoom</Button>
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
      },
    ]

    return (
      <MainLayout location={location}>
        {
          (hasPerm('proj.admin_addproj') || hasPerm('proj.user_addproj')) ?
            <PageTitle title="平台项目" actionLink="/app/projects/add" actionTitle="新增项目" /> :
            <PageTitle title="平台项目" />
        }

        <ProjectListFilter value={filters} onSearch={this.handleFilt} onReset={this.handleReset} />

        <div style={{ marginBottom: '16px' }} className="clearfix">
          <Search2 value={search} placeholder="项目名称" style={{ width: 200, float: 'left' }} onSearch={this.handleSearch} />
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

        <AuditProjectModal afterAudit={this.handleAfterAudit} ref={inst => { this.auditProjectModal = inst }} />

      </MainLayout>
    )
  }
}




export default ProjectList

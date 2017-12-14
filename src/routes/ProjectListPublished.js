import React from 'react'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { i18n, isLogin } from '../utils/util'
import { Table, Pagination, Button, Popconfirm, message } from 'antd'
import LeftRightLayout from '../components/LeftRightLayout'


class ProjectListPublished extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      pageSize: 10,
      total: 0,
      list: [],
      loading: false,
    }
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getProjectList)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getProjectList)
  }

  getProjectList = () => {
    const { page, pageSize } = this.state
    const params = { supportUser: isLogin().id, page_index: page, page_size: pageSize }
    this.setState({ loading: true })
    api.getProj(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ loading: false, total, list })
    }, error => {
      this.setState({ loading: false })
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  handleDelete = (id) => {
    api.deleteProj(id).then(result => {
      message.success(i18n('project.message.delete_success'), 2)
      this.getProjectList()
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  componentDidMount() {
    this.getProjectList()
  }

  render() {
    const { total, list, loading, page, pageSize } = this.state
    const buttonStyle={textDecoration:'underline',color:'#428BCA',border:'none',background:'none'}
    const imgStyle={width:'20px',height:'25px'}
    const columns = [
      {
        title: i18n('project.image'),
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
        title: i18n('project.name'),
        key: 'title',
        render: (text, record) => {
          return (
            <Link to={'/app/projects/' + record.id}>{record.projtitle}</Link>
          )
        }
      },
      {
        title: i18n('project.country'),
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
        title: i18n('project.transaction_size'),
        key: 'transactionAmount',
        render: (text, record) => {
          const transactionAmount = record.transactionAmount
          return transactionAmount || 'N/A'
        }
      },
      {
        title: i18n('project.current_status'),
        key: 'projstatus',
        render: (text, record) => {
          const status = record.projstatus
          const statusName = status ? status.name : ''
          return statusName
        }
      },
      {
        title: i18n('common.operation'),
        key: 'action',
        render: (text, record) => (
          <span style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap'}}>
            <Link to={'/app/projects/edit/' + record.id}>
              <Button style={ buttonStyle} disabled={!record.action.change} >{i18n("common.edit")}</Button>
            </Link>
            &nbsp;
            <Popconfirm title="Confirm to delete?" onConfirm={this.handleDelete.bind(null, record.id)}>
              <a type="danger" disabled={!record.action.delete} >
                <img style={imgStyle} src="/images/delete.png" />
              </a>
            </Popconfirm>
          </span>
        )
      }
    ]

    return (
      <LeftRightLayout location={this.props.location} title={i18n('project.published_projects')}>
        <div>
          <Table columns={columns} dataSource={list} rowKey={record => record.id} loading={loading} pagination={false} />
          <Pagination className="ant-table-pagination" total={total} current={page} pageSize={pageSize} onChange={this.handlePageChange} showSizeChanger onShowSizeChange={this.handlePageSizeChange} showQuickJumper />
        </div>
      </LeftRightLayout>
    )
  }
}


export default connect()(ProjectListPublished)

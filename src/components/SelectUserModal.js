import React from 'react'
import { Table, Pagination, Button, Input, Modal } from 'antd'
import { i18n, showError } from '../utils/util'

// import { UserListFilter } from './Filter'
import { Search } from './Search'


class SelectUser extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // filters: {},
      search: null,
      current: 0,
      pageSize: 10,
      _param: {},
      total: 0,
      list: [],
      loading: false,
      selectedUserIds: [],
      selectedUsers: [],
    }
  }

  // handleFiltersChange = (filters) => {
  //   this.setState({ filters })
  // }

  // handleFilt = () => {
  //   let { _params, filters } = this.state
  //   _params = { ..._params, ...filters }
  //   this.setState({ _params, page: 1 }, this.getOrg)
  // }

  handleReset = () => {
    this.setState({ filters: {}, page: 1, _params: {} }, this.getOrg)
  }

  handleSearchChange = (search) => {
    this.setState({ search })
  }

  handleSearch = () => {
    let { _params, search } = this.state
    _params = { ..._params, search }
    this.setState({ _params, page: 1 }, this.getUser)
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.getUser)
  }

  handlePageSizeChange = (current, pageSize) => {
    this.setState({ pageSize, page: 1 }, this.getUser)
  }

  getUser = () => {
    const { _params, page, pageSize } = this.state
    const params = { ..._params, page_index: page, page_size: pageSize }
    this.setState({ loading: true })
    api.getUser(params).then(result => {
      const { count: total, data: list } = result.data
      this.setState({ loading: false, total, list })
    }, error => {
      this.setState({ loading: false })
      showError(error.message)
    })
  }

  handleSelectChange = (selectedUserIds, selectedUsers) => {
    this.setState({ selectedUserIds, selectedUsers })
  }

  componentDidMount() {
    this.getUser()
  }

  render() {
    const { filters, search, page, pageSize, total, list, loading, selectedUserIds } = this.state

    const rowSelection = {
      type: 'radio',
      selectedRowKeys: selectedUserIds,
      onChange: this.handleSelectChange,
    }

    const columns = [
      {
        title: i18n("username"),
        dataIndex: 'username',
        key: 'username'
      },
      {
        title: i18n("org"),
        dataIndex: 'org.orgname',
        key: 'org'
      },
      {
        title: i18n("position"),
        dataIndex: 'title.name',
        key: 'title'
      },
      {
        title: i18n("tag"),
        dataIndex: 'tags',
        key: 'tags',
        render: tags => tags ? tags.map(t => t.name).join(' ') : null
      },
      {
        title: i18n("role"),
        dataIndex: 'groups',
        key: 'role',
        render: groups => groups ? groups.map(m => m.name).join(' ') : null
      },
      {
        title: i18n("userstatus"),
        dataIndex: 'userstatus.name',
        key: 'userstatus'
      },
    ]


    return (
      <div>
        {/* <UserListFilter
          value={filters}
          onChange={this.handleFiltersChange}
          onSearch={this.handleFilt}
          onReset={this.handleReset}
        /> */}

        <div style={{marginBottom: '24px'}}>
          <Search value={search} onChange={this.handleSearchChange} placeholder="搜索用户" style={{width: 200}} onSearch={this.handleSearch} />
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={list}
          loading={loading}
          rowKey={record => record.id}
          pagination={false}
        />

        <div style={{ margin: '16px 0' }} className="clearfix">
          <Pagination
            style={{ float: 'right' }}
            total={total}
            current={page}
            pageSize={pageSize}
            onChange={this.handlePageChange}
            onShowSizeChange={this.handlePageSizeChange}
            showSizeChanger
            showQuickJumper
          />
        </div>
      </div>
    )
  }
}


class SelectUserModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      userId: props.value || null,
      user: null,
    }
  }

  showModal = () =>  {
    this.setState({ visible: true })
  }

  hideModal = () => {
    this.setState({ visible: false })
  }

  confirmSelect = () => {
    this.hideModal()
    const { selectedUserIds, selectedUsers } = this.selectUser.state // ref
    this.selectUser.handleReset()

    if (selectedUserIds.length > 0) {
      this.selectUser.setState({ selectedUserIds: [], selectedUsers: [] }) // clear selection
      let userId = selectedUserIds ? selectedUserIds[0] : null
      let user = selectedUsers ? selectedUsers[0] : null
      this.setState({ userId, user })
      if (this.props.onChange) {
        this.props.onChange(userId)
      }
    }
  }

  cancelSelect = () => {
    this.hideModal()
    this.selectUser.setState({ selectedUserIds: [], selectedUsers: [] }) // clear selection
    this.selectUser.handleReset()
  }

  getUser = (userId) => {
    api.getUserDetailLang(userId).then(result => {
      const user = result.data
      this.setState({ user })
    })
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      let userId = nextProps.value
      this.setState({ userId, user: null })

      if (userId) {
        this.getUser(userId)
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.value != this.state.userId) {
      return true
    }
    if (!this.state.user) {
      return true
    }
    if (nextState.visible != this.state.visible) {
      return true
    }
    return false
  }

  componentDidMount() {
    const { userId } = this.state
    if (userId) {
      this.getUser(userId)
    }
  }

  render() {
    const { visible, user } = this.state
    return (
      <span>
        <Input value={user && user.username} onClick={this.showModal} readOnly placeholder="点击选择用户" />
        <Modal visible={visible} title="选择用户" onOk={this.confirmSelect} onCancel={this.cancelSelect} width={960}>
          <SelectUser ref={inst => this.selectUser = inst} />
        </Modal>
      </span>
    )
  }
}


export default SelectUserModal

import React from 'react'
import { getCurrentUser, hasPerm, i18n } from '../utils/util'
import { Button } from 'antd'
import SelectOrganization from '../components/SelectOrganization'
import SelectOrgInvestorAndTrader from '../components/SelectOrgInvestorAndTrader'


class SelectInvestorAndTrader extends React.Component {
  constructor(props) {
    super(props)

    const userId = getCurrentUser()
    const traderId = (!hasPerm('usersys.as_admin') && hasPerm('usersys.as_trader')) ? userId : null

    this.state = {
      traderId,
      selectedOrgs: [],
      selectedUsers: [],
      step: 1,
    }
  }

  handleBack = () => {
    this.setState({
      step: 1,
      selectedUsers: [],
    })
  }

  handleNext = () => {
    this.setState({ step: 2 })
  }

  handleSelectOrg = (selectedOrgs) => {
    this.setState({ selectedOrgs })
  }

  handleSelectUser = (selectedUsers) => {
    this.setState({ selectedUsers })
  }

  handleOk = () => {
    this.props.onSelect(this.state.selectedUsers)
  }

  render() {

    const { traderId, selectedOrgs, selectedUsers, step } = this.state

    return (
      <div>
        <div style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>
          <p style={{fontSize: '13px'}}>
            { step == 1 ? <span>1. {i18n('timeline.select_institution')}</span> : null }
            { step == 2 ? <span>2. {i18n('timeline.select_user')}</span> : null }
          </p>
        </div>

        <div style={{padding: '16px'}}>
          { step == 1 ? <SelectOrganization traderId={traderId} value={selectedOrgs} onChange={this.handleSelectOrg} /> : null }
          { step == 2 ? <SelectOrgInvestorAndTrader traderId={traderId} selectedOrgs={selectedOrgs} options={this.props.options} value={selectedUsers} onChange={this.handleSelectUser} /> : null }
        </div>

        { step == 1 ? (
          <div style={{textAlign: 'right', padding: '0 16px', marginTop: '-16px'}}>
            <Button disabled={selectedOrgs.length == 0} type="primary" onClick={this.handleNext}>{i18n('common.next')}</Button>
          </div>
        ) : null }

        { step == 2 ? (
          <div style={{textAlign: 'right', padding: '0 16px', marginTop: '-16px'}}>
            <Button onClick={ this.handleBack}>{i18n('common.back')}</Button>
            <Button disabled={selectedUsers.length == 0} type="primary" onClick={this.handleOk}>{i18n('common.create')}</Button>
          </div>
        ) : null }
      </div>
    )
  }
}

export default SelectInvestorAndTrader

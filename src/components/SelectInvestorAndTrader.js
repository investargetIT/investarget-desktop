import React from 'react'
import { getCurrentUser, hasPerm, i18n } from '../utils/util'
import { Button } from 'antd'
import SelectOrganization from '../components/SelectOrganization'
import SelectOrgInvestorAndTrader from '../components/SelectOrgInvestorAndTrader'
import SelectOrgInvestorToBD from '../components/SelectOrgInvestorToBD';


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
      selectedOrgDetails: [], 
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

  handleSelectOrg = (selectedOrgs, selectedOrgDetails) => {
    let newOrgDetails=selectedOrgDetails.filter(item=>{
      return !this.state.selectedOrgDetails.includes(item)
    })
    newOrgDetails = [...this.state.selectedOrgDetails, ...newOrgDetails].filter(item=>{
      return selectedOrgs.includes(item.id)
    })
    this.setState({ selectedOrgs, selectedOrgDetails:newOrgDetails})
  }

  handleSelectUser = (selectedUsers) => {
    this.setState({ selectedUsers })
  }

  handleOk = () => {
    this.props.onSelect(this.state.selectedUsers)
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.ifContinue)
        this.setState({step:1,selectedUsers: []});
  }
  render() {

    const { traderId, selectedOrgs, selectedUsers, step, selectedOrgDetails } = this.state

    return (
      <div>
        <div style={{padding: '8px 0'}}>
          <p style={{fontSize: '13px'}}>
            { step == 1 ? <span style={{fontWeight: 'bold', color: 'black'}}>1. {i18n('timeline.select_institution')}</span> : null }
            { step == 2 ? <span style={{fontWeight: 'bold'}}>2. {i18n('timeline.select_user')}</span> : null }
          </p>
        </div>
 
        <div style={{padding: '16px'}}>
          { step == 1 ? <SelectOrganization traderId={this.props.options ? undefined : traderId} value={selectedOrgs} details={selectedOrgDetails} onChange={this.handleSelectOrg} /> : null }
          {step == 2 ?
            this.props.options ?
              <SelectOrgInvestorToBD selectedOrgs={selectedOrgDetails} options={this.props.options} value={selectedUsers} onChange={this.handleSelectUser} source={this.props.source}/>
              : <SelectOrgInvestorAndTrader traderId={traderId} selectedOrgs={selectedOrgs} value={selectedUsers} onChange={this.handleSelectUser} />
            : null}
        </div>

        { step == 1 ? (
          <div style={{textAlign: 'right', padding: '0 16px', marginTop: '-16px'}}>
            <Button disabled={selectedOrgs.length == 0} type="primary" onClick={this.handleNext}>{i18n('common.next')}</Button>
          </div>
        ) : null }

        { step == 2 ? (
          <div style={{textAlign: 'right', padding: '0 16px', marginTop: '-16px'}}>
            <Button style={{ marginRight: 10 }} onClick={ this.handleBack}>{i18n('common.back')}</Button>
            <Button disabled={selectedUsers.length == 0} type="primary" onClick={this.handleOk}>{i18n('common.create')}</Button>
          </div>
        ) : null }
      </div>
    )
  }
}

export default SelectInvestorAndTrader

import React from 'react'
import * as api from '../api'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { getCurrentUser, hasPerm, i18n, requestAllData, getURLParamValue, isLogin } from '../utils/util'
import { Button } from 'antd'
import { CheckboxTag, SearchOrganization } from '../components/ExtraInput';
import LeftRightLayout from '../components/LeftRightLayout'

class NewOrgBD extends React.Component {

  constructor(props) {
    super(props)

    const userId = getCurrentUser()
    const traderId = (!isLogin().is_superuser && hasPerm('usersys.as_trader')) ? userId : null

    this.state = {
      traderId,
      projId: Number(getURLParamValue(props, 'projId')),
      projTitle: '',
      searchOption: '0',
      keyword: '',
      tags: [],
    }
  }

  componentDidMount() {
    api.queryUserGroup({ type: this.props.type || 'trader' })
    .then(data => requestAllData(api.getUser, { groups: data.data.data.map(m => m.id), userstatus: 2 }, 100))
    .then(data => this.setState({ data: data.data.data }))
    .catch(error => this.props.dispatch({ type: 'app/findError', payload: error }));

    if (isNaN(this.state.projId)) return;

    api.getProjLangDetail(this.state.projId).then(result => {
      const projTitle = result.data.projtitle
      this.setState({ projTitle })
    }, error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error,
      })
    })
  }

  handleSearchChange = ({ searchOption, keyword }) => {
    this.setState({ searchOption, keyword });
  };

  handleTagsChange = (tags) => {
    this.setState({ tags });
  };

  handleFinish = () => {
    const projId = getURLParamValue(this.props, 'projId') || null;
    const { searchOption, keyword, tags } = this.state;
    const search = searchOption === '0' ? keyword : '';
    const text = searchOption === '1' ? keyword : '';
    const tagsEncoded = encodeURIComponent(tags.join(','));
    window.open(`/app/org/newbd?projId=${projId}&text=${text}&search=${search}&tags=${tagsEncoded}`, '_blank', 'noopener');
  }

  render() {
    const { location }  = this.props
    const { searchOption, keyword, tags } = this.state;

    return (
      <LeftRightLayout
        location={location}
        title={i18n('menu.bd_management')}
        breadcrumb={' > ' + i18n('menu.organization_bd') + ' > ' + i18n('project.create_org_bd')}
      >
        <div>
          {this.state.projTitle ?
            <h3 style={{lineHeight: 2}}>{i18n('timeline.project_name')} : {this.state.projTitle}</h3>
            : null}

          <div>
            <div className="steps-content">

              <div>
                <SearchOrganization
                  searchOption={searchOption}
                  keyword={keyword}
                  onChange={this.handleSearchChange}
                />
              </div>

              <div style={{ marginTop: 20, width: '80%' }}>
                <CheckboxTag
                  value={tags}
                  onChange={this.handleTagsChange}
                />
              </div>
            </div>
            
            <div className="steps-action" style={{ textAlign: 'right' }}>
              <Button
                style={{ marginLeft: 10 }}
                type="primary"
                disabled={tags.length === 0}
                onClick={this.handleFinish}
              >
                完成
              </Button>
            </div>
          </div>

        </div>          
      </LeftRightLayout>
    )
  }
}

function mapStateToProps(state) {
  const { sortedTrader } = state.app;
  return { sortedTrader };
}
export default connect(mapStateToProps)(withRouter(NewOrgBD));

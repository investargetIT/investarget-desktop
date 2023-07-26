import React from 'react'
import { connect } from 'dva';
import { withRouter, Link } from 'dva/router'
import * as api from '../api'
import { handleError, i18n, findAllParentArea, requestAllData, time, sleep } from '../utils/util';
import { Button, Modal, Row, Col, Table, List, Comment, Avatar, Tag } from 'antd';
import LeftRightLayout from '../components/LeftRightLayout';
import styles from './ProjectBDList.css';
import OrganizationForm from '../components/OrganizationForm'
import { OrganizationRemarkList } from '../components/RemarkList'

const formStyle = {
  overflow: 'auto',
  maxHeight: '600px',
  margin: '24px 0',
  padding: '24px',
  border: '1px dashed #eee',
  borderRadius: '4px',
}
const actionStyle = {textAlign: 'center'}
const actionBtnStyle = {margin: '0 16px'}



class EditOrganization extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      data: {},
      loadingEditOrg: false,

      displaySameNameOrgModal: false,
      orgWithSameName: [],
      loadingMergeOrg: false,
      currentOrg: null,
      modalTitle: '发现同名机构，是否合并？',
    }
    this.editOrgFormRef = React.createRef();
    this.orgID = Number(this.props.match.params.id);
  }

  cancel = (e) => {
    this.props.router.goBack()
  }

  handleSubmit = () => {
    this.editOrgFormRef.current.validateFields()
      .then(values => {
        this.setState({ loadingEditOrg: true });
        const id = Number(this.props.match.params.id)
        if (values.country) {
          values.country = values.country[values.country.length - 1];
        }
        api.editOrg(id, values)
          .then((result) => {
            const { id } = result.data;
            const alias = values.alias ? values.alias.filter(f => !!f) : [];
            return this.updateOrgAlias(id, alias);
          })
          .then(() => {
            this.setState({ loadingEditOrg: false });
            this.props.history.goBack();
          })
          .catch(error => {
            this.setState({ loadingEditOrg: false });
            handleError(error)
          });
      });
  }

  autoSave = () => {
    let formValues = null;
    this.editOrgFormRef.current.validateFields()
      .then(values => {
        const id = Number(this.props.match.params.id)
        if (values.country) {
          values.country = values.country[values.country.length - 1];
        }
        formValues = values;
        return api.editOrg(id, values);
      }).then(result => {
        const { id } = result.data;
        const alias = formValues.alias ? formValues.alias.filter(f => !!f) : [];
        return this.updateOrgAlias(id, alias);
      });
  }

  updateOrgAlias = async (orgID, newAlias) => {
    const aliasArr = [...new Set(newAlias)];
    const reqOrgAlias = await requestAllData(api.getOrgAlias, { org: orgID }, 10);
    const { data: originalAlias } = reqOrgAlias.data;
    if (aliasArr.length >= originalAlias.length) {
      // 修改后的别名多了需要新增
      for (let index = 0; index < aliasArr.length; index++) {
        if (index < originalAlias.length) {
          if (aliasArr[index] !== originalAlias[index].alias) {
            await api.deleteOrgAlias(originalAlias[index].id);
            await api.addOrgAlias({ org: orgID, alias: aliasArr[index] });
          }
        } else {
          await api.addOrgAlias({ org: orgID, alias: aliasArr[index] });
        }
      }
    } else {
      // 修改后别名少了需要删除，必须先删除多的，因为无法同名
      for (let index = originalAlias.length - 1; index >= 0; index--) {
        if (index < aliasArr.length) {
          if (aliasArr[index] !== originalAlias[index].alias) {
            await api.deleteOrgAlias(originalAlias[index].id);
            await api.addOrgAlias({ org: orgID, alias: aliasArr[index] });
          }
        } else {
          await api.deleteOrgAlias(originalAlias[index].id);
        }
      }
    }
  }

  getOrgAlias = async orgID => {
    const req = await requestAllData(api.getOrgAlias, { org: orgID }, 10);
    const orgAlias = req.data.data.map(m => m.alias);
    this.editOrgFormRef.current.setFieldsValue({ alias: orgAlias });
  }

  componentDidMount() {
    const id = Number(this.props.match.params.id)
    let data = null;
    api.getOrgDetail(id).then(result => {
      // 数据转换
      data = { ...result.data };
      this.getOrgAlias(data.id);
      return this.props.dispatch({ type: 'app/getSource', payload: 'country' });
    }).then(allCountries => {
      let country = [];
      if (data.country) {
        country = findAllParentArea(data.country, allCountries);
      }
      data = { ...data, country };
      data.country = data.country ? data.country.map(m => m.id) : [];
      data.currency = data.currency && data.currency.id
      data.industry = data.industry && data.industry.id
      data.orgtransactionphase = data.orgtransactionphase ? data.orgtransactionphase.map(item => item.id) : []
      data.orgtype = data.orgtype && data.orgtype.id
      data.orgstatus = data.orgstatus && data.orgstatus.id
      data.tags = data.tags ? data.tags.map(item => item.id) : [];
      const textFields = ['description', 'typicalCase', 'partnerOrInvestmentCommiterMember', 'decisionMakingProcess']
      textFields.forEach(item => {
        if (data[item] == null) { data[item] = '' }
      })
      this.setState({ data })
      this.editOrgFormRef.current.setFieldsValue(data);
    }, error => {
      handleError(error)
    })
  }

  handleAliasOnBlur = async e => {
    const { value: alias } = e.target;
    if (!alias) return;
    let allAlias = this.editOrgFormRef.current.getFieldValue('alias');
    allAlias = allAlias.filter(f => !!f);
    if (allAlias && (new Set(allAlias)).size !== allAlias.length) {
      Modal.error({ title: '机构别名不能重复' });
      return;
    }
    const req = await api.getOrg({ search: alias, issub: false });
    let { data: orgWithSameName } = req.data;
    orgWithSameName = orgWithSameName.filter(f => f.id !== Number(this.props.match.params.id));
    if (orgWithSameName.length > 0) {
      this.setState({
        displaySameNameOrgModal: true,
        orgWithSameName: orgWithSameName.slice(0, 1),
        currentOrg: orgWithSameName[0].id,
      });
      this.props.dispatch({
        type: 'app/getOrgRemarks',
        payload: {
          orgIDArr: orgWithSameName.map(m => m.id),
          forceUpdate: false
        }
      });
      this.props.dispatch({
        type: 'app/getOrgInvestorsAndRemarks',
        payload: {
          orgIDArr: orgWithSameName.map(m => m.id),
          forceUpdate: false
        }
      });
    }
  }

  confirmMergeOrg = () => {
    this.handleConfirmMergeOrg()
      .then(this.autoSave)
      .catch(handleError);
  }

  handleConfirmMergeOrg = async () => {
    const toDelete = this.state.currentOrg;
    const toMerge = this.orgID;

    this.setState({ loadingMergeOrg: true, modalTitle: '开始合并机构' });
    await sleep(1000);

    this.setState({ modalTitle: '正在合并机构备注' });
    await this.mergeOrgRemarks(toDelete, toMerge);
    await sleep(1000);

    this.setState({ modalTitle: '正在合并机构看板' });
    await this.mergeOrgBD(toDelete, toMerge);
    await sleep(1000);

    this.setState({ modalTitle: '正在合并机构投资人' });
    await this.mergeOrgUsers(toDelete, toMerge);
    await sleep(1000);

    this.setState({ modalTitle: '正在删除被合并机构' });
    await api.deleteOrg(toDelete);
    await sleep(1000);

    this.setState({ modalTitle: '合并机构已完成' });
    await sleep(1000);

    this.setState({ loadingMergeOrg: false, displaySameNameOrgModal: false, modalTitle: '发现同名机构，是否合并？' });
  }

  mergeOrgRemarks = async (toDelete, toMerge) => {
    const resData = await requestAllData(api.getOrgRemark, { org: toDelete }, 10);
    const { data } = resData.data;
    await Promise.all(data.map(m => api.editOrgRemark(m.id, { org: toMerge })));
    // await Promise.all(data.map(m => api.editOrgRemark(m.id, { org: toDelete })));
  }

  mergeOrgBD = async (toDelete, toMerge) => {
    const resData = await requestAllData(api.getOrgBdList, { org: toDelete }, 10);
    const { data } = resData.data;
    await Promise.all(data.map(m => api.modifyOrgBD(m.id, { org: toMerge })));
    // await Promise.all(data.map(m => api.modifyOrgBD(m.id, { org: toDelete })));
  }

  mergeOrgUsers = async (toDelete, toMerge) => {
    const resData = await requestAllData(api.getUser, { org: toDelete }, 10);
    const { data, count } = resData.data;
    if (count === 0) return;
    await api.editUser(data.map(m => m.id), { org: toMerge });
    // await api.editUser(data.map(m => m.id), { org: toDelete });
  }

  getCurrentOrgName = () => {
    if (this.state.orgWithSameName.length > 0) {
      return this.state.orgWithSameName[0].orgfullname;
    }
  }

  getCurrentOrgRemarksFromRedux = () => {
    return this.props.orgRemarks.find(f => f.id === this.state.currentOrg);
  }

  getCurrentOrgRemarks = () => {
    const currentOrgObj = this.getCurrentOrgRemarksFromRedux();
    return currentOrgObj ? currentOrgObj.remarks.sort((a, b) => new Date(b.createdtime) - new Date(a.createdtime)) : [];
  }

  getCurrentOrgInvestors = () => {
    const currentOrgObj = this.props.orgInvestorsAndRemarks.find(f => f.id === this.state.currentOrg);
    return currentOrgObj ? currentOrgObj.investors : [];
  }

  getTagNameByID = tagID => {
    const tag = this.props.tag.find(f => f.id === tagID);
    if (!tag) return tagID;
    return tag.name;
  }

  render() {
    const id = Number(this.props.match.params.id)
    const columns = [
      {
        title: '全称', key: 'orgname',
        render: (_, record) => <Link target="_blank" to={'/app/organization/' + record.id}>
          <div style={{ color: "#428BCA" }}>
            {record.orgfullname}
          </div>
        </Link>,
      },
      {
        title: i18n('organization.transaction_phase'), key: 'orgtransactionphase', dataIndex: 'orgtransactionphase', render: (_, record) => {
          let phases = record.orgtransactionphase || [];
          return <span className="span-phase">{phases.map(p => p.name).join(' / ')}</span>
        }
      },
    ];
    return (
      <LeftRightLayout
        location={this.props.location}
        title={i18n('organization.edit_org')}
        action={{ name: i18n('organization.investor_list'), link: '/app/orguser/list?org=' + id }}>
        
        <div style={formStyle}>
          <OrganizationForm
            ref={this.editOrgFormRef}
            wrappedComponentRef={this.handleRef}
            data={this.state.data}
            aliasOnBlur={this.handleAliasOnBlur}
          />
          <div style={actionStyle}>
            <Button size="large" onClick={this.cancel} style={actionBtnStyle}>{i18n('common.cancel')}</Button>
            <Button type="primary" size="large" loading={this.state.loadingEditOrg} style={actionBtnStyle} onClick={this.handleSubmit}>{i18n('common.save')}</Button>
          </div>
        </div>

        <OrganizationRemarkList typeId={id} />

        <Modal
          title={this.state.modalTitle}
          visible={this.state.displaySameNameOrgModal}
          okText="合并"
          onOk={this.confirmMergeOrg}
          onCancel={() => this.setState({ displaySameNameOrgModal: false })}
          confirmLoading={this.state.loadingMergeOrg}
          width="100%"
        >
          <Row>
            <Col span={10}>
              <Table
                rowClassName={styles['current-row']}
                columns={columns}
                dataSource={this.state.orgWithSameName}
                rowKey={record => record.id}
                pagination={false}
              />
            </Col>

            <Col span={6} style={{ minHeight: 500 }}>
              <div style={{ width: '100%', height: '100%', background: '#fafafa', display: 'flex', flexDirection: 'column', position: 'absolute', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ height: 55, padding: 16, color: 'rgba(0, 0, 0, 0.85)', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' }}>
                  <div style={{ height: '100%' }}>
                    <div style={{ lineHeight: '27px', fontWeight: 500 }}>备注</div>
                  </div>
                </div>
                <div style={{ padding: 16, overflowY: 'auto' }}>
                  <List
                    className="comment-list"
                    itemLayout="horizontal"
                    dataSource={this.getCurrentOrgRemarks()}
                    renderItem={item => (
                      <li>
                        <Comment
                          author={item.createuserobj && item.createuserobj.username}
                          avatar={item.createuserobj && <Link to={`/app/user/${item.createuser}`}><Avatar src={item.createuserobj.photourl} /></Link>}
                          content={<p dangerouslySetInnerHTML={{ __html: item.remark }} />}
                          datetime={time(item.createdtime)}
                        />
                      </li>
                    )}
                  />
                </div>
              </div>
            </Col>

            <Col span={8}>
              <div style={{ width: '100%', height: '100%', background: '#fafafa', display: 'flex', flexDirection: 'column', position: 'absolute', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ height: 55, padding: 16, color: 'rgba(0, 0, 0, 0.85)', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ height: '100%' }}>
                    <div style={{ lineHeight: '27px', fontWeight: 500 }}>投资人</div>
                  </div>
                </div>
                <div style={{ padding: 16, overflowY: 'auto', borderLeft: '1px solid #f0f0f0' }}>
                  <List
                    itemLayout="horizontal"
                    dataSource={this.getCurrentOrgInvestors()}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar src={item.photourl} />}
                          title={
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 8px', color: 'rgba(0, 0, 0, .45)', lineHeight: 2, fontWeight: 'normal' }}>
                              <div><Link target="_blank" to={`/app/user/${item.id}`}>{item.username}</Link></div>
                              <div>{item.mobile}</div>
                              <div>{item.tags && item.tags.map(m => <Tag key={m} style={{ color: 'rgba(0, 0, 0, .45)' }}>{this.getTagNameByID(m)}</Tag>)}</div>
                            </div>
                          }
                          description={item.remarks && item.remarks.map(remark => (
                            <Comment
                              key={remark.id}
                              author={remark.createuser && remark.createuser.username}
                              avatar={remark.createuser && <Link target="_blank" to={`/app/user/${remark.createuser.id}`}><Avatar size="small" src={remark.createuser.photourl} /></Link>}
                              content={remark.remark}
                              datetime={time(remark.createdtime)}
                            />
                          ))}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Modal>

      </LeftRightLayout>
    )
  }
}

function mapStateToProps(state) {
  const { tag, orgRemarks, orgInvestorsAndRemarks } = state.app;
  return { tag, orgRemarks, orgInvestorsAndRemarks };
}

export default connect(mapStateToProps)(withRouter(EditOrganization));

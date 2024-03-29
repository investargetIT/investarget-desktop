import { PlusOutlined } from '@ant-design/icons';
import { connect } from 'dva'
import React, { useEffect, useState, useMemo } from 'react';
import {
  InputNumber,
  Select,
  Cascader,
  Input,
  Icon,
  Checkbox,
  Slider,
  Radio,
  Spin,
  DatePicker,
  Popover,
  Row,
  Col,
  Tag,
  Modal,
  Button,
  Divider,
} from 'antd'
import { 
  SimpleLine, 
  Trader,
} from './OrgBDListComponent';
const Option = Select.Option
const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group
import TabCheckbox from './TabCheckbox'
import Select2 from './Select2'
import Select2WithTooltip from './Select2WithTooltip'
import _ from 'lodash'
import * as api from '../api'
import { i18n, hasPerm, getCurrentUser, getCurrencyFormatter, getCurrencyParser, requestAllData, getURLParamValue } from '../utils/util'
import ITCheckboxGroup from './ITCheckboxGroup'
import { ITCheckboxGroup2 } from './ITCheckboxGroup';
import { BasicContainer, BasicContainer2 } from './Filter';
import { mapStateToPropsIndustry as mapStateToPropsLibIndustry } from './Filter';
import debounce from 'lodash/debounce';
import moment from 'moment';
import pinyin from 'tiny-pinyin';
import {
  UpOutlined,
  DownOutlined,
  SearchOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';


const { CheckableTag } = Tag;

function RadioGroup2 ({children, onChange, ...extraProps}) {
  function handleChange(e) {
    onChange(e.target.value)
  }

  return (
    <RadioGroup size="large" {...extraProps} onChange={handleChange} />
  )
}


class _Select extends React.Component {
  render() {
    const { children, options, value, onChange, ...extraProps } = this.props
    return (
      <Select value={value} onChange={onChange} size="large" {...extraProps}>
        {options.map((item, index) =>
          <Option key={item.key || index} value={item.value}>{item.label}</Option>
        )}
      </Select>
    )
  }
}
 
class SelectNumber extends React.Component {

  handleChange = (value) => {
    value = Array.isArray(value) ? value.map(item => Number(item)) : Number(value)
    if (this.props.onChange) { this.props.onChange(value) }
  }

  render() {
    const {children, options, value, onChange, ...extraProps} = this.props
    const _options = options.map(item => ({ label: item.label, value: String(item.value) }))
    let _value
    if (value == undefined) {
      _value = value
    } else {
      _value = Array.isArray(value) ? value.map(item => String(item)) : String(value)
    }

    return (
      <Select value={_value} 
      filterOption={(input, option) => option.props.children.indexOf(input) >= 0} 
      onChange={this.handleChange} 
      {...extraProps}>
        {_options && _options.map((item, index) =>
          <Option key={index} value={item.value}>{item.label}</Option>
        )}
      </Select>
    )
  }
}


const withOptions = function(Component, options) {
  return class extends React.Component {
    constructor(props) {
      super(props)
    }

    render() {
      const Option = Select.Option
      const {children, ...extraProps} = this.props
      return (
        <Component options={options} {...extraProps} />
      )
    }
  }
}

const withOptionsAsync = function(Component, sourceTypeList, mapStateToProps) {
  class WrappedComponent extends React.Component {
    constructor(props) {
      super(props)
    }

    componentDidMount() {
      this.props.dispatch({ type: 'app/getSourceList', payload: sourceTypeList })
    }

    render() {
      const {options, children, dispatch, ...extraProps} = this.props // 剔除属性 options, children, dispatch
      return (
        <Component options={options} {...extraProps} />
      )
    }
  }
  return connect(mapStateToProps)(WrappedComponent)
}

function withYear(Component) {
  class WrappedComponent extends React.Component {

    render() {
      const currYear = new Date().getFullYear()
      const { disabledYears=[], start=currYear, end=currYear-100, children, ...extraProps } = this.props
      const yearList = _.range(start, end)
      const options = yearList.map(year => {
        return { label: String(year), value: year, disabled: disabledYears.includes(year) }
      })

      return (
        <Component options={options} {...extraProps} />
      )
    }
  }
  return WrappedComponent
}



/************************************************************************************************/

/**
 * SelectTag
 */

const SelectTag = withOptionsAsync(SelectNumber, ['tag'], function(state) {
  const { tag } = state.app
  const options = tag ? tag.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

const SelectService = withOptionsAsync(SelectNumber, ['service'], function(state) {
  const { service } = state.app
  const options = service ? service.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * SelectRole
 */

const SelectRole = withOptionsAsync(SelectNumber, ['character'], function(state) {
  const { character } = state.app
  const options = character ? character.map(item => ({value: item.id, label: item.character})) : []
  return { options }
})

/**
 * SelectDegree
 */
const SelectEducation = withOptionsAsync(SelectNumber, ['education'], function(state) {
  const { education } = state.app;
  const options = education ? education.map(item => ({ value: item.id, label: item.name })) : [];
  return { options };
});

/**
 * SelectYear
 */
const SelectYear = withYear(SelectNumber)


/**
 * SelectTransactionType
 */

const SelectTransactionType = withOptionsAsync(SelectNumber, ['transactionType'], function(state) {
  const { transactionType } = state.app
  const options = transactionType ? transactionType.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * SelectCurrencyType
 */

const SelectCurrencyType = withOptionsAsync(SelectNumber, ['currencyType'], function(state) {
  const { currencyType } = state.app
  const options = currencyType ? currencyType.map(item =>({value: item.id, label: item.currency})) : []
  return { options }
})

/**
 * Select training type
 */
 const SelectTraingType = withOptionsAsync(SelectNumber, ['trainingType'], function(state) {
  const { trainingType } = state.app
  const options = trainingType ? trainingType.map(item =>({ value: item.id, label: item.type })) : []
  return { options }
})

/**
 * Select training type
 */
 const SelectTraingStatus = withOptionsAsync(SelectNumber, ['trainingStatus'], function(state) {
  const { trainingStatus } = state.app
  const options = trainingStatus ? trainingStatus.map(item =>({ value: item.id, label: item.status })) : []
  return { options }
})

/**
 * SelectOrganizationType
 */

const SelectOrganizationType = withOptionsAsync(SelectNumber, ['orgtype'], function(state) {
  const { orgtype } = state.app
  const options = orgtype ? orgtype.map(item =>({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * SelectTransactionPhase
 */

const SelectTransactionPhase = withOptionsAsync(SelectNumber, ['transactionPhases'], function(state) {
  const { transactionPhases } = state.app
  const options = transactionPhases ? transactionPhases.map(item =>({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * SelectOrganizatonArea
 */
const SelectOrganizatonArea = withOptionsAsync(SelectNumber, ['orgarea'], function(state) {
  const { orgarea } = state.app
  const options = orgarea ? orgarea.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

// 提供热门地区的快捷选择方式
const HOT_AREA = ['上海', '无锡', '常州', '苏州', '宁波', '嘉兴', '北京', '深圳', '杭州', '广州', '成都', '西安', '武汉', '沈阳', '南京', '海口'];
export const SelectAreaWithShortcut = connect(state => {
  const { orgarea } = state.app
  const options = orgarea ? orgarea.map(item => ({value: item.id, label: item.name})) : []
  const hotAreaOptions = HOT_AREA.map(m => options.find(f => f.label.includes(m)))
    .filter(f => f !== undefined);
  return { options, hotAreaOptions };
})(props => {

  useEffect(() => {
    props.dispatch({ type: 'app/getSource', payload: 'orgarea' });
  }, []);

  function handleChange(value) {
    const newValue = Array.isArray(value) ? value.map(item => Number(item)) : Number(value);
    if (props.onChange) {
      props.onChange(newValue)
    }
  }

  const { children, options, value, onChange, ...extraProps } = props;
  const _options = options.map(item => ({ label: item.label, value: String(item.value) }));
  let _value
  if (value == undefined) {
    _value = value
  } else {
    _value = Array.isArray(value) ? value.map(item => String(item)) : String(value)
  }

  return (
    <div>
      <Select
        value={_value}
        filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
        onChange={handleChange}
        showSearch
      >
        {_options && _options.map((item, index) =>
          <Option key={index} value={item.value}>{item.label}</Option>
        )}
      </Select>
      <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ fontSize: 12, lineHeight: '20px', width: 60, flex: 'none', paddingTop: 1 }}>热门地区：</div>
        <div>
          {props.hotAreaOptions.map(item => ({ label: item.label, value: String(item.value) }))
            .map(m => (
              <CheckableTag
                style={{ marginRight: 0 }}
                key={m.value}
                checked={_value === m.value}
                onChange={() => handleChange(m.value)}
              >
                {m.label}
              </CheckableTag>
            ))}
        </div>
      </div>
    </div>
  )
  
});

/**
 * SelectOrganization
 */
// class SelectOrganization extends React.Component {

//   constructor(props) {
//     super(props)
//     this.state = {
//       org: [],
//     }
//   }

//   handleOrgChange = value => {

//     if (value === '') {
//       this.setState({ org: [] })
//       return
//     } else if (value.length < 2) {
//       this.setState({ org: [] })
//       return
//     } else if (this.state.org.map(i => i.name).includes(value)) {
//       return
//     }

//     api.getOrg({search: value}).then(data => {
//       const org = data.data.data.map(item => {
//         return { id: item.id, name: item.orgname }
//       })
//       this.setState({ org: org })
//     }, error => {
//       this.props.dispatch({
//         type: 'app/findError',
//         payload: error
//       })
//     })
//   }

//   onChange = (value) => {
//     this.props.onChange(value)
//     this.handleOrgChange(value)
//   }

//   render() {
//     const { org } = this.state
//     return (
//       <Select size="large" mode="combobox" value={this.props.value} onChange={this.onChange}>
//         { org ? org.map(d => <Option key={d.id} value={d.name}>{d.name}</Option> ) : null }
//       </Select>
//     )
//   }
// }
// SelectOrganization = connect()(SelectOrganization)

// async function fetchUserList(username) {
//   console.log('fetching user', username);
//   return fetch('https://randomuser.me/api/?results=5')
//     .then((response) => response.json())
//     .then((body) =>
//       body.results.map((user) => ({
//         label: `${user.name.first} ${user.name.last}`,
//         value: user.login.username,
//       })),
//     );
// }

const getOrg = (params) => {
  return api.getOrg({...params, issub: false, orgstatus: 2}).then(result => {
    var { count: total, data: list } = result.data
    list = list.map(item => {
      const { id: value, orgfullname: label, description } = item
      return { value: label, label, description }
    })
    return { total, list }
    // return list;
  });
}

const SelectExistOrganization = (props) => {
  const [value, setValue] = React.useState([]);
  return (
    <Select2
      value={value}
      placeholder={i18n('account.select_org')}
      getData={getOrg}
      onChange={(newValue) => {
        setValue(newValue);
      }}
      style={{
        width: '100%',
      }}
      noResult="未找到相关机构"
      {...props}
    />
  );
};

export const SelectExistOrCreateNewOrganization = (props) => {
  const [value, setValue] = React.useState([]);

  function getOrg(params) {
    return api.getOrg({ ...params, issub: false, orgstatus: 2 }).then(result => {
      var { count: total, data: list } = result.data
      list = list.map(item => {
        const { id: value, orgfullname: label, description } = item
        return { value, label, description }
      })
      return { total, list }
    });
  }

  return (
    <Select2
      labelInValue
      value={value}
      getData={getOrg}
      onChange={(newValue) => {
        setValue(newValue);
      }}
      noResult="未找到相关机构"
      {...props}
    />
  );
};

export const SelectExistOrganizationWithID = (props) => {
  const [value, setValue] = React.useState([]);

  function getOrg(params) {
    return api.getOrg({ ...params, issub: false, orgstatus: 2 }).then(result => {
      var { count: total, data: list } = result.data
      list = list.map(item => {
        const { id: value, orgfullname: label, description } = item
        return { value, label, description }
      })
      return { total, list }
    });
  }

  function getOrgnameById(id) {
    return api.getOrgDetailLang(id).then(result => {
      return result.data.orgfullname
    })
  }

  return (
    <Select2
      value={value}
      getData={getOrg}
      getNameById={getOrgnameById}
      onChange={(newValue) => {
        setValue(newValue);
      }}
      noResult="未找到相关机构"
      {...props}
    />
  );
};

// /**
//  * SelectExistOrganization
//  */
// class SelectExistOrganization extends React.Component {

//   getOrg = (params) => {
//     return api.getOrg({...params, issub: false, orgstatus: 2}).then(result => {
//       var { count: total, data: list } = result.data
//       list = list.map(item => {
//         const { id: value, orgfullname: label, description } = item
//         return { value, label, description }
//       })
//       return { total, list }
//     })
//   }

//   getOrgnameById = (id) => {
//     return api.getOrgDetailLang(id).then(result => {
//       return result.data.orgfullname
//     })
//   }

//   render() {
//     const { value, onChange, allowCreate, ...extraProps } = this.props
//     return (
//       <Select2
//         getData={this.getOrg}
//         getNameById={this.getOrgnameById}
//         value={this.props.value}
//         onChange={this.props.onChange}
//         allowCreate={this.props.allowCreate}
//         {...extraProps}
//       />
//     )
//   }
// }

/**
 * SelectProjectLibrary
 */
class SelectProjectLibrary extends React.Component {

  getData = params => {
    return api.getLibProjSimple({ ...params, com_name: params.search }).then(result => {
      var { count: total, data: list } = result.data
      list = list.map(item => {
        const { com_id: value, com_name: label } = item;
        return { value, label };
      })
      return { total, list };
    })
  }

  getOrgnameById = id => {
    return api.getLibProjSimple({ com_id: id }).then(result => {
      return result.data.data[0].com_name;
    })
  }

  handleChange = value => {
    if (value !== this.props.value) {
      this.props.onChange(value);
    }
  }

  render() {
    const { value, onChange, allowCreate, ...extraProps } = this.props
    return (
      <Select2
        // getData={this.getData}
        getData={this.getData}
        getNameById={this.getOrgnameById}
        value={value}
        onChange={this.handleChange}
        allowCreate={this.props.allowCreate}
        {...extraProps}
      />
    )
  }
}

/**
 * SelectExistUser
 */
class SelectExistUser extends React.Component {

  getUser = (params) => {
    params = { ...params, userstatus: 2 } // 审核通过
    return api.getUser(params).then(result => {
      var { count: total, data: list } = result.data
      list = list.map(item => {
        const { id: value, username: label } = item
        return { value, label }
      })
      return { total, list }
    })
  }

  getUsernameById = (id) => {
    return api.getUserInfo(id).then(result => {
      return result.data.username
    })
  }

  render() {
    return (
      <Select2
        style={this.props.style || {}}
        getData={this.getUser}
        getNameById={this.getUsernameById}
        value={this.props.value}
        onChange={this.props.onChange}
        placeholder={this.props.placeholder}
      />
    )
  }

}

const SelectExistInvestor = (props) => {

  const getInvestor = (params) => {
    params = {
      ...params,
      traderuser: props.dataroom ? undefined : getCurrentUser(),
      sort: 'createdtime',
      desc: 1,
      dataroom: props.dataroom,
    };
    return api.getUserRelation(params).then(result => {
      var { count: total, data: list } = result.data
      list = list.map(item => item.investoruser).map(item => {
        const { id: value, username: label, org, mobile, email } = item;
        const description = [org ? org.orgname : '暂无机构', mobile, email].join('\n');
        return { value, label, description };
      })
      return { total, list }
    })
  }

  return (
    <Select2
      style={props.style || {}}
      size={props.size}
      // getData={this.getInvestor}
      getData={getInvestor}
      // getNameById={this.getUsernameById}
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      noResult="未找到相关投资人"
      allowClear={props.allowClear}
    />
  );
};

const SelectMyInvestor = (props) => {

  const getInvestor = (params) => {
    params = {
      ...params,
      traderuser: getCurrentUser(),
      sort: 'createdtime',
      desc: 1,
    };
    return api.getUserRelation(params).then(result => {
      var { count: total, data: list } = result.data
      list = list.map(item => item.investoruser).map(item => {
        const { id: value, username: label, org, mobile, email } = item;
        // const description = [org ? org.orgname : '暂无机构', mobile, email].join('\n');
        const tooltipContent = org ? org.orgname : '暂无机构';
        return { value, label, tooltipContent };
      })
      return { total, list }
    })
  }

  return (
    <Select2WithTooltip
      style={props.style || {}}
      size={props.size}
      // getData={this.getInvestor}
      getData={getInvestor}
      // getNameById={this.getUsernameById}
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      noResult="未找到相关投资人"
    />
  );
};

const SelectShareInvestor = (props) => {

  const getInvestor = (params) => {
    params = {
      ...params,
      sort: 'createdtime',
      desc: 1,
    };
    return api.getInvestors(params).then(result => {
      var { count: total, data: list } = result.data
      list = list.map(item => {
        const { id: value, username: label, org, mobile, email } = item;
        // const description = [org ? org.orgname : '暂无机构', mobile, email].join('\n');
        const tooltipContent = org ? org.orgname : '暂无机构';
        return { value, label, tooltipContent };
      })
      return { total, list }
    })
  }

  return (
    <Select2WithTooltip
      style={props.style || {}}
      size={props.size}
      // getData={this.getInvestor}
      getData={getInvestor}
      // getNameById={this.getUsernameById}
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      noResult="未找到相关投资人"
    />
  );
};

/**
 * SelectExistInvestor
 */
// class SelectExistInvestor extends React.Component {

//   getInvestor = (params) => {
//     params = {
//       ...params,
//       traderuser: this.props.dataroom ? undefined : getCurrentUser(),
//       sort: 'createdtime',
//       desc: 1,
//       dataroom: this.props.dataroom,
//     };
//     return api.getUserRelation(params).then(result => {
//       var { count: total, data: list } = result.data
//       list = list.map(item => item.investoruser).map(item => {
//         const { id: value, username: label, org, mobile, email } = item;
//         const description = [org ? org.orgname : '暂无机构', mobile, email].join('\n');
//         return { value, label, description };
//       })
//       return { total, list }
//     })
//   }

//   getUsernameById = (id) => {
//     return api.getUserInfo(id).then(result => {
//       return result.data.username
//     })
//   }

//   render() {
//     return (
//       <Select2
//         style={this.props.style || {}}
//         getData={this.getInvestor}
//         getNameById={this.getUsernameById}
//         value={this.props.value}
//         onChange={this.props.onChange}
//         placeholder={this.props.placeholder}
//       />
//     )
//   }
// }

/**
 * SelectAllUser
 */
class SelectAllUser extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      groups: [],
    }
  }

  componentDidMount() {
    this.getGroups()
  }

  getGroups = () => {
    api.queryUserGroup({ type: this.props.type }).then(result => {
      const { data } = result.data
      const groups = data.map(item => item.id)
      this.setState({ groups })
    })
  }

  getUser = (params) => {
    params = { ...params, groups: this.state.groups, userstatus: 2 }
    return api.getUser(params).then(result => {
      var { count: total, data: list } = result.data
      list = list.map(item => {
        const { id: value, username: label, org } = item
        const tooltipContent = org ? org.orgname : '暂无机构';
        return { value, label, tooltipContent }
      })
      return { total, list }
    })
  }

  getUsernameById = (id) => {
    return api.getUserInfo(id).then(result => {
      return result.data.username
    })
  }

  render() {
    if (this.props.type && this.state.groups.length === 0) return null;
    return (
      <Select2WithTooltip
        size={this.props.size}
        style={this.props.style || {}}
        getData={this.getUser}
        getNameById={this.getUsernameById}
        value={this.props.value}
        onChange={this.props.onChange}
        placeholder={this.props.placeholder}
      />
    )
  }
}

/**
 * SelectAllUser
 */
class SelectPartner extends React.Component {

  getPartner = params => {
    return api.getUserRelation(params).then(result => {
      let { count: total, data: list } = result.data;
      const unique = [];
      list = list.map(item => {
        const { id: value, username: label } = item.investoruser;
        if (!unique.map(m => m.value).includes(value)) {
          unique.push({ value, label });
        }
      })
      return { total, list: unique } 
    })
  }

  getUsernameById = (id) => {
    return api.getUserInfo(id).then(result => {
      return result.data.username
    })
  }

  render() {
    return (
      <Select2
        size={this.props.size}
        style={this.props.style || {}}
        getData={this.getPartner}
        getNameById={this.getUsernameById}
        value={this.props.value}
        onChange={this.props.onChange}
        placeholder={this.props.placeholder}
      />
    )
  }
}

/**
 * SelectAllProjectBD
 */
 class SelectProjectBD extends React.Component {

  getProjectBD = params => {
    return api.getProjBDList(params).then(result => {
      let { count: total, data: list } = result.data;
      const unique = [];
      list = list.map(item => {
        const { id: value, com_name: label } = item;
        if (!unique.map(m => m.value).includes(value)) {
          unique.push({ value, label });
        }
      })
      return { total, list: unique } 
    })
  }

  getProjnameById = (id) => {
    return api.getProjBD(id).then(result => {
      return result.data.com_name;
    })
  }

  render() {
    return (
      <Select2
        style={this.props.style || {}}
        getData={this.getProjectBD}
        getNameById={this.getProjnameById}
        value={this.props.value}
        onChange={this.props.onChange}
        placeholder={this.props.placeholder}
        size="middle"
        allowClear
      />
    )
  }
}

const SelectExistProject = (props) => {

  const getProject = (params) => {
    params = { ...params }
    params['skip_count'] = (params['page_index'] - 1) * params['page_size']
    params['max_size'] = params['page_size']
    params['bdm'] = props.bdm;
    params['projstatus'] = props.projstatus;
    delete params['page_index']
    delete params['page_size']
    return api.getProj(params).then(result => {
      var { count: total, data: list } = result.data
      list = list.map(item => {
        const { id: value, realname: label } = item
        return { value, label }
      })
      return { total, list }
    })
  }

  const getProjectNameById = (id) => {
    return api.getProjLangDetail(id).then(result => {
      return result.data.realname
    })
  }

  return (
    <Select2
      value={props.value}
      placeholder={props.placeholder}
      getData={getProject}
      onChange={props.onChange}
      size={props.size}
      style={props.style || {}}
      getNameById={getProjectNameById}
    />
  );
};


/**
 * SelectExistProject
 */
// class SelectExistProject extends React.Component {

//   getProject = (params) => {
//     params = { ...params }
//     params['skip_count'] = (params['page_index'] - 1) * params['page_size']
//     params['max_size'] = params['page_size']
//     params['bdm'] = this.props.bdm;
//     params['projstatus'] = this.props.projstatus;
//     delete params['page_index']
//     delete params['page_size']
//     return api.getProj(params).then(result => {
//       var { count: total, data: list } = result.data
//       list = list.map(item => {
//         const { id: value, projtitle: label } = item
//         return { value, label }
//       })
//       return { total, list }
//     })
//   }

//   getProjectNameById = (id) => {
//     return api.getProjLangDetail(id).then(result => {
//       return result.data.projtitle
//     })
//   }

//   render() {
//     return (
//       <Select2
//         style={this.props.style || {}}
//         getData={this.getProject}
//         getNameById={this.getProjectNameById}
//         value={this.props.value}
//         onChange={this.props.onChange}
//         placeholder={this.props.placeholder}
//         noResult={this.props.noResult}
//       />
//     )
//   }
// }

class SelectProjectForOrgBd extends React.Component {

  getProject = (params) => {
    // 首先请求所有以项目分组的机构看板
    params = { ...params, realname: params.search };
    // if (!hasPerm('BD.manageOrgBD')) {
    //   params.manager = getCurrentUser();
    //   params.createuser = getCurrentUser();
    //   params.unionFields = 'manager,createuser';
    // }
    return api.getOrgBDProj(params).then(result => {
      var { count: total, data: list } = result.data
      list = list.filter(f => f.proj)
      list = list.map(item => {
        const { id: value, realname: label } = item.proj
        return { value, label }
      })
      return { total, list }
    })
  }

  getProjectNameById = (id) => {
    return api.getProjLangDetail(id).then(result => {
      return result.data.realname
    })
  }

  render() {
    return (
      <Select2
        size="middle"
        style={this.props.style || {}}
        getData={this.getProject}
        getNameById={this.getProjectNameById}
        value={this.props.value}
        onChange={this.props.onChange}
        placeholder={this.props.placeholder}
        noResult={this.props.noResult}
      />
    )
  }
}

/**
 * SelectTrader
 */
class SelectTrader extends React.Component {
  state = {
    data: this.props.data || [],
  }
  componentDidMount() {

    if (!this.props.data) {
    api.queryUserGroup({ type: this.props.type || 'trader' })
    .then(data => requestAllData(api.getUser, { groups: data.data.data.map(m => m.id), userstatus: 2 }, 99))
    .then(data => this.setState({ data: data.data.data }))
    .catch(error => {
      this.props.dispatch({
        type: 'app/findError',
        payload: error
      })
    })
    }
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({ data: nextProps.data });
    }
  }

  render() {
    return (
      <Select
      // {...this.props}
      style={{ width: '100%' }}
      placeholder={this.props.placeholder}
      mode={this.props.mode}
      showSearch
      disabled={this.props.disabled}
      optionFilterProp="children"
      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
      allowClear={this.props.allowClear}
      value={this.props.value}
      onChange={this.props.onChange}
      onSelect={this.props.onSelect}
      onDeselect={this.props.onDeselect}>
        {this.state.data.map(d => <Option key={d.id} value={d.id + ""}
          disabled={this.props.disabledOption && (parseInt(this.props.disabledOption, 10) === d.id || this.props.disabledOption.includes(d.id + ""))}>
          {d.username}</Option>)}
      </Select>
    )
  }
}
SelectTrader = connect()(SelectTrader)

/**
 * SelectOrgUser
 */
class SelectOrgUser extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      options: []
    }
  }

  componentDidMount() {
    const { org, type, allStatus, onjob } = this.props
    api.queryUserGroup({ type: type || 'trader'}).then(data => {
      const groups = data.data.data.map(item => item.id)
      const param = { groups, userstatus: allStatus ? undefined : 2, org, onjob }
      return requestAllData(api.getUser, param, 99)
    }).then(data => {
      const traders = data.data.data
      const options = traders.map(item => {
        return { label: item.username, value: item.id }
      })
      if (this.props.allowEmpty && !options.length) {
        this.setState({ options: [{label: "暂无", value: -1}] })
      } else {
        this.setState({ options })
      }
    })
  }

  render() {
    return <SelectNumber options={this.state.options} {...this.props} />
  }
}

class SelectOrgInvestor extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      options: [],
      search: '',
    }
  }

  componentDidMount() {

    this.props.dispatch({ type: 'app/getSource', payload: 'title' });
    this.props.dispatch({ type: 'app/getSource', payload: 'tag' });
    this.getData(this.props);
  }

  getData = (props) => {
    const { org, type, allStatus, onjob } = props
    if (!org) return;
    api.queryUserGroup({ type: type || 'trader'}).then(data => {
      const groups = data.data.data.map(item => item.id)
      const param = { groups, userstatus: allStatus ? undefined : 2, org, onjob }
      return requestAllData(api.getUser, param, 99)
    }).then(data => {
      const traders = data.data.data
      const options = traders.map(item => {
        return { label: item.username, value: item.id, user: item }
      })
      if (this.props.allowEmpty && !options.length) {
        this.setState({ options: [{label: "暂无", value: -1}] })
      } else {
        this.setState({ options })
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.org !== nextProps.org || this.props.reload !== nextProps.reload) {
      this.getData(nextProps);
    }
  }

  handleChange = (value) => {
    value = Array.isArray(value) ? value.map(item => Number(item)) : Number(value)
    if (this.props.onChange) { this.props.onChange(value) }
  }

  content(user) {
    const photourl=user.photourl
    const tags=user.tags ? user.tags.map(m => this.props.tag.filter(f => f.id === m)[0].name).join(',') :''
    const mobile = user.mobile;
    const email = user.email;
    const title = user.title && this.props.title.filter(f => f.id === user.title)[0].name;
    return <div style={{ minWidth: 180, maxWidth: 600 }}>
      <div style={{ textAlign: 'center', margin: '10px 0' }}>
        {photourl ? <img src={photourl} style={{ width: '50px', height: '50px', borderRadius: '50px' }} /> : '暂无头像'}
      </div>

      {mobile ?
        <SimpleLine title={i18n('user.mobile')} value={mobile} />
        : null}

      {email ?
        <SimpleLine title={i18n('user.email')} value={email} />
        : null}

      <SimpleLine title={i18n('user.position')} value={title || '暂无'} />

      <SimpleLine title={i18n('user.tags')} value={tags || '暂无'} />

      <Row style={{ lineHeight: '24px', borderBottom: '0px dashed #ccc' }}>
        <Col span={12}>{i18n('user.trader')}:</Col>
        <Col span={12} style={{ wordBreak: 'break-all' }}>
          <Trader investor={user.id} />
        </Col>
      </Row>
    </div>;
  }

  dropdownRender = originalNode => {
    return (
      <div>
        {this.props.allowCreate && this.state.search && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', minHeight: 32 }}>
            <div style={{ fontWeight: 500, color: '#636e7b' }}>{this.state.search}</div>
            <div onClick={() => this.props.handleAddBtnClick(this.state.search)}  style={{ color: '#339bd2', cursor: 'pointer' }}>添加</div>
          </div>
        )}
        {originalNode}
      </div>
    );
  }

  render() {
    const {
      children,
      options,
      value,
      onChange,
      allStatus,
      onjob,
      dispatch,
      allowEmpty,
      title,
      tag,
      allowCreate,
      handleAddBtnClick,
      ...extraProps,
    } = this.props;
    const _options = this.state.options.map(item => ({ label: item.label, value: String(item.value), user: item.user }))
    let _value
    if (value == undefined) {
      _value = value
    } else {
      _value = Array.isArray(value) ? value.map(item => String(item)) : String(value)
    }
    return (
      <Select
        value={_value}
        showSearch
        onSearch={ search => this.setState({ search }) }
        filterOption={(input, option) => {
          if (!option.props.children.props) {
            return false;
          }
          return option.props.children.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }}
        onChange={this.handleChange}
        autoFocus
        size="large"
        dropdownRender={this.dropdownRender}
        {...extraProps}
      >
        {_options && _options.map((item, index) => (
          <Option key={index} value={item.value}>
            {item.user ?
              <Popover zIndex={9999} placement="right" content={this.content(item.user)}>{item.label}</Popover>
              : item.label}
          </Option>
        ))}
      </Select>
    )

  }
}

SelectOrgInvestor = connect(state => ({ title: state.app.title, tag: state.app.tag }))(SelectOrgInvestor);

/**
 * SelectTransactionStatus
 */
const SelectTransactionStatus = withOptionsAsync(SelectNumber, ['transactionStatus'], function(state) {
  const { transactionStatus } = state.app
  const options = transactionStatus ? transactionStatus.map(item => ({ value: item.id, label: item.name })) : []
  return { options }
})

/**
 * SelectProjectStatus
 */
const SelectProjectStatus = withOptionsAsync(SelectNumber, ['projstatus'], function(state) {
  const { projstatus } = state.app
  const options = projstatus ? projstatus.map(item => ({ value: item.id, label: item.name })) : []
  return { options }
})

/**
 * SelectUserGroup // 值要包装在数组中
 */
class SelectUserGroup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      options: [],
    }
  }

  handleChange = (value) => {
    this.props.onChange([value])
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getGroup' });
  }

  render() {
    const { value, onChange, children, ...extraProps } = this.props
    let roles = this.props.groups;
    if (this.props.type) {
      roles = this.props.groups.filter(f => f.permissions.map(m => m.codename).includes(`usersys.as_${this.props.type}`));
    }
    const options = roles.map(m => ({ label: m.name, value: m.id }));
    return (
      <SelectNumber
      size={this.props.size}
      options={options}
      value={value && value[0]} onChange={this.handleChange} />
    )
  }
}
SelectUserGroup = connect(
  state => ({ groups: state.app.group })
)(SelectUserGroup);

/**
 * SelectTitle
 */
const SelectTitle = withOptionsAsync(SelectNumber, ['title'], function(state) {
  const { title } = state.app
  const options = title ? title.map(item => ({ value: item.id, label: item.name })) : []
  return { options }
})

/**
 * 选择考核结果
 */
 const SelectKPIResult = withOptionsAsync(SelectNumber, ['palevel'], function(state) {
  const { palevel } = state.app
  const options = palevel ? palevel.map(item => ({ value: item.id, label: item.name })) : []
  return { options }
})

/**
 * SelectBDStatus
 */
const SelectBDStatus = withOptionsAsync(SelectNumber, ['bdStatus'], function(state) {
  const { bdStatus } = state.app
  const options = bdStatus ? bdStatus.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * 选择行业组
 */
const SelectIndustryGroup = withOptionsAsync(SelectNumber, ['industryGroup'], function(state) {
  const { industryGroup } = state.app;
  const options = industryGroup ? industryGroup.map(item => ({value: item.id, label: item.name})) : [];
  return { options };
})

/**
 * 选择行业组
 */
 const SelectIndustryGroupWithAll = withOptionsAsync(SelectNumber, ['industryGroup'], function(state) {
  const { industryGroup } = state.app;
  const options = industryGroup ? industryGroup.map(item => ({value: item.id, label: item.name})) : [];
  options.push({ value: 0, label: '其他' });
  return { options };
})

// const SelectNewBDStatus = withOptionsAsync(SelectNumber, ['orgbdres'], function(state) {
//   const { orgbdres } = state.app
//   const options = orgbdres ? orgbdres.map(item => ({value: item.id, label: item.name})) : []
//   return { options, allowClear: true }
// })

let SelectNewBDStatus = props => {
  useEffect(() => {
    props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
  }, []);

  function getProgressOptions() {
    return props.orgbdres.map(m => {
      if (!m.material) {
        return { label: m.name, value: m.id };
      }
      return {
        label: m.name,
        value: m.id,
        children: [
          {
            label: '无材料',
            value: 0,
          },
          {
            label: m.material,
            value: m.material,
          },
        ],
      };
    });
  }

  function getValue() {
    if (!props.value) return undefined;
    const { response, material } = props.value;
    const progressValue = [response];
    if (material) {
      progressValue.push(material);
    }
    return progressValue;
  }

  function handleProgressChange(value) {
    const response = value[0];
    let material = null;
    if (value.length > 0 && value[1] !== 0) {
      material = value[1];
    }
    props.onChange({ response, material });
  }

  return (
    <Cascader
      options={getProgressOptions()}
      onChange={handleProgressChange}
      placeholder="机构进度/材料"
      value={getValue()}
      size={props.size}
    />
  )
}
SelectNewBDStatus = connect(state => {
  const { orgbdres } = state.app;
  return { orgbdres };
})(SelectNewBDStatus);

/**
 * SelectBDSource
 */
const BDSourceOptions = [
  { label: i18n('filter.project_library'), value: 0 },
  { label: i18n('filter.other'), value: 1 },
]
const SelectBDSource = withOptions(SelectNumber, BDSourceOptions)

const ScheduleTypeOptions = [
  { label: '路演会议', value: 1 },
  { label: '约见公司', value: 2 },
  { label: '约见投资人', value: 3 },
  { label: '视频会议', value: 4 },
];
const SelectScheduleType = withOptions(SelectNumber, ScheduleTypeOptions);

const ScheduleTypeOptionsWithoutMeeting = [
  { label: '路演会议', value: 1 },
  { label: '约见公司', value: 2 },
  { label: '约见投资人', value: 3 },
];
const SelectScheduleTypeWithoutMeeting = withOptions(SelectNumber, ScheduleTypeOptionsWithoutMeeting);

const seasons = [
  { label: '第一季度', value: 1 },
  { label: '第二季度', value: 2 },
  { label: '第三季度', value: 3 },
  { label: '第四季度', value: 4 },
];
const SelectSeason = withOptions(SelectNumber, seasons);

/**
 * SelectArea
 */
const SelectArea = withOptionsAsync(SelectNumber, ['country'], function(state) {
  const { country } = state.app
  const options = country.filter(item => item.level == 3).map(item => {
    return { label: item.country, value: item.id }
  })
  return { options }
})


/**
 * CascaderCountry
 */

class CascaderCountry extends React.Component {

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['country'] })
  }

  handleChange = (value, detail) => {
    const countryId = value[value.length - 1];
    const countryDetail = detail[detail.length - 1];
    if (this.props.onChange) {
      this.props.onChange(countryId, countryDetail)
    }
  }

  findParent = idArr => {
    const detail = this.props.data.filter(f => f.id === idArr[0])[0];
    if (detail.parent === null) {
      return idArr;
    }
    idArr.unshift(detail.parent);
    return this.findParent(idArr);
  }

  render() {

    if (this.props.data.length === 0) return null;

    const {options, map, children, dispatch, value:country, isShowProvince, onChange, isDetail, ...extraProps} = this.props;
    const countryID = country && isDetail ? country.value : country; 
    const value = countryID ? this.findParent([countryID]) : [undefined];

    if (isShowProvince) {
      const chinaArea = this.props.data.filter(item => item.parent === 42)
                          .map(item => ({ label: item.country, value: item.id }));
      const asiaIndex = options.map(m => m.value).indexOf(4);
      if (asiaIndex > -1) {
        const chinaIndex = options[asiaIndex].children.map(m => m.value).indexOf(42);
        if (chinaIndex > -1) {
          options[asiaIndex].children[chinaIndex].children = chinaArea;
        }
      }
    }

    return (
      <Cascader options={options} value={value} onChange={this.handleChange} {...extraProps} />
    )
  }

}

function mapStateToPropsCountry (state) {
  const { country } = state.app
  var list = country.filter(item => item.parent == null)
  list = list.map(item => {
    var children = country.filter(i => i.parent == item.id)
    return { ...item, children }
  })
  var options = list.map(item => {
    var ret = {
      label: item.country,
      value: item.id,
    }
    if (item.children.length > 0) {
      ret['children'] = item.children.map(i => {
        return {
          label: i.country,
          value: i.id,
          areaCode: i.areaCode, 
        }
      })
    }
    return ret
  })

  var map = {}
  country.forEach(item => {
    map[item.id] = item.parent
  })

  return { options, map, data: country };
}

CascaderCountry = connect(mapStateToPropsCountry)(CascaderCountry)


/**
 * CascaderCountry
 */

 function CascaderChina(props) {
  const [cascaderValue, setCascaderValue] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [parentArea, setParentArea] = useState([]);

  useEffect(() => {
    props.dispatch({ type: 'app/getSourceList', payload: ['country'] });
  }, []);

  useEffect(() => {
    setCascaderValue(props.value);
  }, [props.value])

  function handleChange(value, detail) {
    if (value[value.length - 1] == 'add_area') {
      setParentArea(detail.slice(0, detail.length - 1));
    } else {
      setCascaderValue(value);
      if (props.onChange) {
        props.onChange(value);
      }
    }
  }

  async function handleOk() {
    if (!inputValue) return;
    const { id: parent, level } = parentArea[parentArea.length - 1];
    let countryE = '';
    if (pinyin.isSupported) {
      countryE = pinyin.convertToPinyin(inputValue, '', true);
    }
    const request = await api.addCountry({ parent, countryC: inputValue, countryE, level: level + 3 });
    const { id } = request.data;
    let newValue = parentArea.map(m => m.id);
    newValue = newValue.concat(id);
    setCascaderValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
    props.dispatch({ type: 'app/getSourceForceUpdate', payload: 'country' });
    handleCancel();
  }

  function handleCancel() {
    setParentArea([]);
    setInputValue('');
  }

  function generateOptions() {
    const china = props.country.find(f => ['中国', 'China'].includes(f.country));
    if (!china) {
      return [];
    }
    function findAllChildren(node, level) {
      const allChildren = props.country.filter(f => f.parent === node.id);
      if (allChildren.length === 0) {
        let children = [];

        if ([1, 2].includes(level)) {
          children.unshift({ label: '添加地区', value: 'add_area' });
        }

        return { ...node, children };
      }
      node.children = allChildren.map(m => findAllChildren({ ...m, label: m.country, value: m.id, level: level + 1 }, level + 1));

      if ([1, 2].includes(level)) {
        node.children.unshift({ label: '添加地区', value: 'add_area' });
      }

      return { ...node, level };
    }
    const chinaWithChilden = findAllChildren(china, 0);
    return chinaWithChilden.children;
  }

  const memoizedOptions = useMemo(() => generateOptions(), [props.country]);

  return (
    <div>
      <Cascader
        options={memoizedOptions}
        value={cascaderValue}
        onChange={handleChange}
        placeholder="请选择地区"
        style={props.style}
      />
      {parentArea.length > 0 && (
        <Modal
          title={<span>添加新的地区到<span style={{ color: 'red' }}>{parentArea[parentArea.length - 1].country}</span></span>}
          visible
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Input
            onChange={e => setInputValue(e.target.value)}
            value={inputValue}
            placeholder="地区名称"
          />
        </Modal>
      )}
    </div>
  );
}

function mapStateToPropsChina (state) {
  const { country } = state.app;
  return { country };
}

CascaderChina = connect(mapStateToPropsChina)(CascaderChina);

/**
 * CascaderIndustry
 */


class CascaderIndustry extends React.Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSource', payload: 'industry' })
  }

  handleChange(value) {
    let v = value.length == 2 ? value[1] : value[0]
    if (this.props.onChange) {
      this.props.onChange(v)
    }
  }


  render() {
    const { disabled, options, industry2pIndustry, children, dispatch, value:industry, onChange, ...extraProps } = this.props
    const industryId = (industry && typeof industry === 'object') ? industry.id : industry;
    const pIndustryId = industry2pIndustry[industryId]
    const value = pIndustryId ? [pIndustryId, industryId] : [industryId]

    let _options = options.map(item => {
      const { label, value, children } = item
      const ret = disabled.includes(value) ? { label, value, disabled: true } : { label, value }
      if (children) {
        ret.children = children.map(item => {
          const { label, value } = item
          return disabled.includes(value) ? { label, value, disabled: true } : { label, value }
        })
      }
      return ret
    })

    return (
      <Cascader options={_options} value={value} onChange={this.handleChange} {...extraProps} />
    )
  }
}

function mapStateToPropsIndustry (state) {
  const { industry } = state.app
  let pIndustries = industry.filter(item => item.id == item.Pindustry)
  pIndustries.forEach(item => {
    let Pindustry = item.id
    let subIndustries = industry.filter(item => item.Pindustry == Pindustry && item.id != Pindustry)
    item.children = subIndustries
  })
  const options = pIndustries.map(item => {
    var ret = {
      label: item.industry,
      value: item.id,
    }
    if (item.children.length > 0) {
      ret['children'] = item.children.map(item => {
        return {
          label: item.industry,
          value: item.id
        }
      })
    }
    return ret
  })
  let industry2pIndustry = {}
  industry.forEach(item => {
    industry2pIndustry[item.id] = item.Pindustry
  })

  return { options, industry2pIndustry }
}

CascaderIndustry = connect(mapStateToPropsIndustry)(CascaderIndustry)

class SelectLibIndustry extends React.Component {

  componentDidMount() {
    this.props.dispatch({ type: 'app/getLibIndustry' });
  }

  handleChange = (value, detail) => {
    let v = value.length == 2 ? value[1] : value[0]
    if (this.props.onChange) {
      this.props.onChange(v)
    }
  }

  findParent = idArr => {
    const detail = this.props.industry.filter(f => f.cat_name === idArr[0])[0];
    if (detail.p_cat_id === null) {
      return idArr;
    }
    idArr.unshift(detail.p_cat_name);
    return this.findParent(idArr);
  } 

  render() {
    const { industryOptions, value:industry, dispatch, industry: data, onChange, ...extraProps } = this.props;
    const value = industry ? this.findParent([industry]) : [undefined];
    return (
      <Cascader options={industryOptions} value={value} onChange={this.handleChange} {...extraProps} />
    )
  }
}

SelectLibIndustry = connect(mapStateToPropsLibIndustry)(SelectLibIndustry);

/**
 * InputCurrency
 */
class InputCurrency extends React.Component {

  render() {
    const { currencyType, ...restProps } = this.props
    const formatter = getCurrencyFormatter(currencyType)
    const parser = getCurrencyParser(currencyType)
    return (
      <InputNumber
        style={{width: '100%'}}
        formatter={formatter}
        parser={parser}
        {...restProps}
      />
    )
  }
}


class InputPhoneNumber extends React.Component {
  constructor(props) {
    super(props)

    if (this.props.value) {
      let valArr = this.props.value.split('-')
      this.state = { areaCode: valArr[0], phoneNumber: valArr[1] }
    } else {
      this.state = { areaCode: '', phoneNumber: '' }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value) {
      let valArr = nextProps.value.split('-')
      this.setState({ areaCode: valArr[0], phoneNumber: valArr[1] })
    } else {
      this.setState({ areaCode: '', phoneNumber: '' })
    }
  }

  handleAreaChange = (e) => {
    const areaCode = e.target.value
    if (!('value' in this.props)) {
      this.setState({ areaCode }, this.triggerChange)
    } else {
      this.triggerChange({
        areaCode,
        phoneNumber: this.state.phoneNumber
      })
    }
  }

  handlePhoneNumberChange = (e) => {
    const phoneNumber = e.target.value
    if (!('value' in this.props)) {
      this.setState({ phoneNumber }, this.triggerChange)
    } else {
      this.triggerChange({
        areaCode: this.state.areaCode,
        phoneNumber
      })
    }
  }

  triggerChange = ({areaCode, phoneNumber}) => {
    const onChange = this.props.onChange
    if (onChange) {
      onChange(areaCode + '-' + phoneNumber)
    }
  }

  render() {
    const InputGroup = Input.Group
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ width: '80px', flexShrink: 0, marginRight: '8px' }}>
          <Input size="large" prefix={<Icon type="plus" />} value={this.state.areaCode} onChange={this.handleAreaChange} />
        </div>
        <div style={{ flexGrow: 1 }}>
          <Input size="large" value={this.state.phoneNumber} onChange={this.handlePhoneNumberChange} />
        </div>
      </div>
    )
  }
}


/**
 * CheckboxTag
 */

const CheckboxTag = withOptionsAsync(ITCheckboxGroup, ['tag'], function(state) {
  const {tag} = state.app
  const options = tag ? tag.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

const CheckboxService = withOptionsAsync(CheckboxGroup, ['service'], function(state) {
  const {service} = state.app
  const options = service ? service.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * CheckboxProjStatus
 */

const CheckboxProjStatus = withOptionsAsync(CheckboxGroup, ['projstatus'], function(state) {
  var { projstatus } = state.app
  if (!hasPerm('proj.admin_manageproj')) {
    projstatus = projstatus.filter(item => item.id >= 4) // 非管理员只能查看终审发布之后的项目
  }
  const options = projstatus ? projstatus.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * CheckboxCurrencyType
 */

const CheckboxCurrencyType = withOptionsAsync(ITCheckboxGroup, ['currencyType'], function(state) {
  const { currencyType } = state.app
  const options = currencyType ? currencyType.map(item =>({value: item.id, label: item.currency})) : []
  return { options }
})

/**
 * CheckboxTransactionPhase
 */
const CheckboxTransactionPhase = withOptionsAsync(ITCheckboxGroup, ['transactionPhases'], function(state) {
  const { transactionPhases } = state.app
  const options = transactionPhases ? transactionPhases.map(item =>({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * CheckboxOrganizationType
 */
const CheckboxOrganizationType = withOptionsAsync(CheckboxGroup, ['orgtype'], function(state) {
  const { orgtype } = state.app
  const options = orgtype ? orgtype.map(item =>({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * CheckboxArea
 */
const CheckboxArea = withOptionsAsync(ITCheckboxGroup, ['country'], function(state) {
  const { country } = state.app
  const options = country.filter(item => item.level == 3).map(item => {
    return { label: item.country, value: item.id, key: item.id}
  })
  return { options }
})
const CheckboxAreaString = withOptionsAsync(ITCheckboxGroup, ['country'], function(state) {
  const { country } = state.app
  const options = country.filter(item => item.level == 3).map(item => {
    return { label: item.country, value: item.country, key: item.id }
  })
  return { options }
})

/**
 * TabCheckboxCountry
 */

class TabCheckboxCountry extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['country'] })
  }

  render() {
    if (this.props.options.filter(item => item.children != null).length > 0) {
      return <TabCheckbox options={this.props.options} value={this.props.value} onChange={this.props.onChange} />
    } else {
      return <CheckboxGroup options={this.props.options} value={this.props.value} onChange={this.props.onChange} />
    }
  }
}
TabCheckboxCountry = connect(mapStateToPropsCountry)(TabCheckboxCountry)

class TabCheckboxAbroad extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['country'] })
  }

  render() {
    if (this.props.options.filter(item => item.children != null).length > 0) {
      return <TabCheckbox options={this.props.options} value={this.props.value} onChange={this.props.onChange} />
    } else {
      return <CheckboxGroup options={this.props.options} value={this.props.value} onChange={this.props.onChange} />
    }
  }
}
TabCheckboxAbroad = connect(mapStateToPropsAbroad)(TabCheckboxAbroad);

function mapStateToPropsAbroad(state) {
  const { country } = state.app
  var list = country.filter(item => item.level === 3);
  const abroadCountry = ['香港', '澳门', '台湾', '其他', 'HongKong', 'Macao', 'Taiwan', 'Others'];
  const options = [
    {
      label: '国内',
      value: -1,
      children: list.filter(f => !abroadCountry.includes(f.country)).map(m => ({ label: m.country, value: m.country, areaCode: m.areaCode })),
    }, {
      label: '国外',
      value: -2,
      children: list.filter(f => abroadCountry.includes(f.country)).map(m => ({ label: m.country, value: m.country, areaCode: m.areaCode })),
    }
  ];

  return { options };
}

/**
 * TabCheckboxIndustry
 */

class TabCheckboxIndustry extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['industry'] })
  }

  render() {
    const { options, value, onChange } = this.props
    if (options.filter(item => item.children != null).length > 0) {
      return <TabCheckbox options={options} value={value} onChange={onChange} />
    } else {
      return <CheckboxGroup options={options} value={value} onChange={onChange} />
    }
  }
}

TabCheckboxIndustry = connect(mapStateToPropsIndustry)(TabCheckboxIndustry)

// TODO: 重命名组件
class TreeSelectTag extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      allowCreateTag: false,
      inputVisible: false,
      inputValue: '',
      tagOptions: props.options.map(m => {
        let { label } = m;
        label = [{ text: label, matchIndex: -1 }];
        return { ...m, label };
      }),
      keyword: '',
      current: -1,
      total: 0,
    };

    this.inputElem = React.createRef();
    this.searchKeyword = debounce(this.searchKeyword, 500);
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    const trimedInputValue = inputValue == null ? '' : inputValue.trim();
    if (trimedInputValue === '') {
      this.setState({
        inputVisible: false,
        inputValue: '',
      });
      return;
    }

    this.props.dispatch({ type: 'app/createTag', payload: trimedInputValue });
    this.setState({
      inputVisible: false,
      inputValue: '',
    });
  };

  saveInputRef = (input) => {
    this.input = input;
  };

  handleChange = (valueItem, checked) => {
    const { value = [], onChange } = this.props;
    const newValue = checked ? [...value, valueItem] : value.filter((item) => item !== valueItem);
    onChange(newValue);
  };

  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['tag'] });
    if (hasPerm('usersys.as_trader')) {
      this.setState({
        allowCreateTag: true,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.options.length !== this.props.options.length) {
      this.searchKeyword(this.state.keyword);
    }
  }

  handleKeywordChange = keyword => {
    this.setState({
      keyword,
    });
    this.searchKeyword(keyword, () => {
      // this.scrollToCurrent(this.state.current);
    });
  }

  searchKeyword = (keyword, callback) => {
    const { tagOptions, total } = this.searchInParagraphs(this.props.options, keyword);
    const current = total > 0 ? 0 : -1;
    this.setState({
      keyword,
      tagOptions,
      total,
      current,
    }, () => {
      if (callback) {
        callback();
      }
    });
  }

  searchInParagraphs = (paragraphs, keyword) => {
    if (keyword == null || keyword === '') {
      return {
        tagOptions: paragraphs.map(m => {
          let { label } = m;
          label = [{ text: label, matchIndex: -1 }];
          return { ...m, label };
        }),
        total: 0,
      };
    }
    const keywordRegExp = new RegExp('(' + keyword + ')');
    const newParagraphs = [];
    let matchIndex = -1;

    paragraphs.forEach((paragraph) => {
      const label = [];
      const spans = paragraph.label.split(keywordRegExp).filter((item) => item !== '');
      spans.forEach((span) => {
        label.push({
          text: span,
          matchIndex: span === keyword ? ++matchIndex : -1,
        });
      });

      newParagraphs.push({
        ...paragraph,
        label,
      });
    });
    return {
      tagOptions: newParagraphs,
      total: matchIndex + 1,
    };
  }

  handlePrev = () => {
    const { total, current } = this.state;
    if (total === 1) return;

    const newCurrent = current > 0 ? current - 1 : total - 1;
    this.setState({
      current: newCurrent,
    });
    // this.scrollToCurrent(newCurrent);
  }

  handleNext = () => {
    const { total, current } = this.state;
    if (total === 1) return;

    const newCurrent = current < total - 1 ? current + 1 : 0;
    this.setState({
      current: newCurrent,
    });
    // this.scrollToCurrent(newCurrent);
  }

  render() {
    const { value = [] } = this.props;
    const { allowCreateTag, inputVisible, inputValue, tagOptions } = this.state;
    const containerStyle = { border: '1px solid #d9d9d9', borderRadius: 4, padding: 4, paddingRight: 24, minHeight: 32 };
    
    return (
      <div style={containerStyle}>
        <div style={{ marginBottom: 18 }}>
          <Finder
            input={this.inputElem}
            keyword={this.state.keyword}
            current={this.state.current}
            total={this.state.total}
            onChange={this.handleKeywordChange}
            onPrev={this.handlePrev}
            onNext={this.handleNext}
          />
        </div>

        {tagOptions.map((option) => (
          <CheckableTag
            key={option.value}
            checked={value.indexOf(option.value) > -1}
            onChange={(checked) => this.handleChange(option.value, checked)}
            style={{ marginBottom: 4, fontSize: 14 }}
          >
            {option.label.map(({ text, matchIndex }, index) => {
              if (matchIndex > -1) {
                return (
                  <mark
                    key={index}
                    data-match-index={matchIndex}
                    style={{
                      padding: 0,
                      background: matchIndex === this.state.current ? 'rgba(245, 74, 69, 0.6)' : 'rgba(255, 198, 10, 0.6)',
                    }}
                  >
                    {text}
                  </mark>
                );
              } else {
                return <span key={index}>{text}</span>;
              }
            })}
          </CheckableTag>
        ))}
        {allowCreateTag && (
          <div style={{ marginTop: tagOptions.length > 0 ? 18 : 0 }}>
            {inputVisible && (
              <Input
                ref={this.saveInputRef}
                type="text"
                size="small"
                style={{ width: 90, marginRight: 8, verticalAlign: 'top' }}
                value={inputValue}
                onChange={this.handleInputChange}
                onBlur={this.handleInputConfirm}
                onPressEnter={this.handleInputConfirm}
              />
            )}
            {!inputVisible && (
              <Tag
                style={{ background: '#fff', borderStyle: 'dashed', fontSize: 14, lineHeight: '22px' }}
                onClick={this.showInput}
              >
                <PlusOutlined /> New Tag
              </Tag>
            )}
          </div>
        )}
      </div>
    );
  }
}


function mapStateToPropsTreeSelectTag(state) {
  const {tag} = state.app
  const options = tag.map((item) => ({
    value: item.id,
    label: item.name,
  }));
  return { options };
}

TreeSelectTag = connect(mapStateToPropsTreeSelectTag)(TreeSelectTag);

function Finder({
  input,
  keyword,
  current = -1,
  total = 0,
  onChange,
  onPrev,
  onNext,
}) {
  const suffix = (
    <div>
      {total > 0 && (
        <span>{current + 1}/{total}</span>
      )}
      <Divider type="vertical" />
      <Button
        type="text"
        icon={<UpOutlined />}
        size="small"
        disabled={total === 0}
        onClick={onPrev}
      />
      <Button
        type="text"
        icon={<DownOutlined />}
        size="small"
        disabled={total === 0}
        onClick={onNext}
      />
      <Button
        type="text"
        icon={<CloseCircleOutlined />}
        size="small"
        onClick={() => {
          onChange('');
        }}
      />
    </div>
  );

  return (
    <Input
      ref={input}
      style={{ width: 300 }}
      prefix={<SearchOutlined />}
      suffix={suffix}
      value={keyword}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      onPressEnter={(e) => {
        if (e.shiftKey) {
          onPrev();
        } else {
          onNext();
        }
      }}
    />
  );
}


class TabCheckboxOrgBDRes extends React.Component {
  componentDidMount() {
    this.props.dispatch({ type: 'app/getSource', payload: 'orgbdres' });
  }
  render() {
    const { options, value, onChange } = this.props
    return (
      <BasicContainer label={i18n('project_bd.bd_status')}>
        <ITCheckboxGroup options={options} value={value} onChange={onChange} />
      </BasicContainer>
    )
  }
}
function mapStateToPropsOrgBDRes(state) {
  const {orgbdres} = state.app
  const options = orgbdres ? [{ value: 'none', label: '暂无状态' }].concat(orgbdres.map(item => ({value: item.id, label: item.name}))) : []
  return { options }  
}
TabCheckboxOrgBDRes = connect(mapStateToPropsOrgBDRes)(TabCheckboxOrgBDRes);

class TabCheckboxOrgBDRes2 extends React.Component {
  render() {
    const { options, value, onChange, allLabel } = this.props
    return (
      <BasicContainer2 label="机构进度" align="top" style={{ width: '100%' }}>
        <ITCheckboxGroup2 options={options} value={value} onChange={onChange} allLabel={allLabel} />
      </BasicContainer2>
    )
  }
}

class TabCheckboxService extends React.Component {
  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['service'] });
  }
  render() {
    const { options, value, onChange } = this.props
    return (
      <BasicContainer label={i18n('filter.service_type')}>
        <ITCheckboxGroup options={options} value={value} onChange={onChange} />
      </BasicContainer>
    )
  }
}
function mapStateToPropsService(state) {
  const {service} = state.app
  const options = service ? service.map(item => ({value: item.id, label: item.name})) : []
  return { options }  
}
TabCheckboxService = connect(mapStateToPropsService)(TabCheckboxService);


class TabCheckboxProjStatus extends React.Component {
  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['projstatus'] });
  }
  render() {
    const { options, value, onChange } = this.props
    return (
      <BasicContainer label={i18n('filter.status')}>
        <ITCheckboxGroup options={options} value={value} onChange={onChange} />
      </BasicContainer>
    )
  }
}
function mapStateToPropsProjStatus(state) {
  const {projstatus} = state.app
  const options = projstatus ? projstatus.map(item => ({value: item.id, label: item.name})) : []
  return { options }  
}
TabCheckboxProjStatus = connect(mapStateToPropsProjStatus)(TabCheckboxProjStatus);

class TabCheckboxIndustryGroup extends React.Component {
  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['industryGroup'] });
  }
  render() {
    const { options, value, onChange } = this.props
    return (
      <BasicContainer label={i18n('filter.industry_group')}>
        <ITCheckboxGroup options={options} value={value} onChange={onChange} />
      </BasicContainer>
    )
  }
}
function mapStateToPropsIndustryGroup(state) {
  const { industryGroup } = state.app;
  const options = industryGroup ? industryGroup.map(item => ({value: item.id, label: item.name})) : [];
  return { options }
}
TabCheckboxIndustryGroup = connect(mapStateToPropsIndustryGroup)(TabCheckboxIndustryGroup);

class TabCheckboxOrgType extends React.Component {
  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['orgtype'] });
  }
  render() {
    const { options, value, onChange } = this.props
    return (
      <BasicContainer label={i18n('filter.org_type')}>
        <ITCheckboxGroup options={options} value={value} onChange={onChange} />
      </BasicContainer>
    )
  }
}
function mapStateToPropsOrgType(state) {
  const { orgtype } = state.app
  const options = orgtype ? orgtype.map(item =>({value: item.id, label: item.name})) : []
  return { options }
}
TabCheckboxOrgType = connect(mapStateToPropsOrgType)(TabCheckboxOrgType);

class TabCheckboxOrgArea extends React.Component {
  componentDidMount() {
    this.props.dispatch({ type: 'app/getSourceList', payload: ['orgarea'] });
  }
  render() {
    const { options, value, onChange } = this.props
    return (
      <BasicContainer label={i18n('filter.area')}>
        <ITCheckboxGroup options={options} value={value} onChange={onChange} />
      </BasicContainer>
    )
  }
}
function mapStateToPropsOrgArea(state) {
  const { orgarea } = state.app
  const options = orgarea ? orgarea.map(item => ({value: item.id, label: item.name})) : []
  return { options }
}
TabCheckboxOrgArea = connect(mapStateToPropsOrgArea)(TabCheckboxOrgArea);
/**
 * CheckboxYear
 */
const CheckboxYear = withYear(ITCheckboxGroup)


/**
 * Slider
 */

const SliderMoney = function(props) {
  const { min, max, marks, range, ...extraProps } = props
  const _marks = { [min]: min + '', [max]: max + '+' }
  return (
    <div style={{display: 'flex', alignItems: 'baseline'}}>
      <Slider
        {...extraProps}
        range
        min={min}
        max={max}
        marks={_marks}
        style={{width: '400px'}} />
      <span style={{marginLeft: '24px'}}>{i18n('common.unit') + ' (' + i18n('common.million') + ')'}</span>
    </div>
  )
}

/**
 * RadioTrueOrFalse
 */

const RadioTrueOrFalse = withOptions(RadioGroup2, [
  { value: true, label: i18n('common.yes') },
  { value: false, label: i18n('common.no') },
])

const SelectGender = withOptions(RadioGroup2, [
  { value: false, label: '男' },
  { value: true, label: '女' },
]);

const RadioProjTraderType = withOptions(RadioGroup2, [
  { value: null, label: '不限' },
  { value: 0, label: '承揽' },
  { value: 1, label: '承做' },
]);

/**
 * RadioCurrencyType
 */

const RadioCurrencyType = withOptionsAsync(RadioGroup2, ['currencyType'], function(state) {
  const { currencyType } = state.app
  const options = currencyType ? currencyType.map(item =>({value: item.id, label: item.currency})) : []
  return { options }
})

/**
 * RadioAudit
 */

const RadioAudit = withOptionsAsync(RadioGroup2, ['audit'], function(state) {
  const { audit } = state.app
  const options = audit ? audit.map(item =>({value: item.id, label: item.name})) : []
  return { options }
})

/**
 * RadioBDStatus
 */

const RadioBDStatus = withOptionsAsync(RadioGroup2, ['bdStatus'], function(state) {
  const { bdStatus } = state.app
  const options = bdStatus ? bdStatus.map(item => ({value: item.id, label: item.name})) : []
  return { options }
})

const RadioNewBDStatus = withOptionsAsync(RadioGroup2, ['orgbdres'], function(state) {
  const { orgbdres } = state.app;
  const options = orgbdres ? orgbdres.map(item => ({value: item.id, label: item.name})) : [];
  return { options };
});

/**
 * RadioBDSource
 */
const RadioBDSource = withOptions(RadioGroup2, BDSourceOptions)

class SelectMultiOrgs extends React.Component {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.fetchOrg = debounce(this.fetchOrg, 800);
  }
  state = {
    data: [],
    value: [],
    fetching: false,
  }
  fetchOrg = (value) => {
    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ data: [], fetching: true });
    requestAllData(api.getOrg, { search: value, issub: false, proj: this.props.proj }, 99)
      .then(body => {
        if (fetchId !== this.lastFetchId) { // for fetch callback order
          return;
        }
        const data = body.data.data.map(org => ({
          text: org.orgname,
          value: org.id,
        }));
        this.setState({ data, fetching: false });
      });
  }
  handleChange = (value) => {
    this.setState({
      data: [],
      fetching: false,
    });
    this.props.onChange(value);
  }
  render() {
    const { fetching, data } = this.state;
    return (
      <Select
        allowClear
        mode="multiple"
        style={this.props.style}
        size={this.props.size}
        labelInValue
        value={this.props.value}
        notFoundContent={fetching ? <Spin size="small" /> : null}
        filterOption={false}
        onSearch={this.fetchOrg}
        onChange={this.handleChange}
        placeholder={this.props.placeholder}
      >
        {data.map(d => <Option key={d.value}>{d.text}</Option>)}
      </Select>
    );
  }
}

class SelectMultiUsers extends React.Component {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.fetchData = debounce(this.fetchData, 800);
  }
  state = {
    data: [],
    value: [],
    fetching: false,
  }
  fetchData = (value) => {
    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ data: [], fetching: true });
    this.asyncFetchData(value).then(data => {
      if (fetchId !== this.lastFetchId) { // for fetch callback order
        return;
      }
      this.setState({ data, fetching: false });
    })
  }

  asyncFetchData = async value => {
    if (this.props.proj) {
      const params = { proj: this.props.proj };
      if (!hasPerm('BD.manageOrgBD')) {
        params.manager = getCurrentUser();
        // params.createuser = getCurrentUser();
        // params.unionFields = 'manager,createuser';
      }
      const getOrgBdListReq = await requestAllData(api.getOrgBdList, params, 99);
      const { count: orgBdListCount } = getOrgBdListReq.data;
      if (orgBdListCount > 0) {
        const { data: orgBdListData } = getOrgBdListReq.data;
        const getUserInfoReq = await Promise.all(
          orgBdListData.map(m => api.getUserInfo(m.bduser))
        );
        return getUserInfoReq.map(m => ({
          text: m.data.username,
          value: m.data.id,
          email: m.data.email,
        })).filter(f => f.text.includes(value));
      } else {
        return await this.asyncFetchAllInvestor(value);
      }
    } else {
      return await this.asyncFetchAllInvestor(value);
    }
  }

  asyncFetchAllInvestor = async value => {
    const reqUserGroup = await api.queryUserGroup({ type: this.props.type || 'investor' });
    const reqUsers = await requestAllData(api.getUser, { search: value, groups: reqUserGroup.data.data.map(m => m.id) }, 100);
    return reqUsers.data.data.filter(f => f.id !== getCurrentUser()).map(user => ({
      text: user.username,
      value: user.id,
      email: user.email,
    }));
  }

  handleChange = (value) => {
    this.setState({
      data: [],
      fetching: false,
    });
    this.props.onChange(value);
  }
  render() {
    const { fetching, data } = this.state;
    return (
      <Select
        allowClear
        mode="multiple"
        style={this.props.style}
        size={this.props.size}
        labelInValue
        value={this.props.value}
        notFoundContent={fetching ? <Spin size="small" /> : null}
        filterOption={false}
        onSearch={this.fetchData}
        onChange={this.handleChange}
      >
        {data.map(d => <Option key={d.value}>{`${d.text}\n${d.email}`}</Option>)}
      </Select>
    );
  }
}

const RadioFamLv= withOptionsAsync(RadioGroup2, ['famlv'], function(state) {
  const { famlv } = state.app
  const options = famlv ? famlv.map(item => ({value: item.id, label: item.name})) : []
  return { options }
});

class SelectOrAddDate extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      options: null,
    }
    this.com_id = this.props.com_id;
  }

  componentDidMount () {
    this.getData();
  }

  getData = () => {
    requestAllData(api.getLibEvent, { com_id: this.com_id }, 100)
    .then(result => this.setState({ options: result.data.data.map(m => m.date)}));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.com_id !== this.props.com_id) {
      this.com_id = nextProps.com_id;
      this.setState({ options: null }, this.getData);
    }
  }

  render() {
    if (this.state.options === null) return null;

    if (this.state.options.length > 0) {
      return <Select style={{ width: 160 }} onChange={ value => this.props.onChange(moment(value)) }>
        {this.state.options.map(m => <Option key={m} value={m}>{m}</Option>)}
      </Select>;
    }

    return <DatePicker format="YYYY-MM-DD" onChange={this.props.onChange} />;
  }
}

class SearchOrganization extends React.Component {
  constructor(props) {
    super(props);
  }

  handleSearchOptionChange = (searchOption) => {
    this.props.onChange({
      searchOption,
      keyword: this.props.keyword,
    });
  };

  handleKeywordChange = (e) => {
    this.props.onChange({
      searchOption: this.props.searchOption,
      keyword: e.target.value,
    });
  };

  render() {
    const { searchOption, keyword } = this.props;
    const selectBefore = (
      <Select
        defaultValue="0"
        style={{ width: 200 }}
        value={searchOption}
        onChange={this.handleSearchOptionChange} 
      >
        <Option value="0">搜索机构名称/股票代码</Option>
        <Option value="1">搜索备注以及附件内文字</Option>
      </Select>
    );

    return (
      <Input
        style={{ width: 450 }}
        placeholder="搜索内容"
        size="large"
        addonBefore={selectBefore}
        value={keyword}
        onChange={this.handleKeywordChange}
      />
    );
  }
}

export {
  SelectNumber,
  RadioGroup2,
  SelectTag,
  SelectRole,
  SelectEducation,
  SelectYear,
  SelectTransactionType,
  SelectCurrencyType,
  SelectOrganizationType,
  SelectTransactionPhase,
  SelectOrganizatonArea,
  SelectTraingStatus,
  SelectTraingType,
  // SelectOrganization,
  SelectExistOrganization,
  SelectExistUser,
  SelectExistProject,
  SelectProjectForOrgBd,
  SelectExistInvestor,
  SelectMyInvestor,
  SelectShareInvestor,
  SelectTrader,
  SelectAllUser,
  SelectGender,
  SelectTransactionStatus,
  SelectProjectStatus,
  SelectUserGroup,
  SelectTitle,
  SelectKPIResult,
  SelectBDStatus,
  SelectIndustryGroup,
  SelectIndustryGroupWithAll,
  SelectNewBDStatus,
  SelectBDSource,
  SelectArea,
  SelectOrgUser,
  SelectOrgInvestor,
  SelectPartner,
  SelectLibIndustry,
  SelectProjectLibrary,
  SelectProjectBD,
  SelectScheduleType,
  SelectOrAddDate,
  SelectSeason,
  CascaderCountry,
  CascaderChina,
  CascaderIndustry,
  InputCurrency,
  InputPhoneNumber,
  CheckboxTag,
  CheckboxProjStatus,
  CheckboxCurrencyType,
  CheckboxTransactionPhase,
  CheckboxOrganizationType,
  CheckboxArea,
  CheckboxAreaString,
  CheckboxYear,
  TabCheckboxCountry,
  TabCheckboxAbroad,
  TabCheckboxIndustry,
  TabCheckboxOrgType, 
  TabCheckboxOrgArea,
  TabCheckboxIndustryGroup,
  SliderMoney,
  RadioTrueOrFalse,
  RadioCurrencyType,
  RadioAudit,
  RadioBDStatus,
  RadioNewBDStatus,
  RadioBDSource,
  RadioFamLv,
  CheckboxService,
  SelectService,
  TabCheckboxService,
  TabCheckboxProjStatus,
  SelectMultiOrgs,
  SelectMultiUsers,
  TabCheckboxOrgBDRes,
  TabCheckboxOrgBDRes2,
  TreeSelectTag,
  SelectScheduleTypeWithoutMeeting,
  RadioProjTraderType,
  SearchOrganization,
}

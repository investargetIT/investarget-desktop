import React from 'react'
import MainLayout from '../components/MainLayout'
import PageTitle from '../components/PageTitle'


const titleStyle = {
  fontSize: '15px',

  color: '#10458f',
  margin: '16px 0',
}
const paraStyle = {
  fontSize: '13px',
  lineHeight: '22px',
}
const boldParaStyle = {
  ...paraStyle,
  color: '#333',
  fontWeight: 700,
}


class Agreement extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <MainLayout location={this.props.location}>
        <PageTitle title="服务条款" />
        <div>
          <h3 style={titleStyle}>一、免责声明</h3>
          <p style={boldParaStyle}>免责声明郑重声明：本公司所有涉及收集个人信息内容，未经客户允许或授权，不会公开或提供第三方使用。</p>
          <ul>
            <li style={paraStyle}>1、Investarget网站（以下简称“本网站”）是Investarget公司为用户提供投融资信息居间服务的网络平台。本声明包含本网站的使用条款，您在浏览和使用本网站之前，请务必仔细查阅本声明。您在浏览和使用本网站的同时，视为您接受以下条款。Investarget公司在法律许可的范围内享有对本声明进行解释、修订及变更的权利；</li>
            <li style={paraStyle}>2、本网站承诺保障用户个人隐私安全，原则上不向任何个人或组织泄露用户个人信息，但当司法机关、监管机构或其他政府部门依据法律程序，要求本网站提供您的个人信息时，本网站将及时通知用户，根据相关部门的要求提供您的相关信息资料；</li>
            <li style={paraStyle}>3、本网站建议用户加强自我保护，提高防范意识，由于您对用户账号、密码等个人信息保管不善或告知他人而导致的任何个人信息、账户信息的泄露及损失，本网站不承担任何责任；</li>
            <li style={paraStyle}>4、本网站如因系统维护或升级而需暂停服务时，将事先公告。若因线路及非本公司控制范围外的硬件故障或其它不可抗力而导致暂停服务，于暂停服务期间造成的一切不便与损失，本网站不负任何责任。</li>
            <li style={paraStyle}>5、对于任何本网站无法控制的原因（包括但不限于黑客攻击、计算机病毒攻击、政府管制、通讯设施故障及其他不可抗力因素）导致的网站暂时关闭、用户信息泄露、被盗用、被篡改等非正常经营行为，本网站不承担任何责任；</li>
            <li style={paraStyle}>6、本网站在某些情况下将挑选具备良好声誉的网站作为友情链接列入本网站，供您浏览和参考。但该行为并不视为本网站与其具备合作关系，请您对相关内容进行审慎辨别及判断，对于任何外部链接的网站，您在该网站上进行访问、使用、下载等行为引起的损失或损害，本网站不承担任何责任。</li>
            <li style={paraStyle}>本网站之声明以及其修改权、更新权及最终解释权均属多维空间网站所有。</li>
          </ul>

          <h3 style={titleStyle}>二、平台保密声明</h3>
          <p style={boldParaStyle}>平台保密声明本公司的业务是建立在客户彼此信任的基础之上的，为了提供更优质的客户服务和产品，为了使您提供的所有信息都能得到机密保障，我们采用以下关于信息保护的政策：</p>
          <ul>
            <li style={paraStyle}>1. Investarget收集信息的范围仅限于那些本公司认为对于您的财务需求和开展业务所必须的相关资料；</li>
            <li style={paraStyle}>2. Investarget尽力确保对客户的信息记录是准确和及时的；</li>
            <li style={paraStyle}>3. 因服务必要而委托的第三方在得到本公司许可获取客户的个人信息时都被要求严格遵守保密责任；</li>
            <li style={paraStyle}>4. Investarget将对客户提供的信息严格保密除具备下列情形之一外不会像任何外部机构披露
              <ul style={{ marginLeft: '24px' }}>
                <li style={paraStyle}>a)经过客户事先同意而披露；</li>
                <li style={paraStyle}>b) 应法律法规的要求而披露；</li>
                <li style={paraStyle}>c) 应政府部门或其他代理机构的要求而披露；</li>
                <li style={paraStyle}>d) 应上级监管机构的要求而披露；</li>
              </ul>
            </li>
            <li style={paraStyle}>5.Investarget设有严格的安全系统以防止未经授权的任何人包括本公司的职员获取客户信息；</li>
            <li style={paraStyle}>6. 本网站使用了cookie的功能，cookie是一个标准的互联网技术，载有小量资料的档案，自动储存于用户本身电脑所安装的互联网浏览器。它可以使本网站存储和获得用户登录信息。本网站使用cookie来确保您不会重复浏览到相同的内容并可以获得最新的信息，并使用cookie来确认您是PA18的合法用户。cookie收集的是不记名的集体统计资料，并不包括姓名、地址、及电话、电邮地址等个人联络资料。即使在使用cookie的情况下，除非您非常明确的告知本网站，否则本网站并不会获知您的个人信息。</li>
          </ul>

          <h3 style={titleStyle}>三、信息准确性上传者承诺</h3>
          <p style={boldParaStyle}>本公司就提供信息及资料的真实性、准确性和完整性，郑重声明及承诺如下：</p>
          <p style={paraStyle}>本公司所提供的信息及资料真实、准确和完整，保证不存在虚假记载、误导性陈述或者重大遗漏，并对所提供信息及资料的真实性、准确性和完整性承担法律责任。</p>
        </div>
      </MainLayout>
    )
  }
}

export default Agreement

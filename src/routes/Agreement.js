import React from 'react'
import LeftRightLayout from '../components/LeftRightLayout'

import { i18n } from '../utils/util'


const titleStyle = {
  fontSize: '15px',

  color: '#108ee9',
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
    const { basename } = this.props.location
    return (
      <LeftRightLayout location={this.props.location} title={i18n('account.term_of_service')}>
        {
          basename === "/en" ? (
            <div>
              <h3 style={titleStyle}>Disclaimer</h3>
              <p style={boldParaStyle}>Solemn declaration: all the personal information that the company involves and collects will not open and provide to the third party without the client’s permission or authorization.</p>
              <ul>
                <li style={paraStyle}>
                1. Investarget website (hereinafter referred to as "the website") is a network platform of investment and financing information accompanying service, which is provided by Investarget Company. This statement contains the using terms of the website, please be sure to go through this statement carefully before browsing and using the website. It’s regarded as you accept the following terms when you are browsing and using the website. Investarget Company owns the right to interpret, revise and change the statement within the law.
                </li>
                <li style={paraStyle}>
                2. The website promises to protect the personal privacy security of users, not to reveal personal information of users to any individual or organization in principle, but when the judiciary, regulators or other government departments require the website to provide your personal information according to the legal procedure, the website will notify the users in time and provide your relevant information and data according to the requirements of relevant departments.
                </li>
                <li style={paraStyle}>
                3. The website recommends users to strengthen self-protection and improve precautionary alertness. For the personal information and account information leakage and loss, due to your improper keeping or informing others users account, passwords and other personal information, the website will not assume any responsibility.
                </li>
                <li style={paraStyle}>
                4. The website will announce in advance the suspending service as a result of system maintenance or upgrade. For any inconvenience or loss when out of service, caused by hardware failure or other majeure problems which are out of the company’s control, the website will not assume any responsibility.
                </li>
                <li style={paraStyle}>
                5. For the website temporarily closing and leakage, embezzlement, tampering of users information and other abnormal operating behavior, due to any reasons beyond the company’s control (including but not limited to hacker attack, computer virus attacks, government regulation, communication facilities fault and other majeure factors), the website will not assume any responsibility.
                </li>
                <li style={paraStyle}>
                6. The website will select websites with good reputation as links of our site in some cases, for your browsing and reference. But it is not considered as the website has cooperation relationship with them, please carefully distinguish and judge the related content. Due to any links of external website, your loss or damage caused by visiting, using, downloading them and other behaviors, the website will not assume any responsibility.
                The statement and the right to modify, update and final interpretation of the website all belong to Hyperspace website.
                </li>
              </ul>

              <h3 style={titleStyle}>Platform Security Statement</h3>
              <p style={boldParaStyle}>The company's business is established on the basis of customers’ mutual trust, in order to provide better customer service and products, and in order to keep the confidential protection of all your provided information, we have the information protection policy as follows:</p>
              <ul>
                <li style={paraStyle}>
                1. Investarget’s collection of information is limited to those relevant information that the company believes that is necessary for your financial needs and operating business;
                </li>
                <li style={paraStyle}>
                2. Investarget try to ensure that the customers’ information records are accurate and timely;
                </li>
                <li style={paraStyle}>
                3. When the third party obtains the personal information under the company permission due to necessary for service, it is required to strictly abide by the confidentiality responsibility;
                </li>
                <li style={paraStyle}>
                4. Investarget will provide strict confidentiality of information and not diclose to any external organizations in addition to any one of the situation as follows:
                </li>
                <li style={paraStyle}>
                <ul style={{ marginLeft: '24px' }}>
                  <li style={paraStyle}>
                  a)the disclosure after the prior consent of the customers;
                  </li>
                  <li style={paraStyle}>
                  b) the disclosure of the requirements of the laws and regulations;
                  </li>
                  <li style={paraStyle}>
                  c) the disclosure of the requirements of government departments or other agencies;
                  </li>
                  <li style={paraStyle}>
                  d) the disclosure of the requirements of higher authority;
                  </li>
                </ul>
                </li>
                <li style={paraStyle}>
                5. Investarget has a strict security system to prevent unauthorized persons including the company's staff obtaining customers’ informations.
                </li>
                <li style={paraStyle}>
                6. This website uses the cookie function, cookie is a standard Internet technology, which contains a small amount of data files, automatically stored in the Internet browser installed in user's own computer. It can make the website storage and access to user login information. This website uses cookie to make sure you don't repeat the same content and get the latest information, and use cookie to confirm that you are PA18's legal user. Cookie’s collection are anonymous collective statistics, not including the name, address, telephone, email address and other personal contact information. Even if you are using cookie, this website will obtain your personal information unless you explicitly inform this website.
                </li>
              </ul>

              <h3 style={titleStyle}>Uploader Commitment of Information Accuracy</h3>
              <p style={boldParaStyle}>The company make solemn declaration and commitment about the authenticity, accuracy and integrity of provided information and data as follows:</p>
              <p style={paraStyle}>The information and data provided by the company are true, accurate and complete, we promise that there is no false records, misguiding representation or significant omission, and assume the legal responsibility for the authenticity, accuracy and integrity of provided information and data.</p>

            </div>
          ) : (
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
          )
        }
      </LeftRightLayout>
    )
  }
}

export default Agreement

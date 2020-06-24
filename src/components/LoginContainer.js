import { changeLang } from '../utils/util'
import headerStyles from './LoginContainerHeader.css';

const containerStyle = {background:'#fff'}
const headerStyle = {width: 1200, height: 80, margin: '0 auto', backgroundColor: '#fff'}
const logoStyle = {height: 70, padding: '10px 0'}
const bodyStyle = {width: 1200, height: '100%', margin: '0 auto', position: 'relative', 
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};
const footerStyle = {width: 1200, height: 100, margin: '0 auto', backgroundColor: '#fff'}
const copyrightStyle = {textAlign:'center',height:20,lineHeight:'20px',paddingTop:40,fontSize:16,color:'#989898'}

class LoginContainer extends React.Component {

  constructor(props) {
    super(props)
  }

  changeLang(lang='en') {
    changeLang(lang);
    this.props.changeLang && this.props.changeLang(lang);
  }
  
  render() {
    const props = this.props;
    const source = parseInt(localStorage.getItem('source'), 10)
    let logo, bg;
    if (source === 1) {
      logo = '/images/logo.png';
      bg = 'url(/images/investarget_bg.png)';
    } else if (source === 2) {
      logo = '/images/autospace.png';
      bg = 'url(/images/bg_autospace.png)';
    } else if (source === 3) {
      logo = '/images/aura_logo.png';
      bg = 'url(/images/aura.jpeg)';
    } else if (source === 4) {
      logo = '/images/logo_delova_biotech.png';
      bg = 'url(/images/bg_delova_biotech.jpeg)';
    }
    const bodyWrapStyle = {
      margin: '0 auto', 
      minWidth: 1200, 
      maxWidth: 1920, 
      height: 750, 
      backgroundImage: bg, 
      backgroundPosition: 'center center', 
      backgroundSize: 'cover', 
      backgroundRepeat: 'no-repeat'
    };
    return (
      <div style={containerStyle}>
        {source !== 1 && (
          <div style={headerStyle}>
            <img src={logo} style={logoStyle} />
            <div style={{ float: "right", marginRight: 30, lineHeight: "80px" }}>
              <a onClick={this.changeLang.bind(this, 'cn')} disabled={window.LANG !== "en"}>中文</a>&nbsp;&nbsp;/&nbsp;&nbsp;<a onClick={this.changeLang.bind(this, 'en')} disabled={window.LANG === "en"}>English</a>
            </div>
          </div>
        )}

        {source === 1 && (
          <div className={headerStyles.head}>
            <div className={`${headerStyles['row']} ${headerStyles['row01']}`}>
              <div className={headerStyles['text-right']}>
                <img className={headerStyles['logoHead']} src="/images/investarget_new_logo.png" alt="" />
              </div>
              <div className={headerStyles['col-lg-offset-1']} style={{ flex: 0.7, textAlign: 'right' }}>
                <ul className={`list-inline ${headerStyles.headText}`}>
                  <li><a
                    // href="http://test.investarget.com/pages/index.html"
                  >主页</a></li>
                  <li><a
                    // href="http://test.investarget.com/pages/index2.html"
                  >精品投行</a></li>
                  <li><a
                    // href="http://test.investarget.com/pages/index3.html"
                  >产业投资</a></li>
                  <li><a
                    // href="http://test.investarget.com/pages/index4.html"
                  >产业发展</a></li>
                  <li><a
                    // href="http://test.investarget.com/pages/index5.html"
                  >联系我们</a></li>
                  <li><a href="/login">
                    <img className={headerStyles['loginImg']} src="/images/btn_sign_in.png" alt="" />
                  </a></li>
                  <li className={headerStyles['textT']}>
                    <span className={`${headerStyles['textCh']}${window.LANG !== 'en' ? ` ${headerStyles['disabled']}` : ''}`} onClick={this.changeLang.bind(this, 'cn')} disabled={window.LANG !== "en"}>中文</span>
                    <span className={headerStyles['textLine']}>|</span>
                    <span className={`${headerStyles['textEnglish']}${window.LANG === 'en' ? ` ${headerStyles['disabled']}` : ''}`} onClick={this.changeLang.bind(this, 'en')} disabled={window.LANG === "en"}>EN</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div style={{ ...bodyWrapStyle, ...this.props.bodyWrapStyle }}>
          <div style={bodyStyle}>
            {props.children}
          </div>
        </div>
        <div style={footerStyle}>
          <p style={copyrightStyle}>
            &copy; 2020.All Rights Reserved. Investarget
          </p>
        </div>
      </div>
    )
  }
}

export default LoginContainer

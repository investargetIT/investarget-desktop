import { changeLang } from '../utils/util'

const containerStyle = {background:'#fff'}
const headerStyle = {width: 1200, height: 80, margin: '0 auto', backgroundColor: '#fff'}
const logoStyle = {height: 70, padding: '10px 0'}
const bodyStyle = {width: 1200, height: '100%', margin: '0 auto', position: 'relative'}
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
      bg = 'url(/images/background.jpg)';
    } else if (source === 2) {
      logo = '/images/autospace.png';
      bg = 'url(/images/bg_autospace.png)';
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
        <div style={headerStyle}>
          <img src={logo} style={logoStyle} />
          <div style={{float: "right", marginRight: 30, lineHeight: "80px"}}>
            <a onClick={this.changeLang.bind(this, 'cn')}>中文</a> / <a onClick={this.changeLang.bind(this, 'en')}>English</a>
          </div>
        </div>
        <div style={bodyWrapStyle}>
          <div style={bodyStyle}>
            {props.children}
          </div>
        </div>
        <div style={footerStyle}>
          <p style={copyrightStyle}>
            &copy; 2018.All Rights Reserved. Investarget
          </p>
        </div>
      </div>
    )
  }
}

export default LoginContainer

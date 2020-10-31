import React from 'react';

class UploadDir extends React.Component {

  constructor (props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.inputElement.directory = true;
    this.inputElement.webkitdirectory = true;
  }

  handleClick() {
    this.inputElement.click();
  }

  render() {
    return (
      <span className="" onClick={this.handleClick}>
        <div className="ant-upload ant-upload-select ant-upload-select-text">
          <span tabIndex="0" className="ant-upload" role="button">
            <input
              ref={input => this.inputElement = input}
              type="file"
              style={{ display: 'none' }}
            />
            {this.props.children}
          </span>
        </div>
      </span>
    );
  }
}

export default UploadDir;
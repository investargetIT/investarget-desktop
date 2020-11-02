import React from 'react';

class UploadDir extends React.Component {

  constructor (props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.onChangeFile = this.onChangeFile.bind(this);
    this.handleInputClick = this.handleInputClick.bind(this);
  }

  componentDidMount() {
    this.inputElement.directory = true;
    this.inputElement.webkitdirectory = true;
  }

  handleClick(e) {
    e.stopPropagation();
    e.preventDefault();
    this.inputElement.click();
  }

  handleInputClick(e) {
    e.stopPropagation();
    this.inputElement.value = null;
  }

  onChangeFile(event) {
    event.stopPropagation();
    event.preventDefault();
    const { files } = event.target;
    window.echo('files', files);
  }

  render() {
    return (
      <span className="" onClick={this.handleClick}>
        <div className="ant-upload ant-upload-select ant-upload-select-text">
          <span tabIndex="0" className="ant-upload" role="button">
            <input
              onClick={this.handleInputClick}
              ref={input => this.inputElement = input}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={this.onChangeFile.bind(this)}
            />
            {this.props.children}
          </span>
        </div>
      </span>
    );
  }
}

export default UploadDir;
import React from 'react';
import * as api from '../api';

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
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      let allowUpload = true;
      if (this.props.beforeUpload) {
        allowUpload = this.props.beforeUpload(file);
      }
      if (allowUpload) {
        const { lastModified, lastModifiedDate, name, size, type, webkitRelativePath } = file;
        this.props.onChange({
          file: {
            lastModified,
            lastModifiedDate,
            name,
            size,
            type,
            webkitRelativePath,
            status: 'uploading',
          },
        });
        api.qiniuUpload('file', file).then(result => {
          const { data } = result;
          this.props.onChange({
            file: {
              lastModified,
              lastModifiedDate,
              name,
              size,
              type,
              webkitRelativePath,
              status: 'done',
              response: { result: data },
            },
          });
        }).catch(error => {
          console.error(error);
          this.props.onChange({
            file: {
              lastModified,
              lastModifiedDate,
              name,
              size,
              type,
              webkitRelativePath,
              status: 'error',
            },
          });
        });
      }
    }
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
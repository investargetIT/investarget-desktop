import React from 'react';
import * as api from '../api';
import { SIZE_4M } from '../constants';
import { uploadFileByChunks } from '../utils/util';

class UploadDir extends React.Component {

  constructor (props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.onChangeFile = this.onChangeFile.bind(this);
    this.handleInputClick = this.handleInputClick.bind(this);
  }

  componentDidMount() {
    if (!this.props.multiple) { 
      this.inputElement.directory = true;
      this.inputElement.webkitdirectory = true;
    }
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
    window.echo('change file', files); 
    const allowedFiles = [];
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      let allowUpload = true;
      if (this.props.beforeUpload) {
        allowUpload = this.props.beforeUpload(file);
      }
      if (allowUpload) {
        allowedFiles.push(file);
      }
    }
    if (allowedFiles.length > 0) {
      this.uploadFiles(allowedFiles);
    }
  } 

  handleProgress = (total, index, partPercentage) => {
    const percentEachFile = Math.floor(100 / total);
    const percentage = Math.floor(percentEachFile * (index + partPercentage / 100));
    this.props.updateUploadProgress(percentage);
  };

  uploadFiles = async files => {
    const allFileResult = [];
    const percentEachFile = Math.floor(100 / files.length);
    if (this.props.updateUploadProgress) {
      this.props.updateUploadProgress(1);
    }
    let uploadFailed = false;

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      let allowUpload = true;
      if (this.props.beforeUpload) {
        allowUpload = this.props.beforeUpload(file);
      }
      if (allowUpload) {
        const { lastModified, lastModifiedDate, name, size, type, webkitRelativePath } = file;
        await this.props.onChange({
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
        try {
          const result = await (file.size > SIZE_4M
            ? uploadFileByChunks(file, (partPercentage) => {
              this.handleProgress(files.length, index, partPercentage);
            })
            : api.qiniuUpload('file', file)
          );
          const { data } = result;
          const currentFileResult = {
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
          };
          allFileResult.push(currentFileResult)
          await this.props.onChange(currentFileResult);
        } catch (error) {
          uploadFailed = true;
          console.error(error);
          await this.props.onChange({
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
        }
      }
      // 更新上传进度
      if (!uploadFailed && this.props.updateUploadProgress) {
        if (index === files.length - 1) {
          this.props.updateUploadProgress(100);
        } else {
          this.props.updateUploadProgress(percentEachFile * (index + 1));
        }
      }
    }

    this.props.onFinishUploadAllFiles(allFileResult);
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
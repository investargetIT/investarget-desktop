import React from 'react';
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
    const files = Array.prototype.slice.call(event.target.files);
    console.log(event.target.files, files);
    // 去除.DS_Store隐藏文件
    const removeIndex = files.findIndex(({ name }) => name === '.DS_Store');
    if (removeIndex > -1) {
      files.splice(removeIndex, 1);
    }
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
    const errorFileResult = [];
    const percentEachFile = Math.floor(100 / files.length);
    if (this.props.updateUploadProgress) {
      this.props.updateUploadProgress(1);
    }

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
          const result = await uploadFileByChunks(file, {
            onProgress: ({ percent }) => {
              this.handleProgress(files.length, index, percent);
            },
          });
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
          console.error(error);
          const errorFile = {
            file: {
              lastModified,
              lastModifiedDate,
              name,
              size,
              type,
              webkitRelativePath,
              status: 'error',
              error,
            },
          }
          errorFileResult.push(errorFile)
          await this.props.onChange(errorFile);
        }
      }
      // 更新上传进度
      if (this.props.updateUploadProgress) {
        if (index === files.length - 1) {
          this.props.updateUploadProgress(100);
        } else {
          this.props.updateUploadProgress(percentEachFile * (index + 1));
        }
      }
    }

    this.props.onFinishUploadAllFiles(allFileResult, errorFileResult);
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
import React from 'react';

class UploadDir extends React.Component {
  render() {
    return (
      <span className="">
        <div className="ant-upload ant-upload-select ant-upload-select-text">
          <span tabIndex="0" className="ant-upload" role="button">
            <input type="file" accept multiple style={{ display: 'none' }} />
            {this.props.children}
          </span>
        </div>
      </span>
    );
  }
}

export default UploadDir;
import React, { Component } from 'react';
import {
    Modal as AntModal,
    Icon,
} from 'antd';
import QRCode from 'qrcode.react';
import * as api from '../api';
import { baseUrl, mobileUploadUrl } from '../utils/request';
import { createThisTypeNode } from 'typescript';

const urlPrefix = `${mobileUploadUrl}/upload?key=`;
export let Modal = {};

export class MobileUploader extends Component {

    constructor(props) {
        super(props);
        this.state = {
            show: false,
            QRCodeKey: null,
        }
        this.poll = null;
        this.definedCallback = null;
    }

    upload(definedCallback=null) {
        if (this.state.show || this.state.QRCodeKey || this.poll !== null) return;
        this.definedCallback = definedCallback;
        this.setState({ show: true });
        api.getMobileUploadKey()
        .then(result => {
            let QRCodeKey;
            const object = result.data;
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    QRCodeKey = key;
                }
            }
            this.setState({ QRCodeKey });
            this.poll = setInterval(this.checkStatus.bind(this), 1000);
        }); 
    }

    cancel(passOn=null) {
        this.stopPoll.apply(this);
        if (passOn) {
            this.props.onSuccess && this.props.onSuccess.apply(this, passOn);
            this.definedCallback && this.definedCallback(false, passOn);
        } else {
            api.cancelMobileUpload(this.state.QRCodeKey);
            this.props.onCancel && this.props.onCancel.apply(this, passOn);
            this.definedCallback && this.definedCallback(true, passOn);
        }
        this.setState({ QRCodeKey: null, show: false });
    }

    checkStatus() {
        let { QRCodeKey } = this.state;
        api.getQRCodeStatus(QRCodeKey)
        .then(result => {
            const record = result.data[QRCodeKey];
            if (record.key) {
                this.cancel({...record});
                AntModal.success({
                    title: "成功",
                    content: "上传文件成功!",
                })
          }
        });
    }

    stopPoll() {
        if (this.poll) {
            clearInterval(this.poll);
            this.poll = null;
        }
    }

    componentWillUnmount() {
        this.stopPoll();
    }

    render() {
        return <AntModal
          width={230}
          visible={this.state.show}
          footer={null}
          onCancel={this.cancel.bind(this, null)}
        >
            <div style={{ width: 128, margin: '20px auto', marginBottom: 10 }}>
                {this.state.QRCodeKey === null
                    ? <Icon type="loading" />
                    : <QRCode value={urlPrefix + this.state.QRCodeKey} />}
            </div>
            <p style={{ marginBottom: 10 }}>请使用手机扫描二维码上传附件</p>
        </AntModal>
    }

}

export class GlobalModal extends Component {

    constructor(props) { super(props); }

    componentDidMount() {
        Modal = {
            get MobileUploader() { 
                return {
                    upload: this.refs.MobileUploader.upload.bind(this.refs.MobileUploader),
                    cancel: this.refs.MobileUploader.cancel.bind(this.refs.MobileUploader, null),
                }
            }
        };
        Object.assign(Modal, this);
    }

    render() {
        return <div>
            <MobileUploader ref="MobileUploader"/>
        </div>
    }

}
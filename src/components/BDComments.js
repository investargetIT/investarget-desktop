import { EditOutlined, DeleteOutlined , UploadOutlined } from '@ant-design/icons';
import { Form, Upload, Input, Button, Divider, Popconfirm, Checkbox, Select, Tooltip, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { i18n, time, hasPerm, getUserInfo, customRequest } from '../utils/util';
import * as api from '../api'
import FileLink from './FileLink';
import { Link } from 'dva/router';
import { fixedDirs } from './ProjectAttachments';

const { Option } = Select;

function BDComments(props) {
  const { BDComments, onAdd, onEdit, onDelete } = props;

  const [form] = Form.useForm();
  const [speechFile, setSpeechFile] = useState(null);
  const [bdComments, setBdComments] = useState([]);
  const [comment, setComment] = useState(null);

  const handleFinish = (values) => {
    const { comments, fileList, speechToText } = values;
    // TODO: 提取上传文件的组件
    let bucket = null;
    let key = null;
    let filename = null;
    if (fileList && fileList[0]) {
      bucket = 'file';
      key = fileList[0].key;
      filename = fileList[0].name;
    }
    const data =  {
      comments,
      bucket,
      key,
      filename,
    }
    if (comment) {
      onEdit(comment.id, data, speechToText ? speechFile : null);
    } else {
      onAdd(data, speechToText ? speechFile : null);
    }
    setComment(null);
    setSpeechFile(null);
    form.resetFields();
  }

  const reset = () => {
    setComment(null);
    setSpeechFile(null);
    form.resetFields();
  };

  const handleEdit = async (comment) => {
    setComment(comment);
    const { comments, bucket, key } = comment;
    let fileList = null;
    if (bucket && key) {
      const result = await api.downloadUrl(comment.bucket, comment.key);
      fileList = [
        {
          uid: '-1',
          status: 'done',
          name: comment.filename || comment.key,
          bucket: comment.bucket,
          key: comment.key,
          url: result.data,
        },
      ];
    }
    form.setFieldsValue({
      comments,
      fileList,
    });
  }

  const normFile = (e) => {
    const fileList = Array.isArray(e) ? e : (e && e.fileList);
    const file = fileList[0];
    return file ? [
      {
        ...file,
        bucket: file.response ? file.response.result.bucket : file.bucket,
        key: file.response ? file.response.result.realfilekey : file.key,
        url: file.response ? file.response.result.url : file.url,
      },
    ] : [];
  };

  const updateComments = (BDComments) => {
    if (BDComments) {
      Promise.all(BDComments.map((comment) => {
        if (!comment.url && comment.key && comment.bucket) {
          return api.downloadUrl(comment.bucket, comment.key)
            .then((res) => ({ ...comment, url: res.data }))
            .catch(() => comment);
        } else {
          return Promise.resolve(comment);
        }
      })).then((bdComments) => {
        setBdComments(bdComments);
      });
    } else {
      setBdComments([]);
    }
  };

  useEffect(() => {
    updateComments(BDComments);
  }, [BDComments]);

  const handleUploadChange = (e) => {
    if (e.file.status === 'done') {
      const file = e.file.originFileObj;
      if (/\.(wav|flac|opus|m4a|mp3)$/.test(file.name)) {
        setSpeechFile(file);
      } else {
        setSpeechFile(null);
      }
    }
  };

  return (
    <div>
      <Form
        style={{ width: 400 }}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        form={form}
        onFinish={handleFinish}
        preserve={false}
      >
        <Form.Item
          label="备注"
          name="comments"
          rules={[{ required: true, message: '请填写备注' }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label="附件">

          <Form.Item
            name="fileType"
            style={{ display: 'inline-block', marginBottom: 0 }}
          >
            <Select
              showSearch
              allowClear
              placeholder="请选择附件目录"
              optionFilterProp="children"
              filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            >
              {fixedDirs.map(dir => <Option key={dir} value={dir}>{dir}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item
            name="fileList"
            style={{ display: 'inline-block', marginBottom: 0 }}
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              name="file"
              customRequest={customRequest}
              data={{ bucket: 'file' }}
              maxCount={1}
              onChange={handleUploadChange}
            >
              <Button icon={<UploadOutlined />} type="link">上传附件</Button>
            </Upload>
          </Form.Item>

        </Form.Item>

        {speechFile && (
          <Form.Item
            label="语音转文字"
            name="speechToText"
            valuePropName="checked"
            extra="目前语音转写支持的音频格式为：已录制音频（5小时内），wav,flac,opus,m4a,mp3，单声道&多声道，支持语种：中文普通话、英语"
          >
            <Checkbox />
          </Form.Item>
        )}
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            确定
          </Button>
          <Button htmlType="button" onClick={reset} style={{marginLeft: 8}}>
            取消
          </Button>
        </Form.Item>
      </Form>

      <Divider />

      <div style={{ display: comment ? 'none' : '' }}>
        {bdComments && bdComments.length ? bdComments.map(comment => (
          <BDCommnet
            key={comment.id}
            comment={comment}
            onEdit={() => handleEdit(comment)}
            onDelete={() => onDelete(comment.id)}
          />
        )) : <p>暂无行动计划</p>}
      </div>
    </div>
  );
}

export function EditBDComment(props) {
  const { onAdd, onEdit, comment } = props;

  const [form] = Form.useForm();
  const [speechFile, setSpeechFile] = useState(null);

  useEffect(() => {
    const timeInterval = setInterval(autoSave, 5 * 1000);
    return () => {
      clearInterval(timeInterval);
    }
  }, []);

  let count = 0;
  function autoSave() {
    count += 1;
    window.echo('auto save', count);
  }

  const handleFinish = (values) => {
    const { comments, fileList, speechToText, filetype } = values;
    // TODO: 提取上传文件的组件
    let bucket = null;
    let key = null;
    let filename = null;
    if (fileList && fileList[0]) {
      bucket = 'file';
      key = fileList[0].key;
      filename = fileList[0].name;
    }
    const data =  {
      comments,
      bucket,
      key,
      filename,
      filetype,
    }
    if (comment) {
      onEdit(comment.id, data, speechToText ? speechFile : null);
    } else {
      onAdd(data, speechToText ? speechFile : null);
    }
    // setComment(null);
    setSpeechFile(null);
    form.resetFields();
  }

  const reset = () => {
    // setComment(null);
    setSpeechFile(null);
    form.resetFields();
  };

  const handleEdit = async (comment) => {
    const { comments, bucket, key, filetype } = comment;
    let fileList = null;
    if (bucket && key) {
      const result = await api.downloadUrl(comment.bucket, comment.key);
      fileList = [
        {
          uid: '-1',
          status: 'done',
          name: comment.filename || comment.key,
          bucket: comment.bucket,
          key: comment.key,
          url: result.data,
        },
      ];
    }
    form.setFieldsValue({
      comments,
      filetype,
      fileList,
    });
  }

  useEffect(() => {
    if (comment) {
      handleEdit(comment);
    }
  }, [comment]);

  const normFile = (e) => {
    const fileList = Array.isArray(e) ? e : (e && e.fileList);
    const file = fileList[0];
    return file ? [
      {
        ...file,
        bucket: file.response ? file.response.result.bucket : file.bucket,
        key: file.response ? file.response.result.realfilekey : file.key,
        url: file.response ? file.response.result.url : file.url,
      },
    ] : [];
  };

  const handleUploadChange = (e) => {
    if (e.file.status === 'done') {
      const file = e.file.originFileObj;
      if (/\.(wav|flac|opus|m4a|mp3)$/.test(file.name)) {
        setSpeechFile(file);
      } else {
        setSpeechFile(null);
      }
    }
  };

  return (
    <div>
      <Form
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 21 }}
        form={form}
        onFinish={handleFinish}
        preserve={false}
      >
        <Form.Item
          label="备注"
          name="comments"
          rules={[{ required: true, message: '请填写备注' }]}
        >
          <Input.TextArea autoSize={{ minRows: 12 }} />
        </Form.Item>

        <Form.Item
          label="附件"
          name="filetype"
          style={{ marginBottom: 0 }}
        >
          <Select
            showSearch
            allowClear
            placeholder="请选择附件目录"
            optionFilterProp="children"
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            style={{ width: 150 }}
          >
            {fixedDirs.map(dir => <Option key={dir} value={dir}>{dir}</Option>)}
          </Select>
        </Form.Item>

        <Form.Item
          wrapperCol={{ offset: 3, span: 21 }}
          name="fileList"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload
            name="file"
            customRequest={customRequest}
            data={{ bucket: 'file' }}
            maxCount={1}
            onChange={handleUploadChange}
            className="upload-list-modal"
          >
            <Button icon={<UploadOutlined />} type="link">上传附件</Button>
          </Upload>
        </Form.Item>

        {speechFile && (
          <Form.Item
            wrapperCol={{ offset: 3, span: 21 }}
            name="speechToText"
            valuePropName="checked"
            extra={
            <div style={{ width: '80%' }}>目前语音转写支持的音频格式为：已录制音频（5小时内），wav,flac,opus,m4a,mp3，单声道&多声道，支持语种：中文普通话、英语</div>}
          >
            <Checkbox>语音转文字</Checkbox>
          </Form.Item>
        )}

        <Form.Item wrapperCol={{ offset: 3, span: 21 }}>
          <Button type="primary" htmlType="submit">
            确定
          </Button>
          <Button htmlType="button" onClick={reset} style={{marginLeft: 8}}>
            取消
          </Button>
        </Form.Item>
      </Form>

    </div>
  );
}

export function BDCommentsWithoutForm(props) {
  const { BDComments, onAdd, onEdit, onDelete } = props;

  const [form] = Form.useForm();
  const [bdComments, setBdComments] = useState([]);
  const [comment, setComment] = useState(null);

  // const handleEdit = async (comment) => {
  //   setComment(comment);
  //   const { comments, bucket, key } = comment;
  //   let fileList = null;
  //   if (bucket && key) {
  //     const result = await api.downloadUrl(comment.bucket, comment.key);
  //     fileList = [
  //       {
  //         uid: '-1',
  //         status: 'done',
  //         name: comment.filename || comment.key,
  //         bucket: comment.bucket,
  //         key: comment.key,
  //         url: result.data,
  //       },
  //     ];
  //   }
  //   form.setFieldsValue({
  //     comments,
  //     fileList,
  //   });
  // }

  // const updateComments = (BDComments) => {
  //   if (BDComments) {
  //     Promise.all(BDComments.map((comment) => {
  //       if (!comment.url && comment.key && comment.bucket) {
  //         return api.downloadUrl(comment.bucket, comment.key)
  //           .then((res) => ({ ...comment, url: res.data }))
  //           .catch(() => comment);
  //       } else {
  //         return Promise.resolve(comment);
  //       }
  //     })).then((bdComments) => {
  //       setBdComments(bdComments);
  //     });
  //   } else {
  //     setBdComments([]);
  //   }
  // };

  useEffect(() => {
    if (BDComments) {
      setBdComments(BDComments);
    }
  }, [BDComments]);

  return (
    <div>
      <div style={{ display: comment ? 'none' : '' }}>
        {bdComments && bdComments.length ? bdComments.map(comment => (
          <BDCommnet
            key={comment.id}
            comment={comment}
            onEdit={() => onEdit(comment)}
            onDelete={() => onDelete(comment.id)}
          />
        )) : <p>暂无行动计划</p>}
      </div>
    </div>
  );
}

function BDCommnet({ comment, onEdit, onDelete }) {
  const [translateSuccess, setTranslateSuccess] = useState(false);
  useEffect(() => {
    if (comment.transid) {
      api.getAudioTranslate(comment.transid).then((res) => {
        if (res.data && res.data.taskStatus === "9") {
          setTranslateSuccess(true);
        }
      });
    }
  }, []);

  return (
    <div key={comment.id} style={{ marginBottom: 8 }}>
      <p>
        <span style={{ marginRight: 8 }}>{time(comment.createdtime)}</span>

        {hasPerm('BD.manageProjectBD') || getUserInfo().id === comment.createuser ?
          <Button type="link" onClick={onEdit} size="small"><EditOutlined /></Button>
          : null}

        &nbsp;
        {hasPerm('BD.manageProjectBD') || getUserInfo().id === comment.createuser ?
          <Popconfirm title={i18n('message.confirm_delete')} onConfirm={onDelete}>
            <Button type="link" size="small"><DeleteOutlined /></Button>
          </Popconfirm>
          : null}
      </p>
      <div style={{ display: 'flex' }}>
        {comment.createuserobj &&
          <div style={{ marginRight: 10 }}>
            <Tooltip title={comment.createuserobj.username}>
              <a target="_blank" href={`/app/user/${comment.createuserobj.id}`}>
                <img style={{ width: 30, height: 30, borderRadius: '50%' }} src={comment.createuserobj.photourl} />
              </a>
            </Tooltip>
          </div>
        }
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <p dangerouslySetInnerHTML={{ __html: comment.comments.replace(/\n/g, '<br>') }}></p>
          {comment.url && (
            <div>
              <FileLink
                filekey={comment.key}
                url={comment.url}
                filename={comment.filename || comment.key}
                style={{ height: 'unset' }}
              />
              {comment.filetype && <Tag>{comment.filetype}</Tag>}
            </div>
          )}
          {comment.transid && translateSuccess && (
            <div style={{ marginTop: 4 }}>
              <Link
                target="_blank"
                style={{ color: 'red' }}
                to={`/app/speech-to-text/${comment.transid}?speechKey=${comment.key}`}
              >
                语音转文字
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BDComments;

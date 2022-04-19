import { EditOutlined, DeleteOutlined , UploadOutlined } from '@ant-design/icons';
import { Form, Upload, Input, Button, Divider, Popconfirm } from 'antd';
import { useEffect, useState } from 'react';
import { i18n, time, hasPerm, getUserInfo } from '../utils/util';
import { baseUrl } from '../utils/request';
import * as api from '../api'

function BDComments(props) {
  const { BDComments, onAdd, onEdit, onDelete } = props;

  const [form] = Form.useForm();
  const [bdComments, setBdComments] = useState([]);
  const [comment, setComment] = useState(null);

  const handleFinish = (values) => {
    const { comments, fileList } = values;
    // TODO: 提取上传文件的组件
    let bucket = null;
    let key = null;
    if (fileList && fileList[0]) {
      bucket = 'file';
      key = fileList[0].key;
    }
    const data =  {
      comments,
      bucket,
      key,
    }
    if (comment) {
      onEdit(comment.id, data);
    } else {
      onAdd(data);
    }
    setComment(null);
    form.resetFields();
  }

  const reset = () => {
    setComment(null);
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
          name: comment.key,
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
        <Form.Item
          label="上传附件"
          name="fileList"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload 
            name="file"
            action={baseUrl + "/service/qiniubigupload?bucket=file"}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />} type="link">上传附件</Button>
          </Upload>
        </Form.Item>
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
          <div key={comment.id} style={{ marginBottom: 8 }}>
            <p>
              <span style={{ marginRight: 8 }}>{time(comment.createdtime)}</span>

              { hasPerm('BD.manageProjectBD') || getUserInfo().id === comment.createuser ? 
              <Button type="link" onClick={() => handleEdit(comment)}><EditOutlined /></Button>
              : null }
              
              &nbsp;
            {hasPerm('BD.manageProjectBD') ?
                <Popconfirm title={i18n('message.confirm_delete')} onConfirm={() => onDelete(comment.id)}>
                  <Button type="link"><DeleteOutlined /></Button>
                </Popconfirm>
                : null}
            </p>
            <div style={{ display: 'flex' }}>
              {comment.createuserobj &&
                <div style={{ marginRight: 10 }}>
                  <a target="_blank" href={`/app/user/${comment.createuserobj.id}`}>
                    <img style={{ width: 30, height: 30, borderRadius: '50%' }} src={comment.createuserobj.photourl} />
                  </a>
                </div>
              }
              <div>
                <p dangerouslySetInnerHTML={{ __html: comment.comments.replace(/\n/g, '<br>') }}></p>
                {comment.url && (
                  <a href={comment.url} target="_blank">{comment.key}</a>
                )}
              </div>
            </div>
          </div>
        )) : <p>暂无行动计划</p>}
      </div>
    </div>
  );
}

export default BDComments;

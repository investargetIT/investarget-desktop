import React, { useState } from 'react';
import { Row, Col, Card, Tree, Select, Tag, Popover } from 'antd';
import { Search } from './Search';
import * as api from '../api';
import { formatBytes, time, isLogin } from '../utils/util';
import { CheckCircleFilled } from '@ant-design/icons';

const { DirectoryTree } = Tree;

function tagRender(props, isReadFile) {
  const { label, closable, onClose } = props;
  const onPreventMouseDown = event => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ marginRight: 3 }}
    >
      {label}
      {isReadFile &&
        <Popover content={`${label}：已读`}>
          <CheckCircleFilled style={{ color: '#339bd2', marginLeft: 4 }} />
        </Popover>
      }
    </Tag>
  );
}

function DataroomFileManage({
  setData,
  setLoading,
  allDataroomFiles,
  parentId,
  dataroomID,
  data,
  userOptions,
  fileUserList,
  onSelectFileUser,
  onDeselectFileUser,
  readFileUserList,
}) {

  const [searchContent, setSearchContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFileUrl, setPreviewFileUrl] = useState('https://www.investarget.com');

  function formatSearchData (data) {
    return data.map(item => {
      const parentId = parentId; 
      const name = item.filename
      const rename = item.filename
      const unique = item.id
      const isFolder = !item.isFile
      const date = item.lastmodifytime || item.createdtime
      const timezone = item.timezone || '+08:00'
      return { ...item, parentId, name, rename, unique, isFolder, date, timezone }
    })
  }

  function findAllParents(fileId) {
    let allParents = [];
    function findParents (id) {
      const currentFile = allDataroomFiles.filter(f => f.id === id);
      const parent = allDataroomFiles.filter(f => f.id === currentFile[0].parent);
      allParents = allParents.concat(parent);
      if (parent.length > 0) {
        findParents(parent[0].id);
      }
      return allParents;
    }
    return findParents(fileId);
  }

  async function handleDataroomSearch(content) {
    if (!content) {
      setData(allDataroomFiles);
      return;
    }
    setLoading(true);
    const req = await api.searchDataroom(dataroomID, content);
    const { data } = req.data;

    let newData = formatSearchData(data);
    if (parentId !== -999) {
      const allParents = findAllParents(parentId);
      const parentFolder = allDataroomFiles.filter(f => f.id === parentId);
      newData = newData.concat(allParents).concat(parentFolder);
    }
    setLoading(false);
    setData(newData);
  }

  function recursiveFindChildren(item) {
    const children = data.filter(f => f.parent === item.id);
    if (children.length === 0) {
      return;
    }
    item['children'] = children.map(m => ({ ...m, title: m.filename, key: m.id, isLeaf: m.isFile }));
    children.forEach(element => {
      return recursiveFindChildren(element);
    });
  }

  function generateTreeData() {
    let rootDirectory = data.filter(f => !f.parent);
    rootDirectory = rootDirectory.map(m => ({ ...m, title: m.filename, key: m.id, isLeaf: m.isFile }));
    rootDirectory.forEach(element => recursiveFindChildren(element));

    const rootDir = { title: '全部文件', key: -999, id: -999 };
    rootDir['children'] = rootDirectory;
    return [rootDir];
  }

  const onSelect = (keys, info) => {
    if (keys.length < 1) return;
    const item = data.filter(f => f.id === keys[0]);
    if (item.length === 0) return;
    const currentFile = item[0];
    setSelectedFile(currentFile);
    if (currentFile.isFile) {
      const url = getPreviewFileUrl(currentFile);
      setPreviewFileUrl(url);
    }
  };

  const onExpand = () => {
    console.log('Trigger Expand');
  };

  function getPreviewFileUrl(file) {
    const { dataroom: dataroomId, id: fileId } = file;
    const originalEmail = isLogin().email || 'Investarget';
    const watermark = originalEmail.replace('@', '[at]');
    const org = isLogin().org ? isLogin().org.orgfullname : 'Investarget';
    const url = window.location.origin + '/pdf_viewer.html?file=' + encodeURIComponent(file.fileurl) +
      '&dataroomId=' + encodeURIComponent(dataroomId) + '&fileId=' + encodeURIComponent(fileId) +
      '&watermark=' + encodeURIComponent(watermark) + '&org=' + encodeURIComponent(org) + '&locale=' + encodeURIComponent(window.LANG);
    return url;
  }

  function getVisibleUsers() {
    const result = fileUserList.filter(item => item.file == selectedFile.id)
      .map(item => String(item.user));
    return result;
  }

  function renderTagContent(props) {
    const { value } = props;
    let isReadFile = false;
    const filterReadUser = readFileUserList.filter(f => f.file === selectedFile.id && f.user === parseInt(value));
    if (filterReadUser.length > 0) {
      isReadFile = true;
    }
    return tagRender(props, isReadFile);
  }

  return (
    <Row gutter={20}>
      <Col span={8}>
        <Card>
          <Search
            style={{ marginBottom: 30 }}
            size="default"
            placeholder="请输入文件名称或内容"
            onSearch={handleDataroomSearch}
            onChange={searchContent => setSearchContent(searchContent)}
            value={searchContent}
          />
          <DirectoryTree
            checkable
            defaultExpandedKeys={[-999]}
            onSelect={onSelect}
            onExpand={onExpand}
            treeData={generateTreeData()}
          />
        </Card>
      </Col>
      {selectedFile &&
        <Col span={16}>
          <Card title={selectedFile.filename}>
            <div style={{ marginBottom: 20, color: '#262626', display: 'flex' }}>
              {selectedFile.size && <div style={{ flex: 2 }}>文件大小：<span style={{ color: '#595959' }}>{formatBytes(selectedFile.size)}</span></div>}
              <div style={{ flex: 3 }}>修改时间：<span style={{ color: '#595959' }}>{selectedFile.date && time(selectedFile.date + selectedFile.timezone)}</span></div>
            </div>

            {selectedFile.isFile &&
              <div style={{ marginBottom: 20, display: 'flex', color: '#262626' }}>
                <div>可见用户：</div>
                <Select
                  mode="multiple"
                  showArrow
                  tagRender={renderTagContent}
                  style={{ flex: 1 }}
                  value={getVisibleUsers()}
                  optionLabelProp="children"
                  filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                  onSelect={userId => onSelectFileUser(selectedFile.id, Number(userId))}
                  onDeselect={userId => onDeselectFileUser(selectedFile.id, Number(userId))}
                >
                  {userOptions.map(option => (
                    <Select.Option
                      key={option.value}
                      value={String(option.value)}>{option.label}</Select.Option>
                  ))}
                </Select>
              </div>
            }

            {selectedFile.isFile &&
              <div>
                <div style={{ color: '#262626', lineHeight: '22px', padding: '14px 20px', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>预览文件</div>
                <div
                  style={{ borderBottom: '1px solid #e6e6e6', borderTop: '1px solid #e6e6e6' }}
                  dangerouslySetInnerHTML={{ __html: `<iframe style="border: none;" src="${previewFileUrl}" width="100%" height="800"></iframe>` }}
                />
              </div>
            }
          </Card>
        </Col>
      }
    </Row>
  );
}

export default DataroomFileManage;

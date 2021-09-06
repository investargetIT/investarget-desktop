import React, { useState } from 'react';
import { Row, Col, Card, Tree } from 'antd';
import { Search } from './Search';
import * as api from '../api';
import { formatBytes, time } from '../utils/util';

const { DirectoryTree } = Tree;

function DataroomFileManage({
  setData,
  setLoading,
  allDataroomFiles,
  parentId,
  dataroomID,
  data,
}) {

  const [searchContent, setSearchContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFileUrl, setPreviewFileUrl] = useState('https://movier.github.io/');

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
    setSelectedFile(item[0]);
  };

  const onExpand = () => {
    console.log('Trigger Expand');
  };

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
            defaultExpandAll
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
            <div style={{ color: '#262626', lineHeight: '22px', padding: '14px 20px', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>预览文件</div>
            <div
              style={{ borderBottom: '1px solid #e6e6e6', borderTop: '1px solid #e6e6e6' }}
              dangerouslySetInnerHTML={{ __html: `<iframe style="border: none;" src="${previewFileUrl}" width="100%" height="800"></iframe>` }}
            />
          </Card>
        </Col>
      }
    </Row>
  );
}

export default DataroomFileManage;

import React, { useState } from 'react';
import { Row, Col, Card, Tree } from 'antd';
import { Search } from './Search';
import * as api from '../api';

const { DirectoryTree } = Tree;

function DataroomFileManage({
  setData,
  setLoading,
  allDataroomFiles,
  parentId,
  dataroomID,
}) {

  const [searchContent, setSearchContent] = useState('');

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
          {/* <DirectoryTree
            multiple
            defaultExpandAll
            onSelect={onSelect}
            onExpand={onExpand}
            treeData={generateTreeData()}
          /> */}
        </Card>
      </Col>
      <Col span={16}>
        <Card></Card>
      </Col>
    </Row>
  );
}

export default DataroomFileManage;

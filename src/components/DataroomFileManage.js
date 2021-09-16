import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Tree, Select, Tag, Popover, Upload, message, Modal, Input, Tooltip, Checkbox, Button } from 'antd';
import { Search } from './Search';
import * as api from '../api';
import { formatBytes, time, isLogin, hasPerm, } from '../utils/util';
import { CheckCircleFilled } from '@ant-design/icons';
import {
  PlusOutlined,
  FolderOutlined,
  FolderAddOutlined,
  FileTextOutlined,
  ExpandOutlined,
  EllipsisOutlined,
  CloudDownloadOutlined,
  EditOutlined,
  ExportOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { baseUrl } from '../utils/request';
import UploadDir from './UploadDir';
import _ from 'lodash';
import { connect } from 'dva';

const { DirectoryTree } = Tree;

const officeFileTypes = [
  'application/msword',
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
];
const imageFileTypes = [
  'image/jpeg', 
  'image/gif', 
  'image/png', 
  'image/bmp', 
  'image/webp', 
];
const videoFileTypes = [
  'video/mp4',
  'video/avi',
];
const audioFileTypes = [
  'audio/mpeg',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp3',
];
const validFileTypes = officeFileTypes.concat(imageFileTypes).concat(videoFileTypes).concat(audioFileTypes);

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
  targetUserFileList,
  onSelectFileUser,
  onDeselectFileUser,
  readFileUserList,
  onUploadFile,
  onUploadFileWithDir,
  dispatch,
  isCompanyDataroom,
  setFileUserList,
  setTargetUserFileList,
  isProjTrader,
  newDataroomFile,
}) {

  const [searchContent, setSearchContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFileUrl, setPreviewFileUrl] = useState('https://www.investarget.com');
  const [dirData, setDirData] = useState([]);

  // Create new folder related states
  const [currentCreateFolder, setCurrentCreateFolder] = useState(null);
  const [displayNewFolderModal, setDisplayNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName]= useState('');
  const [createFolderLoading, setCreateFolderLoading] = useState(false);

  // Rename folder related states
  const [currentRenameFolder, setCurrentRenameFolder] = useState(null);
  const [displayRenameFolderModal, setDisplayRenameFolderModal] = useState(false);
  const [renameFolderName, setRenameFolderName] = useState('');
  const [renameFolderLoading, setRenameFolderLoading] = useState(false);

  // Move files
  const [displayMoveFileModal, setDisplayMoveFileModal] = useState(false);
  const [currentMoveFile, setCurrentMoveFile] = useState(null);
  const [treeDataForMoveFile, setTreeDataForMoveFile] = useState([]);
  const [folderToMove, setFolderToMove] = useState(null);
  const [moveFileLoading, setMoveFileLoading] = useState(false);
  const [moveFileSearchContent, setMoveFileSearchContent] = useState('');
  const [moveFileSearchResult, setMoveFileSearchResult] = useState([]);

  // Download files
  const [displayDownloadFileModal, setDisplayDownloadFileModal] = useState(false);
  const [currentDownloadFile, setCurrentDownloadFile] = useState(null);
  const [pdfPassword, setPdfPassword] = useState('');
  const [noWatermark, setNoWatermark] = useState(false);
  const [userForDownloadFile, setUserForDownloadFile] = useState(null);

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

  async function handleMoveFileSearch(content) {
    if (!content) {
      setMoveFileSearchResult([]);
      return;
    }
    const relatedFolders = data.filter(f => f.isFolder && f.filename.includes(content));
    setMoveFileSearchResult(relatedFolders);
  }

  function getObject(array, key, value) {
    var o;
    array.some(function iter(a) {
        if (a[key] === value) {
            o = a;
            return true;
        }
        return Array.isArray(a.children) && a.children.some(iter);
    });
    return o;
}

  let recursiveData = [];
  function recursiveSwitchSturcture(flatData, parentID) {
    if (flatData.length === 0) return;

    const children = flatData.filter(f => f.parentId === parentID);
    // Delete all children items in original data
    for (let index = 0; index < children.length; index++) {
      const element = children[index];
      const elementIndex = flatData.map(m => m.id).indexOf(element.id);
      flatData.splice(elementIndex, 1); 
    }

    const newObject = getObject(recursiveData, 'id', parentID);
    const newChildren = children.map(m => ({ ...m, title: m.filename, key: m.id, isLeaf: m.isFile }));
    if (newObject) {
      newObject.children = newChildren;
    } else {
      recursiveData = newChildren.map(m => ({ ...m, children: [] }));
    }

    children.forEach(item => {
      item.children = recursiveSwitchSturcture(flatData, item.id);
    });

  }

  function generateTreeData(allData) {
    const newCloneData = _.cloneDeep(allData);
    recursiveSwitchSturcture(newCloneData, -999);
    const rootDir = { title: '全部文件', key: -999, id: -999, isFolder: true, isFile: false };
    rootDir['children'] = recursiveData;
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

  function titleRender(item) {
    
    function popoverContent() {
      const props = {
        name: 'file',
        action: baseUrl + '/service/qiniubigupload?bucket=file',
        showUploadList: false,
        multiple: true,
        beforeUpload: file => {
          console.log(file)
          const fileType = file.type
          const files = data.filter(f => f.parentId === item.id);
          const mimeTypeExistButNotValid = fileType && !validFileTypes.includes(fileType) ? true : false;
          const mimeTypeNotExistSuffixNotValid = !fileType && !(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|gif|jpg|jpeg|bmp|png|webp|mp4|avi|mp3|m4a)$/i.test(file.name)) ? true : false;
          if (mimeTypeExistButNotValid || mimeTypeNotExistSuffixNotValid) {
            window.echo('mime type or file name suffix not valid');
            window.echo('mime type', fileType);
            window.echo('file name', file.name);
            Modal.error({
              title: '不支持的文件类型',
              content: `${file.name} 文件类型有误，请上传 office、pdf 或者后缀名为 mp4、avi、mp3、m4a 的音视频文件`,
            })
            return false
          }
          if (files.some(item => {
            return item.name == file.name
          })) {
            // Modal.error({
            //   title: '不支持的文件名字',
            //   content: '已存在相同的文件名字',
            // })
            message.warning(`同名文件，文件名 ${file.name} 已存在，无法上传`);
            return false
          }

          return true
        },
        onChange(info) {
          if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
          }
          if (info.file.status === 'done') {
            if (!info.file.name || !info.file.size) {
              const file = info.fileList.filter(f => f.status === 'done' && f.uid === info.file.uid)[0];
              info.file.name = file.name;
              info.file.size = file.size;
            }
            message.success(`${info.file.name} file uploaded successfully`)
            // react.setState({ loading: false })
            onUploadFile(info.file, item.id);
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
            // react.setState({ loading: false })
          } else if (info.file.status === 'uploading') {
            // react.setState({ loading: true })
          }
        },
      };

      const uploadDirProps = {
        beforeUpload: file => {
          console.log(file)
          const fileType = file.type
          const mimeTypeExistButNotValid = fileType && !validFileTypes.includes(fileType) ? true : false;
          const mimeTypeNotExistSuffixNotValid = !fileType && !(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|gif|jpg|jpeg|bmp|png|webp|mp4|avi|mp3|m4a)$/i.test(file.name)) ? true : false;
          if (mimeTypeExistButNotValid || mimeTypeNotExistSuffixNotValid) {
            window.echo('mime type or file name suffix not valid');
            window.echo('mime type', fileType);
            window.echo('file name', file.name);
            Modal.error({
              title: '不支持的文件类型',
              content: `${file.name} 文件类型有误，请上传 office、pdf 或者后缀名为 mp4、avi、mp3、m4a 的音视频文件`,
            })
            return false
          }
          
          if (checkFileWithFolderIfExist(file, item.id)) {
            message.warning(`文件 ${file.webkitRelativePath || file.name} 已存在，无法上传`);
            return false;
          }
  
          return true; 
        },
        async onChange(info) {
          if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
          }
          if (info.file.status === 'done') {
            if (!info.file.name || !info.file.size) {
              const file = info.fileList.filter(f => f.status === 'done' && f.uid === info.file.uid)[0];
              info.file.name = file.name;
              info.file.size = file.size;
            }
            message.success(`${info.file.name} file uploaded successfully`)
            // react.setState({ loading: false })
            await onUploadFileWithDir(info.file, item.id);
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
            // react.setState({ loading: false })
          } else if (info.file.status === 'uploading') {
            // react.setState({ loading: true })
          }
        },
      };

      function tryToFindFolder(folderName, parentFolderID) {
        const files = data.filter(f => f.parentId === parentFolderID);
        const sameNameFolderIndex = files.map(item => item.name).indexOf(folderName);
        if (sameNameFolderIndex > -1) {
          return files[sameNameFolderIndex].id;
        }
        return null;
      }

      function findFolderLoop(folderArr, initialParentId) {
        let parentFolderID = initialParentId;
        for (let index = 0; index < folderArr.length; index++) {
          const folderName = folderArr[index];
          const newFolderId = tryToFindFolder(folderName, parentFolderID);
          if (newFolderId) {
            parentFolderID = newFolderId;
          } else {
            return null; 
          }
        }
        return parentFolderID;
      }


      function checkFileWithFolderIfExist(file, initialParentId) {
        const { webkitRelativePath } = file;
        const splitPath = webkitRelativePath.split('/');
        const folderArr = splitPath.slice(0, splitPath.length - 1);

        const finalFolderID = findFolderLoop(folderArr, initialParentId);

        if (finalFolderID) {
          const files = data.filter(f => f.parentId === finalFolderID);
          if (files.some(item => item.name == file.name)) {
            return true;
          }
        }

        return false;
      }

      return (
        <div style={{ color: '#262626', lineHeight: '22px' }}>
          <div style={{ cursor: 'pointer', padding: '5px 0', borderBottom: '1px solid #e6e6e6' }}>
            <Upload {...props}>
              <FileTextOutlined style={{ marginRight: 8, color: '#bfbfbf' }} />上传文件
            </Upload>
          </div>

          <div style={{ cursor: 'pointer', padding: '5px 0', borderBottom: '1px solid #e6e6e6' }}>
            <UploadDir {...uploadDirProps}>
              <FolderOutlined style={{ marginRight: 8, color: '#bfbfbf' }} />上传文件夹
            </UploadDir>
          </div>

          <div onClick={() => handleCreateNewFolderClick(item)} style={{ cursor: 'pointer', padding: '5px 0', borderBottom: '1px solid #e6e6e6' }}>
            <FolderAddOutlined style={{ marginRight: 8, color: '#bfbfbf' }} />新增文件夹
          </div>
        </div>
      );
    }

    function morePopoverContent() {

      function handleDeleteFileClick(item){
        Modal.confirm({
          title: '删除文件',
          content: `确认删除文件“${item.filename}”吗？`,
          onOk() {
            handleDeleteFiles([item.id]);
          },
          onCancel() {
            console.log('Cancel');
          },
        });
      }

      function handleDeleteFiles(idArr) {
        const body = {
          filelist: idArr
        }
        api.deleteDataRoomFile(body).then(_ => {
          const newData = data.slice()
          idArr.map(d => {
            const index = newData.map(m => m.id).indexOf(d);
            newData.splice(index, 1);
          });
          setData(newData);

          if (!isCompanyDataroom) {
            const newFileUserList = fileUserList.filter(f => !idArr.includes(f.file));
            const newTargetUserFileList = targetUserFileList.filter(f => !idArr.includes(f.file));
            setFileUserList(newFileUserList);
            setTargetUserFileList(newTargetUserFileList); 
          }
        }).catch(error => {
          dispatch({
            type: 'app/findError',
            payload: error
          })
        })
      }

      function handleRenameFileClick(file) {
        setCurrentRenameFolder(file);
        setDisplayRenameFolderModal(true);
        setRenameFolderName(file.filename); 
      }

      function handleMoveFileClick(file) {
        setCurrentMoveFile(file);
        setDisplayMoveFileModal(true);
      }

      function handleDownloadFileClick(file) {
        setCurrentDownloadFile(file);
        setDisplayDownloadFileModal(true);
      }

      return (
        <div style={{ color: '#262626', lineHeight: '22px' }}>
          <div onClick={() => handleDownloadFileClick(item)} style={{ cursor: 'pointer', padding: '5px 0', borderBottom: '1px solid #e6e6e6' }}>
            <CloudDownloadOutlined style={{ marginRight: 8, color: '#bfbfbf' }} />下载文件
          </div>

          <div onClick={() => handleRenameFileClick(item)} style={{ cursor: 'pointer', padding: '5px 0', borderBottom: '1px solid #e6e6e6' }}>
            <EditOutlined style={{ marginRight: 8, color: '#bfbfbf' }} />重命名文件
          </div>

          <div onClick={() => handleMoveFileClick(item)} style={{ cursor: 'pointer', padding: '5px 0', borderBottom: '1px solid #e6e6e6' }}>
            <ExportOutlined style={{ marginRight: 8, color: '#bfbfbf' }} />移动至
          </div>

          <div onClick={() => handleDeleteFileClick(item)} style={{ cursor: 'pointer', padding: '5px 0', borderBottom: '1px solid #e6e6e6' }}>
            <DeleteOutlined style={{ marginRight: 8, color: '#bfbfbf' }} />删除
          </div>
        </div>
      );
    }

    let fileIcon = <FolderOutlined />;
    if (item.isFile) {
      fileIcon = <FileTextOutlined />;
    }

    let addOperationIcon = null;
    if (item.isFolder) {
      addOperationIcon = (
        <Popover content={popoverContent()}>
          <PlusOutlined />
        </Popover>
      );
    }
    const moreOperationIcon = (
      <Popover content={morePopoverContent()}>
        <EllipsisOutlined style={{ marginLeft: 4 }} />
      </Popover>
    );
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <span style={{ marginRight: 4 }}>{fileIcon}</span>
          <span>{item.title}</span>
        </div>
        <div>{addOperationIcon}{moreOperationIcon}</div>
      </div>
    );
  }

  useEffect(() => {
    const newTreeData = generateTreeData(data);
    setDirData(newTreeData);

    const newDataForMoveFile = data.filter(f => f.isFolder);
    const newTreeDataForMoveFile = generateTreeData(newDataForMoveFile);
    setTreeDataForMoveFile(newTreeDataForMoveFile);
  }, [data]);

  function handleCreateNewFolderClick(folder) {
    setCurrentCreateFolder(folder);
    setDisplayNewFolderModal(true);
  }

  function handleConfirmCreateFolder() {
    const newData = data.slice();
    const value = currentCreateFolder;

    // Check duplicate folder name 
    const currentFiles = newData.filter(f => f.parentId == value.id);
    if (currentFiles.some(item => Object.is(item.name, newFolderName))) {
      Modal.error({
        title: '不支持的文件夹名字',
        content: '已存在相同的文件夹名字',
      });
      return;
    }

    setCreateFolderLoading(true);
    const body = {
      dataroom: Number(dataroomID),
      filename: newFolderName,
      isFile: false,
      orderNO: 1,
      parent: currentCreateFolder.id == -999 ? null : currentCreateFolder.id,
    }
    api.addDataRoomFile(body).then(data1 => {
      const item = data1.data
      const parentId = item.parent || -999
      const name = item.filename
      const rename = item.filename
      const unique = item.id
      const isFolder = !item.isFile
      const date = item.lastmodifytime || item.createdtime
      const justCreated = true; // 以此为标识用户刚新建的文件夹，否则会被自动隐藏空文件夹功能隐藏
      const newItem = { ...item, parentId, name, rename, unique, isFolder, date, justCreated }
      newData.push(newItem)
      setData(newData);
      setCreateFolderLoading(false);
      setDisplayNewFolderModal(false);
    }).catch(error => {
      setCreateFolderLoading(false);
      dispatch({
        type: 'app/findError',
        payload: error
      })
    })
  }

  function handleConfirmRenameFile() {
    const newData = data.slice();
    const value = currentRenameFolder;

    // Check duplicate folder name 
    const currentFiles = newData.filter(f => f.parentId == value.parentId);
    if (currentFiles.some(item => Object.is(item.name, renameFolderName))) {
      Modal.error({
        title: '不支持的文件夹名字',
        content: '已存在相同的文件夹名字',
      });
      return;
    }

    setRenameFolderLoading(true);
    const body = {
      id: value.id,
      filename: renameFolderName ,
    }
    api.editDataRoomFile(body).then(_ => {
      const index = newData.map(m => m.id).indexOf(value.id);
      newData[index].name = renameFolderName;
      newData[index].filename = renameFolderName;
      setData(newData);
      setRenameFolderLoading(false);
      setDisplayRenameFolderModal(false);
    }).catch(error => {
      setRenameFolderLoading(false);
      dispatch({
        type: 'app/findError',
        payload: error,
      });
    });
  }

  function handleOpenFileInNewWindowClick() {
    const fileUrl = getPreviewFileUrl(selectedFile);
    window.open(fileUrl);
  }

  function onSelectFolderForMoveFiles(keys) {
    setFolderToMove(keys[0]);
  }

  function handleConfirmMoveFile() {
    const files = [currentMoveFile];
    const targetID = folderToMove;
    const targetFile = data.filter(f => f.id === targetID)[0];
    if (files.filter(f => f.dataroom !== targetFile.dataroom).length > 0) {
      Modal.error({
        title: i18n('dataroom.message.error_move_files_title'),
        content: i18n('dataroom.message.error_move_files_content')
      })
      return
    }
    files.map(m => {
      const body = {
        id: m.id,
        parent: targetID == -999 ? null : targetID
      }
      setMoveFileLoading(true);
      api.editDataRoomFile(body).then(_ => {
        const newData = data.slice();
        const index = newData.map(m => m.id).indexOf(m.id);
        newData[index].parentId = targetID;
        newData[index].parent = targetID;
        setData(newData);
        setMoveFileLoading(false);
        setDisplayMoveFileModal(false);
      }).catch(error => {
        setMoveFileLoading(false);
        dispatch({
          type: 'app/findError',
          payload: error,
        });
      });
    });
  }

  const downloadFileModalFooter = (
    <div style={{ marginRight: 4 }}>
      {!isLogin().is_superuser && hasPerm('usersys.as_investor') &&
        <Button disabled={newDataroomFile.length === 0}>下载新文件</Button>
      }
      <Button>下载全部文件</Button>
      <Button type="primary">下载所选文件</Button>
    </div>
  );

  return (
    <div>
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
            {dirData.length > 0 &&
              <DirectoryTree
                checkable
                defaultExpandedKeys={[-999]}
                onSelect={onSelect}
                onExpand={onExpand}
                treeData={dirData}
                titleRender={titleRender}
                icon={null}
                expandAction="doubleClick"
              />
            }
          </Card>
        </Col>
        {selectedFile &&
          <Col span={16}>
            <Card title={selectedFile.filename}>
              <div style={{ marginBottom: 20, color: '#262626', display: 'flex' }}>
                {selectedFile.size && <div style={{ flex: 2 }}>文件大小：<span style={{ color: '#595959' }}>{formatBytes(selectedFile.size)}</span></div>}
                <div style={{ flex: 3 }}>修改时间：<span style={{ color: '#595959' }}>{selectedFile.date && time(selectedFile.date + selectedFile.timezone)}</span></div>
              </div>

              {!isCompanyDataroom && selectedFile.isFile &&
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', lineHeight: '22px', padding: '14px 20px', backgroundColor: '#f5f5f5' }}>
                    <div style={{ color: '#262626', fontWeight: 'bold' }}>预览文件</div>
                    <div style={{ color: '#595959', cursor: 'pointer' }} onClick={handleOpenFileInNewWindowClick}>
                      <Tooltip title="在新窗口中打开"><ExpandOutlined /></Tooltip>
                    </div>
                  </div>
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

      <Modal
        title="新增文件夹"
        visible={displayNewFolderModal}
        onCancel={() => setDisplayNewFolderModal(false)}
        onOk={handleConfirmCreateFolder}
        okButtonProps={{ disabled: !newFolderName }}
        confirmLoading={createFolderLoading}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>文件夹名称：</div>
          <Input
            style={{ flex: 1 }}
            placeholder="请输入新文件夹名称"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        title="修改文件夹名称"
        visible={displayRenameFolderModal}
        onCancel={() => setDisplayRenameFolderModal(false)}
        onOk={handleConfirmRenameFile}
        okButtonProps={{ disabled: !renameFolderName }}
        confirmLoading={renameFolderLoading}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>文件夹名称：</div>
          <Input
            style={{ flex: 1 }}
            placeholder="请输入文件夹名称"
            value={renameFolderName}
            onChange={e => setRenameFolderName(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        title="移动至"
        visible={displayMoveFileModal}
        onOk={handleConfirmMoveFile}
        onCancel={() => setDisplayMoveFileModal(false)}
        okButtonProps={{ disabled: !folderToMove }}
        confirmLoading={moveFileLoading}
      >
        <Search
          style={{ marginBottom: 20 }}
          size="default"
          placeholder="请输入目标位置"
          onSearch={handleMoveFileSearch}
          onChange={searchContent => setMoveFileSearchContent(searchContent)}
          value={moveFileSearchContent}
        />

        {moveFileSearchResult.length === 0 &&
          <DirectoryTree
            defaultExpandedKeys={[-999]}
            onSelect={onSelectFolderForMoveFiles}
            treeData={treeDataForMoveFile}
          />
        }

        {moveFileSearchResult.map(m => (
          <div
            key={m.id}
            style={{ padding: '16px 20px', borderBottom: '1px solid #e6e6e6', backgroundColor: folderToMove === m.id ? '#f0f6fb' : undefined }}
            onClick={() => setFolderToMove(m.id)}
          >
            <FolderOutlined style={{ marginRight: 8 }}  />
            {m.filename}
          </div>
        ))}
      </Modal>

      <Modal
        title="下载文件"
        visible={displayDownloadFileModal}
        onCancel={() => setDisplayDownloadFileModal(false)}
        footer={downloadFileModalFooter}
      >
        {!isCompanyDataroom &&
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: 140, textAlign: 'right' }}>投资人：</div>
            <Select
              showArrow
              placeholder="请选择投资人"
              style={{ width: 280 }}
              value={userForDownloadFile}
              optionLabelProp="children"
              filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
              onSelect={value => setUserForDownloadFile(value)}
            >
              {userOptions.map(option => (
                <Select.Option
                  key={option.value}
                  value={String(option.value)}
                >
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </div>
        }

        {((hasPerm('usersys.as_trader') || (isLogin() && isLogin().is_superuser)) || isProjTrader) &&
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: 140, textAlign: 'right' }}>设置PDF编辑密码：</div>
              <Input
                style={{ width: 280 }}
                placeholder="请输入密码，不输入则默认不加密"
                value={pdfPassword}
                onChange={e => setPdfPassword(e.target.value)}
              />
            </div>
            <div style={{ marginTop: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: 140 }} />
              <div style={{ width: 280, fontSize: 12, paddingLeft: 10 }}>该密码仅针对pdf文件有效</div>
            </div>
          </div>
        }

        {(hasPerm('dataroom.downloadNoWatermarkFile') || isProjTrader) &&
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: 140 }} />
            <div style={{ width: 280 }}>
              <Checkbox
                checked={noWatermark}
                onChange={e => setNoWatermark(e.target.checked)}
              >
                文件无水印
              </Checkbox>
            </div>
          </div>
        }
      </Modal>

    </div>
  );
}

export default connect()(DataroomFileManage);

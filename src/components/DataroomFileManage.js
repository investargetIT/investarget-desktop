import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Tree, Select, Tag, Popover, Upload, message, Modal, Input, Tooltip, Checkbox, Button, Progress, notification, Empty, Spin } from 'antd';
import { Search } from './Search';
import * as api from '../api';
import { formatBytes, time, isLogin, hasPerm, handleError, getCurrentUser, getUserInfo, subtracting, intersection, customRequest } from '../utils/util';
import { CheckCircleFilled } from '@ant-design/icons';
import {
  PlusOutlined,
  FolderOutlined,
  FolderAddOutlined,
  FileTextOutlined,
  FolderViewOutlined,
  ExpandOutlined,
  EllipsisOutlined,
  CloudDownloadOutlined,
  EditOutlined,
  ExportOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import UploadDir from './UploadDir';
import _ from 'lodash';
import { connect } from 'dva';
import moment from 'moment';

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
  'audio/wav',
  'audio/aac',
  'audio/flac',
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

class MyProgress extends React.Component {
  state = {
    remainingSecodes: null,
    allSeconds: null,
  };

  async componentDidMount() {
    const {
      dataroomId,
      requestParams: params,
      downloadUser,
      noWatermark,
      isDownloadingSelectedFiles,
      notificationKey,
    } = this.props;

    const timeInterval = 2000;

    this.intervalId = setInterval(async () => {
      try {
        const result = await api.createAndCheckDataroomZip(dataroomId, params);
        const { seconds, all } = result.data;
        // 8005表示文件打包压缩已经完成，随时可以下载
        if (result.data.code === 8005) {
          // 设置 allSeconds 的值只是为了让进度条显示为 100%，任何数值都可以
          this.setState({ remainingSecodes: 0, allSeconds: 1 });
          clearInterval(this.intervalId);
          this.props.onFinish(dataroomId, downloadUser, isDownloadingSelectedFiles, noWatermark, notificationKey);
        } else {
          this.setState({ remainingSecodes: seconds, allSeconds: all });
        }
      } catch (error) {
        clearInterval(this.intervalId);
        this.props.onError(notificationKey);
        handleError(error);
      }
    }, timeInterval);
  }

  render() {
    let percent = 0;
    if (typeof this.state.remainingSecodes === 'number' && typeof this.state.allSeconds === 'number' && this.state.allSeconds !== 0) {
      percent = Math.floor((this.state.allSeconds - this.state.remainingSecodes) * 100 / this.state.allSeconds);
    }
    return <Progress percent={percent} />;
  }

}

function DataroomFileManage({
  setData,
  setLoading,
  loading,
  allDataroomFiles,
  setAllDataroomFiles,
  parentId,
  dataroomID,
  data,
  userOptions,
  fileUserList,
  targetUserFileList,
  onSelectFileUser,
  onDeselectFileUser,
  readFileUserList,
  // onUploadFile,
  onUploadFileWithDir,
  dispatch,
  isCompanyDataroom,
  setFileUserList,
  setTargetUserFileList,
  isProjTrader,
  newDataroomFile,
  allUserWithFile,
}) {
  const [searchContent, setSearchContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [subFilesOfSelectedFolder, setSubFilesOfSelectedFolder] = useState([]);
  const [previewFileUrl, setPreviewFileUrl] = useState(null);
  const [dirData, setDirData] = useState([]);

  const [uploadDirProgress, setUploadDirProgress] = useState(null);

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
  const [downloadUrl, setDownloadUrl] = useState(null);

  const [watermarkEmail, setWatermarkEmail] = useState('');
  const [watermarkCompany, setWatermarkCompany] = useState('');

  const [checkedFiles, setCheckedFiles] = useState({ checked: [], halfChecked: [] });

  function formatSearchData (data) {
    return data.map(item => {
      const parentId = -999;
      const parent = -999;
      const name = item.filename
      const rename = item.filename
      const unique = item.id
      const isFolder = !item.isFile
      const date = item.lastmodifytime || item.createdtime
      const timezone = item.timezone || '+08:00'
      return { ...item, parentId, name, rename, unique, isFolder, date, timezone, parent }
    })
  }

  function findAllParents(fileId) {
    let allParents = [];
    function findParents (id) {
      const currentFile = allDataroomFiles.filter(f => f.id === id);
      if (currentFile.length === 0) {
        return allParents;
      }
      const parent = allDataroomFiles.filter(f => f.id === currentFile[0].parent);
      allParents = allParents.concat(parent);
      if (parent.length > 0) {
        findParents(parent[0].id);
      }
      return allParents;
    }
    return findParents(fileId);
  }

  function findAllChildren(folderId) {
    let allChildren = [];
    function findChildren (id) {
      const children = allDataroomFiles.filter(f => f.parent === id);
      allChildren = allChildren.concat(children);
      children.map(m => findChildren(m.id));
      return allChildren;
    }
    return findChildren(folderId);
  }

  function formatData(data) {
    return data.map(item => {
      const parent = item.parent || -999;
      const parentId = item.parent || -999
      const name = item.filename
      const rename = item.filename
      const unique = item.id
      const isFolder = !item.isFile
      const date = item.lastmodifytime || item.createdtime
      const timezone = item.timezone || '+08:00'
      return { ...item, parentId, name, rename, unique, isFolder, date, timezone, parent }
    })
  }

  async function handleDataroomSearch(content) {
    if (!content) {
      setData(allDataroomFiles);
      return;
    }
    setLoading(true);
    const req = await api.searchDataroom(dataroomID, content);
    const { data } = req.data;

    if (data.length === 0) {
      setLoading(false);
      Modal.warning({ title: '未找到相关内容' });
      return;
    }

    const newData = formatData(data);
    let flatData = [];
    for (let index = 0; index < newData.length; index++) {
      const element = newData[index];
      element.parent = -999;
      element.parentId = -999;
      element.treeKey = element.id + '-' + index;
      flatData.push(element);
      let allChildren = findAllChildren(element.id);
      allChildren = allChildren.map(m => ({ ...m, treeKey: m.id + '-' + index }));
      flatData = flatData.concat(allChildren);
    }
    setLoading(false);
    setData(formatData(flatData));
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

  function switchStructure(flatData1, parentID1) {
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
      const newChildren = children.map(m => ({ ...m, title: m.filename, key: m.treeKey || m.id, isLeaf: m.isFile, ifContainFiles: m.isFile ? false : ifContainFiles(m, flatData1) }));
      if (newObject) {
        newObject.children = newChildren;
      } else {
        recursiveData = newChildren.map(m => ({ ...m, children: [] }));
      }

      children.forEach(item => {
        item.children = recursiveSwitchSturcture(flatData, item.id);
      });

    }
    recursiveSwitchSturcture(flatData1, parentID1);

    return recursiveData;
  }

  function generateTreeData(allData) {
    const newCloneData = _.cloneDeep(allData);
    const recursiveData = switchStructure(newCloneData, -999);
    const rootDir = { title: '全部文件', key: -999, id: -999, isFolder: true, isFile: false, parent: null };
    rootDir['children'] = recursiveData;
    return [rootDir];
  }

  const onSelect = (keys, info) => {
    if (keys.length < 1) return;
    const item = data.filter(f => f.treeKey === keys[0] || f.id === keys[0]);
    if (item.length === 0) return;
    const currentFile = item[0];
    checkTrainingFile(currentFile);
    setSelectedFile(currentFile);
    if (currentFile.isFile) {
      if ((/\.avi$/i).test(currentFile.filename)) {
        Modal.warning({
          title: '该文件不支持在线预览',
        });
      } else if ((/\.(gif|jpg|jpeg|bmp|png|webp|mp4|avi|mp3|m4a|wav|aac|flac)$/i).test(currentFile.filename) || (/\.(html)$/i.test(currentFile.key))) {
        setPreviewFileUrl(currentFile.fileurl);
      } else {
        const url = getPreviewFileUrl(currentFile);
        setPreviewFileUrl(url);
      }
    } else {
      const allChildren = findAllChildren(currentFile.id);
      const allSubFiles = allChildren.filter(f => f.isFile);
      setSubFilesOfSelectedFolder(allSubFiles);
    }
  };

  function checkTrainingFile(file) {
    if (!file.isTraingFile) return;
    if (!hasPerm('usersys.as_trader')) return;
    const userInfo = getUserInfo();
    if (!userInfo.onjob) return;
    generateTrainingRecord(file);
  }

  function generateTrainingRecord(file) {
    const trainingDate = `${moment().format('YYYY-MM-DD')}T00:00:00`;
    const body = {
      user: getCurrentUser(),
      trainingDate,
      trainingType: 1, // 线上培训
      trainingStatus: 1, // 已完成
      trainingFile: file.id,
    };
    api.addTrainingRecord(body);
  }

  // const onExpand = () => {
  //   window.echo('Trigger Expand');
  // };

  // const onLoad = () => {
  //   window.echo('on load');
  // }

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

  function getVisibleUsersOfFile(fileID) {
    const result = fileUserList.filter(item => item.file == fileID)
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

  function renderTagContentOfFile(props, fileID) {
    const { value } = props;
    let isReadFile = false;
    const filterReadUser = readFileUserList.filter(f => f.file === fileID && f.user === parseInt(value));
    if (filterReadUser.length > 0) {
      isReadFile = true;
    }
    return tagRender(props, isReadFile);
  }

  function titleRender(item) {
    
    function popoverContent() {
      // const props = {
      //   name: 'file',
      //   customRequest,
      //   data: { bucket: 'file' },
      //   showUploadList: false,
      //   multiple: true,
      //   beforeUpload: file => {
      //     console.log(file)
      //     const fileType = file.type
      //     const files = data.filter(f => f.parentId === item.id);
      //     const mimeTypeExistButNotValid = fileType && !validFileTypes.includes(fileType) ? true : false;
      //     const mimeTypeNotExistSuffixNotValid = !fileType && !(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|gif|jpg|jpeg|bmp|png|webp|mp4|avi|mp3|m4a)$/i.test(file.name)) ? true : false;
      //     if (mimeTypeExistButNotValid || mimeTypeNotExistSuffixNotValid) {
      //       window.echo('mime type or file name suffix not valid');
      //       window.echo('mime type', fileType);
      //       window.echo('file name', file.name);
      //       Modal.error({
      //         title: '不支持的文件类型',
      //         content: `${file.name} 文件类型有误，请上传 office、pdf 或者后缀名为 mp4、avi、mp3、m4a 的音视频文件`,
      //       })
      //       return false
      //     }
      //     if (files.some(item => {
      //       return item.name == file.name
      //     })) {
      //       // Modal.error({
      //       //   title: '不支持的文件名字',
      //       //   content: '已存在相同的文件名字',
      //       // })
      //       message.warning(`同名文件，文件名 ${file.name} 已存在，无法上传`);
      //       return false
      //     }

      //     return true
      //   },
      //   onChange(info) {
      //     if (info.file.status !== 'uploading') {
      //       console.log(info.file, info.fileList);
      //     }
      //     if (info.file.status === 'done') {
      //       if (!info.file.name || !info.file.size) {
      //         const file = info.fileList.filter(f => f.status === 'done' && f.uid === info.file.uid)[0];
      //         info.file.name = file.name;
      //         info.file.size = file.size;
      //       }
      //       message.success(`${info.file.name} file uploaded successfully`)
      //       // react.setState({ loading: false })
      //       onUploadFile(info.file, item.id);
      //     } else if (info.file.status === 'error') {
      //       message.error(`${info.file.name} file upload failed.`);
      //       // react.setState({ loading: false })
      //     } else if (info.file.status === 'uploading') {
      //       // react.setState({ loading: true })
      //     }
      //   },
      // };

      const uploadDirProps = {
        beforeUpload: file => {
          console.log(file)
          const fileType = file.type
          const mimeTypeExistButNotValid = fileType && !validFileTypes.includes(fileType) ? true : false;
          const mimeTypeNotExistSuffixNotValid = !fileType && !(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|gif|jpg|jpeg|bmp|png|webp|mp4|avi|mp3|m4a|wav|aac|flac)$/i.test(file.name)) ? true : false;
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
            message.success(`${info.file.name} 文件上传成功`)
            // react.setState({ loading: false })
          } else if (info.file.status === 'error') {
            message.error(`${info.file.name} 文件上传失败`);
            // react.setState({ loading: false })
          } else if (info.file.status === 'uploading') {
            // react.setState({ loading: true })
          }
        },
        async onFinishUploadAllFiles(allFiles, errorFiles) {
          let newData = data;
          for (let index = 0; index < allFiles.length; index++) {
            const info = allFiles[index];
            const newNewData = await onUploadFileWithDir(info.file, item.id, newData);
            newData = newNewData;
          }
          setData(newData);

          if (errorFiles.length > 0) {
            Modal.error({
              title: `其中${errorFiles.length}个文件上传失败`,
              content: (
                <ul>
                  {errorFiles.map((info) => (
                    <li key={info.file.name}>
                      {info.file.name} 上传失败的原因是：{info.file.error.message}
                    </li>
                  ))}
                </ul>
              ),
            });
          }
        },
        updateUploadProgress(percent) {
          setUploadDirProgress(percent);
          if (percent === 100) {
            setTimeout(() => {
              setUploadDirProgress(null)
            }, 2000);
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
            <UploadDir {...uploadDirProps} multiple>
              <FileTextOutlined style={{ marginRight: 8, color: '#bfbfbf' }} />上传文件
            </UploadDir>
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
        const filesToDelete = [...checkedFiles.checked];
        if (!filesToDelete.includes(item.id)) {
          filesToDelete.push(item.id);
        }
        
        Modal.confirm({
          title: '删除文件',
          content: `确认删除文件“${item.filename}”及其他选中的文件吗？`,
          onOk() {
            handleDeleteFiles(filesToDelete);
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

          // 清空勾选的文件
          setCheckedFiles({ checked: [], halfChecked: [] });
          
          const newAllFiles = allDataroomFiles.slice();
          idArr.map(d => {
            const index = newAllFiles.map(m => m.id).indexOf(d);
            newAllFiles.splice(index, 1);
          });
          setAllDataroomFiles(newAllFiles);

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
        if (!watermarkEmail) {
          const downloadUser = isLogin();
          setWatermarkEmail(downloadUser.email);
          setWatermarkCompany(downloadUser.org ? downloadUser.org.orgname : '多维海拓');
        }
        setDisplayDownloadFileModal(true);
      }

      return (
        <div style={{ color: '#262626', lineHeight: '22px' }}>
          <div onClick={() => handleDownloadFileClick(item)} style={{ cursor: 'pointer', padding: '5px 0', borderBottom: '1px solid #e6e6e6' }}>
            <CloudDownloadOutlined style={{ marginRight: 8, color: '#bfbfbf' }} />下载文件
          </div>

          {item.id !== -999 && (hasPerm('dataroom.admin_managedataroom') || isProjTrader) &&
            <div onClick={() => handleRenameFileClick(item)} style={{ cursor: 'pointer', padding: '5px 0', borderBottom: '1px solid #e6e6e6' }}>
              <EditOutlined style={{ marginRight: 8, color: '#bfbfbf' }} />重命名文件
            </div>
          }

          {item.id !== -999 && (hasPerm('dataroom.admin_managedataroom') || isProjTrader) &&
            <div onClick={() => handleMoveFileClick(item)} style={{ cursor: 'pointer', padding: '5px 0', borderBottom: '1px solid #e6e6e6' }}>
              <ExportOutlined style={{ marginRight: 8, color: '#bfbfbf' }} />移动至
            </div>
          }

          {item.id !== -999 && (hasPerm('dataroom.admin_managedataroom') || isProjTrader) &&
            <div onClick={() => handleDeleteFileClick(item)} style={{ cursor: 'pointer', padding: '5px 0', borderBottom: '1px solid #e6e6e6' }}>
              <DeleteOutlined style={{ marginRight: 8, color: '#bfbfbf' }} />删除
            </div>
          }
        </div>
      );
    }

    function renderFileIcon() {
      if (item.isFile) {
        return <FileTextOutlined />;
      }
      // const allChildren = findAllChildren(item.id);
      // if (allChildren.filter(f => f.isFile).length > 0) {
      //   return <FolderViewOutlined />
      // }
      if (item.ifContainFiles) {
        return <FolderViewOutlined />
      }
      return <FolderOutlined />
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
          <span style={{ marginRight: 4 }}>{renderFileIcon()}</span>
          <span style={{ wordBreak: 'break-all' }}>{item.title}</span>
        </div>
        <div>{(isLogin().is_superuser || !hasPerm('usersys.as_investor')) && addOperationIcon}{(isLogin().is_superuser || !hasPerm('dataroom.onlydataroom')) && moreOperationIcon}</div>
      </div>
    );
  }

  function getTableDataSource(data) {
    if (!isLogin()) return [];
    const { is_superuser, permissions } = isLogin();
    if (!is_superuser && permissions.includes('usersys.as_investor')) {
      // 对于投资人，隐藏空目录，除非是刚新建的目录
      const result = data.filter(
        f => ifContainFiles(f, data) || f.isFile || !f.id || f.justCreated || f.isCreatingFolder
      ).sort(sortByFileTypeAndName);
      return result;
    }
    return data.sort(sortByFileTypeAndName);
  }

  function ifContainFiles(file, data) {
    let childFiles = data.filter(f => f.parentId == file.id)
    if (childFiles.length == 0)
      return false;
    if (childFiles.some(item => ifContainFiles(item, data) || item.isFile))
      return true;
  }

  function sortByFileTypeAndName(a, b) {
    return 10 * sortByFileType(a, b) + sortByFileName(a, b)
  }
  
  function sortByFileType(a, b) {
    const va = a.isFolder ? 0 : 1
    const vb = b.isFolder ? 0 : 1
    return va - vb
  }
  
  function sortByFileName(a, b) {
    if (a.name < b.name) {
      return -1;
    } else if (a.name > b.name) {
      return 1;
    } else {
      return 0;
    }
  }
  
  useEffect(() => {
    const newData = getTableDataSource(data);
    const newTreeData = generateTreeData(newData);
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
      const parent = item.parent || -999;
      const parentId = item.parent || -999
      const name = item.filename
      const rename = item.filename
      const unique = item.id
      const isFolder = !item.isFile
      const date = item.lastmodifytime || item.createdtime
      const justCreated = true; // 以此为标识用户刚新建的文件夹，否则会被自动隐藏空文件夹功能隐藏
      const newItem = { ...item, parentId, name, rename, unique, isFolder, date, justCreated, parent }
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
    window.open(previewFileUrl, '_blank', 'noopener')
  }

  function onSelectFolderForMoveFiles(keys) {
    setFolderToMove(keys[0]);
  }

  function handleConfirmMoveFile() {
    const files = [currentMoveFile];
    const targetID = folderToMove;
    const targetFile = data.filter(f => f.id === targetID)[0];
    if (targetFile) {
      if (files.filter(f => f.dataroom !== targetFile.dataroom).length > 0) {
        Modal.error({
          title: i18n('dataroom.message.error_move_files_title'),
          content: i18n('dataroom.message.error_move_files_content')
        })
        return
      }
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
      {isLogin() && !isLogin().is_superuser && hasPerm('usersys.as_investor') &&
        <Button disabled={newDataroomFile.length === 0} onClick={handleDownloadNewFileBtnClicked}>下载新文件</Button>
      }
      <Button onClick={handleDownloadAllFilesBtnClicked}>下载全部文件</Button>
      <Button onClick={handleDownloadSelectFileBtnClicked} type="primary">下载所选文件</Button>
    </div>
  );

  function handleDownloadAllFilesBtnClicked() {
    setDisplayDownloadFileModal(false);
    checkDataRoomStatus(noWatermark);
  }

  function handleDownloadSelectFileBtnClicked() {
    setDisplayDownloadFileModal(false);
    let allFilesIDs = checkedFiles.checked;
    if (allFilesIDs.length === 0) {
      const allChildren = findAllChildren(currentDownloadFile.id);
      allFilesIDs = allChildren.map(m => m.id).concat(currentDownloadFile.id);
    }
    checkDataRoomStatus(noWatermark, true, allFilesIDs.join(','));
  }

  function handleDownloadNewFileBtnClicked() {
    setDisplayDownloadFileModal(false);
    const files = newDataroomFile.map(m => m.id).join(',');
    checkDataRoomStatus(noWatermark, true, files);
  }

  async function checkDataRoomStatus(noWatermark, isDownloadingSelectedFiles, files) {
   
    let downloadUser = isLogin();
    if (userForDownloadFile) {
      const filterDownloadUser = allUserWithFile.filter(f => f.id === userForDownloadFile);
      if (filterDownloadUser.length > 0) {
        downloadUser = filterDownloadUser[0];
      }
    }
    const user = downloadUser && downloadUser.id;
    const params = { user };

    if (noWatermark) {
      params.nowater = 1;
    } else {
      let orgname = downloadUser.org ? downloadUser.org.orgname : '多维海拓';
      if (watermarkCompany) {
        orgname = watermarkCompany;
      }

      let email = downloadUser.email;
      if (watermarkEmail) {
        email = watermarkEmail;
      }
      const water = downloadUser ? downloadUser.username + ',' + orgname + ',' + email : null;
      params.water = water;
    }

    const password = pdfPassword;
    if (password) {
      params.password = password;
    }

    if (isDownloadingSelectedFiles) {
      params.files = files;
    }

    const downloadNotificationKey = JSON.stringify({ ...params, id: dataroomID });

    notification.open({
      key: downloadNotificationKey,
      message: 'Dataroom 文件打包',
      description: <MyProgress
        notificationKey={downloadNotificationKey}
        dataroomId={dataroomID}
        requestParams={params}
        downloadUser={downloadUser}
        noWatermark={noWatermark}
        isDownloadingSelectedFiles={isDownloadingSelectedFiles}
        onFinish={handleDownloadFinish}
        onError={key => notification.close(key)}
      />,
      duration: 0,
      placement: 'bottomRight',
    });
  }

  function handleDownloadFinish(dataroomId, downloadUser, isDownloadingSelectedFiles, noWatermark, notificationKey) {
    const part = isDownloadingSelectedFiles ? 1 : 0;
    const nowater = noWatermark ? 1 : 0;

    const url = api.downloadDataRoom(dataroomId, downloadUser && downloadUser.id, part, nowater);
    setDownloadUrl(url);
    setUserForDownloadFile(null);

    // 重置下载链接， 防止相同下载链接不执行
    setTimeout(() => setDownloadUrl(null), 1000);

    // 如果打包完成，自动关闭通知
    setTimeout(() => notification.close(notificationKey), 3000);
  }

  function handleDownloadUserSelect(user) {
    setUserForDownloadFile(user);

    // Change watermark content
    const filterDownloadUser = allUserWithFile.filter(f => f.id === user);
    if (filterDownloadUser.length > 0) {
      const downloadUser = filterDownloadUser[0];
      setWatermarkEmail(downloadUser.email);
      if (downloadUser.org) {
        setWatermarkCompany(downloadUser.org.orgname);
      }
    }
    
  }

  function handleDirectoryTreeChecked(checkedKeys, e) {
    // setCheckedFiles(checkedKeys);
    // const { checked } = checkedKeys;
    // let checkedFiles = [];
    // for (let index = 0; index < checked.length; index++) {
    //   const element = checked[index];
    //   checkedFiles = checkedFiles.concat(element);
    //   const allChildren = findAllChildren(element);
    //   window.echo('all children', allChildren);
    //   checkedFiles = checkedFiles.concat(allChildren.map(m => m.id));
    // }
    // const unique = _.uniq(checkedFiles);
    // window.echo('all checked files', unique);
    // setCheckedFiles(unique);

    let increase = [], decrease = []; // 应该新增或减少的关联文件
    let increaseHalf = [], decreaseHalf = [];
    let decreaseAllParents = [];
    const { checked, node } = e;
    const { id: changedFile } = node;
    // 勾选了一个文件或目录
    if (checked) {
      // 增加这个文件或目录 
      increase = increase.concat(changedFile);
      // 如果是个目录，增加这个目录的所有子文件
      if (!node.isFile) {
        const allChildren = findAllChildren(changedFile);
        increase = increase.concat(allChildren.map(m => m.id));
      }
      
      // Half checked 中增加所有父目录
      const allParents = findAllParents(changedFile);
      increaseHalf = increaseHalf.concat(allParents.map(m => m.id));
      increaseHalf = increaseHalf.concat(-999);
    } else {
      decrease = decrease.concat(changedFile);
      // 取消勾选一个目录或文件，同时取消半勾选状态
      decreaseHalf = decreaseHalf.concat(changedFile);
      if (!node.isFile) {
        const allChildren = findAllChildren(changedFile);
        decrease = decrease.concat(allChildren.map(m => m.id));
        decreaseHalf = decreaseHalf.concat(allChildren.map(m => m.id));
      }

      // 剔除所有父目录
      const allParents = findAllParents(changedFile);
      decreaseAllParents = decreaseAllParents.concat(allParents.map(m => m.id));
      decreaseAllParents = decreaseAllParents.concat(-999);
      decrease = decrease.concat(allParents.map(m => m.id));
      decrease = decrease.concat(-999);
    }

    const { checked: checkedKeys1, halfChecked } = checkedFiles;
    let newCheckedFiles = [...checkedKeys1];
    newCheckedFiles = newCheckedFiles.concat(increase);
    newCheckedFiles = subtracting(newCheckedFiles, decrease);

    // 取消勾选时，判断是否需要半勾选（如果有子文件选中的话）或取消半勾选父目录（如果没有子文件选中的话）
    for (let index = 0; index < decreaseAllParents.length; index++) {
      const element = decreaseAllParents[index];
      const allChildren = findAllChildren(element);
      const inter = intersection(_.uniq(newCheckedFiles), allChildren.map(m => m.id));
      if (inter.length === 0) {
        decreaseHalf = decreaseHalf.concat(element);
      } else {
        increaseHalf = increaseHalf.concat(element);
      }
    }

    let newHalfCheckedFiles = [...halfChecked];
    newHalfCheckedFiles = newHalfCheckedFiles.concat(increaseHalf);
    newHalfCheckedFiles = subtracting(newHalfCheckedFiles, decreaseHalf);

    setCheckedFiles({ checked: _.uniq(newCheckedFiles), halfChecked: _.uniq(newHalfCheckedFiles) });
  }

  // function handleDirectoryTreeChecked(checkedKeys, e) {
  //   // setCheckedFiles(checkedKeys);
  //   // const { checked } = checkedKeys;
  //   // let checkedFiles = [];
  //   // for (let index = 0; index < checked.length; index++) {
  //   //   const element = checked[index];
  //   //   checkedFiles = checkedFiles.concat(element);
  //   //   const allChildren = findAllChildren(element);
  //   //   window.echo('all children', allChildren);
  //   //   checkedFiles = checkedFiles.concat(allChildren.map(m => m.id));
  //   // }
  //   // const unique = _.uniq(checkedFiles);
  //   // window.echo('all checked files', unique);
  //   // setCheckedFiles(unique);

  //   let increase = [], decrease = []; // 应该新增或减少的关联文件
  //   const { checked, node } = e;
  //   const { id: changedFile } = node;
  //   // 勾选了一个文件或目录
  //   if (checked) {
  //     // 增加这个文件或目录 
  //     increase = increase.concat(changedFile);
  //     // 如果是个目录，增加这个目录的所有子文件
  //     if (!node.isFile) {
  //       const allChildren = findAllChildren(changedFile);
  //       increase = increase.concat(allChildren.map(m => m.id));
  //     }
  //   } else {
  //     decrease = decrease.concat(changedFile);
  //     if (!node.isFile) {
  //       const allChildren = findAllChildren(changedFile);
  //       decrease = decrease.concat(allChildren.map(m => m.id));
  //     }

  //     // 剔除所有父目录
  //     const allParents = findAllParents(changedFile);
  //     decrease = decrease.concat(allParents.map(m => m.id));
  //     decrease = decrease.concat(-999);
  //   }

  //   let newCheckedFiles = [...checkedFiles];
  //   newCheckedFiles = newCheckedFiles.concat(increase);

  //   newCheckedFiles = subtracting(newCheckedFiles, decrease);
  //   setCheckedFiles(_.uniq(newCheckedFiles));
  // }

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
            {dirData.length > 0 && !loading &&
              <DirectoryTree
                checkable
                height={700}
                defaultExpandedKeys={[-999]}
                onSelect={onSelect}
                // onExpand={onExpand}
                // onLoad={onLoad}
                checkStrictly
                treeData={dirData}
                titleRender={titleRender}
                icon={null}
                expandAction="doubleClick"
                checkedKeys={checkedFiles}
                onCheck={handleDirectoryTreeChecked}
              />
            }
            {loading && <div style={{ margin: 20, padding: 30, textAlign: 'center' }}>
              <Spin />
            </div>}
          </Card>
        </Col>
        {selectedFile &&
          <Col span={16}>
            <Card title={selectedFile.filename}>
              <div style={{ marginBottom: 20, color: '#262626', display: 'flex' }}>
                {selectedFile.size && <div style={{ flex: 2 }}>文件大小：<span style={{ color: '#595959' }}>{formatBytes(selectedFile.size)}</span></div>}
                <div style={{ flex: 3 }}>修改时间：<span style={{ color: '#595959' }}>{selectedFile.date && time(selectedFile.date + selectedFile.timezone)}</span></div>
              </div>

              {!isCompanyDataroom && selectedFile.isFile && (hasPerm('dataroom.admin_managedataroom') || isProjTrader) &&
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

            {
              !isCompanyDataroom && !selectedFile.isFile && (hasPerm('dataroom.admin_managedataroom') || isProjTrader) &&
              <div>
                <div style={{ display: 'flex', backgroundColor: '#f5f5f5', padding: '14px 0 14px 20px', lineHeight: '22px', fontSize: 14, fontWeight: 'bold' }}>
                  <div style={{ flex: 1, marginRight: 20 }}>文件名称</div>
                  <div style={{ flex: 2 }}>可见用户</div>
                </div>
                <div style={{ padding: '16px 0' }}>
                  {subFilesOfSelectedFolder.length > 0 ? subFilesOfSelectedFolder.map(m => (
                    <div key={m.id} style={{ display: 'flex', padding: '10px 0 10px 20px', lineHeight: '22px', fontSize: 14 }}>
                      <div style={{ flex: 1, color: '#595959', marginRight: 20 }}><Tooltip title={`修改时间：${m.date && time(m.date + m.timezone)}`}>{m.filename}</Tooltip></div>
                      <div style={{ flex: 2 }}>
                        <Select
                          mode="multiple"
                          showArrow
                          tagRender={props => renderTagContentOfFile(props, m.id)}
                          style={{ width: '100%' }}
                          value={getVisibleUsersOfFile(m.id)}
                          optionLabelProp="children"
                          filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                          onSelect={userId => onSelectFileUser(m.id, Number(userId))}
                          onDeselect={userId => onDeselectFileUser(m.id, Number(userId))}
                        >
                          {userOptions.map(option => (
                            <Select.Option
                              key={option.value}
                              value={String(option.value)}>{option.label}</Select.Option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                </div>
              </div>
            }

              {selectedFile.isFile && previewFileUrl &&
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', lineHeight: '22px', padding: '14px 20px', backgroundColor: '#f5f5f5' }}>
                    <div style={{ color: '#262626', fontWeight: 'bold' }}>预览文件</div>
                    <div style={{ color: '#595959', cursor: 'pointer' }} onClick={handleOpenFileInNewWindowClick}>
                      <Tooltip title="在新窗口中打开"><ExpandOutlined /></Tooltip>
                    </div>
                  </div>
                  {selectedFile.filename.endsWith('.aac') ? (
                    <div style={{ borderBottom: '1px solid #e6e6e6', borderTop: '1px solid #e6e6e6', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <audio controls="controls" src={previewFileUrl} />
                    </div>
                  ) : (
                    <div
                      style={{ borderBottom: '1px solid #e6e6e6', borderTop: '1px solid #e6e6e6' }}
                      dangerouslySetInnerHTML={{ __html: `<iframe style="border: none;" src="${previewFileUrl}" width="100%" height="800"></iframe>` }}
                    />
                  )}
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
        title="修改文件名称"
        visible={displayRenameFolderModal}
        onCancel={() => setDisplayRenameFolderModal(false)}
        onOk={handleConfirmRenameFile}
        okButtonProps={{ disabled: !renameFolderName }}
        confirmLoading={renameFolderLoading}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>文件名称：</div>
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
        {!isCompanyDataroom && hasPerm('usersys.as_trader') &&
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: 140, textAlign: 'right' }}>投资人：</div>
            <Select
              showArrow
              placeholder="请选择投资人"
              style={{ width: 280 }}
              value={userForDownloadFile}
              optionLabelProp="children"
              filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
              onSelect={value => handleDownloadUserSelect(value)}
            >
              {allUserWithFile.map(option => (
                <Select.Option
                  key={option.id}
                  value={option.id}
                >
                  {option.username}
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

        {hasPerm('usersys.as_trader') && !noWatermark &&
          <div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: 140, textAlign: 'right' }}>设置水印邮箱：</div>
              <Input
                style={{ width: 280 }}
                placeholder="请输入水印的邮箱"
                value={watermarkEmail}
                onChange={e => setWatermarkEmail(e.target.value)}
              />
            </div>
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: 140, textAlign: 'right' }}>设置水印公司名称：</div>
              <Input
                style={{ width: 280 }}
                placeholder="请输入水印的公司名称"
                value={watermarkCompany}
                onChange={e => setWatermarkCompany(e.target.value)}
              />
            </div>
          </div>
        }

      </Modal>

      {uploadDirProgress &&
        <Modal
          title="正在上传文件"
          visible
          footer={null}
          closable={false}
          bodyStyle={{ textAlign: 'center' }}
        >
          <Progress type="circle" percent={uploadDirProgress} />
        </Modal>
      }

      <iframe style={{ display: 'none' }} src={downloadUrl}></iframe>

    </div>
  );
}

export default connect()(DataroomFileManage);

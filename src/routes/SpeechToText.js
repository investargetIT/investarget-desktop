import {
  SearchOutlined,
  DownOutlined,
  UpOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Input, Divider, Button, Affix, Typography, Form, Modal, message } from "antd";
import { connect } from "dva";
import { debounce } from 'lodash';
import { Component, createRef, useState, useRef, useEffect } from "react";
import qs from 'qs';
import * as api from '../api';
import LeftRightLayout from "../components/LeftRightLayout";
import { downloadFile, handleError } from "../utils/util";

class SpeechToText extends Component {
  constructor(props) {
    super(props);

    this.state = {
      speechUrl: null,
      filename: null,
      paragraphs: [],
      keyword: '',
      replaceKeyword: '',
      total: 0,
      current: -1,
      speakerModalVisible: false,
      currentParagraph: null,
      textModalVisible: false,
      // 从选中一段往后speaker相同的连续几段
      multiParagraphs: [],
    };

    this.inputElem = createRef();
    this.audioElem = createRef();

    this.searchKeyword = debounce(this.searchKeyword, 500);
  }

  componentDidMount() {
    this.initialize();
    window.addEventListener('keydown', this.handleKeyDown);
    window.scrollTo(0, 0);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeywordChange = (keyword) => {
    this.setState({
      keyword,
    });

    this.searchKeyword(keyword, () => {
      this.scrollToCurrent(this.state.current);
    });
  }

  handlePrev = () => {
    const { total, current } = this.state;
    if (total === 1) return;

    const newCurrent = current > 0 ? current - 1 : total - 1;
    this.setState({
      current: newCurrent,
    });
    this.scrollToCurrent(newCurrent);
  }

  handleNext = () => {
    const { total, current } = this.state;
    if (total === 1) return;

    const newCurrent = current < total - 1 ? current + 1 : 0;
    this.setState({
      current: newCurrent,
    });
    this.scrollToCurrent(newCurrent);
  }

  handleReplaceWordChange = (replaceKeyword) => {
    this.setState({
      replaceKeyword,
    });
  }

  handleReplace = () => {
    const { keyword, replaceKeyword, total, current, paragraphs } = this.state;
    if (keyword === '' || total === 0) return;

    const index = paragraphs.findIndex((item) => (
      item.textSpans.some((item2) => item2.matchIndex === current)
    ));
    const targetTextParagraph = paragraphs[index];
    const newText = targetTextParagraph.textSpans.map((item) => {
      return item.matchIndex === current ? replaceKeyword : item.text;
    }).join('');
    const newParagraph = {
      ...targetTextParagraph,
      text: newText,
    };
    const newParagraphs = [
      ...paragraphs.slice(0, index),
      newParagraph,
      ...paragraphs.slice(index + 1),
    ];
    this.updateAudioTranslate(newParagraphs);

    const {
      paragraphs: newParagraphs2,
      total: newTotal,
    } = searchInParagraphs(newParagraphs, keyword);
    const newCurrent = total > 0 ? (current % newTotal) : -1;
    this.setState({
      paragraphs: newParagraphs2,
      total: newTotal,
      current: newCurrent,
    }, () => {
      if (newCurrent > -1) {
        this.scrollToCurrent(newCurrent);
      }
    });
  }

  handleEditSpeaker = (paragraph) => {
    this.setState({
      currentParagraph: paragraph,
      speakerModalVisible: true,
    });
  }

  handleCancelEditSpeaker = () => {
    this.setState({
      currentParagraph: null,
      speakerModalVisible: false,
    });
  }

  handleConfirmEditSpeaker = (values) => {
    const newParagraphs = this.state.paragraphs.map((item) => ({
      ...item,
      speaker: item.speaker === this.state.currentParagraph.speaker
        ? values.speaker
        : item.speaker,
    }));

    this.setState({
      currentParagraph: null,
      speakerModalVisible: false,
      paragraphs: newParagraphs,
    });
    this.updateAudioTranslate(newParagraphs);
  }

  handleEditText = (paragraph) => {
    const { paragraphs } = this.state;
    const newMultiParagraphs = [];
    let index = paragraphs.findIndex((item) => item.id === paragraph.id);
    while (paragraphs[index] && paragraphs[index].speaker === paragraph.speaker) {
      newMultiParagraphs.push(paragraphs[index]);
      index += 1;
    }
    this.setState({
      multiParagraphs: newMultiParagraphs,
      textModalVisible: true,
    });
  }

  handleCancelEditText = () => {
    this.setState({
      multiParagraphs: [],
      textModalVisible: false,
    });
  }

  handleConfirmEditText = (multiParagraphs) => {
    const multiParagraphIds = multiParagraphs.map((item) => item.id);
    const newParagraphs = this.state.paragraphs.map((paragraph) => {
      const index = multiParagraphIds.indexOf(paragraph.id);
      if (index > -1) {
        return {
          ...paragraph,
          text: multiParagraphs[index].text,
        };
      } else {
        return paragraph;
      }
    });
    this.setState({
      multiParagraphs: [],
      textModalVisible: false,
      paragraphs: newParagraphs,
    });
    this.updateAudioTranslate(newParagraphs);

    // 不自动跳转到匹配的第current个文字处
    this.searchKeyword(this.state.keyword);
  }

  handleKeyDown = (e) => {
    if (e.keyCode === 114 || ((e.ctrlKey || e.metaKey) && e.keyCode === 70)) { 
      e.preventDefault();

      const selectedText = window.getSelection().toString();
      if (this.inputElem.current) {
        this.inputElem.current.focus();
      }
      if (selectedText) {
        this.setState({
          keyword: selectedText,
        });
        this.searchKeyword(selectedText, () => {
          this.scrollToCurrent(this.state.current);
        });
      }
    }
  }

  handleDownload = () => {
    const { paragraphs, filename } = this.state;
    const lines = [];
    paragraphs.forEach(({ speaker, startTime, text }) => {
      lines.push(`说话人 ${speaker} ${startTime}\n`);
      lines.push(`${text}\n`);
    });
    const blob = new Blob(lines, { type: 'text/plain', endings: 'native' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, `${filename}文字记录.txt`);
    URL.revokeObjectURL(url);
  }

  handleClickTime = (bg, ed) => {
    if (this.audioElem.current == null) return;

    const audio = this.audioElem.current;
    const startTime = bg / 1000;
    const endTime = ed / 1000;
    if (this.audioTimeupdateHandler) {
      audio.removeEventListener('timeupdate', this.audioTimeupdateHandler);
    }
    this.audioTimeupdateHandler = () => {
      if (audio.currentTime >= endTime) {
        audio.pause();
        audio.removeEventListener('timeupdate', this.audioTimeupdateHandler);
        this.audioTimeupdateHandler = null;
      }
    };
    audio.addEventListener('timeupdate', this.audioTimeupdateHandler);
    audio.currentTime = startTime;
    audio.play();
  }

  searchKeyword(keyword, callback) {
    const { paragraphs, total } = searchInParagraphs(this.state.paragraphs, keyword);
    const current = total > 0 ? 0 : -1;
    this.setState({
      keyword,
      paragraphs,
      total,
      current,
    }, () => {
      if (callback) {
        callback();
      }
    });
  }

  scrollToCurrent = (current) => {
    if (current === -1) return;

    const markElem = document.querySelector(`[data-match-index="${current}"]`);
    if (markElem) {
      const { top, bottom } = markElem.getBoundingClientRect();
      const isInView = top > 116 + 14 && window.innerHeight - bottom > 86 + 36;
      if (!isInView) {
        markElem.scrollIntoView({
          block: 'center',
        });
      }
    }
  }

  initialize = async () => {
    const id = parseInt(this.props.match.params.id, 10);
    const search = this.props.location.search;
    if (id == null) return;

    let res;
    try {
      res = await api.getAudioTranslate(id);
    } catch (err) {
      handleError(err);
    }
    // TODO: check taskStatus
    const { onebest, file_name } = res.data;
    if (onebest) {
      let paragraphs = JSON.parse(onebest);
      paragraphs = paragraphs.map(formatParagraph);
      const { paragraphs: newParagraphs, total } = searchInParagraphs(paragraphs, '');
      this.setState({
        paragraphs: newParagraphs,
        filename: file_name,
        total,
      });
    }

    if (search) {
      const { speechKey } = qs.parse(search, { ignoreQueryPrefix: true });
      if (speechKey) {
        try {
          const res2 = await api.downloadUrl('file', speechKey);
          const speechUrl = res2.data;
          this.setState({
            speechUrl,
          });
        } catch (err) {
          handleError(err);
        }
      }
    }
  }

  updateAudioTranslate = (paragraphs) => {
    const transId = this.props.match.params.id;
    const onebest = JSON.stringify(paragraphs.map(unformatParagraph));
    api.updateAudioTranslate(transId, { onebest })
      .catch((err) => {
        handleError(err);
      });
  }

  render() {
    const {
      speechUrl,
      filename,
      paragraphs,
      keyword,
      replaceKeyword,
      current,
      total,
      speakerModalVisible,
      currentParagraph,
      textModalVisible,
      multiParagraphs,
    } = this.state;

    return (
      <LeftRightLayout location={this.props.location} title="语音转文字">
        <div>
          <Affix offsetTop={50}>
            <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div level={3} style={{ margin: 0 }}>
                  {filename}文字记录
                </div>
                <Button
                  style={{ marginLeft: 8 }}
                  size="small"
                  disabled={paragraphs.length === 0}
                  onClick={this.handleDownload}
                >
                  下载txt
                </Button>
              </div>
              <Finder
                input={this.inputElem}
                keyword={keyword}
                current={current}
                total={total}
                onChange={this.handleKeywordChange}
                onPrev={this.handlePrev}
                onNext={this.handleNext}
                replaceKeyword={replaceKeyword}
                onChangeReplaceKeyword={this.handleReplaceWordChange}
                onReplace={this.handleReplace}
              />
            </div>
          </Affix>
          <div style={{ padding: 16 }}>
            {paragraphs.map((item) => {
              const { id, speaker, text, startTime, bg, ed, textSpans } = item;
              return (
                <TextParagraph
                  key={id}
                  speaker={speaker}
                  text={text}
                  startTime={startTime}
                  textSpans={textSpans}
                  current={current}
                  onEditSpeaker={() => {
                    this.handleEditSpeaker(item);
                  }}
                  onEditText={() => {
                    this.handleEditText(item);
                  }}
                  onClickTime={() => {
                    this.handleClickTime(bg, ed);
                  }}
                />
              );
            })}
          </div>
          {speechUrl && (
            <Affix offsetBottom={0}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: 16, background: '#fff' }}>
                <audio ref={this.audioElem} src={speechUrl} controls style={{ width: 500 }} />
              </div>
            </Affix>
          )}
          {speakerModalVisible && (
            <SpeakerModalForm
              speaker={currentParagraph && currentParagraph.speaker}
              onCancel={this.handleCancelEditSpeaker}
              onEdit={this.handleConfirmEditSpeaker}
            />
          )}
          {textModalVisible && (
            <TextModalForm1
              multiParagraphs={multiParagraphs}
              onCancel={this.handleCancelEditText}
              onEdit={this.handleConfirmEditText}
            />
          )}
        </div>
      </LeftRightLayout>
    );
  }
}

function TextParagraph({
  speaker,
  onEditSpeaker,
  onEditText,
  onClickTime,
  startTime,
  textSpans,
  current,
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
        <div>说话人 {speaker}</div>
        <Button
          style={{ marginLeft: 8 }}
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={onEditSpeaker}
        />
        <Button
          style={{ marginLeft: 8 }}
          type="text"
          onClick={onClickTime}
        >
          <div>{startTime}</div>
        </Button>
      </div>
      <div>
        <Button
          style={{ marginRight: 8 }}
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={onEditText}
        />
        {textSpans.map(({ text, matchIndex }) => {
          if (matchIndex > -1) {
            return (
              <mark
                data-match-index={matchIndex}
                style={{
                  padding: 0,
                  background: matchIndex === current ? 'rgba(245, 74, 69, 0.6)' : 'rgba(255, 198, 10, 0.6)',
                }}
              >
                {text}
              </mark>
            );
          } else {
            return <span>{text}</span>;
          }
        })}
      </div>
    </div>
  );
}

function Finder({
  input,
  keyword,
  current = -1,
  total = 0,
  onChange,
  onPrev,
  onNext,
  replaceKeyword,
  onChangeReplaceKeyword,
  onReplace,
}) {
  const suffix = (
    <div>
      {total > 0 && (
        <span>{current + 1}/{total}</span>
      )}
      <Divider type="vertical" />
      <Button
        type="text"
        icon={<UpOutlined />}
        size="small"
        disabled={total === 0}
        onClick={onPrev}
      />
      <Button
        type="text"
        icon={<DownOutlined />}
        size="small"
        disabled={total === 0}
        onClick={onNext}
      />
      <Button
        type="text"
        icon={<CloseCircleOutlined />}
        size="small"
        onClick={() => {
          onChange('');
        }}
      />
    </div>
  );

  return (
    <div>
      <Input
        ref={input}
        style={{ width: 300 }}
        prefix={<SearchOutlined />}
        suffix={suffix}
        value={keyword}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onPressEnter={(e) => {
          if (e.shiftKey) {
            onPrev();
          } else {
            onNext();
          }
        }}
      />
      <Input.Group compact>
        <Input
          style={{ width: 'calc(100% - 92px)' }}
          value={replaceKeyword}
          onChange={(e) => {
            onChangeReplaceKeyword(e.target.value);
          }}
        />
        <Button
          style={{ width: 92 }}
          onClick={onReplace}
        >
          替换
        </Button>
      </Input.Group>
    </div>
  );
}

function SpeakerModalForm({ speaker, onCancel, onEdit }) {
  const [form] = Form.useForm();
  return (
    <Modal
      visible
      title="修改说话人名称"
      okText="修改"
      cancelText="取消"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            form.resetFields();
            onEdit(values);
          })
          .catch((info) => {
            const errorField = info.errorFields[0];
            if (errorField) {
              const error = errorField.errors[0];
              if (error) {
                message.error(error);
              }
            }
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="speaker_modal_form"
        initialValues={{ speaker }}
      >
        <Form.Item
          name="speaker"
          label="说话人名称"
          rules={[{ required: true, message: '请输入说话人名称' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

function TextModalForm({ multiParagraphs, onCancel, onEdit }) {
  const [paragraphs, setParagraphs] = useState([...multiParagraphs]);
  const speaker = paragraphs[0] && paragraphs[0].speaker;

  const handleChange = (index, text) => {
    const newParagraphs = [
      ...paragraphs.slice(0, index),
      {
        ...paragraphs[index],
        text,
      },
      ...paragraphs.slice(index + 1),
    ];
    setParagraphs(newParagraphs);
  };

  const handleOk = () => {
    onEdit(paragraphs);
  };

  return (
    <Modal
      visible
      width={800}
      title="修改文字"
      okText="修改"
      cancelText="取消"
      onCancel={onCancel}
      onOk={handleOk}
    >
      <div style={{ marginBottom: 24 }}>
        说话人 {speaker}
      </div>
      <div>
        {paragraphs.map((paragraph, index) => (
          <div key={paragraph.id} style={{ display: 'flex' }}>
            <div style={{ flex: 'none', marginRight: 24 }}>
              {paragraph.startTime}
            </div>
            <Typography.Paragraph
              key={paragraph.id}
              style={{ flex: 1, marginBottom: 22 }}
              editable={{
                onChange: (value) => {
                  handleChange(index, value);
                },
                tooltip: '点击编辑',
              }}
            >
              {paragraph.text}
            </Typography.Paragraph>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function TextModalForm1({ multiParagraphs, onCancel, onEdit }) {
  const [paragraphs, setParagraphs] = useState([...multiParagraphs]);
  const textareaRef = useRef(null);
  const speaker = paragraphs[0] && paragraphs[0].speaker;

  useEffect(() => {
    const font = getCanvasFont(textareaRef.current);
    const containerWidth = getElementContentWidth(textareaRef.current);
    const newParagraphs = [...paragraphs];
    newParagraphs.forEach(element => {
      const textWidth = getTextWidth(element.text, font);
      const lineNumber = Math.ceil(textWidth / containerWidth);
      element.lineNumber = lineNumber;
    });
    setParagraphs(newParagraphs);
  }, []);

  useEffect(() => {

  }, [paragraphs])

  const handleChange = (index, text) => {
    const newParagraphs = [
      ...paragraphs.slice(0, index),
      {
        ...paragraphs[index],
        text,
      },
      ...paragraphs.slice(index + 1),
    ];
    setParagraphs(newParagraphs);
  };

  const handleOk = () => {
    onEdit(paragraphs);
  };

  function combineAllText() {
    return paragraphs.reduce((prev, curr, index) => {
      let text = prev;
      if (index > 0) {
        text += '\n';
      }
      text += curr.text;
      return text;
    }, '');
  }

  function combineAllTime() {
    let result = '';
    for (let index = 0; index < paragraphs.length; index++) {
      const element = paragraphs[index];
      result += element.startTime;
      if (element.lineNumber) {
        for (let i = 0; i < element.lineNumber; i++) {
          result += '\n';
        }
      } else {
        result += '\n';
      }
    }
    return result;
  }

  function getTextWidth(text, font) {
    // re-use canvas object for better performance
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }

  function getCssStyle(element, prop) {
    return window.getComputedStyle(element, null).getPropertyValue(prop);
  }

  function getCanvasFont(el = document.body) {
    const fontWeight = getCssStyle(el, 'font-weight') || 'normal';
    const fontSize = getCssStyle(el, 'font-size') || '16px';
    const fontFamily = getCssStyle(el, 'font-family') || 'Times New Roman';

    return `${fontWeight} ${fontSize} ${fontFamily}`;
  }

  function getElementContentWidth(element) {
    return element.offsetWidth - element.style.paddingLeft - element.style.paddingRight;
  }

  return (
    <Modal
      visible
      width={800}
      title="修改文字"
      okText="修改"
      cancelText="取消"
      onCancel={onCancel}
      onOk={handleOk}
    >
      <div style={{ marginBottom: 24 }}>
        说话人 {speaker}
      </div>
      <div style={{ display: 'flex' }}>
        <Input.TextArea
          style={{ width: 100, marginRight: 8 }}
          value={combineAllTime()}
          autoSize
          disabled
          bordered={false}
        />
        <div ref={textareaRef} style={{ flex: 1 }}>
          <Input.TextArea defaultValue={combineAllText()} autoSize />
        </div>
        {/* {paragraphs.map((paragraph, index) => (
          <div key={paragraph.id} style={{ display: 'flex' }}>
            <div style={{ flex: 'none', marginRight: 24 }}>
              {paragraph.startTime}
            </div>
            <Typography.Paragraph
              key={paragraph.id}
              style={{ flex: 1, marginBottom: 22 }}
              editable={{
                onChange: (value) => {
                  handleChange(index, value);
                },
                tooltip: '点击编辑',
              }}
            >
              {paragraph.text}
            </Typography.Paragraph>
          </div>
        ))} */}
      </div>
    </Modal>
  );
}

// utils
function formatTime(milliseconds) {
  let seconds = Math.ceil(milliseconds / 1000);
  let miniutes = Math.floor(seconds / 60);
  seconds = seconds - miniutes * 60;
  let hours = Math.floor(miniutes / 60);
  miniutes = miniutes - hours * 60;
  const hourStr = hours < 10 ? '0' + hours : hours;
  const miniuteStr = miniutes < 10 ? '0' + miniutes : miniutes;
  const secondStr = seconds < 10 ? '0' + seconds : seconds;
  return `${hourStr}:${miniuteStr}:${secondStr}`;
}

let uuid = 1;
function formatParagraph(paragraph) {
  const { bg, ed, onebest, speaker } = paragraph;
  const startTime = formatTime(bg);
  return {
    id: uuid++,
    speaker,
    bg,
    ed,
    startTime,
    text: onebest,
    textSpans: [{
      text: onebest,
      matchIndex: -1,
    }],
  };
}

function unformatParagraph(paragraph) {
  const { bg, ed, text, speaker } = paragraph;
  return {
    bg,
    ed,
    onebest: text,
    speaker,
  }
}

function searchInParagraphs(paragraphs, keyword) {
  if (keyword == null || keyword === '') {
    return {
      paragraphs: paragraphs.map((paragraph) => ({
        ...paragraph,
        textSpans: [
          {
            text: paragraph.text,
            matchIndex: -1,
          },
        ],
      })),
      total: 0,
    };
  } 

  const keywordRegExp = new RegExp('(' + keyword + ')');
  const newParagraphs = [];
  let matchIndex = -1;

  paragraphs.forEach((paragraph) => {
    const textSpans = [];
    const spans = paragraph.text.split(keywordRegExp).filter((item) => item !== '');
    spans.forEach((span) => {
      textSpans.push({
        text: span,
        matchIndex: span === keyword ? ++matchIndex : -1,
      });
    });

    newParagraphs.push({
      ...paragraph,
      textSpans,
    });
  });
  return {
    paragraphs: newParagraphs,
    total: matchIndex + 1,
  };
}

export default connect()(SpeechToText);

import {
  SearchOutlined,
  DownOutlined,
  UpOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Input, Divider, Button, Affix, Typography, Form, Modal, message } from "antd";
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { connect } from "dva";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from 'react-use';
import qs from 'qs';
import * as api from '../api';
import LeftRightLayout from "../components/LeftRightLayout";
import { downloadFile } from "../utils/util";

function SpeechToText(props) {
  const [speechUrl, setSpeechUrl] = useState(null);
  const [filename, setFilename] = useState(null);
  const [paragraphs, setParagraphs] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  useDebounce(() => {
    setDebouncedKeyword(keyword);
  }, 500, [keyword]);
  const [current, setCurrent] = useState(-1);
  const [total, setTotal] = useState(0);
  const [textParagraphs, setTextParagraphs] = useState([]);
  const inputElem = useRef(null);
  const [id, setId] = useState(null); // paragraph id
  const [speaker, setSpeaker] = useState(null);
  const [speakerModalVisible, setSpeakerModalVisible] = useState(false);
  const [text, setText] = useState(null);
  const [textModalVisible, setTextModalVisible] = useState(false);
  const audioElem = useRef();
  const audioTimeupdateHandler = useRef();

  const handleChange = (keyword) => {
    setKeyword(keyword);
  };

  const handlePrev = () => {
    if (total === 1) return;
    setCurrent(current > 0 ? current - 1 : total - 1);
  };

  const handleNext = () => {
    if (total === 1) return;
    setCurrent(current < total - 1 ? current + 1 : 0);
  };

  const handleCancelEditSpeaker = () => {
    setId(null);
    setSpeaker(null);
    setSpeakerModalVisible(false);
  };
 
  const handleConfirmEditSpeaker = (values) => {
    const newParagraphs = paragraphs.map((paragraph) => ({
      ...paragraph,
      speaker: paragraph.speaker === speaker ? values.speaker : paragraph.speaker,
    }));
    setId(null);
    setSpeaker(null);
    setSpeakerModalVisible(false);
    setParagraphs(newParagraphs);
    updateAudioTranslate(newParagraphs);
  }

  const handleCancelEditText = () => {
    setId(null);
    setText(null);
    setTextModalVisible(false);
  };

  const handleConfirmEditText = (values) => {
    const newParagraphs = paragraphs.map((paragraph) => ({
      ...paragraph,
      text: paragraph.id === id ? values.text : paragraph.text,
    }));
    setId(null);
    setText(null);
    setTextModalVisible(false);
    setParagraphs(newParagraphs);
    updateAudioTranslate(newParagraphs);
  };

  const updateAudioTranslate = (paragraphs) => {
    const transId = props.match.params.id;
    const onebest = JSON.stringify(paragraphs.map(unformatParagraph));
    api.updateAudioTranslate(transId, { onebest });
  };

  const handleClickTime = (bg, ed) => {
    if (audioElem.current == null) return;

    const startTime = bg / 1000;
    const endTime = ed / 1000;
    if (audioTimeupdateHandler.current) {
      audioElem.current.removeEventListener('timeupdate', audioTimeupdateHandler.current);
    }
    audioTimeupdateHandler.current = () => {
      if (audioElem.current.currentTime >= endTime) {
        audioElem.current.pause();
        audioElem.current.removeEventListener('timeupdate', audioTimeupdateHandler.current);
        audioTimeupdateHandler.current = null;
      }
    };
    audioElem.current.addEventListener('timeupdate', audioTimeupdateHandler.current);
    audioElem.current.currentTime = startTime;
    audioElem.current.play();
  };

  const handleDownload = () => {
    // Documents contain sections, you can have multiple sections per document, go here to learn more about sections
    // This simple example will only contain one section
    const doc = new Document({
      styles: {
        // TODO: 优化样式
        paragraphStyles: [
          {
            id: 'paragraph',
            paragraph: {
              spacing: {
                before: 240,
                after: 240,
              },
            },
          },
        ],
      },
      sections: [{
        properties: {},
        children: paragraphs.map((item) => (
          new Paragraph({
            children: [
              new TextRun(item.text),
            ],
            style: 'paragraph',
          })
        )),
      }],
    });

    // Used to export the file into a .docx file
    Packer.toBlob(doc).then((blob) => {
      const fileName = `${filename}文字记录.docx`;
      const url = URL.createObjectURL(blob);
      downloadFile(url, fileName);
      URL.revokeObjectURL(url);
    });
  };

  useEffect(() => {
    const { textParagraphs, total } = searchInParagraphs(paragraphs, debouncedKeyword);
    setTextParagraphs(textParagraphs);
    setTotal(total);
    setCurrent(total > 0 ? 0 : -1);
  }, [paragraphs, debouncedKeyword]);

  useEffect(() => {
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
  }, [textParagraphs, current]);

  useEffect(() => {
    async function initialize() {
      const id = parseInt(props.match.params.id);
      const search = props.location.search;
      if (id == null) return;

      const res = await api.getAudioTranslate(id);
      // TODO: check taskStatus
      const { onebest, file_name } = res.data;
      if (onebest) {
        try {
          const paragraphs = JSON.parse(onebest);
          setParagraphs(paragraphs.map(formatParagraph));
          setFilename(file_name);
        } catch (error) {
          throw error;
          // TODO: error handle
        }
      }

      if (search) {
        const { speechKey } = qs.parse(search, { ignoreQueryPrefix: true });
        if (speechKey) {
          try {
            const res2 = await api.downloadUrl('file', speechKey);
            const speechUrl = res2.data;
            setSpeechUrl(speechUrl);
          } catch (error) {
            throw error;
            // TODO: error handle
          }
        }
      }
    }
    initialize();

    window.scrollTo(0,0);

    const handleKeyDown = (e) => {
      if (e.keyCode === 114 || ((e.ctrlKey || e.metaKey) && e.keyCode === 70)) { 
        e.preventDefault();

        const selectedText = window.getSelection().toString();
        if (inputElem.current) {
          inputElem.current.focus();
        }
        if (selectedText) {
          setKeyword(selectedText);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <LeftRightLayout location={props.location} title="语音转文字">
      <div>
        <Affix offsetTop={50}>
          <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography.Title level={3} style={{ margin: 0 }}>
                文字记录
              </Typography.Title>
              <Button
                style={{ marginLeft: 8 }}
                size="small"
                disabled={paragraphs.length === 0}
                onClick={handleDownload}
              >
                下载Word
              </Button>
            </div>
            <Finder
              input={inputElem}
              keyword={keyword}
              current={current}
              total={total}
              onChange={handleChange}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </div>
        </Affix>
        <div style={{ padding: 16 }}>
          {textParagraphs.map(({ id, speaker, text, startTime, bg, ed, textSpans }) => (
            <TextParagraph
              key={id}
              speaker={speaker}
              text={text}
              startTime={startTime}
              textSpans={textSpans}
              current={current}
              onEditSpeaker={() => {
                setId(id)
                setSpeaker(speaker);
                setSpeakerModalVisible(true);
              }}
              onEditText={() => {
                setId(id);
                setText(text);
                setTextModalVisible(true);
              }}
              onClickTime={() => {
                handleClickTime(bg, ed);
              }}
            />
          ))}
        </div>
        {speechUrl && (
          <Affix offsetBottom={0}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: 16, background: '#fff' }}>
              <audio ref={audioElem} src={speechUrl} controls style={{ width: 500 }} />
            </div>
          </Affix>
        )}
      </div>
      {speakerModalVisible && (
        <SpeakerModalForm
          speaker={speaker}
          onCancel={handleCancelEditSpeaker}
          onEdit={handleConfirmEditSpeaker}
        />
      )}
      {textModalVisible && (
        <TextModalForm
          text={text}
          onCancel={handleCancelEditText}
          onEdit={handleConfirmEditText}
        />
      )}
    </LeftRightLayout>
  );
}

function TextParagraph({ speaker, onEditSpeaker, onEditText, onClickTime, startTime, textSpans, current }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <Typography.Text>说话人 {speaker}</Typography.Text>
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
          <Typography.Text>{startTime}</Typography.Text>
        </Button>
      </div>
      <Typography.Paragraph>
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
      </Typography.Paragraph>
    </div>
  );
}

function Finder({ input, keyword, current = -1, total = 0, onChange, onPrev, onNext }) {
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
  );
}

function SpeakerModalForm({ speaker, onCancel, onEdit }) {
  const [form] = Form.useForm();
  return (
    <Modal
      visible={true}
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

function TextModalForm({ text, onCancel, onEdit }) {
  const [form] = Form.useForm();
  return (
    <Modal
      visible={true}
      title="修改文字"
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
        name="text_modal_form"
        initialValues={{ text }}
      >
        <Form.Item
          name="text"
          label="文字"
          rules={[{ required: true, message: '请输入文字' }]}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
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
      textParagraphs: paragraphs.map((paragraph) => ({
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
  const textParagraphs = [];
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

    textParagraphs.push({
      ...paragraph,
      textSpans,
    });
  });
  return {
    textParagraphs,
    total: matchIndex + 1,
  };
}

export default connect()(SpeechToText);

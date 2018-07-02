import '../../public/index.html';
import appLocaleData from 'react-intl/locale-data/zh';
import zhMessages from '../../locales/zh.json';
import enMessages from '../../locales/en.json';

window.appLocale = {
  messages: {
    ...zhMessages,
  },
  messagesEn: {
    ...enMessages,
  },
  antd: null,
  locale: 'zh-Hans-CN',
  data: appLocaleData,
};

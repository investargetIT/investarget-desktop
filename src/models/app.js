import * as api from '../api'

export default {
  namespace: 'app',
  state: {
    selectedKeys: [],
    openKeys: [],
    tags: [],
    countries: [],
    titles: [],
    transactionPhases:  [{"name":"种子天使轮","id":1},{"name":"A轮","id":4},{"name":"B轮","id":6},{"name":"C轮","id":7},{"name":"C+轮","id":8},{"name":"Pre-IPO","id":10},{"name":"兼并收购","id":11}],
    areas: [{"areaName":"上海","id":1},{"areaName":"北京","id":2},{"areaName":"天津","id":3},{"areaName":"重庆","id":4},{"areaName":"深圳","id":5},{"areaName":"香港","id":6},{"areaName":"台湾","id":7},{"areaName":"广州","id":8},{"areaName":"杭州","id":9},{"areaName":"武汉","id":10},{"areaName":"成都","id":11},{"areaName":"沈阳","id":12},{"areaName":"南京","id":13},{"areaName":"济南","id":14},{"areaName":"郑州","id":15},{"areaName":"长沙","id":16},{"areaName":"哈尔滨","id":17},{"areaName":"石家庄","id":18},{"areaName":"长春","id":19},{"areaName":"福州","id":20},{"areaName":"西安","id":21},{"areaName":"合肥","id":22},{"areaName":"南昌","id":23},{"areaName":"昆明","id":24},{"areaName":"太原","id":25},{"areaName":"呼和浩特","id":26},{"areaName":"南宁","id":27},{"areaName":"乌鲁木齐","id":28},{"areaName":"兰州","id":29},{"areaName":"贵阳","id":30},{"areaName":"银川","id":31},{"areaName":"海口","id":32},{"areaName":"西宁","id":33},{"areaName":"拉萨","id":34},{"areaName":"宁波","id":35},{"areaName":"青岛","id":36},{"areaName":"江苏","id":37},{"areaName":"苏州","id":38},{"areaName":"应城","id":39},{"areaName":"福建","id":40},{"areaName":"株洲","id":41},{"areaName":"大连","id":42},{"areaName":"上虞","id":43},{"areaName":"佛山","id":44},{"areaName":"宁德","id":45},{"areaName":"济宁","id":46},{"areaName":"厦门","id":47},{"areaName":"衡阳","id":48},{"areaName":"泰州","id":49},{"areaName":"滁州","id":50},{"areaName":"台北","id":51},{"areaName":"淮南","id":52},{"areaName":"东莞","id":53},{"areaName":"昆山","id":54},{"areaName":"常熟","id":55},{"areaName":"甘肃","id":56},{"areaName":"洛阳","id":57},{"areaName":"嘉兴","id":58},{"areaName":"中山","id":59},{"areaName":"绍兴","id":60},{"areaName":"珠海","id":61},{"areaName":"烟台","id":62},{"areaName":"南通","id":63},{"areaName":"无锡","id":64},{"areaName":"徐州","id":65},{"areaName":"扬州","id":66},{"areaName":"张家港","id":67},{"areaName":"汕头","id":68},{"areaName":"旧金山","id":69},{"areaName":"盘锦","id":70},{"areaName":"惠州","id":71},{"areaName":"芜湖","id":72},{"areaName":"潍坊","id":73},{"areaName":"许昌","id":74},{"areaName":"唐山","id":75},{"areaName":"景德镇","id":76},{"areaName":"邯郸","id":77},{"areaName":"吉林","id":78},{"areaName":"宜昌","id":79},{"areaName":"聊城","id":80},{"areaName":"赤峰","id":81},{"areaName":"张家界","id":82},{"areaName":"寿光","id":83},{"areaName":"南充","id":84},{"areaName":"德阳","id":85},{"areaName":"江阴","id":86},{"areaName":"湘潭","id":87},{"areaName":"柳州","id":88},{"areaName":"白银","id":89},{"areaName":"荆州","id":90},{"areaName":"泰安","id":91},{"areaName":"宝鸡","id":92},{"areaName":"泸州","id":93},{"areaName":"常州","id":94},{"areaName":"江门","id":95},{"areaName":"北海","id":96},{"areaName":"伊春","id":97},{"areaName":"亳州","id":98},{"areaName":"韶关","id":99},{"areaName":"包头","id":100},{"areaName":"焦作","id":101},{"areaName":"三亚","id":102},{"areaName":"襄阳","id":103},{"areaName":"岳阳","id":104},{"areaName":"敦化","id":105},{"areaName":"连云港","id":106},{"areaName":"荆门","id":107},{"areaName":"攀枝花","id":108},{"areaName":"铜陵","id":109},{"areaName":"石嘴山","id":110},{"areaName":"肇庆","id":111},{"areaName":"茂名","id":112},{"areaName":"滨州","id":113},{"areaName":"淄博","id":114},{"areaName":"梧州","id":115},{"areaName":"永安","id":116},{"areaName":"大同","id":117},{"areaName":"鄂尔多斯","id":118},{"areaName":"保定","id":119},{"areaName":"梅州","id":120},{"areaName":"咸阳","id":121},{"areaName":"黄石","id":122},{"areaName":"玉林","id":123},{"areaName":"遂宁","id":124},{"areaName":"三明","id":125},{"areaName":"运城","id":126},{"areaName":"东阳","id":127},{"areaName":"桂林","id":128},{"areaName":"葫芦岛","id":129},{"areaName":"漳州","id":130},{"areaName":"临汾","id":131},{"areaName":"内江","id":132},{"areaName":"本溪","id":133},{"areaName":"通化","id":134},{"areaName":"武安","id":135},{"areaName":"上饶","id":136},{"areaName":"格尔木","id":137},{"areaName":"吉首","id":138},{"areaName":"绵阳","id":139},{"areaName":"铁岭","id":140},{"areaName":"盐城","id":141},{"areaName":"凌海","id":142},{"areaName":"赣州","id":143},{"areaName":"贵港","id":144},{"areaName":"承德","id":145},{"areaName":"安庆","id":146},{"areaName":"宜宾","id":147},{"areaName":"宣城","id":148},{"areaName":"峨眉山","id":149},{"areaName":"秦皇岛","id":150},{"areaName":"漯河","id":151},{"areaName":"鞍山","id":152},{"areaName":"丹阳","id":153},{"areaName":"温岭","id":154},{"areaName":"临沂","id":155},{"areaName":"佳木斯","id":156},{"areaName":"张家口","id":157},{"areaName":"汉川","id":158},{"areaName":"蚌埠","id":159},{"areaName":"永城","id":160},{"areaName":"江油","id":161},{"areaName":"邢台","id":162},{"areaName":"新乡","id":163},{"areaName":"武穴","id":164},{"areaName":"河池","id":165},{"areaName":"海门","id":166},{"areaName":"仙桃","id":167},{"areaName":"锡林郭勒盟","id":168},{"areaName":"开平","id":169},{"areaName":"宿州","id":170},{"areaName":"黄山","id":171},{"areaName":"灵武","id":172},{"areaName":"大庆","id":173},{"areaName":"武威","id":174},{"areaName":"临海","id":175},{"areaName":"诸暨","id":176},{"areaName":"丽水","id":177},{"areaName":"马鞍山","id":178},{"areaName":"临安","id":179},{"areaName":"台州","id":180},{"areaName":"威海","id":181},{"areaName":"晋江","id":182},{"areaName":"揭阳","id":183},{"areaName":"丽江","id":184},{"areaName":"湖州","id":185},{"areaName":"莱州","id":186},{"areaName":"淮北","id":187},{"areaName":"江山","id":188},{"areaName":"瑞安","id":189},{"areaName":"平湖","id":190},{"areaName":"莆田","id":191},{"areaName":"德州","id":192},{"areaName":"镇江","id":193},{"areaName":"高密","id":194},{"areaName":"南阳","id":195},{"areaName":"即墨","id":196},{"areaName":"永州","id":197},{"areaName":"泉州","id":198},{"areaName":"沧州","id":199},{"areaName":"兴平","id":200},{"areaName":"曲靖","id":201},{"areaName":"慈溪","id":202},{"areaName":"余姚","id":203},{"areaName":"霍林郭勒","id":204},{"areaName":"巩义","id":205},{"areaName":"海宁","id":206},{"areaName":"嘉峪关","id":207},{"areaName":"廊坊","id":208},{"areaName":"温州","id":209},{"areaName":"宜春","id":210},{"areaName":"天水","id":211},{"areaName":"金华","id":212},{"areaName":"如皋","id":213},{"areaName":"克拉玛依","id":214},{"areaName":"扬中","id":215},{"areaName":"陇南","id":216},{"areaName":"濮阳","id":217},{"areaName":"宁国","id":218},{"areaName":"蓬莱","id":219},{"areaName":"自贡","id":220},{"areaName":"禹城","id":221},{"areaName":"林芝","id":222},{"areaName":"南平","id":223},{"areaName":"宿迁","id":224},{"areaName":"信阳","id":225},{"areaName":"诸城","id":226},{"areaName":"普宁","id":227},{"areaName":"龙口","id":228},{"areaName":"长葛","id":229},{"areaName":"忻州","id":230},{"areaName":"潜江","id":231},{"areaName":"眉山","id":232},{"areaName":"桐乡","id":233},{"areaName":"黔南布依族苗族自治州","id":234},{"areaName":"宜兴","id":235},{"areaName":"益阳","id":236},{"areaName":"济源","id":237},{"areaName":"安顺","id":238},{"areaName":"临沧","id":239},{"areaName":"启东","id":240},{"areaName":"沙河","id":241},{"areaName":"瓦房店","id":242},{"areaName":"孟州","id":243},{"areaName":"青铜峡","id":244},{"areaName":"新余","id":245},{"areaName":"东营","id":246},{"areaName":"新郑","id":247},{"areaName":"招远","id":248},{"areaName":"阜新","id":249},{"areaName":"雅安","id":250},{"areaName":"辽源","id":251},{"areaName":"怀化","id":252},{"areaName":"南安","id":253},{"areaName":"新沂","id":254},{"areaName":"太仓","id":255},{"areaName":"林州","id":256},{"areaName":"胶州","id":257},{"areaName":"偃师","id":258},{"areaName":"集安","id":259},{"areaName":"曲阜","id":260},{"areaName":"章丘","id":261},{"areaName":"永康","id":262},{"areaName":"义乌","id":263},{"areaName":"海东","id":264},{"areaName":"山南地区","id":265},{"areaName":"龙岩","id":266},{"areaName":"鄂州","id":267},{"areaName":"阿克苏","id":268},{"areaName":"郴州","id":269},{"areaName":"昌吉","id":270},{"areaName":"莱阳","id":271},{"areaName":"台山","id":272},{"areaName":"乐清","id":273},{"areaName":"巢湖","id":274},{"areaName":"乐平","id":275},{"areaName":"简阳","id":276},{"areaName":"商丘","id":277},{"areaName":"枣庄","id":278},{"areaName":"酒泉","id":279},{"areaName":"乌兰察布","id":280},{"areaName":"鹰潭","id":281},{"areaName":"开封","id":282},{"areaName":"辽阳","id":283},{"areaName":"潮州","id":284},{"areaName":"桐城","id":285},{"areaName":"什邡","id":286},{"areaName":"湛江","id":287},{"areaName":"丰城","id":288},{"areaName":"石河子","id":289},{"areaName":"汉中","id":290},{"areaName":"沅江","id":291},{"areaName":"长治","id":292},{"areaName":"浏阳","id":293},{"areaName":"衢州","id":294},{"areaName":"常德","id":295},{"areaName":"十堰","id":296},{"areaName":"抚州","id":297},{"areaName":"昌邑","id":298},{"areaName":"靖江","id":299},{"areaName":"丹东","id":300},{"areaName":"恩平","id":301},{"areaName":"奉化","id":302},{"areaName":"莱芜","id":303},{"areaName":"云浮","id":304},{"areaName":"嵊州","id":305},{"areaName":"日照","id":306},{"areaName":"清远","id":307},{"areaName":"遵义","id":308},{"areaName":"晋城","id":309},{"areaName":"阿坝藏族羌族自治州","id":310},{"areaName":"塔城","id":311},{"areaName":"晋中","id":312},{"areaName":"齐齐哈尔","id":313},{"areaName":"牡丹江","id":314},{"areaName":"项城","id":315},{"areaName":"邹城","id":316},{"areaName":"锦州","id":317},{"areaName":"伊犁哈萨克自治州","id":318},{"areaName":"阜阳","id":319},{"areaName":"安阳","id":320},{"areaName":"铜川","id":321},{"areaName":"凌源","id":322},{"areaName":"舟山","id":323},{"areaName":"阳江","id":324},{"areaName":"库尔勒","id":325},{"areaName":"普洱","id":326},{"areaName":"乌海","id":327},{"areaName":"当阳","id":328},{"areaName":"贺州","id":329},{"areaName":"平顶山","id":330},{"areaName":"营口","id":331},{"areaName":"阿拉善盟","id":332},{"areaName":"阳泉","id":333},{"areaName":"阿拉尔","id":334},{"areaName":"贵溪","id":335},{"areaName":"兴宁","id":336},{"areaName":"六盘水","id":337},{"areaName":"萍乡","id":338},{"areaName":"抚顺","id":339},{"areaName":"义马","id":340},{"areaName":"介休","id":341},{"areaName":"磐石","id":342},{"areaName":"图们","id":343},{"areaName":"荣成","id":344},{"areaName":"涿州","id":345},{"areaName":"六安","id":346},{"areaName":"西昌","id":347},{"areaName":"仁怀","id":348},{"areaName":"博乐","id":349},{"areaName":"衡水","id":350},{"areaName":"兰溪","id":351},{"areaName":"建德","id":352},{"areaName":"乐山","id":353},{"areaName":"福清","id":354},{"areaName":"周口","id":355},{"areaName":"汾阳","id":356},{"areaName":"保山","id":357},{"areaName":"三河","id":358},{"areaName":"广安","id":359},{"areaName":"文山","id":360},{"areaName":"七台河","id":361},{"areaName":"韩城","id":362},{"areaName":"昌江黎族自治县","id":363},{"areaName":"延边朝鲜族自治州","id":364},{"areaName":"池州","id":365},{"areaName":"淮安","id":366},{"areaName":"虎林","id":367}],
  },
  reducers: {
    menuOpen(state, { payload: openKeys }) {
      return { ...state, openKeys }
    },
    menuSelect(state, { payload: selectedKeys }) {
      return { ...state, selectedKeys }
    },
    saveTags(state, { payload: tags }) {
      return { ...state, tags }
    },
    saveCountries(state, { payload: countries }) {
      return { ...state, countries }
    },
    saveTitles(state, { payload: titles }) {
      return { ...state, titles }
    },
  },
  effects: {
    *requestTags({}, { call, put }) {
      const { data } = yield call(api.getTags)
      yield put({ type: 'saveTags', payload: data })
    },
    *getTags({}, { put, select }) {
      const tags = yield select(state => state.app.tags)
      tags.length > 0 || (yield put({ type: 'requestTags' }))
    },
    *requestCountries({}, { call, put }) {
      const { data } = yield call(api.getCountries)
      yield put({ type: 'saveCountries', payload: data })
    },
    *getCountries({}, { put, select }) {
      const countries = yield select(state => state.app.countries)
      countries.length > 0 || (yield put({ type: 'requestCountries' }))
    },
    *requestTitles({}, { call, put }) {
      const { data } = yield call(api.getTitles)
      yield put({ type: 'saveTitles', payload: data })
    },
    *getTitles({}, { put, select }) {
      const titles = yield select(state => state.app.titles)
      titles.length > 0 || (yield put({ type: 'requestTitles' }))
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname }) => {
        // TODO 路径不在 menu 中时，selectedKeys 为 []
        const selectedKeys = [pathname]
        dispatch({
          type: 'menuSelect',
          payload: selectedKeys
        })
        // TODO 设置 selectedKeys 的同时设置 openKeys
      })
    }
  },
};

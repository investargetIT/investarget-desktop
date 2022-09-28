# Docker
* `docker build . -t investarget-desktop-frontend`
* `docker run -p 8000:8000 -v $(pwd):/usr/src/app -v /usr/src/app/node_modules investarget-desktop-frontend`

# Migration to Antd V4
* Table Column `dataIndex` 不再支持`.`，需要使用 Array
* 不再支持 `<Icon type="value" >`
* 不再支持 `Form.create()`, 属性全部直接移到 `<Form>` 中
* 不再支持 `getFieldDecorator()`, 属性全部直接移到 `<Form.Item>` 中
* `getFieldValue()` 使用方式变化，使用 `ref` 获取实例然后调方法，如果是根据值来显示或隐藏控件，用法见 `Register1.js`
* 遇到类似 `React does not recognize the ... prop` 报错，需要把这些不认识的 `props` 排除掉再传递给组件，https://reactjs.org/warnings/unknown-prop.html
* [antd: Checkbox] `value` is not a valid prop, do you mean `checked`, https://github.com/ant-design/ant-design/issues/20803#issuecomment-601626759
* [antd: Form.Item] `children` is array of render props cannot have `name`, 这是要求 Form.Item 只能包含一子组件
* 涉及到表单组件复用的可能需要 `React.forwardRef()`, 参考 ScheduleForm 组件
* 获取URL参数值时，使用util中的 `getURLParamValue()`

# Important #

为了能够使用IP地址访问，请修改`node_modules/roadhog/lib/runServer.js`文件，在193行左右的`runDevServer`方法中的`devServer`变量最后加上`disableHostCheck: true`，否则通过IP地址访问会报`Invalid Host Header`。

支持 URL 重写，请修改`node_modules/roadhog/lib/runServer.js`文件，在`runDevServer`方法中的 webpack-dev-server 配置中加上
```
historyApiFallback: {
  rewrites: [
    { from: /^\/en\//, to: '/index-en.html' },
    { from: /^\//, to: '/index.html' },
  ]
},
```

## 升级依赖：
`antd` 2.10.0 升级到 2.11.0

最新版本的 Upload 组件 onRemove 才支持返回一个 Promise 对象

## Dataroom
一共有三种类型的 dataroom, 公共 dataroom, 投资人 dataroom, 项目方 dataroom。
公共 dataroom 和项目方 dataroom 是在项目状态变为终审发布后由系统自动创建的。
投资人 dataroom 需要手动创建。

### 与 Dataroom 有关的用户
1. 投资人
2. 交易师
3. 项目方
4. 承揽
5. 承做
6. 创建者（投资人 dataroom 的创建者）

### Dataroom 访问权限
1. 公共 dataroom 任何人都可以访问
2. 项目方 dataroom 除了投资人和交易师之外其余相关用户都能访问
3. 投资人 dataroom 除了项目方之外其余相关用户都能访问

### 关于Dataroom文件操作的一些规则
1. 当 dataroom 为关闭状态时，所以操作都无法执行
2. 上传、新建文件夹、删除和复制这四个操作需要管理员添加 dataroom 权限
3. 文件（不是文件夹）是不能复制或移动的
4. 在影子目录或虚拟目录中，不能进行任何操作（包括上传和新建文件夹）
5. 移动操作只有在跨 dataroom 的时候才允许执行

## favoritetype类型说明
1-系统推荐，2-后台人员推荐，3-交易师推荐，4-主动收藏，5-感兴趣

## 发布

### 测试环境
```
NODE_ENV=development yarn build
scp -r dist/* summer@192.168.1.251:/var/www/investarget-web/investarget-desktop/
```

### 生产环境
```
yarn build
scp -r dist/* root@www.investarget.com:/var/www/investarget-web/investarget-desktop/
```
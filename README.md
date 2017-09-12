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

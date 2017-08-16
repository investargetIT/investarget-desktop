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

## 关于Dataroom文件操作的一些规则
1. 当dataroom为关闭状态时，所以操作都无法执行
2. 上传、新建文件夹、删除和复制这四个操作需要管理员添加dataroom权限
3. 文件（不是文件夹）是不能复制或移动的
4. 在影子目录或虚拟目录中，不能进行任何操作（包括上传和新建文件夹）

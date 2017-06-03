# 在多页面项目下使用 Webpack + Vue
# start
## vue-cli
<b>init project</b>
```
$ npm install -g vue-cli
$ vue init Plortinus/vue-multiple-pages new-project
$ cd new-project
$ npm install
```
## 常用命令
```
# 开发运行
$ npm run dev

#编译运行
$ npm run build
$ node server.js
```

## 项目目录结构
```
├─src(源代码目录)
│   ├─assets(公共资源)
│   ├─components(公共组件)
│   ├─module(页面模块)
│   │   ├─user(用户模块)
│   │   │   ├─components(模块公共组件)
│   │   │   ├─scss(模块scss文件)
│   │   │   ├─login(登录模块)
│   │   │   │   ├─app.js(entry 文件)
│   │   │   │   ├─app.html(template，可省略)
│   │   │   │   ├─app.vue(登录模块逻辑)
│   │   │   └─index
│   │   │       ├─app.js
│   │   │       ├─app.html
│   │   │       └─app.vue
│   │   └─module1(其他模块)
│   │       ├─components
│   │       ├─scss
│   │       ├─login
│   │       └─index
│   └─app.html(子模块app.html省略时使用)
└─server.js(编译后的web server)

```
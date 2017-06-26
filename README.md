# nhry-front


#### 项目构建
1. 本地安装[Nodejs](https://nodejs.org/en/)最新版本4.4.4<br>
安装完成后，查看是否输出对应版本：`node -v`
2. 本地安装Grunt命令行（CLI），指定-g安装到全局环境：`npm install -g grunt-cli`<br>
若是windows系统，用管理员运行的方式打开cmd，再执行命令<br>
若是Linux操作系统，加上sudo
3. 从项目仓库上fork前端项目nhry-front，并clone到本地
4. 本地进入项目目录，安装项目依赖包：`npm install`<br>

> 注：项目初始状态已经安装了开发需要的第三方包，无需用`bower install`重新安装

#### 项目结构
```
nhry-front
├── scripts：js脚本
│   ├── api: 测试用假数据（json文件）
│   ├── controllers: 控制器脚本
│   │   ├── basic_info：基础信息脚本合集
│   │   ├── orders：订单管理脚本合集
│   │   ├── milk_trans：送奶管理脚本合集
│   │   ├── billing：结算管理脚本合集
│   │   └── statistic：统计查询脚本合集
│   ├── directives: 指令脚本
│   ├── filters: 过滤器脚本
│   └── services: 服务脚本
├── assets：静态css，图片，字体等文件
│   └── styles：自定义css文件
├── html：依赖jQuery的视图文件（暂时不用）
├── libs：第三方依赖包
└── views：依赖于angularjs的视图文件，按业务功能划分
    ├── layout：页面布局模板
    ├── home：首页
    ├── basic_info：基础信息页面合集
    ├── orders：订单管理页面合集
    ├── milk_trans：送奶管理页面合集
    ├── billing：结算管理页面合集
    └── statistic：统计查询页面合集

```
> 注：将新增文件按项目结构放在对应的文件夹下面

#### 开发规范
1. **命名**：新增文件必须以`nh_xxx_xxx.html/js/css...`的形式命名
2. **第三方依赖包**：若在开发过程中需要使用新的第三方组件，为避免重复，请先告知其他前端开发者，并提供组件名字，对应版本及文件存放路径（应放到libs文件夹下）

#### 项目打包
本地进入项目目录，运行命令：`grunt build`

#### 项目发布
本地进入项目目录，运行命令：`grunt release`

#### 前端跨域问题解决方法
采用nginx反向代理解决跨域<br>

本地配置
1. 下载nginx，在任意目录下解压，解压后替换conf文件夹下的nginx.conf文件
2. 在nginx.conf中**后端服务实际地址**可根据项目请求需要进行修改
3. 本地开发时先启动http-server和nginx，然后在浏览器中使用http://localhost/local/ 访问

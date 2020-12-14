# eForm project 2020

Xây dựng dịch vụ quản lý kho biểu mẫu.

## Prerequisites

Một số cài đặt cần thiết:
- [Node.js](https://nodejs.org/en/download) - Server side runtime environment
- [npm](https://www.npmjs.com/get-npm) - Package manager (Có thể được phát hành kèm bộ cài đặt Node.js)
- Một trình code editor như [VS Code](https://code.visualstudio.com/download), Sublime Text, Webstorm,...

## Run

###### Bước 1:

> Download hoặc clone repo: [eForm](http://git.mitc.vn/ledinhluongstd/2020-e-form.git)

###### Buớc 2:

Cài đặt dependencies:

> Mở cmd

> cd frontend-reactjs

> npm i -save

###### Bước 3:

Run project:

> npm start

### - Tests

<!-- Thêm hướng dẫn test -->

<!--
### Coding conventions
Thêm rules
 -->

### - Deployment

<!-- Thêm hướng dẫn deploy lên một hệ thống test/thực sự -->

<!--
## Features

### - Available

##### Core features

- Authenticate (JWT)
- Routing (Express.js)

##### Function features

- Login

### - incoming features
 -->
 
<!--
## Libraries & Tools used

- [ReactJS](https://nodejs.org/en/docs/) - Front-end framework
- [npm](http://www.dropwizard.io/1.0.2/docs/) - Package manager
- [MongoDB](https://docs.mongodb.com/manual/) - NoSQL database program
- [Restheart](https://restheart.org/docs/) - REST API Microservice for MongoDB
- [express](https://expressjs.com/) - The de facto standard server framework for Node.js.
- [axios](https://github.com/axios/axios) - A popular promise-based HTTP client.
- [formidable](https://github.com/node-formidable/formidable) - A Node.js module for parsing form data, especially file uploads.
- [jsonwebtoken]() - An internet standard for creating JSON-based access tokens that assert some number of claims.
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js#readme) - Optimized bcrypt in JavaScript with zero dependencies.
- [nodemon](https://nodemon.io/) - A utility that will monitor for any changes in your source and automatically restart your server.
- [cors](https://github.com/expressjs/cors#readme) - A Node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
- [express-validation](https://github.com/andrewkeig/express-validation) - An express middleware that validates a request and returns a response with errors; if any of the configured validation rules fail.
- [morgan](https://github.com/expressjs/morgan#readme) - HTTP request logger middleware for Node.js.
- [body-parser](https://github.com/expressjs/body-parser#readme) - Node.js body parsing middleware.
- [multer](https://github.com/expressjs/multer#readme) - A Node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
- [cookie-parser](https://github.com/expressjs/cookie-parser#readme) - HTTP request cookies parser.
- [redis](https://github.com/NodeRedis/node-redis) - A fast and efficient in-memory key-value store.
- [moment](https://momentjs.com/) - Parse, validate, manipulate, and display dates and times in JavaScript.
- [debug](https://github.com/visionmedia/debug#readme) - A tiny JavaScript debugging utility modelled after Node.js core's debugging technique.
- [speakeasy](http://github.com/speakeasyjs/speakeasy) - A one-time passcode generator, ideal for use in two-factor authentication, that supports Google Authenticator and other two-factor devices.
- [uuid](https://github.com/uuidjs/uuid#readme) - Generate RFC-compliant UUIDs in JavaScript.

###### dev dependencies

- [babel-cli](https://babeljs.io/docs/en/6.26.3/babel-cli) - A built-in CLI which can be used to compile files from the command line.
- [babel-preset-env](https://babeljs.io/docs/en/babel-preset-env) - A smart preset that allows you to use the latest JavaScript without needing to micromanage which syntax transforms (and optionally, browser polyfills) are needed by your target environment(s).
- [babel-preset-es2015](https://babeljs.io/docs/en/babel-preset-es2015/)
- [babel-preset-es2017](https://babeljs.io/docs/en/babel-preset-es2017/)
- [babel-preset-stage-0](https://babeljs.io/docs/en/babel-preset-stage-0)
- [babel-plugin-transform-runtime](https://babeljs.io/docs/en/babel-plugin-transform-runtime) - A toolchain that is mainly used to convert ECMAScript 2015+ code into a backwards compatible version of JavaScript in current and older browsers or environments.
-->

## Folder structure

- Cấu trúc thư mục trong dự án

```
2020-e-form/
|-- src/
|-- config.js
|-- webpack.config.js
|-- package.json
|-- .babelrc
```

- Giải thích

```
1.  src - source code dự án
2.  config.js - file cấu hình app (port, method,...)
3.  webpack.config.js - file cấu hình webpack
4.  package.json - Khai báo các module, thư viện cần thiết,...
5. .babelrc - Tệp tin config của Babel.io
```

### - src

```
2020-e-form/src/
|-- common/
    |-- assets/ - thư mục chứa fonts, ảnh, lib js, css,...
    |-- util - chứa các file config, constant, function,...
|-- controller/
    |-- redux/ - redux controller
    |-- services - khai báo các network services
    |-- api.js - khai báo các endpoint
|-- interface/
    |-- components/ - các components chung
    |-- navigation/ - app navigation
    |-- screens - Các màn hình chính
|-- report/ - Phần báo cáo stimulsoft
|-- favicon.ico
|-- index.html - HTML entry
|-- index.js - App entry
```


<!-- 
## Wiki

Truy cập [**Wiki**]() để xem chi tiết

## Conclusion

Chúng tôi sẽ sẵn lòng trả lời bất kỳ câu hỏi nào của bạn về dự án này và nếu bạn muốn giúp một tay phát triển boilerplate này thì hãy thoải mái đóng góp issue và/hoặc pull request 🙂.
-->
<!-- Một điều cần lưu ý, đây là ví dụ có thể xuất hiện dưới dạng kiến ​​trúc quá mức cho những gì nó nên là - nhưng nó chỉ là một ví dụ. Nếu bạn thích công việc của chúng tôi, đừng quên ⭐ repo để thể hiện sự ủng hộ của bạn.-->
"# 2020-dvc-frontend-reactjs" 

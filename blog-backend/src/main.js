// 해당 디렉토리를 대표하는 파일
require('dotenv').config();
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { connect } from 'mongoose'; // mongoose를 이용해서 서버와 데이터베이스 연결하기

import api from './api';
import createFakeData from './createFakeData';
import jwtMiddleware from './lib/jwtMiddleware';

// 비구조화 할당을 통해 precess.env 내부 값에 대한 레퍼런스 만들기.
const { PORT, MONGO_URI } = process.env;

connect('mongodb://localhost:27017/blog')
  .then(() => {
    console.log('Connected to MongoDB');
    //  createFakeData();
  })
  .catch((e) => {
    console.error(e);
  });

const app = new Koa();
const router = new Router();

// 모듈화
router.use('/api', api.routes()); // api라우트 적용

// 라우트 전에 bodyParser 적용
app.use(bodyParser());
app.use(jwtMiddleware);

// app인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

// app.listen(4000, () => {
//   console.log('Listening to port 4000', router.routes());
// });
const port = PORT || 4000; // PORT가 지정안되어있으면 4000사용
app.listen(port, () => {
  console.log('Listening to port %d', port);
});
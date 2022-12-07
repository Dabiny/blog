// let postId = 1; // id의 초기값.

// // posts 배열 초기 데이터
// const posts = [
//     {
//         id: 1,
//         title: '제목',
//         body: '내용'
//     },
// ];

// // 포스트 작성
// // POST /api/posts
// // {title, body}
// export function write(ctx) {
//     // REST API의 Request Body는 ctx.request.body에서 조회할 수 있음.
//     const {title, body} = ctx.request.body;
//     postId++;
//     const post = { id: postId, title, body };
//     posts.push(post);
//     ctx.body = post;
// }

// // 포스트 목록 조회
// // GET /api/posts
// export function list(ctx) {
//     ctx.body = posts;
// }

// // 특정 포스트 조회
// // GET /api/posts/:id
// export function read(ctx) {
//     const { id } = ctx.params;
//     // 주어진 id값으로 포스트를 찾는다.
//     // 파라미터로 받아 온 값은 문자열 형식이므로 파라미터를 숫자로 변환하거나 비교할 p.id값을 문자열로 변경
//     const post = posts.find(p => p.id.toString() === id);
//     if (!post) {
//         ctx.status = 404;
//         ctx.body = {
//             message: '포스트가 존재하지 않습니다..'
//         };
//         return;
//     }
//     ctx.body = post; // find한 포스트 넣기.
// }

// // 특정 포스트 제거
// // DELETE /api/posts/:id
// export function remove(ctx) {
//     const { id } = ctx.params;
//     const index = posts.findIndex(p => p.id.toString() === id);
//     if(index === -1) {
//         ctx.status = 404;
//         ctx.body = {
//             message: '포스트가 존재하지 않습니다..'
//         };
//         return;
//     }
//     posts.splice(index, 1); // index번째 아이템제거
//     ctx.status = 204;
// }

// // 포스트 수정(교체)
// // PUT /api/posts/:id
// // {title, body}

// export function replace(ctx) {
//   // PUT 메서드는 전체 포스트 정보를 입력해서 데이터를 통째로 교체할 떄 사용한다.
//   const { id } = ctx.params;
//   // 해당 id가 몇번쨴지 확인
//   const index = posts.findIndex((p) => p.id.toString() === id);
//   if (index === -1) {
//     ctx.status = 404;
//     ctx.body = {
//       message: '포스트가 존재하지 않습니다.',
//     };
//     return;
//   }
//   // 전체 객체를 덮어 씌운다.
//   // 따라서 id를 제외한 기존 정보를 날리고 객체를 새로 만든다.
//   posts[index] = {
//     id,
//     ...ctx.request.body,
//   };
//   ctx.body = posts[index];
// }

// // 포스트 수정(특정 필드 요청)
// // PATCH /api/posts/:id
// // {title, body}
// export function update(ctx) {
//     // PUT 메서드는 전체 포스트 정보를 입력해서 데이터를 통째로 교체할 떄 사용한다.
//     const { id } = ctx.params;
//     // 해당 id가 몇번쨴지 확인
//     const index = posts.findIndex(p => p.id.toString() === id);
//     if (index === -1) {
//         ctx.status = 404;
//         ctx.body = {
//             message: '포스트가 존재하지 않습니다.'
//         };
//         return;
//     }
//     // 전체 객체를 덮어 씌운다.
//     // 따라서 id를 제외한 기존 정보를 날리고 객체를 새로 만든다.
//     posts[index] = {
//         ...posts[index],
//         ...ctx.request.body,
//     };
//     ctx.body = posts[index];
// }

// MongoDB를 활용한 RESTAPI
import mongoose from 'mongoose';
import Joi from 'joi';
import Post from '../../models/post';

const { ObjectId } = mongoose.Types;

export const checkObjectId = (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400; // bad Request
    return;
  }
  return next();
};

// 블로그 포스트 작성
// export const write = async (ctx) => {
//   const { title, body, tags } = ctx.request.body;
//   const post = new Post({
//     title,
//     body,
//     tags,
//   });

//   try {
//     await post.save();
//     ctx.body = post;
//   } catch (e) {
//     ctx.throw(500, e);
//   }
// };

// ⭐️joi 라이브러리 사용예시
export const write = async (ctx) => {
  const schema = Joi.object().keys({
    // 객체가 다음 필드를 가지고 있음을 검증한다.
    title: Joi.string().required(), // required()가있으면 필수 항목이다.
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(), // 문자열로 이루어진 배열
  });

  const request = schema.validate(ctx.request.body); // 검사하기
  if (request.error) {
    ctx.status = 400; // bad request
    ctx.body = request.error;
    return;
  }

  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body,
    tags
  });
  
  try {
    await post.save();
    ctx.body = post;
  }
  catch(e) {
    ctx.throw(500, e);
  }

};

// 데이터 조회 (블로그글 조회)
export const list = async (ctx) => {
  // 쿼리는 문자열이기때문에 숫자로 변환해줘야한다. 
  const page = parseInt(ctx.query.page || '1', 10);
  if (page < 1) {
    ctx.status = 400;
    return;
  }
  
  try {
    // const posts = await Post.find().exec(); // 데이터 조회시 모델 인스턴스의 find함수 적용, exec()는 서버에 쿼리를 요청.
    const posts = await Post.find().sort({ _id: -1 }).limit(10).skip((page - 1) * 10).exec(); // 정렬 , 보이는 개수 제한 사용, skip 다음페이지넘어가기
    const postCount = await Post.countDocuments().exec();
    ctx.set('Last-page', Math.ceil(postCount / 10));
    // 200자 이상일때 ...을 붙이고 문자열을 자르는 기능
    ctx.body = posts.map(post => post.toJSON()).map(post => ({
      ...post,
      body:
        post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
    }));
  } catch (e) {
    ctx.throw(500, e);
  }
};
// 특정 블로그글 조회
export const read = async (ctx) => {
  const { id } = ctx.params;
  try {
    const post = await Post.findById(id).exec(); // 특정데이터 조회시 findById()사용
    if (!post) {
      ctx.status = 404; // not found
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};
export const remove = async (ctx) => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndDelete(id).exec(); // id를 찾아서 지운다.
    ctx.status = 204; // No Content (성공하기는 했지만 응답할 데이터는 없다.)
  } catch (e) {
    ctx.throw(500, e);
  }
};

// export const update = async (ctx) => {
//   const { id } = ctx.params;
//   try {
//     const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
//       // id, 업데이트 내용, 업데이트 옵션
//       new: true, // 이 값을 설정하면 업데이트된 데이터를 반환한다.
//     }).exec();
//     if (!post) {
//       ctx.status = 404;
//       return;
//     }
//     ctx.body = post;
//   } catch (e) {
//     ctx.throw(500, e);
//   }
// };

// ⭐️joi 사용 update
export const update = async(ctx) => {
  const { id } = ctx.params;
  // write에서 사용한 스키마와 비슷하지만 required가 없다. 
  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });
  
  const result = schema.validate(ctx.request.body);
  if(result.error) {
    ctx.status = 400; // bad request
    ctx.body = result.error;
    return;
  }

  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, { new: true }).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  }
  catch(e) {
    ctx.throw(500, e);
  }
};

// 기존 구현했던 replace는 구현하지 않을것이다.

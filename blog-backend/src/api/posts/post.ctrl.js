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
import Post from '../../models/post';

// 블로그 포스트 작성
export const write = async (ctx) => {
  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body,
    tags,
  });

  try {
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};
// 데이터 조회 (블로그글 조회)
export const list = async (ctx) => {
  try {
    const posts = await Post.find().exec();
    ctx.body = posts;
  } catch (e) {
    ctx.throw(500, e);
  }
};
// 특정 블로그글 조회
export const read = async (ctx) => {
  const { id } = ctx.params;
  try {
    const post = await Post.findById(id).exec();
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
    await Post.findByIdAndDelete(id).exec();
    ctx.status = 204; // No Content (성공하기는 했지만 응답할 데이터는 없다.)
  } catch (e) {
    ctx.throw(500, e);
  }
};
export const update = async (ctx) => {
  const { id } = ctx.params;
  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true, // 이 값을 설정하면 업데이트된 데이터를 반환한다.
    }).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

// 기존 구현했던 replace는 구현하지 않을것이다.

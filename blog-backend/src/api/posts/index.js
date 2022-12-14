import Router from 'koa-router';
import { list, write, read, remove, update, checkObjectId } from './post.ctrl';

const posts = new Router();

// const printInfo = ctx => {
//     ctx.body = {
//         method: ctx.method,
//         path: ctx.path,
//         params: ctx.params
//     };
// };

// posts.get('/', printInfo);
// posts.post('/', printInfo);

// posts.get('/:id', printInfo);
// posts.delete('/:id', printInfo);
// posts.put('/:id', printInfo);
// posts.patch('/:id', printInfo);

posts.get('/', list);
posts.post('/', write);

posts.get('/:id', checkObjectId, read);
posts.delete('/:id', checkObjectId, remove);
// posts.put('/:id', replace); // 몽고DB에서는 사용하지 않을 것.
posts.patch('/:id', checkObjectId, update);

export default posts;

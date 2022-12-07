/*
    POST /api/auth/register
    {
        username: 'velo',
        password: 'mypass123'
    }
*/

import Joi from '../../../node_modules/joi/lib/index';
import User from '../../models/users';

export const register = async (ctx) => {
  // 회원가임
  // request body 검증하기..
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().required(),
  });

  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { username, password } = ctx.request.body;
  try {
    // username이 존재하는지 확인
    const exists = await User.findByUsername(username);
    if (exists) {
      ctx.status = 409; // Conflict
      return;
    }
    const user = new User({
      username,
    });
    await user.setPassword(password); // 비밀번호 설정
    await user.save(); // db에 저장.

    // const data = user.toJSON(); // 응답할 데이터에서 hashedPassword 필드 제거
    // delete data.hashedPassword;
    // ctx.body = data;

    ctx.body = user.serialize();

    const token = user.generateToken();
    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
      httpOnly: true,
    });

  } catch (e) {
    ctx.throw(500, e);
  }
};

export const login = async (ctx) => {
  // 로그인
  const { username, password } = ctx.request.body;

  if (!username || !password) {
    ctx.status = 401; // Unauthorized
    return;
  }

  try {
    const user = await User.findByUsername(username);
    // 계정존재하지않으면 에러처리
    if (!user) {
      ctx.status = 401;
      return;
    }
    const valid = await user.checkPassword(password);
    if (!valid) {
      ctx.status = 401;
      return;
    }
    ctx.body = user.serialize();
    const token = user.generateToken();
    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
      httpOnly: true,
    });

  } catch (e) {
    ctx.throw(500, e);
  }
};

export const check = async (ctx) => {
  // 로그인 체크
  const { user } = ctx.state;
  console.log(ctx);
  if (!user) {
    // 로그인중이 아님
    ctx.status = 401; // Unauthorized
    return;
  }
  ctx.body = user;
};

export const logout = async (ctx) => {
  // 로그아웃 쿠키를 지워주면 끝난다. 
  ctx.cookies.set('access_token');
  ctx.status = 204; // No Content;
};

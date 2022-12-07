import jwt from 'jsonwebtoken';
import User from '../models/users';

const jwtMiddleware = async (ctx, next) => {
  const token = ctx.cookies.get('access_token');
  if (!token) return next(); // 토큰이 없음.
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    /* decoded
        {
            _id: '638ec78e5435d8e425ca63e9',
            username: 'dabin2',
            iat: 1670386491,
            exp: 1670991291
        }  */
    // 검증된 유저들은 ctx.state.user에 집어넣기
    ctx.state.user = { // ctx.state
        _id: decoded._id,
        username: decoded.username,
    };
    
    // 토큰의 남은 유효기간이 3.5미만이면 다시 재발급해주기
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp - now < 60 * 60 * 24 * 3.5) {
        const user = await User.findById(decoded._id);
        const token = user.generateToken();
        ctx.cookies.set('access_token', token, {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
            httpOnly: true,
        });
    }
    return next();
  } catch (e) {
    return next(); // 검증 실패
  }
};

export default jwtMiddleware;

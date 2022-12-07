import mongoose, { Model, Schema } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const UserSchema = new Schema({
    username: String,
    hashedPassword: String,
});

// 인스턴스 메서드만들기
// 인스턴스메서드 작성시 화살표 함수가 아닌 function 키워드로 구현해야한다. 함수 내부에서 this에 접근해야하기 때문. 
UserSchema.methods.setPassword = async function(password) { // 입력값이 파라미터
    const hash = await bcrypt.hash(password, 10);
    this.hashedPassword = hash;
};
UserSchema.methods.checkPassword = async function(password) {
    const result = await bcrypt.compare(password, this.hashedPassword);
    return result; // true / false
};

UserSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.hashedPassword;
  return data;
};

UserSchema.methods.generateToken = function() {
    const token = jwt.sign(
        // 첫번째 파라미터는 토큰 안에 집어넣고 싶은 데이터를 넣는다. 
        {
            _id: this.id,
            username: this.username,
        },
        process.env.JWT_SECRET, // 두 번째 파라미터는 JWT 암호를 넣는다. 
        {
            expiresIn: '7d', // 7일동안 유효한다. 
        },
    );
    return token;
};

// 스태틱메서드 만들기
// 스태틱함수에서의 this는 모델을 가리킨다. 여기서는 User를 가리킨다. 
UserSchema.statics.findByUsername = function(username) {
    return this.findOne({ username });
}


const User = mongoose.model('User', UserSchema);
export default User;
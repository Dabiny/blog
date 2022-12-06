import mongoose from "mongoose";

const { Schema } = mongoose;

const PostSchema = new Schema({
    title: String,
    body: String,
    tags: [String], // 문자로 이루어진 배열
    publishedDate: {
        type: Date,
        default: Date.now, // 현재날자를 기본값으로 지정
    },
});

const Post = mongoose.model('Post', PostSchema); // (스키마 이름, 스키마 객체)
export default Post;
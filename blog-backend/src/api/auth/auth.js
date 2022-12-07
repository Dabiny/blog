import Router from "koa-router";
import { check, login, logout, register } from "./auth.ctrl";

const auth = new Router();

auth.post('/register', register);
auth.post('/login', login);
auth.get('/check', check);
auth.post('/logout', logout);

export default auth;
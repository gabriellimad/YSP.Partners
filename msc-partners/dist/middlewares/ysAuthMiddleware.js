"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const status_1 = require("../status/status");
const SECRET_KEY = process.env.JWT_SECRET;
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(status_1.unauthorized).json({ error: 'Token não fornecido' });
        return;
    }
    jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            res.status(status_1.invalidToken).json({ error: 'Token inválido' });
            return;
        }
        req.user = user;
        next();
    });
}
exports.default = authenticateToken;

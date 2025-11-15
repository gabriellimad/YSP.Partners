"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.verifyRefreshToken = exports.verifyResetToken = exports.sendPasswordResetEmail = void 0;
exports.generateToken = generateToken;
exports.verifyPassword = verifyPassword;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const ysMailService_1 = require("./ysMailService");
const ysUserModel_1 = require("../model/ysUserModel");
const SECRET_KEY = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = '1h'; // 1 hora
function generateToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
    };
    return jsonwebtoken_1.default.sign(payload, SECRET_KEY, { expiresIn: '12h' });
}
function verifyPassword(inputPassword, storedPasswordHash) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(inputPassword, storedPasswordHash);
    });
}
// Enviar email de recuperação de senha
const sendPasswordResetEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, ysUserModel_1.getUserByEmail)(email);
    if (!user)
        throw new Error('Usuário não encontrado.');
    const token = jsonwebtoken_1.default.sign({ id: user.id }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    yield (0, ysMailService_1.sendEmail)(email, 'Recuperação de Senha', `Clique no link para redefinir sua senha: ${resetLink}`);
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
// Verificar token e redefinir senha
const verifyResetToken = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    let userId;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        userId = decoded.id;
    }
    catch (error) {
        throw new Error('Token inválido ou expirado.');
    }
    const user = yield (0, ysUserModel_1.getUserById)(userId);
    if (!user)
        throw new Error('Usuário não encontrado.');
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
    user.password_hash = hashedPassword;
    yield (0, ysUserModel_1.updateUser)(userId, user);
});
exports.verifyResetToken = verifyResetToken;
const verifyRefreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, SECRET_KEY);
        const foundUser = yield (0, ysUserModel_1.getUserById)(decoded.id);
        return foundUser ? decoded : null;
    }
    catch (error) {
        return null; // Token inválido ou expirado
    }
});
exports.verifyRefreshToken = verifyRefreshToken;
const generateRefreshToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1d' });
};
exports.generateRefreshToken = generateRefreshToken;
exports.default = {
    generateToken,
    verifyPassword,
};

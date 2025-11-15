"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.requestPasswordReset = exports.createUser = exports.refreshToken = exports.login = void 0;
const ysAuthService_1 = require("../service/ysAuthService");
const user = __importStar(require("../model/ysUserModel"));
const status_1 = require("../status/status");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const resultUser = yield user.getUser(username);
        if (!resultUser) {
            res.status(status_1.unauthorized).json(status_1.loginUserNotFound);
            return;
        }
        const passwordMatch = yield (0, ysAuthService_1.verifyPassword)(password, resultUser.password_hash);
        if (!passwordMatch) {
            res.status(status_1.unauthorized).json(status_1.passwordUserNotMatch);
            return;
        }
        const token = (0, ysAuthService_1.generateToken)(resultUser);
        const refreshToken = (0, ysAuthService_1.generateRefreshToken)(resultUser);
        res.status(status_1.success).json({
            token,
            refreshToken, // Adiciona refreshToken na resposta
            user: {
                id: resultUser.id,
                username: resultUser.username,
                email: resultUser.email
            }
        });
    }
    catch (err) {
        console.error('Erro ao tentar fazer login:', err);
        res.status(status_1.internalServerError).json({ message: 'Erro ao tentar fazer login' });
    }
});
exports.login = login;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(status_1.badRequest).json({ message: 'Refresh token é obrigatório' });
        return;
    }
    try {
        // Verifica se o refresh token é válido e obtém o usuário associado
        const userData = yield (0, ysAuthService_1.verifyRefreshToken)(refreshToken);
        if (!userData) {
            res.status(status_1.unauthorized).json({ message: 'Refresh token inválido ou expirado' });
            return;
        }
        // Gera um novo token de acesso
        const newAccessToken = (0, ysAuthService_1.generateToken)(userData);
        res.status(status_1.success).json({ token: newAccessToken });
    }
    catch (err) {
        console.error('Erro ao tentar renovar o token:', err);
        res.status(status_1.internalServerError).json({ message: 'Erro ao tentar renovar o token' });
    }
});
exports.refreshToken = refreshToken;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { masterKey } = req.params;
    const expectedMasterKey = process.env.MASTER_KEY;
    if (masterKey !== expectedMasterKey) {
        res.status(status_1.unauthorized).json({ message: 'Acesso negado: chave mestre inválida' });
        return;
    }
    const { username, password, email } = req.body;
    try {
        if (!username || !password || !email) {
            res.status(status_1.badRequest).json({ message: 'Todos os campos são obrigatórios' });
            return;
        }
        const newUser = yield user.createUser(username, password, email);
        res.status(status_1.created).json({
            message: 'Usuário criado com sucesso',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            }
        });
    }
    catch (err) {
        console.error('Erro ao cadastrar usuário:', err);
        res.status(status_1.internalServerError).json({ message: 'Erro ao cadastrar usuário' });
    }
});
exports.createUser = createUser;
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        yield (0, ysAuthService_1.sendPasswordResetEmail)(email);
        return res.status(200).json({ message: 'Email enviado com sucesso, verifique sua caixa de entrada.' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao enviar o email. Tente novamente.' });
    }
});
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    try {
        yield (0, ysAuthService_1.verifyResetToken)(token, newPassword);
        return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }
});
exports.resetPassword = resetPassword;
exports.default = {
    login: exports.login,
    createUser: exports.createUser,
    requestPasswordReset: exports.requestPasswordReset,
    resetPassword: exports.resetPassword
};

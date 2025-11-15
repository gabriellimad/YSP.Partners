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
exports.createUser = createUser;
exports.getUser = getUser;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.getUserByEmail = getUserByEmail;
const bcrypt_1 = __importDefault(require("bcrypt"));
const ysConnection_1 = __importDefault(require("./ysConnection"));
function createUser(username, password, email) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingUserResult = yield (0, ysConnection_1.default)('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUserResult.rows.length > 0) {
            throw new Error('Usuário já existe');
        }
        const passwordHash = yield bcrypt_1.default.hash(password, 10);
        const sqlCommand = `
        INSERT INTO users (username, password_hash, email) 
        VALUES ($1, $2, $3) RETURNING id, username, password_hash, email
    `;
        const params = [username, passwordHash, email];
        const result = yield (0, ysConnection_1.default)(sqlCommand, params);
        if (result.rows.length === 0) {
            throw new Error('Erro ao criar o usuário');
        }
        return result.rows[0];
    });
}
function getUser(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const sqlCommand = `SELECT * FROM users WHERE username = $1`;
        const userResult = yield (0, ysConnection_1.default)(sqlCommand, [username]);
        if (userResult.rows.length === 0) {
            throw new Error('Usuário não encontrado');
        }
        return userResult.rows[0]; // Retorna o usuário encontrado
    });
}
function getUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const sqlCommand = `SELECT * FROM users WHERE id = $1`;
        const userResult = yield (0, ysConnection_1.default)(sqlCommand, [id]);
        if (userResult.rows.length === 0) {
            throw new Error('Usuário não encontrado');
        }
        return userResult.rows[0]; // Retorna o usuário encontrado
    });
}
function updateUser(id, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        const fields = Object.keys(updates).map((field, index) => `${field} = $${index + 2}`).join(', ');
        const values = Object.values(updates);
        if (!fields) {
            throw new Error('Nenhum campo para atualizar');
        }
        const sqlCommand = `
        UPDATE users
        SET ${fields}
        WHERE id = $1
        RETURNING id, username, password_hash, email
    `;
        const params = [id, ...values];
        const result = yield (0, ysConnection_1.default)(sqlCommand, params);
        if (result.rows.length === 0) {
            throw new Error('Usuário não encontrado ou não atualizado');
        }
        return result.rows[0];
    });
}
function getUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const sqlCommand = `SELECT * FROM users WHERE email = $1`;
        const result = yield (0, ysConnection_1.default)(sqlCommand, [email]);
        if (result.rows.length === 0) {
            throw new Error('Usuário não encontrado');
        }
        return result.rows[0];
    });
}
exports.default = {
    createUser,
    getUser
};

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
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_CONNECTION,
    ssl: {
        rejectUnauthorized: false,
    },
});
function connectAndQuery(sqlCommand_1) {
    return __awaiter(this, arguments, void 0, function* (sqlCommand, params = []) {
        const client = yield pool.connect();
        try {
            const res = yield client.query(sqlCommand, params);
            console.log(res.rows);
            return { rows: res.rows };
        }
        catch (err) {
            console.error('Erro ao conectar ou consultar:', err.message);
            throw err;
        }
        finally {
            client.release();
            console.log('Conexão devolvida ao pool');
        }
    });
}
exports.default = connectAndQuery;

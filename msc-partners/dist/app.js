"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./routers/index"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(index_1.default);
app.get('/', (_request, response) => {
    response.send('Server is working');
});
exports.default = app;
// import express, { Request, Response } from 'express';
// import router from './routers/index';
// const app = express();
// app.use(express.json());
// app.use(router);
// app.get('/', (_request: Request, response: Response) => {
//     response.send();
// });
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
// export default app;

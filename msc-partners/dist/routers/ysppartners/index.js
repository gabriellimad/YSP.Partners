"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ysPartnersController_1 = require("../../controllers/ysPartnersController");
const ysUserController_1 = require("../../controllers/ysUserController");
const ysAuthMiddleware_1 = __importDefault(require("../../middlewares/ysAuthMiddleware"));
const ysIBGEController_1 = require("../../controllers/ysIBGEController");
const multer_1 = __importDefault(require("multer")); // Comentado para buildar no vercel
const ysSheetController_1 = require("../../controllers/ysSheetController");
const routerYsChatBot = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
routerYsChatBot.get('/getStates', ysAuthMiddleware_1.default, ysIBGEController_1.getStates);
routerYsChatBot.get('/getCities/:uFId', ysAuthMiddleware_1.default, ysIBGEController_1.getCities);
routerYsChatBot.post('/forgot-password', ysUserController_1.requestPasswordReset);
routerYsChatBot.post('/reset-password', ysUserController_1.resetPassword);
routerYsChatBot.post('/upload', ysAuthMiddleware_1.default, upload.single('file'), ysSheetController_1.uploadSheet); // Comentado para buildar no vercel
routerYsChatBot.post('/reprocess-failed-inserts', upload.single('file'), ysSheetController_1.reprocessFailedInserts); // Comentado para buildar no vercel
routerYsChatBot.post('/exportPartnersToExcel', ysAuthMiddleware_1.default, ysSheetController_1.exportPartnersToExcel);
routerYsChatBot.delete('/cleanDuplicateRegisters', ysAuthMiddleware_1.default, ysPartnersController_1.cleanDuplicateRegisters);
routerYsChatBot.post('/login', ysUserController_1.login);
routerYsChatBot.post('/refresh-token', ysUserController_1.refreshToken);
routerYsChatBot.post('/create-user/:masterKey', ysUserController_1.createUser);
routerYsChatBot.post('/getByParams', ysAuthMiddleware_1.default, ysPartnersController_1.getByParams);
routerYsChatBot.get('/:id', ysAuthMiddleware_1.default, ysPartnersController_1.getById);
routerYsChatBot.put('/:id', ysAuthMiddleware_1.default, ysPartnersController_1.update);
routerYsChatBot.delete('/:masterKey/:id', ysAuthMiddleware_1.default, ysPartnersController_1.partnerDelete);
routerYsChatBot.get('/', ysAuthMiddleware_1.default, ysPartnersController_1.getAll);
routerYsChatBot.post('/', ysAuthMiddleware_1.default, ysPartnersController_1.create);
exports.default = routerYsChatBot;

import express from 'express';
import { create, getAll, getById, getByParams, partnerDelete, update, cleanDuplicateRegisters } from '../../controllers/ysPartnersController';
import {login, createUser, requestPasswordReset, resetPassword, refreshToken} from '../../controllers/ysUserController';
import authenticateToken from '../../middlewares/ysAuthMiddleware';
import { getCities, getStates } from '../../controllers/ysIBGEController';
import multer from 'multer'; // Comentado para buildar no vercel
import { exportPartnersToExcel, reprocessFailedInserts, uploadSheet} from '../../controllers/ysSheetController';

const routerYsChatBot = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

routerYsChatBot.get('/getStates', authenticateToken, getStates);
routerYsChatBot.get('/getCities/:uFId', authenticateToken, getCities);

routerYsChatBot.post('/forgot-password', requestPasswordReset);
routerYsChatBot.post('/reset-password', resetPassword);

routerYsChatBot.post('/upload', authenticateToken, upload.single('file'), uploadSheet); // Comentado para buildar no vercel
routerYsChatBot.post('/reprocess-failed-inserts', upload.single('file'), reprocessFailedInserts); // Comentado para buildar no vercel
routerYsChatBot.post('/exportPartnersToExcel', authenticateToken, exportPartnersToExcel);
routerYsChatBot.delete('/cleanDuplicateRegisters', authenticateToken, cleanDuplicateRegisters);

routerYsChatBot.post('/login', login);
routerYsChatBot.post('/refresh-token', refreshToken);

routerYsChatBot.post('/create-user/:masterKey', createUser);

routerYsChatBot.post('/getByParams', authenticateToken, getByParams);

routerYsChatBot.get('/:id', authenticateToken, getById);
routerYsChatBot.put('/:id', authenticateToken, update);
routerYsChatBot.delete('/:masterKey/:id', authenticateToken, partnerDelete);

routerYsChatBot.get('/', authenticateToken, getAll);
routerYsChatBot.post('/', authenticateToken, create);

export default routerYsChatBot;

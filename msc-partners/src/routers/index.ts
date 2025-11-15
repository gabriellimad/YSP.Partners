import express, { Router } from 'express';
import routerYsChatBot from './ysppartners/index';

const router: Router = express.Router();

router.use('/yspartners', routerYsChatBot);

export default router;

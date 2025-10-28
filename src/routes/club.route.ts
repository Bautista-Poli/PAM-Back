import { Router } from 'express';
import { getClubsController } from '../controllers/get.clubs.controller';

const router = Router();

router.get('/', getClubsController);

export default router;
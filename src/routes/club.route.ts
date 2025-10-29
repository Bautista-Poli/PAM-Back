import { Router } from 'express';
import { getClubsController } from '../controllers/get.clubs.controller';
import { getClub } from '../controllers/get.club.controller';

const router = Router();

router.get('/', getClubsController);

router.get('/:nombre', getClub)

export default router;
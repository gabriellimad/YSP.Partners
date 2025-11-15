import { Request, Response } from 'express';
import { success, badRequest, notFound, userNotFound, errorConflict, noContent, created } from '../status/status';
import { getUFs } from '../helpers/enums/states';
import IBGEservices from '../service/ysIBGEService';

export const getStates = async (req: Request, res: Response): Promise<void> => {
  console.log("chegou");
    try {
        const data = getUFs();
        res.status(success).json(data);
      } catch (err) {
        res.status(badRequest).json(badRequest);
      }
};

export const getCities = async (req: Request, res: Response): Promise<void> => {
    const { uFId } = req.params;
    try {
      const data = await IBGEservices.getCitiesByStateId(parseInt(uFId));
      res.status(success).json(data);
    } catch (err) {
      res.status(badRequest).json(badRequest);
    }
};
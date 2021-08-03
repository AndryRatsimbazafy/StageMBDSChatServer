import {Request, Response} from 'express';
import * as packageJSON from '../../package.json';
import {spawn} from 'child_process';

class PingController {
  constructor() {}
  
  Ping(req: Request, res: Response): void {
    res.json({
      status: 200,
      version: `API Version v${packageJSON.version}`
    });
  }

  Webhook(req: Request, res: Response): void {
    spawn('npm run build');
    res.sendStatus(200);
  }
}

const pingController = new PingController();

export default pingController;

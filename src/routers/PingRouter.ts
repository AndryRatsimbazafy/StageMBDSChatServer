import { Router } from 'express';
import PingController from '../controllers/PingController';

class PingRouter {

    router: Router;

    constructor(){
        this.router = Router();
        this.routes();
    }

    routes(){
        this.router.post('/webhook', PingController.Webhook)
        this.router.get('*', PingController.Ping)
    }
}

export default  new PingRouter().router;

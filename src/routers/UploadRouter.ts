import { Router } from "express";
import uploadController from "../controllers/UploadController";
import * as multer from "multer";
import * as path from 'path'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/files/");
    },
    filename: function (req, file, cb) {
        const originalname = file.originalname;
        const newNameArray = originalname.split(".")
        newNameArray.pop()
        const ext = path.extname(originalname)
        const newName = [...newNameArray, `-${new Date().valueOf()}`, ext].join('');
        file.originalname = newName
        cb(null, file.originalname);
    },
});

class UploadRouter {
    upload: any;
    router: Router;

    constructor() {
        this.upload = multer({ storage });
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.post(
            "",
            this.upload.array("files"),
            uploadController.Upload
        );
    }
}

export default new UploadRouter().router;

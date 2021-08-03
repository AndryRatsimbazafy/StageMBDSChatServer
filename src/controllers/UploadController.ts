import {Request, Response} from 'express';

class UploadController {
  constructor() {}
  
  Upload(req: any, res: Response): void {
    try {
        console.log("files", req.files)
    
        let files = req.files
        let fileNames = []

        files.forEach(element => {
            fileNames.push(element.originalname)
        });

        res.status(200).json({
            success: true,
            data: fileNames,
        });    
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'upload error'
        })
    }
    
  }
}

const uploadController = new UploadController();

export default uploadController;

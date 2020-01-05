import File from '../models/File';

class FileController {
  async store(req, resp) {
    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
    });

    return resp.json({
      status: true,
      data: file,
    });
  }
}

export default new FileController();

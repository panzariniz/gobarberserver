import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(req, resp) {
    const { email } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return resp.status(400).json({
        status: false,
        message: 'User already exists',
      });
    }

    const { id, name, provider } = await User.create(req.body);

    return resp.json({
      status: true,
      data: {
        id,
        name,
        email,
        provider,
      },
    });
  }

  async update(req, resp) {
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return resp.status(400).json({
          message: 'User already exists',
        });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return resp.status(401).json({
        message: 'Password does not match',
      });
    }

    await user.update(req.body);

    const { id, name, avatar } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return resp.json({
      status: true,
      data: {
        id,
        name,
        email,
        avatar,
      },
    });
  }
}

export default new UserController();

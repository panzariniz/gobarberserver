import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, resp) {
    const checkProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkProvider) {
      return resp.status(401).json({
        status: false,
        message: 'Only providers can load notifications',
      });
    }

    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({
        createdAt: 'DESC',
      })
      .limit(20);

    return resp.json({
      status: true,
      data: notifications,
    });
  }

  async update(req, resp) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        read: true,
      },
      { new: true }
    );

    return resp.json({
      status: true,
      data: notification,
    });
  }
}

export default new NotificationController();

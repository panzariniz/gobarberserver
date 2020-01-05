import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

import CreateAppointmentService from '../services/CreateAppointmentService';
import CancelAppointmentService from '../services/CancelAppointmentService';

import Cache from '../../lib/Cache';

class AppointmentController {
  async index(req, resp) {
    const { page = 1, limit = 20 } = req.query;

    const cacheKey = `user:${req.userId}:appointments:${page}`;
    const dataCache = await Cache.get(cacheKey);
    if (dataCache) {
      return resp.json({
        status: true,
        data: dataCache,
      });
    }

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      limit,
      offset: (page - 1) * limit,
      include: {
        model: User,
        as: 'provider',
        attributes: ['id', 'name'],
        include: {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      },
    });

    await Cache.setInMinutes(cacheKey, appointments, 10);

    return resp.json({
      status: true,
      data: appointments,
    });
  }

  async store(req, resp) {
    const { provider_id, date } = req.body;

    try {
      const appointment = await CreateAppointmentService.run({
        provider_id,
        user_id: req.userId,
        date,
      });

      return resp.json({
        status: true,
        data: appointment,
      });
    } catch ({ message, code }) {
      return resp.status(code).json({
        status: false,
        message,
      });
    }
  }

  async delete(req, resp) {
    try {
      const appointment = await CancelAppointmentService.run({
        id: req.params.id,
        user_id: req.userId,
      });

      return resp.json({
        status: true,
        data: appointment,
      });
    } catch ({ message, code }) {
      return resp.status(code).json({
        status: false,
        message,
      });
    }
  }
}

export default new AppointmentController();

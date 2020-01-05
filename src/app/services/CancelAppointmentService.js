import { isBefore, subHours } from 'date-fns';

import Appointment from '../models/Appointment';
import User from '../models/User';

import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';
import Cache from '../../lib/Cache';

class CancelAppointmentService {
  async run({ id, user_id }) {
    const error = new Error();

    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.canceled_at) {
      error.message = 'You already cancelled this appointment';
      error.code = 401;

      throw error;
    }

    if (appointment.user_id !== user_id) {
      error.message = 'You do not have permission to cancel this appointment';
      error.code = 401;

      throw error;
    }

    /**
     * Subs 2 hours
     */
    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      error.message = 'You can only cancel appointments 2 hours in advance';
      error.code = 401;

      throw error;
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    await Cache.deletePrefix(`user:${user_id}:appointments`);

    return appointment;
  }
}

export default new CancelAppointmentService();

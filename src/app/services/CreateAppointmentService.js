import { startOfHour, parseISO, format, isBefore } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Notification from '../schemas/Notification';

import Appointment from '../models/Appointment';
import User from '../models/User';
import Cache from '../../lib/Cache';

class CreateAppointmentService {
  async run({ provider_id, user_id, date }) {
    const error = new Error();

    if (parseInt(provider_id, 10) === user_id) {
      error.message = 'You can not create appointments with yourself';
      error.code = 401;

      throw error;
    }

    /**
     * Check if provider_id is a provider
     */
    const checkProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!checkProvider) {
      error.message = 'You can only create appointments with providers';
      error.code = 401;

      throw error;
    }

    /**
     * Check for past dates
     */
    const hourStart = startOfHour(parseISO(date));
    if (isBefore(hourStart, new Date())) {
      error.message = 'Past dates are not permitted';
      error.code = 400;

      throw error;
    }

    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      error.message = 'Appointment date is not available';
      error.code = 400;

      throw error;
    }

    const appointment = await Appointment.create({
      user_id,
      provider_id,
      date,
    });

    /**
     * Notify appointment provider
     */
    const user = await User.findByPk(user_id);
    const formattedDate = format(hourStart, "dd 'de' MMMM' às 'H:mm'h'", {
      locale: pt,
    });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para o dia ${formattedDate}`,
      user: provider_id,
    });

    await Cache.deletePrefix(`user:${user_id}:appointments`);

    return appointment;
  }
}

export default new CreateAppointmentService();

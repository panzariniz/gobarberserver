import AvailableService from '../services/AvailableService';

class AvailableController {
  async index(req, resp) {
    const { date } = req.query;

    if (!date) {
      return resp.status(400).json({
        status: false,
        message: 'Invalid date',
      });
    }

    const available = await AvailableService.run({
      provider_id: req.params.providerId,
      date: Number(date),
    });

    return resp.json({
      status: true,
      data: available,
    });
  }
}

export default new AvailableController();

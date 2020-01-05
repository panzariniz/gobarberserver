import User from '../models/User';
import File from '../models/File';

import Cache from '../../lib/Cache';

class ProviderController {
  async index(req, resp) {
    const cached = await Cache.get('providers');
    if (cached) {
      return resp.json(cached);
    }

    const providers = await User.findAll({
      where: { provider: true },
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    await Cache.setInMinutes('providers', providers, 1);

    return resp.json(providers);
  }
}

export default new ProviderController();

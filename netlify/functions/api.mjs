import { handleApiRequest } from '../../server/api-router.mjs';

export default async (req, context) => {
  return handleApiRequest(req);
};

export const config = {
  path: '/api/*',
  preferStatic: true,
};


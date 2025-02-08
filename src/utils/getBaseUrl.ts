export const getBaseURL = ({ STAGE }: { STAGE?: string } = {}) =>
  process.env[`BASE_URL_${STAGE || process.env.STAGE}`];

export const getStrapiConfig = () => {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const apiToken = process.env.STRAPI_API_TOKEN;
  
  return {
    baseUrl,
    apiToken,
    getImageUrl: (path: string) => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return `${baseUrl}${path}`;
    },
    getApiHeaders: () => ({
      "Content-Type": "application/json",
      ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
    }),
  };
};

export const strapiConfig = getStrapiConfig();
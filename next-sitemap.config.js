const fs = require('fs');

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.paperstudio.app',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  additionalPaths: async () => {
    try {
      const data = fs.readFileSync('paper_ids.json', 'utf8');
      const ids = JSON.parse(data);
      const paths = ids.map((/** @type {string} */ id) => {
        return {
          loc: `/paper/${id}`,
          lastmod: new Date().toISOString(),
        };
      });
      return paths;
    } catch (err) {
      console.error('Error reading paper_ids.json:', err);
      return [];
    }
  },
};

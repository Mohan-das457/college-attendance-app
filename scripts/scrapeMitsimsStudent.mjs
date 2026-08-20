import { mkdirSync, writeFileSync } from 'node:fs';

const BASE_URL = 'http://mitsims.in';
const OUT_DIR = 'exported-data/mitsims';

const endpoints = [
  {
    name: 'studentIndex',
    url: `${BASE_URL}/studentIndex.html`
  },
  {
    name: 'leftSidebar',
    url: `${BASE_URL}/gemsonline-student/getLeftSideBar.action?`
  },
  {
    name: 'profile',
    url: `${BASE_URL}/gemsonline-student/profile.action?actionType=view`
  },
  {
    name: 'dashboard',
    url: `${BASE_URL}/gemsonline-student/dashboard.action?actionType=view`
  },
  {
    name: 'homeView',
    url: `${BASE_URL}/gemsonline-student/getHomeView.action?`
  }
];

const args = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    return [key, rest.join('=')];
  })
);

const cookie = args.cookie || process.env.MITSIMS_COOKIE || '';

const sanitize = (text) => text.replace(/[^a-z0-9_-]/gi, '_');

const fetchText = async ({ url }) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 AttendTrack data export',
      ...(cookie ? { Cookie: cookie } : {})
    }
  });

  return {
    status: response.status,
    contentType: response.headers.get('content-type') || '',
    text: await response.text()
  };
};

mkdirSync(OUT_DIR, { recursive: true });

for (const endpoint of endpoints) {
  const result = await fetchText(endpoint);
  const ext = result.contentType.includes('html') ? 'html' : 'txt';
  const filePath = `${OUT_DIR}/${sanitize(endpoint.name)}.${ext}`;
  writeFileSync(filePath, result.text);
  console.log(`${endpoint.name}: HTTP ${result.status} -> ${filePath}`);

  if (/session has timed out|logout\.action/i.test(result.text)) {
    console.log(`  ${endpoint.name}: login session required`);
  }
}

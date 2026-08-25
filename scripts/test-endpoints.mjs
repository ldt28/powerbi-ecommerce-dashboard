import http from 'http';

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  const loginRes = await get('/api/dev-login');
  console.log('dev-login response status:', loginRes.statusCode);
  const setCookie = loginRes.headers['set-cookie'];
  console.log('Set-Cookie received:', setCookie ? setCookie[0].split(';')[0] : 'None');

  const cookie = setCookie ? setCookie[0].split(';')[0] : 'app_session_id=demo-token';

  console.log('\nQuerying auth.me via tRPC batch query...');
  const meRes = await get('/api/trpc/auth.me?batch=1&input=%7B%7D', { Cookie: cookie });
  console.log('auth.me status:', meRes.statusCode);
  console.log('auth.me body:', meRes.body);

  console.log('\nQuerying liveData.listConnections via tRPC batch query...');
  const connRes = await get('/api/trpc/liveData.listConnections?batch=1&input=%7B%7D', { Cookie: cookie });
  console.log('listConnections status:', connRes.statusCode);
  console.log('listConnections body:', connRes.body);
}

run().catch(console.error);

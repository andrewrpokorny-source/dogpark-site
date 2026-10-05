// Serves the built site from dist/, behind a password when SITE_PASSWORD is set.
import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import handler from 'serve-handler';

const port = Number(process.env.PORT) || 3000;
const password = process.env.SITE_PASSWORD;

const matches = (given, expected) => {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

const authorized = (req) => {
  if (!password) return true;
  const [scheme, encoded] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Basic' || !encoded) return false;
  const decoded = Buffer.from(encoded, 'base64').toString();
  // Any username works; only the password is checked.
  return matches(decoded.slice(decoded.indexOf(':') + 1), password);
};

http
  .createServer((req, res) => {
    if (!authorized(req)) {
      res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Dog Park preview", charset="UTF-8"' });
      return res.end('Password required');
    }
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return handler(req, res, { public: 'dist', cleanUrls: true });
  })
  .listen(port, '0.0.0.0', () => {
    console.log(`Dog Park site on :${port}${password ? ' (password protected)' : ''}`);
  });

const LoginLog = require('../models/LoginLog');

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) {
    // first IP in list
    return xff.split(',')[0].trim();
  }
  // express populates req.ip (may include ::ffff:)
  return String(req.ip || req.connection?.remoteAddress || '').trim();
}

function parseNumber(v) {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  if (Number.isNaN(n)) return undefined;
  return n;
}

function requireLatLong(req) {
  const latitude = parseNumber(req.body?.latitude);
  const longitude = parseNumber(req.body?.longitude);
  if (latitude === undefined || longitude === undefined) {
    return { ok: false, message: 'Location permission is required to login.' };
  }
  return { ok: true, latitude, longitude };
}

async function logSuccessfulLogin({ req, role, username, email }) {
  try {
    await LoginLog.create({
      role,
      username: username || '',
      email: email || '',
      ipAddress: getClientIp(req),
      latitude: parseNumber(req.body?.latitude),
      longitude: parseNumber(req.body?.longitude),
      userAgent: String(req.headers['user-agent'] || ''),
    });
  } catch (err) {
    // Don't block login if logging fails
    console.error('Login log create error:', err.message);
  }
}

module.exports = { logSuccessfulLogin, requireLatLong };


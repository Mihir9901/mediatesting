require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const bcrypt = require('bcrypt');
const connectDB = require('./config/db');
const User = require('./models/User');
const Manager = require('./models/Manager');
const { updateTenureStatuses } = require('./utils/tenureUpdater');

const app = express();

// ================= DATABASE =================
connectDB()
  .then(() => {
    console.log('✅ Database connected');
    seedDefaultUsers();
  })
  .catch((err) => {
    console.error('❌ DB Error:', err.message);
    process.exit(1);
  });

// ================= SEED =================
const seedDefaultUsers = async () => {
  try {
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'info.kamalyadav@gmail.com';
    const adminPassword = process.env.SEED_ADMIN_PASS || 'Kamal@7740';
    const managerEmail = process.env.SEED_MANAGER_EMAIL || 'mail.kamalyadav@gmail.com';
    const managerPassword = process.env.SEED_MANAGER_PASS || 'Kamal@7740';

    // Admin
    const adminExists = await User.findOne({ email: adminEmail, role: 'Admin' });
    if (!adminExists) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hashed,
        role: 'Admin',
      });
      console.log('✅ Admin created');
    }

    // Manager (User)
    const managerUserExists = await User.findOne({ email: managerEmail, role: 'Manager' });
    if (!managerUserExists) {
      const hashed = await bcrypt.hash(managerPassword, 10);
      await User.create({
        name: 'Super Manager',
        email: managerEmail,
        password: hashed,
        role: 'Manager',
      });
      console.log('✅ Manager (User) created');
    }

    // Manager (Manager collection)
    const managerExists = await Manager.findOne({ email: managerEmail });
    if (!managerExists) {
      const hashed = await bcrypt.hash(managerPassword, 10);
      await Manager.create({
        name: 'Super Manager',
        email: managerEmail,
        password: hashed,
        departments: ['All'],
      });
      console.log('✅ Manager (Manager) created');
    }
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
};

// ================= MIDDLEWARE =================
app.use(express.json());

// ✅ CORS (FINAL FIX)
// Add your Vercel live domain here.
const allowedOrigins = [
  'https://graphuramedia.vercel.app',
  'https://mediatesting-murex.vercel.app',
  'https://graphurafest.in',
  'https://www.graphurafest.in',
  'https://media.graphura.in',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

// Optional: allow preview / custom domains via env
// Example:
// CORS_ORIGINS=https://foo.vercel.app,https://bar.example.com
// CORS_ORIGIN_REGEX=^https:\\/\\/.*\\.vercel\\.app$
const envOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : [];
const originRegexes = process.env.CORS_ORIGIN_REGEX
  ? process.env.CORS_ORIGIN_REGEX.split(',').map((s) => s.trim()).filter(Boolean)
  : [];
const allowedOriginRegexes = originRegexes
  .map((src) => {
    try {
      return new RegExp(src);
    } catch (e) {
      console.error('[CORS] Invalid regex:', src);
      return null;
    }
  })
  .filter(Boolean);

const allowedOriginsSet = new Set([...allowedOrigins, ...envOrigins]);
console.log('[CORS] Allowed origins:', [...allowedOriginsSet].join(', '));
if (allowedOriginRegexes.length) {
  console.log('[CORS] Allowed origin regexes:', allowedOriginRegexes.map((r) => r.source).join(', '));
}

// Debug escape hatch (do NOT enable unless needed):
// CORS_ALLOW_ALL=true  -> allow any Origin (still echoes origin; works with credentials)
const corsAllowAll = String(process.env.CORS_ALLOW_ALL || '').toLowerCase() === 'true';
if (corsAllowAll) {
  console.log('[CORS] WARNING: CORS_ALLOW_ALL=true (allowing any origin)');
}

const corsOptions = {
  origin(origin, callback) {
    // server-to-server/curl/same-origin
    if (!origin) return callback(null, true);
    if (corsAllowAll) return callback(null, true);
    if (allowedOriginsSet.has(origin)) return callback(null, true);
    if (allowedOriginRegexes.some((r) => r.test(origin))) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// ✅ Preflight fix (Express 5 / Node 22+ compatible)
// path-to-regexp rejects wildcard strings like '/*' or '*', so use a RegExp.
app.options(/.*/, cors(corsOptions));

// ================= ROUTES =================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Helps verify which commit/config is deployed (Render provides RENDER_GIT_COMMIT)
app.get('/api/version', (req, res) => {
  res.json({
    service: 'mediatesting-backend',
    commit: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || null,
    node: process.version,
    corsAllowAll,
    allowedOrigins: [...allowedOriginsSet],
  });
});

app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/manager', require('./routes/managerRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/khi-accounts', require('./routes/accountRoutes'));

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ================= SELF PING =================
const selfPing = () => {
  const url =
    process.env.SELF_PING_URL ||
    `http://127.0.0.1:${PORT}/api/health`;

  const client = url.startsWith('https') ? require('https') : http;

  console.log(`🔄 Self-ping active: ${url}`);

  setInterval(() => {
    client.get(url).on('error', (err) => {
      console.error('Self-ping error:', err.message);
    });
  }, 5 * 60 * 1000);
};

setTimeout(selfPing, 10000);

// ================= BACKGROUND TASKS =================
// Run tenure update every hour
setInterval(async () => {
  console.log('--- Running Scheduled Tenure Update ---');
  await updateTenureStatuses();
}, 60 * 60 * 1000);

// Run once on startup (after a short delay to ensure DB is ready)
setTimeout(updateTenureStatuses, 5000);
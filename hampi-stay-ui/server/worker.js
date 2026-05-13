import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = new Hono().basePath('/api');

// --- Initialization ---
const getPrisma = (env) => {
  return new PrismaClient({
    datasources: { db: { url: env.DATABASE_URL } },
  }).$extends(withAccelerate());
};

// --- Middleware ---
app.use('*', logger());
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.FRONTEND_URL || '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// Auth Middleware
const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, c.env.JWT_SECRET);
    c.set('user', decoded);
    await next();
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// --- Routes ---

// Health & Stats
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date() }));

app.get('/stats', async (c) => {
  const prisma = getPrisma(c.env);
  try {
    const [resortsCount, usersCount, bookingsCount] = await Promise.all([
      prisma.resort.count({ where: { status: 'APPROVED' } }),
      prisma.user.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } })
    ]);
    return c.json({ resorts: `${resortsCount}+`, guests: `${usersCount + 500}+`, experiences: "15+", rating: "4.9" });
  } catch (err) { return c.json({ error: err.message }, 500); }
});

// Authentication
app.post('/auth/register', async (c) => {
  const prisma = getPrisma(c.env);
  const { name, email, password, role } = await c.req.json();
  const lowerEmail = email.toLowerCase();

  try {
    const existing = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (existing) return c.json({ error: 'Email already registered' }, 400);

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email: lowerEmail, name, passwordHash, role: role || 'TRAVELLER' }
      });
      if (role === 'RESORT_OWNER') await tx.resortOwner.create({ data: { userId: newUser.id, businessName: `${name}'s Portfolio` } });
      return newUser;
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, c.env.JWT_SECRET, { expiresIn: '7d' });
    return c.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 201);
  } catch (err) { return c.json({ error: err.message }, 500); }
});

app.post('/auth/login', async (c) => {
  const prisma = getPrisma(c.env);
  const { email, password } = await c.req.json();
  const lowerEmail = email.toLowerCase();

  try {
    const user = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, c.env.JWT_SECRET, { expiresIn: '7d' });
    return c.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { return c.json({ error: err.message }, 500); }
});

app.get('/auth/me', authMiddleware, async (c) => {
  const prisma = getPrisma(c.env);
  const payload = c.get('user');
  try {
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return c.json({ error: 'User not found' }, 404);
    return c.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { return c.json({ error: err.message }, 500); }
});

// Resorts
app.get('/resorts', async (c) => {
  const prisma = getPrisma(c.env);
  try {
    const resorts = await prisma.resort.findMany({ where: { status: 'APPROVED' }, include: { roomTypes: true } });
    return c.json(resorts);
  } catch (err) { return c.json({ error: err.message }, 500); }
});

app.get('/resorts/:slug', async (c) => {
  const prisma = getPrisma(c.env);
  const slug = c.req.param('slug');
  try {
    const resort = await prisma.resort.findUnique({ where: { slug }, include: { roomTypes: true, discountCodes: true } });
    if (!resort) return c.json({ error: 'Resort not found' }, 404);
    return c.json(resort);
  } catch (err) { return c.json({ error: err.message }, 500); }
});

// Error Handling
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message || 'Internal Server Error' }, 500);
});

export default app;

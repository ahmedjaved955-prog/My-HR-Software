import { pool, query } from '../../config/db.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { ROLES } from '../../config/roles.js';

export async function registerAdmin({ companyName, companyCode, email, password }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const companyRes = await client.query(
      `INSERT INTO companies (name, code)
       VALUES ($1, $2)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [companyName, companyCode]
    );

    const companyId = companyRes.rows[0].id;
    const passwordHash = await hashPassword(password);

    const userRes = await client.query(
      `INSERT INTO users (company_id, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, role, company_id`,
      [companyId, email, passwordHash, ROLES.ADMIN]
    );

    if (!userRes.rows.length) {
      throw Object.assign(new Error('User with this email already exists'), { status: 400 });
    }

    const user = userRes.rows[0];

    await client.query('COMMIT');

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    return { user, accessToken, refreshToken };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function login({ email, password }) {
  const res = await query(
    `SELECT id, email, password_hash, role, company_id, is_active
     FROM users
     WHERE email = $1`,
    [email]
  );

  if (!res.rows.length) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  const user = res.rows[0];

  if (!user.is_active) {
    throw Object.assign(new Error('User is inactive'), { status: 403 });
  }

  const match = await comparePassword(password, user.password_hash);
  if (!match) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  const safeUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    company_id: user.company_id,
  };

  const accessToken = signAccessToken(safeUser);
  const refreshToken = signRefreshToken(safeUser);

  return { user: safeUser, accessToken, refreshToken };
}

export async function refreshToken(token) {
  try {
    const payload = verifyRefreshToken(token);
    const res = await query(
      `SELECT id, email, role, company_id, is_active
       FROM users
       WHERE id = $1`,
      [payload.id]
    );
    if (!res.rows.length || !res.rows[0].is_active) {
      throw Object.assign(new Error('User not found or inactive'), { status: 401 });
    }

    const user = res.rows[0];
    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    };

    const newAccessToken = signAccessToken(safeUser);
    const newRefreshToken = signRefreshToken(safeUser);

    return { user: safeUser, accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (err) {
    throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
  }
}

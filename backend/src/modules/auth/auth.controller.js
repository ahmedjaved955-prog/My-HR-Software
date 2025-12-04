import { registerAdmin, login, refreshToken } from './auth.service.js';

export async function register(req, res, next) {
  try {
    const { companyName, companyCode, email, password } = req.body;
    const result = await registerAdmin({ companyName, companyCode, email, password });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function loginController(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await login({ email, password });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function refreshController(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    const result = await refreshToken(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

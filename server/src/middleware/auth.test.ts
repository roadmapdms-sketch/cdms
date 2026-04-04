import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { authMiddleware, requireRole, type AuthRequest } from './auth';

describe('authMiddleware', () => {
  const secret = process.env.JWT_SECRET!;

  it('returns 401 when Authorization header is missing', async () => {
    const req = { header: () => undefined } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    await authMiddleware(req as AuthRequest, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid', async () => {
    const req = {
      header: (name: string) => (name === 'Authorization' ? 'Bearer not-a-jwt' : undefined),
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    await authMiddleware(req as AuthRequest, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next and attaches user when token is valid', async () => {
    const token = jwt.sign(
      { userId: 'user-1', email: 'a@b.com', role: 'ADMIN' },
      secret,
      { expiresIn: '1h' }
    );
    const req = {
      header: (name: string) => (name === 'Authorization' ? `Bearer ${token}` : undefined),
    } as unknown as AuthRequest;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe('user-1');
    expect(req.role).toBe('ADMIN');
  });
});

describe('requireRole', () => {
  it('calls next when role is allowed', () => {
    const req = { role: 'ADMIN' } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    requireRole(['ADMIN', 'ACCOUNTANT'])(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 when role is missing', () => {
    const req = {} as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    requireRole(['ADMIN'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when role is not in list', () => {
    const req = { role: 'MEMBER' } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    requireRole(['ADMIN', 'ACCOUNTANT'])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

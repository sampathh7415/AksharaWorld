import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuditService } from '../src/audit/audit.service';
import { UserRole } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const audit = { log: jest.fn() };
  const jwt = {
    sign: jest.fn().mockReturnValue('token'),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('registers a new user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      firstName: 'T',
      lastName: 'U',
      role: UserRole.STAFF,
    });
    prisma.user.update.mockResolvedValue({});
    const result = await service.register({
      email: 'test@test.com',
      password: 'password123',
      firstName: 'T',
      lastName: 'U',
    });
    expect(result.accessToken).toBe('token');
    expect(result.refreshToken).toBe('token');
  });

  it('rejects duplicate email', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1' });
    await expect(
      service.register({
        email: 'test@test.com',
        password: 'password123',
        firstName: 'T',
        lastName: 'U',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('logs in with valid credentials', async () => {
    const hash = await bcrypt.hash('password123', 12);
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      passwordHash: hash,
      firstName: 'T',
      lastName: 'U',
      role: UserRole.ADMIN,
      isActive: true,
    });
    prisma.user.update.mockResolvedValue({});
    const result = await service.login({
      email: 'test@test.com',
      password: 'password123',
    });
    expect(result.user.email).toBe('test@test.com');
    expect(result.accessToken).toBeDefined();
  });

  it('rejects invalid login', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.login({ email: 'x@y.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

import { JwtService } from '@nestjs/jwt';
import { TestingModule, Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { User } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from './enums/role.enum';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';


describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;

  describe('register endpoint', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          AuthService,
          { 
            provide: UserService, 
            useValue: {
              addUser: jest.fn().mockImplementation(() => {
                throw new UnauthorizedException();
              }),
            },
          },
          { provide: JwtService, useValue: {} },
          { provide: getModelToken('User'), useValue: {} },
        ],
      }).compile();

      authController = module.get<AuthController>(AuthController);
      authService = module.get<AuthService>(AuthService);
      userService = module.get<UserService>(UserService);
    });

    it('should throw UnauthorizedException', async () => {
      const userDto = {
        username: 'test',
        email: 'test@test.com',
        password: 'test',
        roles: [Role.User],
      };
      await expect(authController.register(userDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should register a new user', async () => {
      const userDto = {
        username: 'test',
        email: 'test@test.com',
        password: 'test',
        roles: [Role.User],
      };
  
      const createdUser: User = {
        username: userDto.username,
        email: userDto.email,
        password: userDto.password,
        roles: userDto.roles,
      };
  
      (userService.addUser as jest.Mock).mockResolvedValue(createdUser);
      const result = await authController.register(userDto);
      expect(result.username).toBe(createdUser.username);
      expect(result.email).toBe(createdUser.email);
      expect(result.password).toBe(createdUser.password);
      expect(result.roles).toEqual(createdUser.roles);
    });
  });


  describe('when user is unauthenticated', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          AuthService,
          { 
            provide: UserService, 
            useValue: {
              addUser: jest.fn().mockImplementation(() => {
                throw new UnauthorizedException();
              }),
            },
          },
          { provide: JwtService, useValue: {} },
          { provide: getModelToken('User'), useValue: {} },
        ],
      }).compile();

      authController = module.get<AuthController>(AuthController);
      authService = module.get<AuthService>(AuthService);
      userService = module.get<UserService>(UserService);
    });

    it('should throw UnauthorizedException', async () => {
      const userDto = {
        username: 'test',
        email: 'test@test.com',
        password: 'test',
        roles: [Role.User],
      };
      await expect(authController.register(userDto)).rejects.toThrow(UnauthorizedException);
    });
  });
  describe('when user is authenticated', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          AuthService,
          { 
            provide: UserService, 
            useValue: {
              addUser: jest.fn().mockImplementation((user) => Promise.resolve(user)),
            },
          },
          JwtAuthGuard,
          RolesGuard,
          { provide: JwtService, useValue: {} },
          { provide: getModelToken('User'), useValue: {} },
          { provide: JwtAuthGuard, useValue: { canActivate: () => true }},
          { provide: RolesGuard, 
            useValue: { 
              canActivate: (context) => {
                const request = context.switchToHttp().getRequest();
                return request.user.roles.includes(Role.Admin);
              },
            },
          },
        ],
      })
      .compile();

      authController = module.get<AuthController>(AuthController);
      authService = module.get<AuthService>(AuthService);
      userService = module.get<UserService>(UserService);
    });
  
    it('should register a new user', async () => {
      const userDto = {
        username: 'test',
        email: 'test@test.com',
        password: 'test',
        roles: [Role.User],
      };
  
      const createdUser: User = {
        username: userDto.username,
        email: userDto.email,
        password: userDto.password,
        roles: userDto.roles,
      };
  
      (userService.addUser as jest.Mock).mockResolvedValue(createdUser);
      const result = await authController.register(userDto);
      expect(result.username).toBe(createdUser.username);
      expect(result.email).toBe(createdUser.email);
      expect(result.password).toBe(createdUser.password);
      expect(result.roles).toEqual(createdUser.roles);
    });
    
    it('should not allow user to access admin endpoint', async () => {
      const userDto = {
        username: 'test',
        email: 'test@test.com',
        password: 'test',
        roles: [Role.User],
      };

      const req = { user: userDto };

      try {
        await authController.getDashboard(req);
        fail('Should have thrown ForbiddenException');
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });

    it('should allow admin to access user and admin endpoints', async () => {
      const adminDto = {
        username: 'admin',
        email: 'admin@admin.com',
        password: 'admin',
        roles: [Role.Admin],
      };
    
      const req = { user: adminDto };
      const userProfile = await authController.getProfile(req);
      expect(userProfile).toEqual(adminDto);

      const adminDashboard = await authController.getDashboard(req);
      expect(adminDashboard).toEqual(adminDto);
    });
    
  });
});
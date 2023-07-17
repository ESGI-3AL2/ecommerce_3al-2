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
import { UnauthorizedException } from '@nestjs/common';


describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;

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
        ],
      }).compile();

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
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { NotFoundException } from '@nestjs/common';
import { Cities } from '../enums/cties';
import { User } from './entities/user.entity';
import { Response } from 'express';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    mockResponse = {
      cookie: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            signUp: jest.fn(),
            getProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController) as UserController;
    service = module.get<UserService>(UserService) as  UserService;
  });

  describe('signUp', () => {
    it('should create a new user and return the response', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Shady',
        email: 'test@example.com',
        latitude: 30.05,
        longitude: 31.15,
      };

      const createdUser: User = {
        id: 1,
        name: 'Shady',
        email: 'test@example.com',
        city: Cities.Cairo,
      };

      const token = 'mockToken';

      (service.signUp as jest.Mock).mockResolvedValue({ user: createdUser, token });

      await controller.signUp(createUserDto, mockResponse as Response);

      expect(service.signUp).toHaveBeenCalledWith(createUserDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith('jwt', token, { httpOnly: true });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 201,
        message: 'User created successfully',
        data: createdUser,
      });
    });

    it('should return an error response when user creation fails', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Shady',
        email: 'test@example.com',
        latitude: 30.05,
        longitude: 31.15,
      };

      const error = new Error('Something went wrong');
      (service.signUp as jest.Mock).mockRejectedValue(error);

      await controller.signUp(createUserDto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        message: 'User creation failed',
        error: error.message,
      });
    });

    it('should throw a validation error when inputs are invalid', async () => {
      const invalidUserDto: CreateUserDto = {
        name: '',
        email: 'not-an-email',
        latitude: 100,
        longitude: 200,
      };

      (service.signUp as jest.Mock).mockImplementation(() => {
        throw new Error('Validation failed');
      });

      await controller.signUp(invalidUserDto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        message: 'User creation failed',
        error: 'Validation failed',
      });
    });
  });

  describe('getProfile', () => {
    it('should return the user profile for a valid ID', async () => {
      const userId = 1;
      const user: User = {
        id: userId,
        name: 'Shady',
        email: 'test@example.com',
        city: Cities.Cairo,
      };

      (service.getProfile as jest.Mock).mockResolvedValue(user);

      const result = await controller.getProfile(userId.toString());

      expect(result).toEqual({
        statusCode: 200,
        message: 'User profile fetched successfully',
        data: user,
      });
      expect(service.getProfile).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException for an invalid ID', async () => {
      await expect(controller.getProfile('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if the user is not found', async () => {
      const userId = 2;
      (service.getProfile as jest.Mock).mockResolvedValue(null);

      await expect(controller.getProfile(userId.toString())).rejects.toThrow(NotFoundException);
    });
  });
});

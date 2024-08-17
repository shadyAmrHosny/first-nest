import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Cities } from '../enums/cties';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService) as UserService;
    repository = module.get<Repository<User>>(getRepositoryToken(User)) as Repository<User>;
  });

  describe('signUp', () => {
    it('should create a new user with a determined city', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Shady',
        email: 'test@example.com',
        latitude: 30.05,
        longitude: 31.15,
      };

      const savedUser = {
        id: 1,
        name: 'Shady',
        email: 'test@example.com',
        city: Cities.Cairo,
      } as User;

      (repository.create as jest.Mock).mockReturnValue(savedUser);
      (repository.save as jest.Mock).mockResolvedValue(savedUser);

      const result = await service.signUp(createUserDto);
      expect(result).toEqual(savedUser);
      expect(repository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
        city: Cities.Cairo,
      });
      expect(repository.save).toHaveBeenCalledWith(savedUser);
    });

    it('should throw a BadRequestException if city cannot be determined', async () => {
      const createUserDto: CreateUserDto = {
        name: 'shady',
        email: 'test@example.com',
        latitude: 40.0,
        longitude: 50.0,
      };

      await expect(service.signUp(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile by ID', async () => {
      const userId = 1;
      const user = {
        id: userId,
        name: 'shady',
        email: 'shady@example.com',
        city: Cities.Cairo,
      } as User;

      (repository.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.getProfile(userId);
      expect(result).toEqual(user);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 2;

      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.getProfile(userId)).rejects.toThrow(NotFoundException);
    });
  });
});

import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Cities } from '../enums/cties';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}



  /**
   * Creates a new user and determines their city based on latitude and longitude using mocked logic.
   * Generates a JWT token for the newly created user and returns it along with the user data.
   *
   * @param {CreateUserDto} createUserDto - The data transfer object containing user information.
   * @throws {BadRequestException} If the city cannot be determined from the provided coordinates.
   * @returns {Promise<{ user: User; token: string }>} An object containing the newly created user and a JWT token.
   */
  async signUp(createUserDto: CreateUserDto): Promise<{ user: User; token: string }> {
    const city = this.getMockCityFromCoordinates(createUserDto.latitude, createUserDto.longitude);
    if (!city) {
      throw new BadRequestException('Could not determine the city from the provided coordinates.');
    }

    const user = this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      city,
    });
    await this.userRepository.save(user);

    const payload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { user, token };
  }
  /**
   * Mock logic to derive the city based on latitude and longitude.
   *
   * @param {number} latitude - The latitude coordinate.
   * @param {number} longitude - The longitude coordinate.
   * @return {string | null} The name of the city or null if no city is found.
   */
  private getMockCityFromCoordinates(latitude: number, longitude: number): string {
    if (latitude >= 29.5 && latitude <= 31.0 && longitude >= 30.5 && longitude <= 31.7) {
      return Cities.Cairo;
    } else if (latitude >= 30.7 && latitude <= 31.5 && longitude >= 29.0 && longitude <= 30.7) {
      return Cities.Alexandria;
    } else if (latitude >= 28.5 && latitude <= 30.0 && longitude >= 30.5 && longitude <= 32.5) {
      return Cities.Giza;
    } else {
      return null;
    }
  }


  /**
   * Retrieves the profile of a user by their ID.
   *
   * @param {number} userId - The ID of the user to retrieve.
   * @throws {NotFoundException} If the user is not found.
   * @return {Promise<User>} The user profile.
   */
  async getProfile(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

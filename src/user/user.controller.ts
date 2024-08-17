import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException, Res
} from "@nestjs/common";
import { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  /**
   * Handles the creation of a new user.
   *
   * @param {CreateUserDto} createUserDto - The data transfer object containing user information.
   * @param res To access the response object and add the JWT
   * @returns {Promise<{statusCode: number; message: string; data?: User; error?: string}>}
   *    The response containing the status, message, and created user data, or an error message if the creation fails.
   */
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      const { user, token } = await this.userService.signUp(createUserDto);


      res.cookie('jwt', token, { httpOnly: true });

      return res.status(201).json({
        statusCode: 201,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        statusCode: 400,
        message: 'User creation failed',
        error: error.message,
      });
    }
  }
  /**
   * Retrieves the profile of a user by their ID.
   *
   * @param {string} id - The ID of the user to retrieve.
   * @throws {NotFoundException} If the user ID is invalid or if the user is not found.
   * @returns {Promise<{statusCode: number; message: string; data?: User}>}
   *    The response containing the status, message, and user profile data.
   */
  @Get(':id')
  async getProfile(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new NotFoundException('User not found');
    }

    const user = await this.userService.getProfile(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      statusCode: 200,
      message: 'User profile fetched successfully',
      data:user,
    };
  }
}

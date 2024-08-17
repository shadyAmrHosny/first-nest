import { IsEmail, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNumber()
  @Min(22.0)
  @Max(31.5)
  latitude: number;

  @IsNumber()
  @Min(25.0)
  @Max(35.0)
  longitude: number;
}

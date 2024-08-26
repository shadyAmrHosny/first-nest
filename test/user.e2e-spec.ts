import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../src/user/user.module';
import { User } from '../src/user/entities/user.entity';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          synchronize: true,
        }),
        UserModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/user/signup (POST)', async () => {
    return request(app.getHttpServer())
      .post('/user/signup')
      .send({ name: 'Shady', email: 'shady@example.com', latitude: 30.05, longitude: 31.15 })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.name).toBe('Shady');
        expect(res.body.data.email).toBe('shady@example.com');
      });
  });

  it('/user/:id (GET)', async () => {
    const response = await request(app.getHttpServer())
      .post('/user/signup')
      .send({ name: 'Shady', email: 'shady2@example.com', latitude: 30.05, longitude: 31.15 });

    console.log('Response Body:', response.body);

    const userId = response.body?.data?.id;

    expect(userId).toBeDefined();

    if (userId) {
      await request(app.getHttpServer())
        .get(`/user/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.name).toBe('Shady');
          expect(res.body.data.email).toBe('shady2@example.com');
        });
    }
  });
});

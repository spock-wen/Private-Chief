import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { TableStatus } from '@prisma/client';

describe('Business Flow (e2e)', () => {
  let app: INestApplication;
  let dishId: string;
  let tableId: string;
  const sessionId = 'test-session-id-' + Date.now();
  const nickname = 'TestUser';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a dish', async () => {
    const response = await request(app.getHttpServer())
      .post('/dishes')
      .send({
        name: 'Test Dish ' + Date.now(),
        description: 'Delicious test dish',
        category: 'HOT_DISH',
        image: 'http://example.com/image.jpg',
        tags: ['spicy'],
      });

    if (response.status !== 201) {
      console.error('Create Dish Failed:', response.body);
    }
    expect(response.status).toBe(201);

    dishId = response.body.id;
    expect(dishId).toBeDefined();
  });

  it('should create a table', async () => {
    const response = await request(app.getHttpServer())
      .post('/tables')
      .send({
        name: 'Test Table ' + Date.now(),
        time: new Date().toISOString(),
      });

    if (response.status !== 201) {
      console.error('Create Table Failed:', response.body);
    }
    expect(response.status).toBe(201);

    tableId = response.body.id;
    expect(tableId).toBeDefined();
    expect(response.body.status).toBe(TableStatus.PLANNING);
  });

  it('should update table candidates', async () => {
    await request(app.getHttpServer())
      .patch(`/tables/${tableId}/candidates`)
      .send({
        dishIds: [dishId],
      })
      .expect(200);

    // Verify candidates
    const table = await request(app.getHttpServer())
      .get(`/tables/${tableId}`)
      .expect(200);

    expect(table.body.candidateDishes).toHaveLength(1);
    expect(table.body.candidateDishes[0].id).toBe(dishId);
  });

  it('should join the table as a guest', async () => {
    await request(app.getHttpServer())
      .post(`/tables/${tableId}/guests`)
      .send({
        sessionId,
        name: nickname,
      })
      .expect(201);
  });

  it('should start voting phase', async () => {
    await request(app.getHttpServer())
      .patch(`/tables/${tableId}/status`)
      .send({
        status: TableStatus.VOTING,
      })
      .expect(200);
  });

  it('should vote for a dish', async () => {
    await request(app.getHttpServer())
      .post(`/tables/${tableId}/votes`)
      .send({
        sessionId,
        dishId,
      })
      .expect(201);
  });

  it('should get voting heatmap', async () => {
    const response = await request(app.getHttpServer())
      .get(`/tables/${tableId}/votes/heatmap`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    const vote = response.body.find((v: any) => v.dishId === dishId);
    expect(vote).toBeDefined();
    expect(vote.count).toBe(1);
  });

  // Cleanup: Delete the table and dish to keep environment clean
  // Note: Depending on foreign key constraints, we might need to delete votes/guests first or rely on cascade delete.
  // For simplicity in this test, we might skip full cleanup or do it carefully.
  // Prisma usually handles cascade if configured, but let's try to be nice.

  it('should unvote (optional cleanup step)', async () => {
    await request(app.getHttpServer())
      .delete(`/tables/${tableId}/votes/${dishId}`)
      .send({ sessionId }) // DELETE usually doesn't take body in standard REST but our controller uses @Body
      // Wait, let's check the controller.
      // @Delete(':dishId') unvote(@Param... @Body('sessionId') ...)
      // HTTP DELETE with body is discouraged but supported by some clients/frameworks.
      // Supertest supports it.
      .expect(200);
  });
});

import { MigrationInterface, QueryRunner } from "typeorm";


// npx typeorm migration:create src/migrations/InsertSampleUsers
export class InsertSampleUsers1723899696521 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      INSERT INTO user (name, email, city) VALUES
      ('shady amr', 'shady@example.com', 'Cairo'),
      ('amr mahmoud', 'amr@example.com', 'Alexandria'),
      ('omar', 'omar@example.com', 'Alexandria');

    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      DELETE FROM user WHERE email IN ('shady@example.com', 'amr@example.com','omar@example.com');
    `);
    }

}


// Run the migration to apply the changes to your database.
// npx typeorm migration:run
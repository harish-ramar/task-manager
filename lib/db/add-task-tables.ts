import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { db } from './drizzle';

async function addTaskTables() {
  try {
    console.log('Adding task tables...');
    
    // Create tasks table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id serial PRIMARY KEY NOT NULL,
        title varchar(255) NOT NULL,
        description text,
        status varchar(20) DEFAULT 'todo' NOT NULL,
        created_by integer NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Create task_comments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS task_comments (
        id serial PRIMARY KEY NOT NULL,
        task_id integer NOT NULL,
        comment text NOT NULL,
        created_by integer NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Create task_media table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS task_media (
        id serial PRIMARY KEY NOT NULL,
        task_id integer NOT NULL,
        file_name varchar(255) NOT NULL,
        file_type varchar(100) NOT NULL,
        file_url text NOT NULL,
        file_size integer NOT NULL,
        uploaded_by integer NOT NULL,
        uploaded_at timestamp DEFAULT now() NOT NULL
      );
    `);
    
    // Add foreign key constraints
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_created_by_users_id_fk') THEN
          ALTER TABLE tasks ADD CONSTRAINT tasks_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES users(id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'task_comments_task_id_tasks_id_fk') THEN
          ALTER TABLE task_comments ADD CONSTRAINT task_comments_task_id_tasks_id_fk FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'task_comments_created_by_users_id_fk') THEN
          ALTER TABLE task_comments ADD CONSTRAINT task_comments_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES users(id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'task_media_task_id_tasks_id_fk') THEN
          ALTER TABLE task_media ADD CONSTRAINT task_media_task_id_tasks_id_fk FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'task_media_uploaded_by_users_id_fk') THEN
          ALTER TABLE task_media ADD CONSTRAINT task_media_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES users(id);
        END IF;
      END $$;
    `);
    
    console.log('Task tables added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding task tables:', error);
    process.exit(1);
  }
}

addTaskTables();

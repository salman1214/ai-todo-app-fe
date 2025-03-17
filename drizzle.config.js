// import 'dotenv/config';
// import { defineConfig } from 'drizzle-kit';

// export default defineConfig({
//     out: './drizzle',
//     schema: './db/schema.js',
//     dialect: 'postgresql',
//     dbCredentials: {
//         url: process.env.DATABASE_URL,
//     },
// });


import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './drizzle',
    schema: './db/schema.js',
    dialect: 'sqlite',
    dbCredentials: {
        url: process.env.DB_FILE_NAME,
    },
});

import dotenv from 'dotenv';
import http from 'http';

// Load env BEFORE importing any other modules so they can read process.env at init time
dotenv.config();

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // Dynamically import modules that rely on env vars (DB, routes, Cloudinary via controllers)
    const [{ default: app }, { default: connectDB }] = await Promise.all([
      import('./app.js'),
      import('./config/db.js'),
    ]);

    await connectDB();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();

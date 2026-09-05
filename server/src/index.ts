import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRoutes from './routes/payment.routes.js';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

  // Security & Parsing Middleware
  // Restrict CORS to known origins for demo and dev environments
  const allowedOrigins = [
    'http://localhost:5173', // Vite dev server
    'https://demo.shoppilot.com', // Production demo host (adjust as needed)
  ];
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    })
  );
app.use(express.json());

// API Health Check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'ShopPilot Autonomous Commerce Agent — Razorpay Payment Gateway',
    version: '2.4.0',
    mode: 'Razorpay Test Mode',
    timestamp: new Date().toISOString(),
  });
});

// Mount Payment Routes
app.use('/api/payments', paymentRoutes);

// Global Error Handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error in payment subsystem',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[ShopPilot Server] Payment gateway backend running on http://localhost:${PORT}`);
  console.log(`[ShopPilot Server] Razorpay environment: TEST MODE ONLY`);
});

export default app;

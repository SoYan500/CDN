import express, { Request, Response } from 'express';

const app = express();

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const healthResponse = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: 'CDN Management Server is running smoothly'
  };

  res.status(200).json(healthResponse);
});

export default app;
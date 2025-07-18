import type { Response, NextFunction } from "express";
import express, { type Request } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

console.warn("--- Checking Environment Variables ---");
console.warn(
  "CLERK_PUBLISHABLE_KEY:",
  process.env.CLERK_PUBLISHABLE_KEY ? "Loaded" : "MISSING"
);
console.warn(
  "CLERK_SECRET_KEY:",
  process.env.CLERK_SECRET_KEY ? "Loaded" : "MISSING"
);
console.warn("------------------------------------");
const app = express();
// Parse Clerk webhooks as raw buffers so signature verification succeeds
app.use('/api/webhooks/clerk', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson) {
    capturedJsonResponse = bodyJson as Record<string, unknown>;
    return originalResJson.call(res, bodyJson);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = registerRoutes(app);

  app.use((err: Error & { status?: number, statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("SERVER ERROR:", err); // 👈 We'll log the error instead
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      //reusePort: true,
    },
    () => {
      const url = `http://localhost:${port}`;
      log(`serving on port ${port}`);
      console.warn(`🚀 Server is running at: ${url}`);
    }
  );
})().catch((err) => {
  console.error("Failed to start server:", err);
});

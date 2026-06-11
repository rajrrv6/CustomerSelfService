# Free Hosting & Deployment Strategy

This document maps out deployment configurations, resource limits, and workaround strategies for hosting the CustomerSelfService backend entirely on free tiers.

---

## 1. Hosting Provider Analysis

### Render Free Tier (Web Service)
- **Memory Limit**: 512MB RAM (Exceeding this triggers instant container termination).
- **Concurrency**: Shared CPU, which limits maximum requests per second.
- **Sleep Mode**: Inactive containers spin down after 15 minutes of quiet traffic. The first incoming request after sleep triggers a **cold start** delay of 50-120 seconds.
- **WebSocket persistence**: Render Free Web Services support persistent WebSockets, but the connection is terminated every time the container is cycled or goes to sleep.

### Railway / Fly.io
- **Railway Developer plan**: $5/mo free credit (capped execution hours).
- **Fly.io Free plan**: Capped at 3 shared-cpu-1x containers with 256MB RAM. Excellent performance, but lacks automatic sleep prevention, requiring manual allocation strategies to stay within budget parameters.

### Vercel Serverless (Not Recommended for Backend)
- **Constraint**: Serverless functions have a 10-second timeout limit on free tiers.
- **WebSocket Block**: Serverless containers cannot maintain persistent TCP state, making Socket.io connections impossible without paid external serverless adapters (like Pusher).

---

## 2. Mitigation for Cold Starts & Sleep Mode
Because the Render Free web server cycles to sleep after 15 minutes, we deploy two sleep-mitigation steps:

1. **Self-Ping Scheduler**: We configure a background task inside the in-memory cron runner that executes a HTTP ping request to its own health check endpoint (`/api/v1/health`) every 14 minutes.
2. **External Keep-Alive Cron**: Set up a free account on [Cron-Job.org](https://cron-job.org/) to trigger a GET request to `https://your-service.onrender.com/api/v1/health` every 10 minutes. This ensures the container stays warm during core operational business hours.

---

## 3. MongoDB Atlas Free Tier Limits
- **Storage Cap**: 512MB total storage.
- **Connection Limit**: Capped at 100 simultaneous open socket connections.
- **Mitigation (Mongoose Connection Pooling)**: Set `maxPoolSize` to 5 in Mongoose. If 10 instances of the app or test runners run concurrently, this prevents overloading Atlas's connection slot count:
  ```typescript
  mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 5,
    socketTimeoutMS: 45000,
  });
  ```
- **Indexes limit**: Keep index definitions light. Do not exceed 5 compound indexes per collection to stay within memory limits.

---

## 4. File Upload Limits (Direct Streaming)
- **Constraint**: Render Free containers do not offer persistent local disks. Disk writes inside `/tmp` consume container memory (RAM), risking out-of-memory crashes.
- **Strategy**: Never write files to disk. Uploaded files from the client-admin knowledge base wizard are parsed as an in-memory stream using `multer` or `busboy` and passed directly to external stores (like free Cloudinary or AWS S3 equivalents), keeping memory footprint under 2MB.

---

## 5. Summary Matrix for Free-Tier Deployment

| Resource Component | Provider / Solution | Free Tier Constraint | Configuration Adjustment |
| :--- | :--- | :--- | :--- |
| **App Server** | Render (Web Service) | 512MB RAM, 15m Sleep | Multer memory storage, Cron keep-alive |
| **WebSockets** | Express + Socket.io | Persisted connections | Socket client reconnection config |
| **Database** | MongoDB Atlas M0 | 512MB Disk, 100 Connects | Pool size = 5, limit compound indexes |
| **Scheduler** | Node-cron | Runs in-process memory | Fallback to cron-job.org if sleep occurs |
| **Vector DB** | Atlas Vector Search | Shared database space | COS Similarity search over Atlas collection |
# Backup & Disaster Recovery Strategy

This document outlines the backup processes, disaster recovery plans, restore operations, and environment setup checklists for the platform.

---

## 1. MongoDB Atlas Backups (Free Tier Constraints)
- **Atlas Shared Tier (M0)**: Automatic scheduled cluster snapshots are **not** supported on the free M0 tier.
- **Development / Free-tier Backup Strategy**:
  - We configure an automatic cron schedule (`node-cron` or local job queue runner) executing every 24 hours (midnight).
  - The script runs `mongodump` using the MongoDB connection URI, compresses the output as a `.tar.gz` bundle, and uploads it to our secured object storage buckets (e.g. free Cloudinary, AWS S3 equivalent, or external backups node).
  - To prevent container memory saturation, the dump process streams directly using pipe connections rather than local file storage.

---

## 2. Retention Policies
To comply with data safety frameworks, data collections follow structured lifecycle limits:

| Data Class | Retention Period | Action |
| :--- | :---: | :--- |
| **Conversations / Transcripts**| 1 Year | Archive to cold storage |
| **Audit Logs (Security logs)** | 3 Years | Retained in read-only compressed archives |
| **AI Interactions Logs** | 90 Days | Aggregate to hourly metrics, delete raw messages |
| **Ingestion Logs** | 30 Days | Pruned automatically |
| **Background Jobs** | 7 Days | Pruned after successful completion |

---

## 3. Restore Procedures & Checkpoint Checks
To recover database state in the event of database corruption:
1. Spin down active application servers to prevent dirty writes.
2. Clear the database namespace target.
3. Fetch the latest daily backup archive.
4. Run `mongorestore` using the command-line utility:
   ```bash
   mongorestore --uri="mongodb+srv://..." --drop --archive=backup_2026-06-10.tar.gz --gzip
   ```
5. Spin up a single application server, run automated integration verification tests, and confirm indices are fully reconstructed.
6. Re-enable traffic routing.

---

## 4. Environment Recreation Checklist
In the event of a provider outage (e.g. Render Web Service fails or Railway changes pricing parameters), use this checklist to rebuild the stack:

1. **Scaffold Container Services**: Build and register the Docker environment on the target host (Render, Fly.io, or AWS EC2).
2. **DNS & SSL Provisioning**: Set up CNAME records pointing to the new domain, mapping the API subdomains (`api.*`).
3. **Environment Keys Sync**: Set up all variables listed in `.env.example` in the new provider interface.
4. **Atlas Database Whitelist**: Confirm the IP address of the new server container is added to the MongoDB Access Control list.
5. **Real-time Webhook Bindings**: Update webhook callback links inside the Meta developer dashboard (WhatsApp) and Twilio console to target the new server domain.
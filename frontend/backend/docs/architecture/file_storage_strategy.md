# File Storage Abstraction Strategy

This document details the file upload strategy, cloud storage abstractions, free tier configurations, and lifecycle cleanup jobs.

---

## 1. Storage Abstraction Interface
To decouple application logic from third-party storage APIs, all upload operations pass through a generic `StorageService` interface:

```typescript
interface IUploadResult {
  url: string;        // Public access URL
  storageKey: string; // Identifier used for deletion/lookups
  sizeBytes: number;
  mimeType: string;
}

interface IStorageProvider {
  upload(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<IUploadResult>;
  delete(storageKey: string): Promise<void>;
  getSignedUrl(storageKey: string, expirySeconds?: number): Promise<string>;
}
```

---

## 2. Storage Providers

### 1. Local Development Provider (`LocalStorageProvider`)
- **Use Case**: Local development offline.
- **Behavior**: Saves buffers to a git-ignored folder `backend/public/uploads/` on the local disk.
- **Access URL**: Maps files to `http://localhost:5001/uploads/[fileName]`.

### 2. Free Cloud Storage Provider (`CloudinaryStorageProvider`)
- **Use Case**: Live staging and production on Render.
- **Behavior**: Streams files directly using Cloudinary's Node SDK.
- **Free Limit**: Cloudinary offers 25 monthly credits (approx. 25GB storage or bandwidth), which fits development needs.

### 3. Future Enterprise Upgrade (`S3StorageProvider`)
- **Behavior**: Swaps in an AWS S3 client using the AWS SDK, with no change to the core service signatures.

---

## 3. Upload Security Guards
Before buffers are accepted by the storage providers:
- **Size Verification**: Reject files exceeding 5MB.
- **MIME Whitelists**: Accept only `application/pdf`, `text/plain` for knowledge bases, and `image/png`, `image/jpeg` for chat attachments.
- **Path Isolation**: Files are uploaded into tenant-scoped paths:
  ```text
  tenant/[tenantId]/kb/[fileId]
  tenant/[tenantId]/chat/[messageId]
  ```

---

## 4. Deletion & Cleanup Background Jobs
- **Orphaned Attachments**: If a customer starts a ticket draft, uploads an attachment, but aborts the submission, the file remains in storage.
- **Cleanup Job**: A weekly cron job scans the storage directories, compares keys against the `messages` and `knowledge_sources` database collections, and triggers deletion calls for orphaned files.
'use client';

import { useNotificationStore } from './notifications/notificationStore';

/**
 * Backward compatibility wrapper.
 *
 * Redirects all imports of `useNotificationsStore` to the new unified `useNotificationStore`
 * under `@/stores/notifications/notificationStore`. This preserves audit log operations
 * and avoids multiple desynchronized stores.
 */
export const useNotificationsStore = useNotificationStore;

import { apiClient } from '../api/apiClient';

export type NotificationPreferences = {
  push?: boolean;
  email?: boolean;
  sms?: boolean;
  marketing?: boolean;
};

export const notificationService = {
  async registerPushToken(expoPushToken: string, appVariant: 'customer' | 'agent', platform?: string) {
    await apiClient.post('/notifications/push-tokens', {
      expoPushToken,
      appVariant,
      platform,
    });
  },

  async unregisterPushToken(expoPushToken: string) {
    await apiClient.delete('/notifications/push-tokens', {
      data: { expoPushToken },
    });
  },

  async getPreferences() {
    const res = await apiClient.get('/notifications/preferences');
    return res.data?.preferences as NotificationPreferences;
  },

  async savePreferences(preferences: NotificationPreferences) {
    const res = await apiClient.patch('/notifications/preferences', { preferences });
    return res.data?.preferences as NotificationPreferences;
  },

  async getCustomerNotifications() {
    const res = await apiClient.get('/notifications/me');
    return res.data;
  },

  async getStaffNotifications() {
    const res = await apiClient.get('/notifications/staff/me');
    return res.data;
  },

  async markCustomerRead(id: string) {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markStaffRead(id: string) {
    await apiClient.patch(`/notifications/staff/${id}/read`);
  },

  async markAllCustomerRead() {
    await apiClient.patch('/notifications/me/read-all');
  },

  async markAllStaffRead() {
    await apiClient.patch('/notifications/staff/me/read-all');
  },
};

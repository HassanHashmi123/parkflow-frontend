import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('parkflow_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 — token expired or invalid → clear auth and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('parkflow_token');
      localStorage.removeItem('parkflow_user');
      localStorage.removeItem('parkflow-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============= Auth =============
export const authApi = {
  login: async (username: string, password: string) => {
    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);
    const { data } = await api.post('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return data;
  },
  loginJson: async (username: string, password: string) => {
    const { data } = await api.post('/auth/login-json', { username, password });
    return data;
  },
  me: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
  changePassword: async (current_password: string, new_password: string) => {
    await api.post('/auth/change-password', null, {
      params: { current_password, new_password },
    });
  },
};

// ============= Sessions =============
export const sessionsApi = {
  checkin: async (payload: {
    plate_number: string;
    vehicle_type_id: number;
    entry_method?: string;
    notes?: string;
  }) => {
    const { data } = await api.post('/sessions/checkin', payload);
    return data;
  },
  checkout: async (payload: {
    token?: string;
    plate_number?: string;
    notes?: string;
  }) => {
    const { data } = await api.post('/sessions/checkout', payload);
    return data;
  },
  active: async () => {
    const { data } = await api.get('/sessions/active');
    return data;
  },
  today: async () => {
    const { data } = await api.get('/sessions/today');
    return data;
  },
  search: async (params: any) => {
    const { data } = await api.get('/sessions/search', { params });
    return data;
  },
};

// ============= Vehicle Types =============
export const vehicleTypesApi = {
  list: async (activeOnly: boolean = true) => {
    const { data } = await api.get('/vehicle-types', { params: { active_only: activeOnly } });
    return data;
  },
  create: async (payload: { name: string; flat_rate: number; icon?: string }) => {
    const { data } = await api.post('/vehicle-types', payload);
    return data;
  },
  update: async (id: number, payload: any) => {
    const { data } = await api.patch(`/vehicle-types/${id}`, payload);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/vehicle-types/${id}`);
  },
};

// ============= Reports =============
export const reportsApi = {
  summary: async () => {
    const { data } = await api.get('/reports/summary');
    return data;
  },
  hourly: async (date?: string) => {
    const { data } = await api.get('/reports/hourly', { params: date ? { date } : {} });
    return data;
  },
  daily: async (days?: number) => {
    const { data } = await api.get('/reports/daily', { params: days ? { days } : {} });
    return data;
  },
  monthly: async (year?: number) => {
    const { data } = await api.get('/reports/monthly', { params: year ? { year } : {} });
    return data;
  },
  byVehicleType: async (from_date?: string, to_date?: string) => {
    const { data } = await api.get('/reports/by-vehicle-type', { params: { from_date, to_date } });
    return data;
  },
  history: async (params: {
    period: 'hourly' | 'daily' | 'weekly' | 'monthly';
    from_date?: string;
    to_date?: string;
    target_date?: string;
    year?: number;
  }) => {
    const { data } = await api.get('/reports/history', { params });
    return data;
  },
  dailySlip: async (slip_date: string) => {
    const { data } = await api.get(`/reports/daily-slip/${slip_date}`);
    return data;
  },
  closeDay: async (target_date?: string, notes?: string) => {
    const { data } = await api.post('/reports/close-day', null, {
      params: { target_date, notes },
    });
    return data;
  },
  snapshots: async (limit?: number) => {
    const { data } = await api.get('/reports/snapshots', { params: { limit } });
    return data;
  },
};

// ============= Users (Admin) =============
export const usersApi = {
  list: async () => {
    const { data } = await api.get('/users');
    return data;
  },
  create: async (payload: { username: string; full_name: string; email?: string; password: string; role: string }) => {
    const { data } = await api.post('/users', payload);
    return data;
  },
  update: async (id: number, payload: any) => {
    const { data } = await api.patch(`/users/${id}`, payload);
    return data;
  },
  resetPassword: async (id: number, new_password: string) => {
    await api.post(`/users/${id}/reset-password`, null, { params: { new_password } });
  },
  deactivate: async (id: number) => {
    await api.delete(`/users/${id}`);
  },
};

// ============= Shops (Phase 3A) =============
export const shopsApi = {
  list: async (params?: { search?: string; block?: string; floor?: string; plaza_name?: string; is_active?: boolean; skip?: number; limit?: number }) => {
    const { data } = await api.get('/shops', { params });
    return data;
  },
  plazas: async (): Promise<string[]> => {
    const { data } = await api.get('/shops/plazas');
    return data;
  },
  get: async (id: number) => {
    const { data } = await api.get(`/shops/${id}`);
    return data;
  },
  create: async (payload: any) => {
    const { data } = await api.post('/shops', payload);
    return data;
  },
  update: async (id: number, payload: any) => {
    const { data } = await api.patch(`/shops/${id}`, payload);
    return data;
  },
  deactivate: async (id: number) => {
    await api.delete(`/shops/${id}`);
  },
  count: async () => {
    const { data } = await api.get('/shops/count');
    return data;
  },
  bulkUpload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/shops/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  resetAll: async () => {
    const { data } = await api.delete('/shops/reset-all');
    return data;
  },
};

// ============= Permanent Vehicles (Phase 3A) =============
export const permanentVehiclesApi = {
  list: async (params?: { search?: string; shop_id?: number; is_active?: boolean; skip?: number; limit?: number }) => {
    const { data } = await api.get('/permanent-vehicles', { params });
    return data;
  },
  lookup: async (plate: string) => {
    const { data } = await api.get(`/permanent-vehicles/lookup/${encodeURIComponent(plate)}`);
    return data as { is_permanent: boolean; plate_number: string; permanent_vehicle: any };
  },
  create: async (payload: { plate_number: string; shop_id: number; vehicle_type_id: number; owner_name?: string; owner_phone?: string; notes?: string }) => {
    const { data } = await api.post('/permanent-vehicles', payload);
    return data;
  },
  update: async (id: number, payload: any) => {
    const { data } = await api.patch(`/permanent-vehicles/${id}`, payload);
    return data;
  },
  deactivate: async (id: number) => {
    await api.delete(`/permanent-vehicles/${id}`);
  },
  bulkUpload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/permanent-vehicles/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  resetAll: async () => {
    const { data } = await api.delete('/permanent-vehicles/reset-all');
    return data;
  },
};

// ============= Monthly Payments (Phase 3A) =============
export const monthlyPaymentsApi = {
  list: async (params?: { shop_id?: number; month?: string; skip?: number; limit?: number }) => {
    const { data } = await api.get('/monthly-payments', { params });
    return data;
  },
  create: async (payload: {
    shop_id: number;
    month: string;
    amount: number;
    payment_method?: string;
    receipt_number?: string;
    notes?: string;
    billing_start?: string;
    billing_end?: string;
  }) => {
    const { data } = await api.post('/monthly-payments', payload);
    return data;
  },
  update: async (id: number, payload: any) => {
    const { data } = await api.patch(`/monthly-payments/${id}`, payload);
    return data;
  },
  pending: async (month: string) => {
    const { data } = await api.get(`/monthly-payments/pending/${month}`);
    return data;
  },
  summary: async (month: string) => {
    const { data } = await api.get(`/monthly-payments/summary/${month}`);
    return data;
  },
  reminders: async () => {
    const { data } = await api.get('/monthly-payments/reminders');
    return data as { today: string; count: number; reminders: any[] };
  },
};

// ============= ANPR =============
export const anprApi = {
  scan: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/anpr/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data as {
      plate: string | null;
      confidence: number;
      all_candidates: { plate: string; confidence: number }[];
      raw_text: string[];
    };
  },
};

export default api;

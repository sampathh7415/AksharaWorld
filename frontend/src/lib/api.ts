const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.message || res.statusText, res.status);
  }
  return res.json();
}

export const api = {
  register: (data: object) => request<{ accessToken: string; refreshToken: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: object) => request<{ user: object; accessToken: string; refreshToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  refresh: (refreshToken: string) => request<{ accessToken: string; refreshToken: string }>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  logout: (token: string) => request<{ success: boolean }>('/auth/logout', { method: 'POST' }, token),

  getDashboard: (token: string) =>
    request<{
      totalSales: number;
      totalOrders: number;
      pendingOrders: number;
      lowStockProducts: number;
      activeCustomers: number;
      liveRevenue: number;
    }>(`/analytics/dashboard`, {}, token),
  getDailySales: (token: string, days = 7) =>
    request<{ date: string; revenue: number; orders: number }[]>(`/analytics/daily-sales?days=${days}`, {}, token),
  getTopProducts: (token: string) => request<unknown[]>('/analytics/top-products', {}, token),

  getCustomers: (token: string, search?: string) =>
    request<unknown[]>(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`, {}, token),
  createCustomer: (token: string, data: object) =>
    request<unknown>('/customers', { method: 'POST', body: JSON.stringify(data) }, token),
  updateCustomer: (token: string, id: string, data: object) =>
    request<unknown>(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
  deleteCustomer: (token: string, id: string) =>
    request<{ success: boolean }>(`/customers/${id}`, { method: 'DELETE' }, token),

  getProducts: (token: string, search?: string, lowStock?: boolean) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (lowStock) params.set('lowStock', 'true');
    const q = params.toString();
    return request<unknown[]>(`/products${q ? `?${q}` : ''}`, {}, token);
  },
  createProduct: (token: string, data: object) =>
    request<unknown>('/products', { method: 'POST', body: JSON.stringify(data) }, token),
  updateProduct: (token: string, id: string, data: object) =>
    request<unknown>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),
  adjustStock: (token: string, id: string, data: object) =>
    request<unknown>(`/products/${id}/stock`, { method: 'POST', body: JSON.stringify(data) }, token),
  deleteProduct: (token: string, id: string) =>
    request<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }, token),

  getOrders: (token: string, params?: Record<string, string>) => {
    const q = params ? `?${new URLSearchParams(params)}` : '';
    return request<unknown[]>(`/orders${q}`, {}, token);
  },
  createOrder: (token: string, data: object) =>
    request<unknown>('/orders', { method: 'POST', body: JSON.stringify(data) }, token),
  updateOrderStatus: (token: string, id: string, status: string) =>
    request<unknown>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token),
  cancelOrder: (token: string, id: string) =>
    request<unknown>(`/orders/${id}/cancel`, { method: 'POST' }, token),

  getPayments: (token: string) => request<unknown[]>('/payments', {}, token),
  createPayment: (token: string, data: object) =>
    request<unknown>('/payments', { method: 'POST', body: JSON.stringify(data) }, token),
  updatePayment: (token: string, id: string, data: object) =>
    request<unknown>(`/payments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, token),

  getUsers: (token: string) => request<unknown[]>('/users', {}, token),
  createUser: (token: string, data: object) =>
    request<unknown>('/users', { method: 'POST', body: JSON.stringify(data) }, token),

  getNotifications: (token: string, unreadOnly?: boolean) =>
    request<unknown[]>(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`, {}, token),
  markNotificationRead: (token: string, id: string) =>
    request<unknown>(`/notifications/${id}/read`, { method: 'PATCH' }, token),
  markAllNotificationsRead: (token: string) =>
    request<{ success: boolean }>('/notifications/read-all', { method: 'POST' }, token),

  getSettings: (token: string) => request<Record<string, unknown>>('/settings', {}, token),
  updateSettings: (token: string, data: object) =>
    request<Record<string, unknown>>('/settings', { method: 'PATCH', body: JSON.stringify(data) }, token),
};

import { getToken, clearAuth } from '@/utils/storage';

const baseURL = 'http://10.133.233.96:8070/api';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  needAuth?: boolean;
}

export async function request<T>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = getToken();
    
    console.log('[request]', options.url, 'needAuth:', options.needAuth, 'hasToken:', !!token);
    
    uni.request({
      url: baseURL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(options.needAuth && token 
          ? { 'Authorization': `Bearer ${token}` } 
          : {})
      },
      success: (res: any) => {
        console.log('[response]', options.url, 'statusCode:', res.statusCode, 'data:', res.data);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
        } else if (res.statusCode === 401) {
          clearAuth();
          uni.navigateTo({ url: '/pages/auth/login' });
          reject(new Error('未登录'));
        } else {
          reject(new Error(res.data?.message || '请求失败'));
        }
      },
      fail: (err) => {
        console.error('[request fail]', options.url, err);
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
}

export default request;

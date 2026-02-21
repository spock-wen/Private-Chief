import request from './request';
import type { LoginResponse, User } from '@/types';

export interface WechatLoginDto {
  code: string;
}

export interface EmailLoginDto {
  email: string;
  password: string;
}

export async function wechatLogin(dto: WechatLoginDto): Promise<LoginResponse> {
  return request<LoginResponse>({
    url: '/auth/wechat',
    method: 'POST',
    data: dto
  });
}

export async function login(dto: EmailLoginDto): Promise<LoginResponse> {
  return request<LoginResponse>({
    url: '/auth/login',
    method: 'POST',
    data: dto
  });
}

export async function refreshToken(): Promise<LoginResponse> {
  return request<LoginResponse>({
    url: '/auth/refresh',
    method: 'POST',
    needAuth: true
  });
}

export async function getProfile(): Promise<User> {
  return request<User>({
    url: '/auth/profile',
    method: 'GET',
    needAuth: true
  });
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  return request<User>({
    url: '/auth/profile',
    method: 'PUT',
    data,
    needAuth: true
  });
}

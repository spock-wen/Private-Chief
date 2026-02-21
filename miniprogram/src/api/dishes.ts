import request from './request';
import type { Dish } from '@/types';

export async function getDishes(familyId: string): Promise<Dish[]> {
  return request<Dish[]>({
    url: `/dishes?familyId=${familyId}`,
    method: 'GET',
    needAuth: true
  });
}

export async function getDish(id: string): Promise<Dish> {
  return request<Dish>({
    url: `/dishes/${id}`,
    method: 'GET',
    needAuth: true
  });
}

export async function createDish(data: any): Promise<Dish> {
  return request<Dish>({
    url: '/dishes',
    method: 'POST',
    data,
    needAuth: true
  });
}

export async function updateDish(id: string, data: any): Promise<Dish> {
  return request<Dish>({
    url: `/dishes/${id}`,
    method: 'PUT',
    data,
    needAuth: true
  });
}

export async function deleteDish(id: string): Promise<void> {
  return request({
    url: `/dishes/${id}`,
    method: 'DELETE',
    needAuth: true
  });
}

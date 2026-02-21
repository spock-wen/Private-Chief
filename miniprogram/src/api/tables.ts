import request from './request';
import type { Table, Guest } from '@/types';

export async function getTables(familyId: string): Promise<Table[]> {
  return request<Table[]>({
    url: `/tables?familyId=${familyId}`,
    method: 'GET',
    needAuth: true
  });
}

export async function getTable(id: string): Promise<Table> {
  return request<Table>({
    url: `/tables/${id}`,
    method: 'GET',
    needAuth: true
  });
}

export async function createTable(data: any): Promise<Table> {
  return request<Table>({
    url: '/tables',
    method: 'POST',
    data,
    needAuth: true
  });
}

export async function updateTable(id: string, data: any): Promise<Table> {
  return request<Table>({
    url: `/tables/${id}`,
    method: 'PUT',
    data,
    needAuth: true
  });
}

export async function joinTable(tableId: string, data: any): Promise<Guest> {
  return request<Guest>({
    url: `/guests/join`,
    method: 'POST',
    data: { tableId, ...data },
    needAuth: true
  });
}

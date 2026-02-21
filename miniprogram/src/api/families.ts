import request from './request';
import type { Family, FamilyInvitation } from '@/types';

export async function getFamilies(): Promise<Family[]> {
  return request<Family[]>({
    url: '/families',
    method: 'GET',
    needAuth: true
  });
}

export async function getFamily(id: string): Promise<Family> {
  return request<Family>({
    url: `/families/${id}`,
    method: 'GET',
    needAuth: true
  });
}

export async function createFamily(data: any): Promise<Family> {
  return request<Family>({
    url: '/families',
    method: 'POST',
    data,
    needAuth: true
  });
}

export async function createInvitation(familyId: string, data: any): Promise<FamilyInvitation> {
  return request<FamilyInvitation>({
    url: `/families/${familyId}/invitations`,
    method: 'POST',
    data,
    needAuth: true
  });
}

export async function joinFamily(inviteCode: string): Promise<any> {
  return request({
    url: '/families/join',
    method: 'POST',
    data: { inviteCode },
    needAuth: true
  });
}

export async function getFamilyMembers(familyId: string): Promise<any[]> {
  const family: any = await request({
    url: `/families/${familyId}`,
    method: 'GET',
    needAuth: true
  });
  return family?.members || [];
}

export async function removeFamilyMember(familyId: string, memberId: string): Promise<void> {
  return request({
    url: `/families/${familyId}/members/${memberId}`,
    method: 'DELETE',
    needAuth: true
  });
}

export async function getInvitations(familyId: string): Promise<FamilyInvitation[]> {
  return request<FamilyInvitation[]>({
    url: `/families/${familyId}/invitations`,
    method: 'GET',
    needAuth: true
  });
}

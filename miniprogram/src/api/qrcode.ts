import request from './request';

export interface QrcodeResponse {
  url: string;
}

export async function getTableQrcode(tableId: string): Promise<QrcodeResponse> {
  return request<QrcodeResponse>({
    url: `/qrcode/table/${tableId}`,
    method: 'GET',
    needAuth: true
  });
}

export async function getFamilyQrcode(familyId: string): Promise<QrcodeResponse> {
  return request<QrcodeResponse>({
    url: `/qrcode/family/${familyId}`,
    method: 'GET',
    needAuth: true
  });
}

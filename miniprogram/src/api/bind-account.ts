import request from './request';

export async function sendPhoneCode(phone: string) {
  return request({
    url: '/auth/send-code',
    method: 'POST',
    data: { phone },
    needAuth: false
  });
}

export async function bindPhone(phone: string, code: string) {
  return request({
    url: '/auth/bind-phone',
    method: 'POST',
    data: { phone, code },
    needAuth: true
  });
}

export async function bindWechat(code: string) {
  return request({
    url: '/auth/bind-wechat',
    method: 'POST',
    data: { code },
    needAuth: true
  });
}

export async function bindWechatByToken(bindToken: string, code: string) {
  return request({
    url: '/auth/bind-wechat-by-token',
    method: 'POST',
    data: { bindToken, code },
    needAuth: false
  });
}

export async function unbindPhone() {
  return request({
    url: '/auth/unbind-phone',
    method: 'POST',
    needAuth: true
  });
}

export async function unbindWechat() {
  return request({
    url: '/auth/unbind-wechat',
    method: 'POST',
    needAuth: true
  });
}

export async function getBindInfo() {
  return request({
    url: '/auth/bind-info',
    method: 'GET',
    needAuth: true
  });
}

import api from './http';

export const verifyEsewaPayment = async ({ orderId, refId, amt }) => {
  const { data } = await api.post('/payments/esewa/verify', { orderId, refId, amt });
  return data;
};

export const verifyKhaltiPayment = async ({ orderId, token }) => {
  const { data } = await api.post('/payments/khalti/verify', { orderId, token });
  return data;
};

import api from './http.js';

export const submitContact = async (payload) => {
  const { data } = await api.post('/contact', payload);
  return data;
};

import api from './http';

export const getCart = async () => {
  const { data } = await api.get('/cart');
  return data;
};

export const addToCart = async (bookId, quantity = 1) => {
  const { data } = await api.post('/cart/add', { bookId, quantity });
  return data;
};

export const updateCartItem = async (bookId, quantity) => {
  const { data } = await api.put(`/cart/item/${bookId}`, { quantity });
  return data;
};

export const removeCartItem = async (bookId) => {
  const { data } = await api.delete(`/cart/item/${bookId}`);
  return data;
};

export const clearCart = async () => {
  const { data } = await api.delete('/cart');
  return data;
};

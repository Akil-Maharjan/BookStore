import api from './http';

export const fetchBooks = async (params = {}) => {
  const { data } = await api.get('/books', { params });
  return data;
};

export const fetchBook = async (id) => {
  const { data } = await api.get(`/books/${id}`);
  return data;
};

export const createBook = async (payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.append(k, v);
  });
  const { data } = await api.post('/books', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};

export const updateBook = async (id, payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.append(k, v);
  });
  const { data } = await api.put(`/books/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};

export const deleteBook = async (id) => {
  const { data } = await api.delete(`/books/${id}`);
  return data;
};

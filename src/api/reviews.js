import api from './http';

export const getReviews = async (bookId) => {
  const { data } = await api.get(`/reviews/${bookId}`);
  return data;
};

export const addOrUpdateReview = async (bookId, { rating, comment, reviewId }) => {
  const { data } = await api.post(`/reviews/${bookId}`, { rating, comment, reviewId });
  return data;
};

export const deleteMyReview = async (bookId, reviewId) => {
  const { data } = await api.delete(`/reviews/${bookId}`, { data: { reviewId } });
  return data;
};

import Review from '../models/Review.js';
import Book from '../models/Book.js';

const recomputeBookRatings = async (bookId) => {
  const stats = await Review.aggregate([
    { $match: { book: new Book({ _id: bookId })._id } },
    { $group: { _id: '$book', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Book.findByIdAndUpdate(bookId, {
    ratings: Math.round((avg || 0) * 10) / 10,
    numReviews: count || 0,
  });
};

export const listReviewsForBook = async (req, res) => {
  const { bookId } = req.params;
  const reviews = await Review.find({ book: bookId }).populate('user', 'name');
  res.json(reviews);
};

export const addOrUpdateReview = async (req, res) => {
  const { bookId } = req.params;
  const { rating, comment = '', reviewId } = req.body;
  const trimmedComment = comment.trim();
  if (!rating) return res.status(400).json({ message: 'rating is required' });
  if (!trimmedComment) return res.status(400).json({ message: 'comment is required' });
  const book = await Book.findById(bookId);
  if (!book) return res.status(404).json({ message: 'Book not found' });

  let review;
  if (reviewId) {
    review = await Review.findOne({ _id: reviewId, book: bookId, user: req.user._id });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    review.rating = rating;
    review.comment = trimmedComment;
    await review.save();
  } else {
    review = await Review.create({ book: bookId, user: req.user._id, rating, comment: trimmedComment });
  }
  await recomputeBookRatings(bookId);
  const populatedReview = await Review.findById(review._id).populate('user', 'name');
  res.status(201).json(populatedReview);
};

export const deleteMyReview = async (req, res) => {
  const { bookId } = req.params;
  const { reviewId } = req.body || {};
  const filter = reviewId
    ? { _id: reviewId, book: bookId, user: req.user._id }
    : { book: bookId, user: req.user._id };
  const review = await Review.findOne(filter);
  if (!review) return res.status(404).json({ message: 'Review not found' });
  await review.deleteOne();
  await recomputeBookRatings(bookId);
  res.json({ message: 'Review removed' });
};

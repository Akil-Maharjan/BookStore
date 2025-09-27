import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);

const dropLegacyUniqueIndex = async () => {
  try {
    const hasIndex = await Review.collection.indexExists('book_1_user_1');
    if (hasIndex) {
      await Review.collection.dropIndex('book_1_user_1');
      // eslint-disable-next-line no-console
      console.info('Dropped legacy unique index book_1_user_1 from reviews');
    }
  } catch (error) {
    // 26 -> NamespaceNotFound, 27 -> IndexNotFound for MongoDB
    if (![26, 27].includes(error?.code)) {
      // eslint-disable-next-line no-console
      console.warn('Failed to drop legacy reviews index', error);
    }
  }
};

if (mongoose.connection.readyState === 1) {
  dropLegacyUniqueIndex();
} else {
  mongoose.connection.once('open', dropLegacyUniqueIndex);
}

export default Review;

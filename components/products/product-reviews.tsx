'use client';

import { useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { createBrowserSupabaseClient } from '@/lib/supabase/browserClient';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_purchase: boolean;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
}

export function ProductReviews({ productId, reviews, averageRating }: ProductReviewsProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setError('Please sign in to leave a review');
        setSubmitting(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please sign in to leave a review');
        setSubmitting(false);
        return;
      }

      // Get customer ID
      const { data: customer } = await supabase
        .from('customers')
        .select('id, full_name')
        .eq('auth_user_id', user.id)
        .single();

      if (!customer) {
        setError('Customer profile not found');
        setSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase.from('product_reviews').insert({
        product_id: productId,
        customer_id: customer.id,
        customer_name: customer.full_name,
        rating,
        title: title || null,
        body: body || null,
        is_verified_purchase: true,
      });

      if (insertError) {
        setError('Failed to submit review. You may have already reviewed this product.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Something went wrong');
    }

    setSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Customer Reviews</h2>

      {/* Rating summary */}
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold tabular-nums">
          {averageRating > 0 ? averageRating.toFixed(1) : '—'}
        </div>
        <div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`size-5 ${
                  star <= Math.round(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <p className="text-muted-foreground text-sm">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Write a review */}
      {!submitted ? (
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 font-medium">Write a review</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">Rating:</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus-visible:ring-2 focus-visible:ring-ring rounded"
                    >
                      <Star
                        className={`size-6 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                placeholder="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-border rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              />
              <Textarea
                placeholder="Share your experience with this product…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button onClick={handleSubmit} disabled={submitting} className="gap-2 self-start">
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Submit review
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-5">
            <p className="text-green-800 text-sm font-medium">
              Thank you for your review! It will appear once approved.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="flex flex-col gap-2 border-b pb-4 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{review.customer_name}</span>
                  {review.is_verified_purchase && (
                    <span className="text-xs text-green-700 bg-green-100 rounded px-1.5 py-0.5">Verified</span>
                  )}
                </div>
                <span className="text-muted-foreground text-xs">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`size-4 ${
                      star <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              {review.title && <p className="font-medium text-sm">{review.title}</p>}
              {review.body && <p className="text-muted-foreground text-sm">{review.body}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

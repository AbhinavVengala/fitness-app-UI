import React, { useState } from 'react';
import { Star, X, MessageSquare, Loader2, Send } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('Feedback submitted:', { rating, comment });
        setIsSuccess(true);
        setIsSubmitting(false);

        // Reset after success message
        setTimeout(() => {
            onClose();
            setIsSuccess(false);
            setRating(0);
            setComment('');
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="modal-surface rounded-3xl p-6 w-full max-w-md relative">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-muted-foreground" />
                </button>

                {isSuccess ? (
                    <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-50 duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <Send size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Thank You!</h3>
                        <p className="text-muted-foreground">Your feedback helps us build a better fitness companion.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Share Feedback</h2>
                                <p className="text-sm text-muted-foreground">Help us improve the beta experience</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Rating */}
                            <div className="flex flex-col items-center gap-3">
                                <label className="text-sm font-medium text-muted-foreground">Rate your experience</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                size={32}
                                                className={`transition-colors ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    What can we do better?
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us about bugs you found or features you want..."
                                    className="w-full h-32 p-4 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none transition-all"
                                    required
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={rating === 0 || isSubmitting}
                                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Submit Feedback'
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;

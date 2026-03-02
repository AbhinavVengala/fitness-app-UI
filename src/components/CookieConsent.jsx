import React, { useState, useEffect } from 'react';
import { Cookie, X, CheckCircle2 } from 'lucide-react';

const COOKIE_KEY = 'paceplate_cookie_consent';

const CookieConsent = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_KEY);
        if (!consent) {
            // Small delay so it doesn't flash on initial render
            const timer = setTimeout(() => setVisible(true), 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptAll = () => {
        localStorage.setItem(COOKIE_KEY, 'accepted');
        setVisible(false);
    };

    const acceptEssential = () => {
        localStorage.setItem(COOKIE_KEY, 'essential');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Icon */}
                <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Cookie className="w-5 h-5 text-primary" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground mb-0.5">We use cookies 🍪</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        We use essential cookies for app functionality and optional analytics to improve your experience.
                        We never sell your data. See our{' '}
                        <a href="#privacy" className="underline underline-offset-2 hover:text-primary transition-colors">
                            Privacy Policy
                        </a>.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                        onClick={acceptEssential}
                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors"
                    >
                        Essential only
                    </button>
                    <button
                        onClick={acceptAll}
                        className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Accept All
                    </button>
                    <button
                        onClick={acceptEssential}
                        className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;

import React from 'react';
import { ArrowLeft, Shield, FileText } from 'lucide-react';

export const TermsPage = ({ onBack }) => (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-12 animate-in fade-in slide-in-from-bottom-4">
        <div className="max-w-3xl mx-auto">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Home
            </button>

            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <FileText size={32} />
                    </div>
                    <h1 className="text-3xl font-bold">Terms of Service</h1>
                </div>

                <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <h3 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h3>
                    <p>By accessing and using Fitness Tracker ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.</p>

                    <h3 className="text-xl font-semibold text-foreground">2. Description of Service</h3>
                    <p>The App provides health and fitness tracking features, including calorie logging, workout tracking, and hydration monitoring. These services are provided "as is" and are for informational purposes only.</p>

                    <h3 className="text-xl font-semibold text-foreground">3. Health Disclaimer</h3>
                    <p className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-700 dark:text-yellow-400">
                        <strong>Important:</strong> We are not medical professionals. The information provided by this App is for educational purposes only and is not intended to treat, diagnose, or prescribe. Always consult with a physician before beginning any new diet or exercise program.
                    </p>

                    <h3 className="text-xl font-semibold text-foreground">4. User Account</h3>
                    <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                </div>
            </div>
        </div>
    </div>
);

export const PrivacyPage = ({ onBack }) => (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-12 animate-in fade-in slide-in-from-bottom-4">
        <div className="max-w-3xl mx-auto">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Home
            </button>

            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-600">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-3xl font-bold">Privacy Policy</h1>
                </div>

                <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <h3 className="text-xl font-semibold text-foreground">1. Information We Collect</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Personal Information:</strong> Name, email address, age, gender, height, and weight.</li>
                        <li><strong>Health Data:</strong> Food logs, water intake, and workout history.</li>
                        <li><strong>Usage Data:</strong> How you interact with the App features.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-foreground">2. How We Use Your Data</h3>
                    <p>We use your data solely to provide and improve the fitness tracking services. We calculate your daily calorie budget and macro goals based on the metrics you provide.</p>

                    <h3 className="text-xl font-semibold text-foreground">3. Data Security</h3>
                    <p>We implement industry-standard security measures to protect your personal information. Your data is encrypted in transit and at rest.</p>

                    <h3 className="text-xl font-semibold text-foreground">4. No Third-Party Sharing</h3>
                    <p>We do not sell, trade, or rent your personal identification information to others. Your health journey is private.</p>
                </div>
            </div>
        </div>
    </div>
);

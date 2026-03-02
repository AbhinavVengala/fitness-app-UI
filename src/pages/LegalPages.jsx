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
                    <div>
                        <h1 className="text-3xl font-bold">Terms of Service</h1>
                        <p className="text-sm text-muted-foreground mt-1">Last updated: March 2, 2026</p>
                    </div>
                </div>

                <div className="prose dark:prose-invert max-w-none space-y-8 text-muted-foreground">

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h3>
                        <p>By accessing or using PacePlate ("the App", "we", "us", "our"), you agree to be bound by these Terms of Service and all applicable laws. If you do not agree with any of these terms, you are prohibited from using this App. These terms apply to all users, visitors, and others who access or use the App.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h3>
                        <p>PacePlate provides a personal health and fitness tracking platform, including but not limited to:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>Calorie and macro tracking using an Indian food database</li>
                            <li>Workout logging and tracking</li>
                            <li>Water intake monitoring</li>
                            <li>Healthy food ordering from partner restaurants</li>
                            <li>Personal fitness profile management</li>
                        </ul>
                        <p className="mt-3">These services are provided "as is" for informational and personal tracking purposes only.</p>
                    </section>

                    <section>
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-700 dark:text-yellow-400">
                            <p className="font-semibold mb-1">⚠️ Important Health Disclaimer</p>
                            <p className="text-sm">PacePlate is not a medical service. The information provided is for educational and informational purposes only and is not intended to diagnose, treat, cure, or prevent any disease or health condition. We are not medical professionals. Always consult with a qualified physician or registered dietitian before beginning any new diet or exercise program, especially if you have any pre-existing medical conditions.</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">3. User Accounts</h3>
                        <p>To use PacePlate, you must create an account. You are responsible for:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>Maintaining the confidentiality of your account credentials</li>
                            <li>All activities that occur under your account</li>
                            <li>Providing accurate and truthful information</li>
                            <li>Notifying us immediately of any unauthorized use of your account</li>
                        </ul>
                        <p className="mt-3">You must be at least 13 years of age to use this App. Users under 18 must have parental consent.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">4. Payments & Refunds</h3>
                        <p>Payments for food orders placed through PacePlate are processed securely by Razorpay. By placing an order, you agree to Razorpay's terms of service.</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li><strong>Refunds:</strong> Refund requests for food orders must be raised within 24 hours of delivery. Contact us at <a href="mailto:support@paceplate.in" className="text-primary underline">support@paceplate.in</a>.</li>
                            <li><strong>Payment failures:</strong> Failed payment amounts will not be deducted. If charged, they will be automatically refunded within 5–7 business days.</li>
                            <li>All prices are in Indian Rupees (INR) inclusive of applicable GST.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">5. Prohibited Use</h3>
                        <p>You agree not to:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>Use the App for any unlawful purpose</li>
                            <li>Attempt to gain unauthorized access to any part of the App</li>
                            <li>Scrape, copy, or redistribute any content from the App</li>
                            <li>Upload malicious code or attempt to interfere with the App's functionality</li>
                            <li>Impersonate any person or entity</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">6. Intellectual Property</h3>
                        <p>The PacePlate name, logo, content, features, and functionality are owned by PacePlate and are protected by applicable copyright, trademark, and other intellectual property laws. You may not use our branding or content without written permission.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">7. Limitation of Liability</h3>
                        <p>To the maximum extent permitted by law, PacePlate shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, health outcomes, or business interruption, arising from your use of the App.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">8. Governing Law</h3>
                        <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India. These terms comply with the Information Technology Act, 2000 and applicable Consumer Protection laws of India.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">9. Changes to Terms</h3>
                        <p>We reserve the right to modify these Terms at any time. We will notify users of material changes via email or an in-app notice. Continued use after changes constitutes acceptance of the revised Terms.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">10. Contact</h3>
                        <p>For questions about these Terms, contact us at: <a href="mailto:legal@paceplate.in" className="text-primary underline">legal@paceplate.in</a></p>
                    </section>
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
                    <div>
                        <h1 className="text-3xl font-bold">Privacy Policy</h1>
                        <p className="text-sm text-muted-foreground mt-1">Last updated: March 2, 2026</p>
                    </div>
                </div>

                <div className="prose dark:prose-invert max-w-none space-y-8 text-muted-foreground">

                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-700 dark:text-green-400">
                        <p className="font-semibold mb-1">🔒 Our Privacy Commitment</p>
                        <p className="text-sm">PacePlate does not sell, rent, or trade your personal data. Your health journey is private. This policy complies with India's <strong>Digital Personal Data Protection Act, 2023 (DPDPA)</strong>.</p>
                    </div>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h3>
                        <p className="mb-3">We collect only what is necessary to provide our services:</p>
                        <div className="space-y-3">
                            <div className="p-4 bg-muted/50 rounded-xl">
                                <p className="font-medium text-foreground mb-1">Account Information</p>
                                <p className="text-sm">Name, email address, and hashed password (never stored in plain text).</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-xl">
                                <p className="font-medium text-foreground mb-1">Health Profile Data</p>
                                <p className="text-sm">Age, gender, height, weight, fitness goals, and experience level — used solely to calculate your personal nutrition and fitness targets.</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-xl">
                                <p className="font-medium text-foreground mb-1">Usage Data</p>
                                <p className="text-sm">Food logs, water intake, workout history, and meal orders. This data is tied to your account and is not shared with third parties.</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-xl">
                                <p className="font-medium text-foreground mb-1">Technical Data</p>
                                <p className="text-sm">IP address, browser type, and device information — used for security and rate limiting purposes only.</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Data</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>To provide and personalize the fitness tracking service</li>
                            <li>To calculate your daily calorie budget and macro goals (TDEE)</li>
                            <li>To process food orders and send transactional emails (order confirmations, password resets)</li>
                            <li>To improve the accuracy of our Indian food database</li>
                            <li>To detect and prevent security threats and abuse</li>
                        </ul>
                        <p className="mt-3">We do <strong>not</strong> use your data for advertising, profiling, or sale to third parties.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">3. Data Sharing</h3>
                        <p>We share your data only in these limited circumstances:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Razorpay:</strong> Payment data for processing food orders. Razorpay is PCI-DSS compliant. We do not store your payment card details.</li>
                            <li><strong>Email provider:</strong> Your email address is shared with our transactional email service only to deliver emails you request (e.g., password resets).</li>
                            <li><strong>Legal requirements:</strong> We may disclose data if required by Indian law or a valid court order.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">4. Data Security</h3>
                        <p>We implement multiple layers of security:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>All passwords are hashed using BCrypt — we never store plain text passwords</li>
                            <li>All data is encrypted in transit using TLS/HTTPS</li>
                            <li>Authentication uses short-lived JWT tokens</li>
                            <li>Rate limiting protects login and password reset endpoints</li>
                            <li>Data is stored on secure servers within India</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">5. Data Retention</h3>
                        <p>We retain your data for as long as your account is active. If you delete your account, all personal data and health logs are permanently deleted within 30 days.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">6. Your Rights (DPDPA 2023)</h3>
                        <p>Under India's Digital Personal Data Protection Act, 2023, you have the right to:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                            <li><strong>Correction:</strong> Request correction of inaccurate personal data</li>
                            <li><strong>Erasure:</strong> Request deletion of your account and all associated data</li>
                            <li><strong>Grievance redressal:</strong> Contact our Data Protection Officer for any privacy concerns</li>
                            <li><strong>Withdraw consent:</strong> Withdraw consent at any time; this will not affect the lawfulness of prior processing</li>
                        </ul>
                        <p className="mt-3">To exercise any of these rights, email us at: <a href="mailto:privacy@paceplate.in" className="text-primary underline">privacy@paceplate.in</a>. We will respond within 72 hours.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">7. Cookies</h3>
                        <p>PacePlate uses the following cookies:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Essential cookies:</strong> Authentication tokens and theme preference. These are required for the App to function.</li>
                            <li><strong>Analytics cookies (optional):</strong> Anonymous usage data to help us improve the product. You can opt out via the cookie banner.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">8. Children's Privacy</h3>
                        <p>PacePlate does not knowingly collect personal data from children under 13 years of age. If we discover such data has been collected, it will be deleted immediately.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">9. Changes to This Policy</h3>
                        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notice at least 7 days before the changes take effect.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-foreground mb-3">10. Contact & Grievance Officer</h3>
                        <p>For privacy concerns or to exercise your DPDPA rights, contact our Data Protection Officer:</p>
                        <div className="mt-3 p-4 bg-muted/50 rounded-xl text-sm space-y-1">
                            <p><strong className="text-foreground">PacePlate</strong></p>
                            <p>Email: <a href="mailto:privacy@paceplate.in" className="text-primary underline">privacy@paceplate.in</a></p>
                            <p>Support: <a href="mailto:support@paceplate.in" className="text-primary underline">support@paceplate.in</a></p>
                            <p>Response time: Within 72 hours</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
);

import React from 'react';
import { Activity, Apple, Droplets, TrendingUp, ChevronRight, Shield, Zap, Star } from 'lucide-react';

const LandingPage = ({ onGetStarted, onViewTerms, onViewPrivacy }) => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Navbar */}
            <nav className="p-5 flex items-center justify-between max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2.5">
                    <img src="/icon-512.png" alt="PacePlate logo" className="w-8 h-8 rounded-xl" />
                    <span className="text-xl font-bold tracking-tight">
                        Pace<span className="text-primary">Plate</span>
                    </span>
                </div>
                <button
                    onClick={onGetStarted}
                    className="font-medium hover:text-primary transition-colors"
                >
                    Sign In
                </button>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col">
                <section className="relative pt-20 pb-32 px-6 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

                    <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Now with Extensive Indian Food Database 🍛
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance animate-in fade-in slide-in-from-bottom-6 duration-700">
                            Fit Food,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
                                Delivered. India.
                            </span>
                        </h1>

                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            The only tracker that truly understands{' '}
                            <strong className="text-foreground">Indian cuisine</strong>. Log Dal, Roti, Sabzi, and Paneer accurately.
                            Private, fast, and beautifully designed.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            <button
                                onClick={onGetStarted}
                                className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
                            >
                                Start for Free
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Trust indicators */}
                        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground animate-in fade-in duration-700 delay-300">
                            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-green-500" /> No credit card</span>
                            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500" /> Free forever plan</span>
                            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-primary" /> Setup in 2 min</span>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20 px-6 bg-secondary/30">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold">Designed for how India eats</h2>
                            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Finally, a tracker that gets Indian diets right.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={Apple}
                                title="Authentic Indian Database"
                                desc="Finally, a tracker that knows a Samosa from a Salad. Comprehensive calorie counts for home-cooked Indian meals — dal, sabzi, roti, biryani and more."
                                color="bg-orange-500/10 text-orange-600"
                            />
                            <FeatureCard
                                icon={Droplets}
                                title="Smart Hydration"
                                desc="Track your water intake with one tap. Set daily goals and stay hydrated throughout your day — no reminders, just clean tracking."
                                color="bg-cyan-500/10 text-cyan-600"
                            />
                            <FeatureCard
                                icon={Shield}
                                title="Privacy First"
                                desc="Your health data is yours alone. No tracking pixels, no data selling, no ads. Just honest, secure metrics stored safely on our servers."
                                color="bg-green-500/10 text-green-600"
                            />
                        </div>
                    </div>
                </section>

                {/* Why Different */}
                <section className="py-20 px-6 border-t border-border">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <h2 className="text-3xl font-bold">Why PacePlate is different</h2>
                        <div className="grid sm:grid-cols-2 gap-8">
                            <div className="flex gap-4 text-left p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
                                <div className="p-3 bg-primary/10 rounded-xl h-fit">
                                    <TrendingUp className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-2">Macro-Focused</h3>
                                    <p className="text-muted-foreground">Specifically designed for hitting protein targets and tracking carb intake for traditional Indian diets — something global apps get wrong.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 text-left p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
                                <div className="p-3 bg-orange-500/10 rounded-xl h-fit">
                                    <Activity className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-2">Workout + Nutrition Together</h3>
                                    <p className="text-muted-foreground">Log your gym sessions, cardio, and yoga alongside your meals. See your full fitness picture — calories in vs. calories out.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 text-left p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
                                <div className="p-3 bg-purple-500/10 rounded-xl h-fit">
                                    <Zap className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-2">Lightning Fast</h3>
                                    <p className="text-muted-foreground">No ads, no bloat, no premium paywalls on core features. Log your entire lunch in under 10 seconds with barcode scanning.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 text-left p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
                                <div className="p-3 bg-cyan-500/10 rounded-xl h-fit">
                                    <Droplets className="w-6 h-6 text-cyan-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-2">Healthy Food Ordering</h3>
                                    <p className="text-muted-foreground">Order from healthy restaurant partners right within the app. Know exactly what macros you're eating before you order.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-20 px-6 bg-primary/5 border-t border-border text-center">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <h2 className="text-3xl md:text-4xl font-extrabold">Ready to track smarter?</h2>
                        <p className="text-muted-foreground text-lg">Join the growing community of Indians hitting their fitness goals — the right way.</p>
                        <button
                            onClick={onGetStarted}
                            className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 group"
                        >
                            Get Started — It's Free
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-10 px-6 border-t border-border text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <img src="/icon-512.png" alt="PacePlate" className="w-5 h-5 rounded" />
                    <span className="font-semibold text-foreground">Pace<span className="text-primary">Plate</span></span>
                </div>
                <div className="flex justify-center gap-6 mb-4">
                    <button onClick={onViewTerms} className="hover:text-primary transition-colors">Terms of Service</button>
                    <button onClick={onViewPrivacy} className="hover:text-primary transition-colors">Privacy Policy</button>
                </div>
                <p>© {new Date().getFullYear()} PacePlate. All rights reserved.</p>
                <p className="mt-1 text-xs opacity-60">Made with ❤️ in India 🇮🇳</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, color }) => (
    <div className="bg-card p-8 rounded-3xl border border-border hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6`}>
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
);

export default LandingPage;

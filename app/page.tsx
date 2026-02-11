import LandingNav from "./landing/LandingNav";
import HeroSection from "./landing/HeroSection";
import ProblemSection from "./landing/ProblemSection";
import SolutionSection from "./landing/SolutionSection";
import DemoPreviewSection from "./landing/DemoPreviewSection";
import HowItWorksSection from "./landing/HowItWorksSection";
import FinalCTASection from "./landing/FinalCTASection";
import Footer from "./landing/Footer";

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-[var(--bg-base)] overflow-x-hidden">
            <LandingNav />
            <HeroSection />

            {/* Divider */}
            <div className="max-w-7xl mx-auto px-6">
                <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent" />
            </div>

            <ProblemSection />

            <div className="max-w-7xl mx-auto px-6">
                <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent" />
            </div>

            <SolutionSection />

            <div className="max-w-7xl mx-auto px-6">
                <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent" />
            </div>

            <DemoPreviewSection />

            <div className="max-w-7xl mx-auto px-6">
                <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent" />
            </div>

            <HowItWorksSection />

            <div className="max-w-7xl mx-auto px-6">
                <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent" />
            </div>

            <FinalCTASection />
            <Footer />
        </main>
    );
}

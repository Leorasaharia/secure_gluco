import {
  Activity,
  AlertTriangle,
  Database,
  Heart,
  Lock,
  Mail,
  Shield,
  TrendingUp,
  Zap
} from "lucide-react";
import React, { useEffect, useState } from "react";

// Gallery component included below — images/videos reference public paths

const Gallery: React.FC = () => {
  const media: { src: string; type: "image" | "video"; alt?: string }[] = [
    { src: "/images/img1.jpeg", type: "image", alt: "Wearable chip closeup 1" },
    { src: "/images/img2.jpeg", type: "image", alt: "Wearable chip closeup 2" },
    { src: "/images/img3.jpeg", type: "image", alt: "Device + phone demo 1" },
    { src: "/images/img4.jpeg", type: "image", alt: "Device + phone demo 2" },
    { src: "/images/video1.mp4", type: "video" },
    { src: "/images/video2.mp4", type: "video" }
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
        Demo Gallery
      </h2>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {media.map((m, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform bg-white/5"
              aria-label={`Open media ${i + 1}`}
            >
              {m.type === "image" ? (
                <img src={m.src} alt={m.alt || `media-${i}`} className="w-full h-56 object-cover" />
              ) : (
                <div className="w-full h-56 bg-black/30 flex items-center justify-center">
                  <video src={m.src} className="w-full h-full object-cover" muted />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Modal viewer */}
        {activeIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
            <div className="max-w-5xl w-full max-h-full bg-slate-900 rounded-2xl overflow-hidden">
              <div className="flex justify-between items-center p-3 border-b border-white/10">
                <div className="text-sm text-slate-300">Preview</div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveIndex((ai) => (ai !== null ? Math.max(0, ai - 1) : null))}
                    className="px-3 py-1 bg-white/5 rounded"
                    aria-label="Previous"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => setActiveIndex((ai) => (ai !== null ? Math.min(media.length - 1, ai + 1) : null))}
                    className="px-3 py-1 bg-white/5 rounded"
                    aria-label="Next"
                  >
                    ▶
                  </button>
                  <button
                    onClick={() => setActiveIndex(null)}
                    className="px-3 py-1 bg-red-600 rounded text-white"
                    aria-label="Close"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="p-4 bg-black">
                {media[activeIndex].type === "image" ? (
                  <img src={media[activeIndex].src} alt={media[activeIndex].alt} className="w-full h-[70vh] object-contain" />
                ) : (
                  <video src={media[activeIndex].src} controls className="w-full h-[70vh] object-contain" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const AboutPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 text-slate-100 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <header className={`relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-emerald-300 mb-4">
              SecureGluco
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">
              Next-generation security for medical devices. Real-time protection for CGMs and insulin pumps with intelligent threat detection.
            </p>
          </div>

          <button
            onClick={() => window.history.back()}
            className="hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        {/* Hero stats */}
        <section className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <StatsCard 
            icon={<Shield className="w-8 h-8 text-emerald-400" />}
            value="98.87%"
            label="Threat Detection Rate"
          />
          <StatsCard 
            icon={<Zap className="w-8 h-8 text-yellow-400" />}
            value="<500ms"
            label="Response Time"
          />
          <StatsCard 
            icon={<Heart className="w-8 h-8 text-red-400" />}
            value="Patient-First"
            label="Safety Approach"
          />
        </section>

        {/* Problem & Solution */}
        <section className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-br from-red-950/40 to-orange-950/40 backdrop-blur-sm rounded-2xl p-8 border border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-7 h-7 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">The Problem</h2>
            </div>
            <p className="text-slate-200 mb-4 leading-relaxed">
              Medical devices face growing cyber threats that can directly harm patients through false data injection, device manipulation, and communication disruption.
            </p>
            <div className="space-y-2">
              <ThreatItem text="Remote insulin pump manipulation" />
              <ThreatItem text="Insulin data spoofing attacks" />
              <ThreatItem text="Network flooding & device DoS" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-950/40 to-blue-950/40 backdrop-blur-sm rounded-2xl p-8 border border-emerald-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-7 h-7 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">Our Solution</h2>
            </div>
            <p className="text-slate-200 mb-4 leading-relaxed">
              Advanced ML-powered intrusion detection designed specifically for resource-constrained medical devices with real-time monitoring.
            </p>
            <div className="space-y-2">
              <SolutionItem text="Lightweight AI threat detection" />
              <SolutionItem text="Real-time security dashboard" />
              <SolutionItem text="Edge-optimized deployment" />
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className={`mb-16 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Cutting-Edge Protection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Activity className="w-8 h-8 text-blue-400" />}
              title="Real-Time Monitoring"
              description="Continuous threat analysis with instant alerts"
            />
            <FeatureCard
              icon={<Database className="w-8 h-8 text-purple-400" />}
              title="Smart Analytics"
              description="ML-powered pattern recognition and anomaly detection"
            />
            <FeatureCard
              icon={<Lock className="w-8 h-8 text-emerald-400" />}
              title="Secure Communications"
              description="End-to-end encryption for all device interactions"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-amber-400" />}
              title="Adaptive Learning"
              description="Continuously improves threat detection accuracy"
            />
          </div>
        </section>

        {/* Insert Gallery here */}
        <Gallery />

        {/* Case Study - Compact */}
        <section className={`mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-r from-slate-900/60 to-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3 text-white">Real-World Impact: Medtronic Recall</h3>
                <p className="text-slate-300 mb-4 leading-relaxed">
                  In 2019, Medtronic recalled insulin pumps due to cybersecurity vulnerabilities that could allow attackers to alter insulin delivery - the first-ever medical device recall for cybersecurity reasons.
                </p>
                <p className="text-slate-400 text-sm">
                  This incident highlighted the critical need for security-by-design in medical devices and continuous threat monitoring.
                </p>
              </div>
              <div className="hidden md:block p-4 bg-red-950/30 rounded-xl border border-red-500/20">
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20 text-center">
            <h3 className="text-2xl font-bold mb-4 text-white">Ready to Secure Your Medical Devices?</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Join healthcare providers and device manufacturers who trust SecureGluco for next-generation medical device security.
            </p>
            
            <a
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
              href="mailto:hello@securegluco.com"
            >
              <Mail className="w-5 h-5" />
              Get Started Today
            </a>
          </div>
        </section>

        <footer className={`mt-16 text-center text-sm text-slate-500 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <p>
            © {new Date().getFullYear()} SecureGluco — Advanced medical device security solutions. Research prototype.
          </p>
        </footer>
      </main>
    </div>
  );
};

// Component helpers
function StatsCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center hover:bg-white/10 transition-all duration-300">
      <div className="flex justify-center mb-3">{icon}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );
}

function ThreatItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-orange-200">
      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
      <span className="text-sm">{text}</span>
    </div>
  );
}

function SolutionItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-emerald-200">
      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
      <span className="text-sm">{text}</span>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
      <div className="mb-4">{icon}</div>
      <h4 className="font-bold text-white mb-2">{title}</h4>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export default AboutPage;

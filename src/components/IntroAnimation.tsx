import {
  Activity,
  ChevronRight,
  GitBranch,
  Mail,
  Shield,
  User,
  Wifi,
  Zap
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

interface IntroLandingProps {
  onComplete: (name?: string) => void;
  skipAnimationInitially?: boolean;
}

export const IntroAnimation: React.FC<IntroLandingProps> = ({
  onComplete,
  skipAnimationInitially = false
}) => {
  const [phase, setPhase] = useState<number>(0);
  const [showSkip, setShowSkip] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [showGoogleSignIn, setShowGoogleSignIn] = useState<boolean>(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const animationTimings = useMemo(
    () =>
      prefersReducedMotion
        ? [0, 200, 400, 600, 800, 900]
        : [0, 1000, 2500, 4000, 5500, 7000],
    [prefersReducedMotion]
  );

  useEffect(() => {
    if (skipAnimationInitially) {
      setPhase(5);
      setShowAbout(true);
      return;
    }

    const timers: number[] = [];
    animationTimings.forEach((delay, i) => {
      timers.push(
        window.setTimeout(() => {
          setPhase(i);
        }, delay)
      );
    });

    const skipDelay = prefersReducedMotion ? 200 : 2000;
    const skipTimer = window.setTimeout(() => setShowSkip(true), skipDelay);
    timers.push(skipTimer);

    const finalDelay = (animationTimings[animationTimings.length - 1] || 7000) + 1000;
    const finishTimer = window.setTimeout(() => {
      setPhase(5);
      setTimeout(() => setShowAbout(true), prefersReducedMotion ? 150 : 350);
    }, finalDelay);
    timers.push(finishTimer);

    return () => timers.forEach((t) => clearTimeout(t));
  }, [animationTimings, skipAnimationInitially, prefersReducedMotion]);

  const handleSkip = () => {
    setPhase(5);
    setShowAbout(true);
  };

  const handleEnter = () => {
    setShowGoogleSignIn(true);
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    setShowGoogleSignIn(false);
    if (credentialResponse.credential) {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const userName = decoded.name || "Patient";
      onComplete(userName); // Pass name up to App
    } else {
      onComplete();
    }
  };

  const handleGoogleError = () => {
    setShowGoogleSignIn(false);
    alert("Google sign-in failed. Please try again.");
  };

  const goToAbout = () => {
    window.location.href = "/about";
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-auto"
      aria-live="polite"
    >
      {showSkip && !showAbout && (
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={handleSkip}
            className="text-slate-200 hover:text-white bg-black/30 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Skip intro and go to about"
          >
            Skip
          </button>
        </div>
      )}

      {showGoogleSignIn && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Sign in with Google</h2>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
            <button
              className="mt-6 text-sm text-blue-600 hover:underline"
              onClick={() => setShowGoogleSignIn(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px"
          }}
        />

        <ParticleCloud visible={phase >= 1} count={20} />

        <div className="relative w-full max-w-5xl">
          <div className="mx-auto relative">
            <div
              className={`relative mx-auto transition-all duration-1000 ease-out transform ${
                phase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-75"
              }`}
              style={{ maxWidth: 520 }}
            >
              <ChipVisual phase={phase} prefersReducedMotion={prefersReducedMotion} />
            </div>

            <div className="relative mt-8">
              <div
                className={`w-full flex items-center justify-center transition-opacity duration-700 ${
                  phase >= 3 ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <div className="grid grid-cols-3 gap-8 w-full max-w-4xl">
                  <FeatureCard
                    icon={<Shield className="w-6 h-6 text-blue-400" />}
                    title="Security-first"
                    desc="Real-time anomaly detection, secure telemetry and robust incident response workflows."
                  />
                  <FeatureCard
                    icon={<Wifi className="w-6 h-6 text-purple-400" />}
                    title="Reliable Connectivity"
                    desc="Optimized for low-power IoMT networks with adaptive buffering and encryption."
                  />
                  <FeatureCard
                    icon={<Zap className="w-6 h-6 text-emerald-400" />}
                    title="Edge Analytics"
                    desc="Lightweight models for on-device inference and rapid mitigation."
                  />
                </div>
              </div>
            </div>

            <div className={`mt-10 text-center transition-all duration-700 ${phase >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                SecureGluco
              </h1>
              <p className="mt-3 text-lg text-slate-300 max-w-2xl mx-auto">
                BioMEMS-enabled glucose monitoring guarded by AI-driven threat detection — privacy-first, reliable, clinical-grade.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`bg-gradient-to-t from-transparent to-black/30 border-t border-black/20 w-full transition-all duration-700 ${
          showAbout ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <section>
              <h2 className="text-3xl font-semibold">About SecureGluco</h2>
              <p className="mt-4 text-slate-300 max-w-xl">
                SecureGluco combines continuous glucose monitoring hardware with edge AI to deliver secure, reliable insights for patients and clinicians.
                Our platform protects telemetry and device integrity while providing real-time threat detection tailored for IoMT environments.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleEnter}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-3 rounded-full font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Enter Dashboard <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={goToAbout}
                  className="inline-flex items-center gap-2 bg-white/6 text-white px-4 py-3 rounded-full font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Learn More
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 max-w-xl">
                <MiniStat title="Latency" value="sub-500ms" icon={<Activity className="w-5 h-5 text-emerald-300" />} />
                <MiniStat title="Model Size" value="~2.2 MB" icon={<GitBranch className="w-5 h-5 text-blue-300" />} />
                <MiniStat title="Uptime" value="98.87%" icon={<Zap className="w-5 h-5 text-yellow-300" />} />
                <MiniStat title="Secure" value="AES-256" icon={<Shield className="w-5 h-5 text-indigo-300" />} />
              </div>
            </section>

            <aside className="bg-white/5 rounded-xl p-6">
              <h3 className="text-xl font-semibold">Team & Contact</h3>
              <p className="mt-3 text-slate-300">
                Built by a cross-functional team of embedded, security and data-science engineers. We value privacy, transparency and clinical safety.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/6 p-2 rounded-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-200 font-medium">SecureGluco</div>
                    <div className="text-xs text-slate-400">Security & Product</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-white/6 p-2 rounded-md">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-200 font-medium">hello@securegluco.example</div>
                    <div className="text-xs text-slate-400">Support & partnerships</div>
                  </div>
                </div>

                <div className="mt-4">
                  <a
                    href="#more-details"
                    className="text-sm text-blue-300 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      goToAbout();
                    }}
                  >
                    Read technical whitepaper →
                  </a>
                </div>
              </div>
            </aside>
          </div>

          <div id="more-details" className="mt-12 bg-white/3 rounded-xl p-6">
            <h4 className="text-2xl font-semibold">Core Capabilities</h4>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <DetailCard
                title="Secure Telemetry"
                desc="End-to-end encrypted device telemetry with tamper-evident logs."
                icon={<Shield className="w-6 h-6 text-blue-300" />}
              />
              <DetailCard
                title="Low-power Edge ML"
                desc="Optimized neural models for battery-operated devices."
                icon={<Zap className="w-6 h-6 text-emerald-300" />}
              />
              <DetailCard
                title="Threat Intelligence"
                desc="Contextual threat scoring and automated playbooks for IoMT incidents."
                icon={<Wifi className="w-6 h-6 text-purple-300" />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState<boolean>(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefers(mq.matches);
    const handler = () => setPrefers(mq.matches);
    try {
      mq.addEventListener("change", handler);
    } catch {
      (mq as any).addListener(handler);
    }
    return () => {
      try {
        mq.removeEventListener("change", handler);
      } catch {
        (mq as any).removeListener(handler);
      }
    };
  }, []);
  return prefers;
}

const ParticleCloud: React.FC<{ visible: boolean; count?: number }> = ({ visible, count = 20 }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${visible ? "opacity-100" : "opacity-0"}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full opacity-70"
          style={{
            left: `${10 + (i * 7.3) % 90}%`,
            top: `${(i * 13.7) % 90}%`,
            animationDelay: `${(i % 8) * 120}ms`,
            animationDuration: `${1500 + (i % 5) * 300}ms`
          }}
        />
      ))}
    </div>
  );
};

const ChipVisual: React.FC<{ phase: number; prefersReducedMotion: boolean }> = ({ phase, prefersReducedMotion }) => {
  const glow = phase >= 2 ? "animate-pulse" : "";
  return (
    <div className="relative w-full flex items-center justify-center">
      <div className={`relative w-80 h-80 rounded-2xl border border-slate-700 shadow-2xl transform ${phase >= 1 ? "scale-100" : "scale-75"} transition-transform duration-700`}>
        <div className={`absolute inset-4 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 ${glow} `}>
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={`h-${i}`}
                className={`absolute h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent ${phase >= 2 ? "opacity-80" : "opacity-0"} transition-opacity duration-500`}
                style={{ top: `${16 + i * 12}%`, left: "8%", right: "8%" }}
              />
            ))}
            {[...Array(5)].map((_, i) => (
              <div
                key={`v-${i}`}
                className={`absolute w-0.5 bg-gradient-to-b from-transparent via-blue-400 to-transparent ${phase >= 2 ? "opacity-80" : "opacity-0"} transition-opacity duration-500`}
                style={{ left: `${18 + i * 14}%`, top: "14%", bottom: "14%" }}
              />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-16 h-16 rounded-lg shadow-lg ${phase >= 2 ? "scale-100 opacity-100" : "scale-75 opacity-0"} transition-all duration-700 bg-gradient-to-br from-blue-500 to-purple-600`}>
              <div className="absolute inset-2 rounded bg-cyan-400/40" />
              <div className="absolute inset-4 rounded bg-white/60" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 rounded-3xl border-2 border-slate-500/20 backdrop-blur-sm" />
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-xs font-mono text-slate-300 opacity-80">
          CGM-BIOMEMS-2025
        </div>
      </div>
      {phase >= 3 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={`ring-${i}`}
              className="absolute rounded-full border border-blue-400/30"
              style={{
                width: `${200 + i * 100}px`,
                height: `${200 + i * 100}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                animationDuration: `${3000 + i * 400}ms`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => {
  return (
    <div className="bg-white/4 rounded-xl p-6 flex flex-col items-start gap-4">
      <div className="p-3 rounded-md bg-white/6">{icon}</div>
      <h4 className="text-lg font-semibold">{title}</h4>
      <p className="text-sm text-slate-300">{desc}</p>
    </div>
  );
};

const MiniStat: React.FC<{ title: string; value: string; icon?: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white/4 rounded-md p-3 flex items-center gap-3">
    <div className="p-2 rounded bg-white/6">{icon}</div>
    <div>
      <div className="text-xs text-slate-300">{title}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  </div>
);

const DetailCard: React.FC<{ title: string; desc: string; icon?: React.ReactNode }> = ({ title, desc, icon }) => (
  <div className="bg-white/4 rounded-lg p-4 flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded bg-white/6">{icon}</div>
      <h5 className="text-md font-semibold">{title}</h5>
    </div>
    <p className="text-sm text-slate-300">{desc}</p>
  </div>
);

export default IntroAnimation;
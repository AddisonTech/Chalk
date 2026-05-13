import { redirect } from "next/navigation";
import { ArrowRight, Film, ClipboardList, BookOpen, Users, Target, Zap, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Wordmark } from "@/components/ui/wordmark";
import { AuthForm } from "@/components/auth/auth-form";
import { DemoButton } from "@/components/landing/demo-button";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export default async function Landing() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <Wordmark size="sm" />
        <div className="flex items-center gap-5">
          <a
            href="#how-it-works"
            className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            How it works
          </a>
          <a
            href="#auth"
            className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </a>
          <DemoButton size="sm" />
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">

        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-1/3 -left-1/4 w-[72vw] h-[72vw] rounded-full blur-[140px] opacity-20"
            style={{
              background: "radial-gradient(circle, #2d6a4f 0%, transparent 65%)",
              animation: "mesh-drift-a 16s ease-in-out infinite",
            }}
          />
          <div
            className="absolute -bottom-1/3 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-15"
            style={{
              background: "radial-gradient(circle, #1b4332 0%, transparent 65%)",
              animation: "mesh-drift-b 20s ease-in-out infinite",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #f3f4f6 1px, transparent 1px), linear-gradient(to bottom, #f3f4f6 1px, transparent 1px)",
              backgroundSize: "52px 52px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

          <div
            className="hero-animate mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs tracking-wider uppercase"
            style={{ animation: "fade-up 0.55s ease both" }}
          >
            Film Room &middot; Board &middot; Playbook
          </div>

          <h1
            className="hero-animate text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.04] tracking-tight text-foreground"
            style={{ animation: "fade-up 0.6s ease 0.08s both" }}
          >
            Your opponents have
            <br />
            <span className="text-accent">film analysts.</span>
            <br />
            Now you do too.
          </h1>

          <p
            className="hero-animate mt-7 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-muted-foreground"
            style={{ animation: "fade-up 0.6s ease 0.16s both" }}
          >
            Chalk is a football intelligence platform built for coaches at any level.
            Tag plays from film, watch tendency reports build themselves, and turn Monday prep
            into a game-ready plan in under two hours. No analytics department required.
          </p>

          <div
            className="hero-animate mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ animation: "fade-up 0.6s ease 0.24s both" }}
          >
            <DemoButton size="lg" />
            <a
              href="#auth"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-sm text-base font-medium tracking-tight border border-border-strong text-foreground hover:bg-surface transition-colors"
            >
              Sign Up
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <p
            className="hero-animate mt-4 text-xs text-muted-foreground"
            style={{ animation: "fade-up 0.6s ease 0.3s both" }}
          >
            No account needed for the demo. Click once, land in a full team.
          </p>

        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Scroll</span>
          <div className="w-px h-6 bg-border" />
        </div>
      </section>

      {/* MODULES */}
      <section className="py-28 px-6 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto">

          <ScrollReveal>
            <div className="mb-16 text-center">
              <p className="text-xs uppercase tracking-widest text-accent mb-3">Three modules</p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                Everything your staff needs.{" "}
                <span className="text-muted-foreground">Nothing it doesn&apos;t.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <ScrollReveal delay={0}>
              <div className="flex flex-col rounded-sm border border-border bg-background overflow-hidden h-full">
                <div className="p-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent/10 border border-accent/20 flex-shrink-0">
                      <Film className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Film Room</p>
                      <p className="text-xs text-muted-foreground">Tag plays. Reports write themselves.</p>
                    </div>
                  </div>
                </div>
                <div className="mx-4 mb-4 rounded-sm border border-border bg-surface overflow-hidden flex-1">
                  <div className="border-b border-border px-4 py-2 flex gap-4">
                    <span className="text-[11px] text-foreground border-b border-accent pb-0.5">Tendency Report</span>
                    <span className="text-[11px] text-muted-foreground">Tagged Plays</span>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                        <span>Run</span><span>63%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: "63%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                        <span>Pass</span><span>37%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "37%" }} />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Top Formations</p>
                      {[
                        { name: "Trips Right", plays: 12 },
                        { name: "Doubles", plays: 8 },
                        { name: "I-Form", plays: 5 },
                      ].map((f) => (
                        <div key={f.name} className="flex justify-between py-1">
                          <span className="text-[11px] text-foreground">{f.name}</span>
                          <span className="text-[11px] text-muted-foreground tabular-nums">{f.plays} plays</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={80}>
              <div className="flex flex-col rounded-sm border border-border bg-background overflow-hidden h-full">
                <div className="p-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent/10 border border-accent/20 flex-shrink-0">
                      <ClipboardList className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Board</p>
                      <p className="text-xs text-muted-foreground">Scheme fit scores and tier ratings.</p>
                    </div>
                  </div>
                </div>
                <div className="mx-4 mb-4 rounded-sm border border-border bg-surface overflow-hidden flex-1">
                  <div className="border-b border-border px-4 py-2">
                    <span className="text-[11px] text-muted-foreground">4 prospects</span>
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      { name: "T. Brooks", pos: "QB", year: "2027", fit: 88, tier: "take", tierClass: "text-success" },
                      { name: "M. Hayes", pos: "WR", year: "2026", fit: 84, tier: "take", tierClass: "text-success" },
                      { name: "J. Reed", pos: "OLB", year: "2026", fit: 71, tier: "watch", tierClass: "text-accent" },
                      { name: "D. Carter", pos: "CB", year: "2026", fit: 65, tier: "dev", tierClass: "text-muted-foreground" },
                    ].map((r) => (
                      <div key={r.name} className="flex items-center justify-between px-4 py-2.5 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[11px] font-medium text-foreground w-16 truncate">{r.name}</span>
                          <span className="text-[10px] bg-surface-raised px-1.5 py-0.5 rounded-sm text-muted-foreground flex-shrink-0">{r.pos}</span>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">{r.year}</span>
                        </div>
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          <span className="text-[11px] font-medium text-foreground tabular-nums">{r.fit}</span>
                          <span className={`text-[10px] uppercase tracking-wide ${r.tierClass}`}>{r.tier}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={160}>
              <div className="flex flex-col rounded-sm border border-border bg-background overflow-hidden h-full">
                <div className="p-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent/10 border border-accent/20 flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Playbook</p>
                      <p className="text-xs text-muted-foreground">Situational concepts for your game plan.</p>
                    </div>
                  </div>
                </div>
                <div className="mx-4 mb-4 rounded-sm border border-border bg-surface overflow-hidden flex-1">
                  <div className="border-b border-border px-4 py-2">
                    <span className="text-[11px] text-foreground">vs. North Catholic - Wk 4</span>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">3rd Down</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: "Mesh", phase: "offense" },
                          { name: "Cover 2 Hold", phase: "defense" },
                        ].map((c) => (
                          <div key={c.name} className={`rounded-sm border p-2.5 ${c.phase === "offense" ? "border-accent/30 bg-accent/5" : "border-primary/30 bg-primary/5"}`}>
                            <p className="text-[11px] font-medium text-foreground">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{c.phase}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Red Zone</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: "Fade", phase: "offense" },
                          { name: "Goal Line 4-4", phase: "defense" },
                        ].map((c) => (
                          <div key={c.name} className={`rounded-sm border p-2.5 ${c.phase === "offense" ? "border-accent/30 bg-accent/5" : "border-primary/30 bg-primary/5"}`}>
                            <p className="text-[11px] font-medium text-foreground">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{c.phase}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-28 px-6 bg-background">
        <div className="max-w-3xl mx-auto">

          <ScrollReveal>
            <div className="mb-16 text-center">
              <p className="text-xs uppercase tracking-widest text-accent mb-3">Workflow</p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                Monday to game plan in four steps.
              </h2>
            </div>
          </ScrollReveal>

          <div className="relative flex flex-col gap-8">
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border hidden sm:block" />
            {[
              {
                n: "01",
                title: "Add a game and name your opponent",
                body: "Create a game entry in Film Room. One form, 30 seconds. Chalk tracks it by week and season.",
              },
              {
                n: "02",
                title: "Tag plays from your film",
                body: "Log each play with formation, personnel, concept, play type, and result. Timestamp it for video reference. Works on any device.",
              },
              {
                n: "03",
                title: "Read the tendency report",
                body: "Run/pass splits by down, top formations, red zone patterns, 3rd down tendencies, and coaching notes emerge automatically from your tags.",
              },
              {
                n: "04",
                title: "Build your game plan in Playbook",
                body: "Pull situational offensive and defensive concepts matched to what you now know about the opponent. Ready for your staff meeting.",
              },
            ].map((step, i) => (
              <ScrollReveal key={step.n} delay={i * 70}>
                <div className="flex gap-5">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-sm border border-accent/30 bg-accent/5 text-accent text-xs font-semibold tracking-wider">
                    {step.n}
                  </div>
                  <div className="pt-1.5 flex-1">
                    <p className="text-sm font-medium text-foreground mb-1.5">{step.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="py-28 px-6 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto">

          <ScrollReveal>
            <div className="mb-16 text-center">
              <p className="text-xs uppercase tracking-widest text-accent mb-3">Built for</p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                The coaching staff of two.
              </h2>
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
                Most programs don&apos;t have 40-person analytics departments.
                Chalk gives your staff the tools those departments use, without needing the staff to run them.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                Icon: Users,
                title: "Small college programs",
                body: "FCS, NAIA, D3, JUCO. One or two QC coaches covering both sides of the ball on a limited budget.",
              },
              {
                Icon: Target,
                title: "Any size staff",
                body: "From Friday night programs to mid-majors, where the same coach handles game planning, recruiting calls, and film review.",
              },
              {
                Icon: Zap,
                title: "Coaches short on time",
                body: "If your Monday prep window is two hours instead of twelve, Chalk is built for exactly that constraint.",
              },
            ].map(({ Icon, title, body }, i) => (
              <ScrollReveal key={title} delay={i * 80}>
                <div className="rounded-sm border border-border bg-background p-6 h-full">
                  <Icon className="h-5 w-5 text-accent mb-4" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-foreground mb-2">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* DEMO CTA */}
      <section className="py-28 px-6 bg-background">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <div className="rounded-sm border border-accent/25 bg-accent/5 p-12 text-center">
              <p className="text-xs uppercase tracking-widest text-accent mb-4">No account needed</p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-5">
                One click. Full team. No friction.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-md mx-auto">
                Click once and land in a fully populated demo team with two games of tagged plays,
                a recruiting board with four evaluated prospects, and ready-to-use game plans.
                No signup, no credit card, nothing to remember.
              </p>
              <DemoButton size="lg" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* AUTH */}
      <section id="auth" className="py-28 px-6 bg-surface border-t border-border">
        <div className="max-w-sm mx-auto">
          <ScrollReveal>
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Your own team</p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
                Sign up for free
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Create a persistent account for your program. Your games, recruits, and game plans stay yours.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <AuthForm />
          </ScrollReveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-7 px-6 border-t border-border bg-background">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <Wordmark size="sm" />
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a
              href="https://github.com/AddisonTech/Chalk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
              GitHub
            </a>
            <a
              href="https://addisontech.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              AddisonTech
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}

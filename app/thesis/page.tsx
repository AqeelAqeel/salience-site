import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Lightbulb, Users, Smartphone, Car, Monitor, Headphones, Home } from 'lucide-react';
import Link from 'next/link';

export default function ThesisPage() {
  return (
    <main className="relative overflow-hidden min-h-screen bg-gradient-to-b from-background via-secondary/10 to-background">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-lg transform rotate-45"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-accent to-primary rounded-lg transform rotate-45 scale-75"></div>
              </div>
              <span className="text-xl font-bold">Salience</span>
            </Link>
            
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Background gradient with elegant colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5" />
      
      {/* Hero Section */}
      <section className="relative py-40 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="sun-gradient-text">Creating Novel Experiences</span>
          </h1>
          <p className="text-2xl text-muted-foreground leading-relaxed font-medium">
            Transcending traditional hardware-centric design towards human-centric experiences that adapt to you.
          </p>
        </div>
      </section>

      {/* Core Philosophy */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">
                We Bridge the Gaps
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                Our imagination helps us bridge the gaps between where technology is and where people need it to be. We understand where people are at, what they're trying to achieve, and become what seems unseen or impossible.
              </p>
              <p className="text-xl text-muted-foreground leading-relaxed">
                <span className="text-primary font-semibold">We are here to be seen.</span> Not as another interface, but as an extension of human intention.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card/80 backdrop-blur-xl rounded-3xl p-12 border border-border shadow-2xl hover:shadow-3xl transition-all duration-300">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <Brain className="w-12 h-12 text-primary" />
                    <h3 className="text-2xl font-bold">Human-Centric Design</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Moving beyond traditional hardware constraints to create experiences that understand and adapt to human behavior, context, and needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Principles */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
            <span className="sun-gradient-text">Our Principles</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Principle 1 */}
            <div className="bg-card/70 backdrop-blur-md rounded-2xl p-10 border border-border hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02]">
              <Users className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-4">Meeting People Where They Are</h3>
              <p className="text-muted-foreground leading-relaxed">
                Understanding both parties' capabilities and finding seamless integrations. This means adapting to when, where, and however works best for everyone involved.
              </p>
            </div>

            {/* Principle 2 */}
            <div className="bg-card/70 backdrop-blur-md rounded-2xl p-10 border border-border hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02]">
              <Lightbulb className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-4">Context-Aware Adaptation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your device understanding multiple inputs, audio structures, and AI capabilities to meet you where you're at - whether in a car, at home, or on the go.
              </p>
            </div>

            {/* Principle 3 */}
            <div className="bg-card/70 backdrop-blur-md rounded-2xl p-10 border border-border hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02]">
              <Brain className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-4">Cognitive Load Reduction</h3>
              <p className="text-muted-foreground leading-relaxed">
                Integrating with applications people cannot live without, alleviating cognitive burden and becoming a natural extension of how they do things.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-World Example */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
            <span className="sun-gradient-text">Adaptive Experiences in Action</span>
          </h2>
          
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-16 backdrop-blur-xl border border-border shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h3 className="text-3xl font-bold">The Car Interface Example</h3>
                <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                  Imagine interacting with your phone while driving. Instead of complex desktop UI patterns, you get:
                </p>
                <ul className="space-y-5 text-muted-foreground">
                  <li className="flex items-start gap-4">
                    <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="leading-relaxed">Big, accessible buttons designed for safety</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="leading-relaxed">Clean, clear design that matches existing car interfaces</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="leading-relaxed">Core functionality without complex onboarding</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <span className="leading-relaxed">Leveraging existing behaviors from familiar apps</span>
                  </li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-card/70 rounded-2xl p-8 border border-border hover:border-primary/30 flex flex-col items-center gap-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.05]">
                  <Car className="w-16 h-16 text-primary" />
                  <span className="font-medium">Car Mode</span>
                </div>
                <div className="bg-card/70 rounded-2xl p-8 border border-border hover:border-primary/30 flex flex-col items-center gap-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.05]">
                  <Monitor className="w-16 h-16 text-primary" />
                  <span className="font-medium">Desktop Mode</span>
                </div>
                <div className="bg-card/70 rounded-2xl p-8 border border-border hover:border-primary/30 flex flex-col items-center gap-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.05]">
                  <Smartphone className="w-16 h-16 text-primary" />
                  <span className="font-medium">Mobile Mode</span>
                </div>
                <div className="bg-card/70 rounded-2xl p-8 border border-border hover:border-primary/30 flex flex-col items-center gap-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.05]">
                  <Headphones className="w-16 h-16 text-primary" />
                  <span className="font-medium">Voice Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="sun-gradient-text">Join the Evolution</span>
          </h2>
          <p className="text-xl text-muted-foreground font-medium">
            We're building the future of human-computer interaction. One experience at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/campfire">
              <Button 
                size="lg"
                className="rounded-full px-12 py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                🔥 Sit at the Campfire
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/">
              <Button 
                size="lg"
                variant="outline"
                className="rounded-full px-12 py-6 text-lg border-border hover:bg-secondary hover:border-primary/30 transition-all duration-300"
              >
                Back to Home
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
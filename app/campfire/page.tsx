import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Eye, Users, Zap, Waves, Mountain, Home } from 'lucide-react';
import Link from 'next/link';

export default function CampfirePage() {
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

      {/* Background gradient with warm elegant colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10" />
      
      {/* Hero Section */}
      <section className="relative py-40 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <div className="text-7xl mb-8 animate-pulse">🔥</div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="sun-gradient-text">Sit at the Campfire</span>
          </h1>
          <p className="text-2xl text-muted-foreground leading-relaxed font-medium">
            We know what it's like to not be seen. Let us share our story.
          </p>
        </div>
      </section>

      {/* Story Section 1 - Not Being Seen */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">
                We Know What It's Like
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                We know what it's like to not be seen, to not fit in, to not be understood. We know the feeling when systems at scale do their best, but they're not designed for individualized cases and nuance.
              </p>
              <p className="text-xl text-muted-foreground leading-relaxed">
                <span className="text-primary font-semibold">We seek to understand first, then be understood.</span> We want to understand someone else's perspective, their point of view, their lived experience.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card/80 backdrop-blur-xl rounded-3xl p-12 border border-border shadow-2xl hover:shadow-3xl transition-all duration-300">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <Eye className="w-12 h-12 text-primary" />
                    <h3 className="text-2xl font-bold">To Be Seen</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Everyone deserves to be seen, understood, and met where they are. Technology should adapt to humans, not the other way around.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section 2 - The Problem */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card/80 backdrop-blur-xl rounded-3xl p-12 border border-border shadow-2xl hover:shadow-3xl transition-all duration-300">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <Zap className="w-12 h-12 text-primary" />
                    <h3 className="text-2xl font-bold">Breaking Free</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Why should we bottleneck our productivity through our fingers and keyboards when we're stressed, overwhelmed, and need our hands free?
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8 order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold">
                Technology Shouldn't Constrain Us
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                For too long, our technology has forced our bodies and physiology to conform to existing interfaces. We've been tied to keyboards, screens, and rigid interaction patterns.
              </p>
              <p className="text-xl text-muted-foreground leading-relaxed">
                But we're humans - we're hands-free, we're stressed out, we're physiologically abundant and overwhelmed. <span className="text-primary font-semibold">Why would we bottleneck our productivity towards our fingers?</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section 3 - The Vision */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
            <span className="sun-gradient-text">The New Age of Abundance</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Vision 1 */}
            <div className="bg-card/70 backdrop-blur-md rounded-2xl p-10 border border-border hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02]">
              <Waves className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-4">Natural Communication</h3>
              <p className="text-muted-foreground leading-relaxed">
                Articulate and communicate through gestures, voice, and natural expressions. Technology that understands the full spectrum of human expression.
              </p>
            </div>

            {/* Vision 2 */}
            <div className="bg-card/70 backdrop-blur-md rounded-2xl p-10 border border-border hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02]">
              <Mountain className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-4">Grounding & Connection</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connecting us back to our bodies, grounding us, and helping discharge stored energy. Technology as a bridge to embodied living.
              </p>
            </div>

            {/* Vision 3 */}
            <div className="bg-card/70 backdrop-blur-md rounded-2xl p-10 border border-border hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.02]">
              <Heart className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-4">Abundance Consciousness</h3>
              <p className="text-muted-foreground leading-relaxed">
                This is the new age of abundance consciousness - where technology serves human flourishing rather than constraining it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-16 backdrop-blur-xl border border-border shadow-2xl">
            <div className="text-center space-y-10">
              <h2 className="text-4xl md:text-5xl font-bold">
                We Build Technology That Does
              </h2>
              <p className="text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto font-medium">
                We know what it's like to not be understood, to not fit in, to not be seen. We know what it's like when systems fail to recognize the good in individualized cases and nuance.
              </p>
              <p className="text-2xl text-primary font-semibold">
                We're building solutions and systems that do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="sun-gradient-text">Join Our Story</span>
          </h2>
          <p className="text-xl text-muted-foreground font-medium">
            Together, we're creating technology that understands, adapts, and sees you.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/thesis">
              <Button 
                size="lg"
                className="rounded-full px-12 py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Read Our Thesis
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
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
} 
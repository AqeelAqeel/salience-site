import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Eye, Users, Zap, Waves, Mountain, Home } from 'lucide-react';
import Link from 'next/link';

export default function CampfirePage() {
  return (
    <main className="relative overflow-hidden min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg transform rotate-45"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-red-400 to-yellow-400 rounded-lg transform rotate-45 scale-75"></div>
              </div>
              <span className="text-xl font-bold text-gray-900">Salience</span>
            </Link>
            
            <Link href="/">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg shadow-orange-500/25">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Background gradient with warm campfire colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/60 via-yellow-50/40 to-red-100/60" />
      
      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="text-6xl mb-8">🔥</div>
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="sun-gradient-text">Sit at the Campfire</span>
          </h1>
          <p className="text-2xl text-gray-700 leading-relaxed">
            We know what it's like to not be seen. Let us share our story.
          </p>
        </div>
      </section>

      {/* Story Section 1 - Not Being Seen */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                We Know What It's Like
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                We know what it's like to not be seen, to not fit in, to not be understood. We know the feeling when systems at scale do their best, but they're not designed for individualized cases and nuance.
              </p>
              <p className="text-xl text-gray-700 leading-relaxed">
                <span className="text-orange-600 font-semibold">We seek to understand first, then be understood.</span> We want to understand someone else's perspective, their point of view, their lived experience.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-orange-300/30 shadow-2xl">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <Eye className="w-12 h-12 text-orange-600" />
                    <h3 className="text-2xl font-bold text-gray-900">To Be Seen</h3>
                  </div>
                  <p className="text-gray-700">
                    Everyone deserves to be seen, understood, and met where they are. Technology should adapt to humans, not the other way around.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section 2 - The Problem */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-red-300/30 shadow-2xl">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <Zap className="w-12 h-12 text-red-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Breaking Free</h3>
                  </div>
                  <p className="text-gray-700">
                    Why should we bottleneck our productivity through our fingers and keyboards when we're stressed, overwhelmed, and need our hands free?
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Technology Shouldn't Constrain Us
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                For too long, our technology has forced our bodies and physiology to conform to existing interfaces. We've been tied to keyboards, screens, and rigid interaction patterns.
              </p>
              <p className="text-xl text-gray-700 leading-relaxed">
                But we're humans - we're hands-free, we're stressed out, we're physiologically abundant and overwhelmed. <span className="text-red-600 font-semibold">Why would we bottleneck our productivity towards our fingers?</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section 3 - The Vision */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="sun-gradient-text">The New Age of Abundance</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Vision 1 */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-orange-200/50 hover:border-orange-400/60 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Waves className="w-12 h-12 text-orange-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Natural Communication</h3>
              <p className="text-gray-700">
                Articulate and communicate through gestures, voice, and natural expressions. Technology that understands the full spectrum of human expression.
              </p>
            </div>

            {/* Vision 2 */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-yellow-200/50 hover:border-yellow-400/60 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Mountain className="w-12 h-12 text-yellow-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Grounding & Connection</h3>
              <p className="text-gray-700">
                Connecting us back to our bodies, grounding us, and helping discharge stored energy. Technology as a bridge to embodied living.
              </p>
            </div>

            {/* Vision 3 */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-red-200/50 hover:border-red-400/60 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Heart className="w-12 h-12 text-red-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Abundance Consciousness</h3>
              <p className="text-gray-700">
                This is the new age of abundance consciousness - where technology serves human flourishing rather than constraining it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-orange-200/40 to-red-200/40 rounded-3xl p-12 backdrop-blur-xl border border-orange-300/30 shadow-2xl">
            <div className="text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                We Build Technology That Does
              </h2>
              <p className="text-2xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
                We know what it's like to not be understood, to not fit in, to not be seen. We know what it's like when systems fail to recognize the good in individualized cases and nuance.
              </p>
              <p className="text-2xl text-orange-600 font-semibold">
                We're building solutions and systems that do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="sun-gradient-text">Join Our Story</span>
          </h2>
          <p className="text-xl text-gray-700">
            Together, we're creating technology that understands, adapts, and sees you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/thesis">
              <Button 
                size="lg"
                className="rounded-full px-10 py-6 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg shadow-orange-500/25"
              >
                Read Our Thesis
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/">
              <Button 
                size="lg"
                variant="outline"
                className="rounded-full px-10 py-6 text-lg border-orange-300 text-gray-700 hover:bg-orange-50 hover:border-orange-400 transition-all"
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
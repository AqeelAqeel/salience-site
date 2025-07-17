import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Lightbulb, Users, Smartphone, Car, Monitor, Headphones, Home } from 'lucide-react';
import Link from 'next/link';

export default function ThesisPage() {
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

      {/* Background gradient with sun colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 via-yellow-50/30 to-red-100/50" />
      
      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="sun-gradient-text">Creating Novel Experiences</span>
          </h1>
          <p className="text-2xl text-gray-700 leading-relaxed">
            Transcending traditional hardware-centric design towards human-centric experiences that adapt to you.
          </p>
        </div>
      </section>

      {/* Core Philosophy */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                We Bridge the Gaps
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Our imagination helps us bridge the gaps between where technology is and where people need it to be. We understand where people are at, what they're trying to achieve, and become what seems unseen or impossible.
              </p>
              <p className="text-xl text-gray-700 leading-relaxed">
                <span className="text-orange-600 font-semibold">We are here to be seen.</span> Not as another interface, but as an extension of human intention.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-orange-300/30 shadow-2xl">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <Brain className="w-12 h-12 text-orange-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Human-Centric Design</h3>
                  </div>
                  <p className="text-gray-700">
                    Moving beyond traditional hardware constraints to create experiences that understand and adapt to human behavior, context, and needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Principles */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="sun-gradient-text">Our Principles</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Principle 1 */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-orange-200/50 hover:border-orange-400/60 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Users className="w-12 h-12 text-orange-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Meeting People Where They Are</h3>
              <p className="text-gray-700">
                Understanding both parties' capabilities and finding seamless integrations. This means adapting to when, where, and however works best for everyone involved.
              </p>
            </div>

            {/* Principle 2 */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-yellow-200/50 hover:border-yellow-400/60 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Lightbulb className="w-12 h-12 text-yellow-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Context-Aware Adaptation</h3>
              <p className="text-gray-700">
                Your device understanding multiple inputs, audio structures, and AI capabilities to meet you where you're at - whether in a car, at home, or on the go.
              </p>
            </div>

            {/* Principle 3 */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-red-200/50 hover:border-red-400/60 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Brain className="w-12 h-12 text-red-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cognitive Load Reduction</h3>
              <p className="text-gray-700">
                Integrating with applications people cannot live without, alleviating cognitive burden and becoming a natural extension of how they do things.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-World Example */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="sun-gradient-text">Adaptive Experiences in Action</span>
          </h2>
          
          <div className="bg-gradient-to-br from-orange-200/40 to-red-200/40 rounded-3xl p-12 backdrop-blur-xl border border-orange-300/30 shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-gray-900">The Car Interface Example</h3>
                <p className="text-xl text-gray-700 leading-relaxed">
                  Imagine interacting with your phone while driving. Instead of complex desktop UI patterns, you get:
                </p>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                    <span>Big, accessible buttons designed for safety</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                    <span>Clean, clear design that matches existing car interfaces</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                    <span>Core functionality without complex onboarding</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                    <span>Leveraging existing behaviors from familiar apps</span>
                  </li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/70 rounded-2xl p-6 border border-orange-200/50 flex flex-col items-center gap-4 shadow-lg">
                  <Car className="w-16 h-16 text-orange-600" />
                  <span className="text-gray-900 font-medium">Car Mode</span>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 border border-yellow-200/50 flex flex-col items-center gap-4 shadow-lg">
                  <Monitor className="w-16 h-16 text-yellow-600" />
                  <span className="text-gray-900 font-medium">Desktop Mode</span>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 border border-red-200/50 flex flex-col items-center gap-4 shadow-lg">
                  <Smartphone className="w-16 h-16 text-red-600" />
                  <span className="text-gray-900 font-medium">Mobile Mode</span>
                </div>
                <div className="bg-white/70 rounded-2xl p-6 border border-orange-200/50 flex flex-col items-center gap-4 shadow-lg">
                  <Headphones className="w-16 h-16 text-orange-600" />
                  <span className="text-gray-900 font-medium">Voice Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="sun-gradient-text">Join the Evolution</span>
          </h2>
          <p className="text-xl text-gray-700">
            We're building the future of human-computer interaction. One experience at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/campfire">
              <Button 
                size="lg"
                className="rounded-full px-10 py-6 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg shadow-orange-500/25"
              >
                🔥 Sit at the Campfire
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
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
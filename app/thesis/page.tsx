import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Lightbulb, Users, Smartphone, Car, Monitor, Headphones } from 'lucide-react';
import Link from 'next/link';

export default function ThesisPage() {
  return (
    <main className="relative overflow-hidden min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
      
      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="gradient-text">Creating Novel Experiences</span>
          </h1>
          <p className="text-2xl text-gray-300 leading-relaxed">
            Transcending traditional hardware-centric design towards human-centric experiences that adapt to you.
          </p>
        </div>
      </section>

      {/* Core Philosophy */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                We Bridge the Gaps
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Our imagination helps us bridge the gaps between where technology is and where people need it to be. We understand where people are at, what they're trying to achieve, and become what seems unseen or impossible.
              </p>
              <p className="text-xl text-gray-300 leading-relaxed">
                <span className="text-purple-400 font-semibold">We are here to be seen.</span> Not as another interface, but as an extension of human intention.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl" />
              <div className="relative bg-black/50 backdrop-blur-xl rounded-3xl p-12 border border-purple-500/20">
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <Brain className="w-12 h-12 text-purple-400" />
                    <h3 className="text-2xl font-bold text-white">Human-Centric Design</h3>
                  </div>
                  <p className="text-gray-300">
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
            <span className="gradient-text">Our Principles</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Principle 1 */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
              <Users className="w-12 h-12 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Meeting People Where They Are</h3>
              <p className="text-gray-300">
                Understanding both parties' capabilities and finding seamless integrations. This means adapting to when, where, and however works best for everyone involved.
              </p>
            </div>

            {/* Principle 2 */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
              <Lightbulb className="w-12 h-12 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Context-Aware Adaptation</h3>
              <p className="text-gray-300">
                Your device understanding multiple inputs, audio structures, and AI capabilities to meet you where you're at - whether in a car, at home, or on the go.
              </p>
            </div>

            {/* Principle 3 */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-green-500/30 transition-all duration-300">
              <Brain className="w-12 h-12 text-green-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Cognitive Load Reduction</h3>
              <p className="text-gray-300">
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
            <span className="gradient-text">Adaptive Experiences in Action</span>
          </h2>
          
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-3xl p-12 backdrop-blur-xl border border-purple-500/20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-white">The Car Interface Example</h3>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Imagine interacting with your phone while driving. Instead of complex desktop UI patterns, you get:
                </p>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                    <span>Big, accessible buttons designed for safety</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                    <span>Clean, clear design that matches existing car interfaces</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                    <span>Core functionality without complex onboarding</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                    <span>Leveraging existing behaviors from familiar apps</span>
                  </li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-black/50 rounded-2xl p-6 border border-white/10 flex flex-col items-center gap-4">
                  <Car className="w-16 h-16 text-purple-400" />
                  <span className="text-white font-medium">Car Mode</span>
                </div>
                <div className="bg-black/50 rounded-2xl p-6 border border-white/10 flex flex-col items-center gap-4">
                  <Monitor className="w-16 h-16 text-blue-400" />
                  <span className="text-white font-medium">Desktop Mode</span>
                </div>
                <div className="bg-black/50 rounded-2xl p-6 border border-white/10 flex flex-col items-center gap-4">
                  <Smartphone className="w-16 h-16 text-green-400" />
                  <span className="text-white font-medium">Mobile Mode</span>
                </div>
                <div className="bg-black/50 rounded-2xl p-6 border border-white/10 flex flex-col items-center gap-4">
                  <Headphones className="w-16 h-16 text-pink-400" />
                  <span className="text-white font-medium">Voice Mode</span>
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
            <span className="gradient-text">Join the Evolution</span>
          </h2>
          <p className="text-xl text-gray-300">
            We're building the future of human-computer interaction. One experience at a time.
          </p>
          <Link href="/">
            <Button 
              size="lg"
              className="rounded-full px-10 py-6 text-lg bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/20"
            >
              Back to Home
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
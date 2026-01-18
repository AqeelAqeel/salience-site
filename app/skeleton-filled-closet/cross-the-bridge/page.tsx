'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/header';
import { LavaLamp } from '@/components/lava-lamp';
import Link from 'next/link';

export default function CrossingTheBridgePage() {
  return (
    <>
      <Header />
      
      {/* Lava Lamps on both sides */}
      <LavaLamp side="left" />
      <LavaLamp side="right" />
      
      <main className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 dotted-pattern opacity-20" />
        <div className="absolute inset-0 noise-texture" />
        
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative pt-16">
          <div className="relative z-10 max-w-5xl mx-auto w-full">
            

            {/* Title */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-12 text-center leading-none">
              <span className="sun-gradient-text drop-shadow-2xl">The Salience Stack</span>
            </h1>
            
            <div className="text-center mb-16">
              <p className="text-xl md:text-2xl text-white/70 italic font-light">
                Bridging the Chasm Between Mortal Intent and Divine Implementation
              </p>
            </div>
          </div>
        </section>

        {/* The Myth - Main Content */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto relative z-10">
            
            {/* Chapter I - The Panoramic Vision */}
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                <span className="being-gradient-text">Chapter I: The Cosmic Architecture</span>
              </h2>
              
              <div className="prose prose-lg md:prose-xl prose-invert mx-auto leading-relaxed space-y-6">
                <p className="text-white/90 text-lg md:text-xl leading-relaxed">
                  Behold the grand tapestry—not merely the threads that align with our vision, but the entire weave of existence. The Salience Stack perceives the totality: every soul that walks this earth, whether destined for resonance or destined for divergence. Like the Titans before Zeus, we see the whole planet, the spinning galaxies, and the metaphysical realities that dance between dimensions.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  Those who will <em>not</em> align are not obstacles to be removed—they are essential threads in the cosmic ecosystem. The shepherd understands that wolves serve the forest just as sheep serve the pasture. We design not for the converted, but for the totality of human experience across all realms of being.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  This is the first principle of divine architecture: <strong>complete systemic awareness</strong>. Before we speak of funnels and conversion, we must see the entire landscape—the peaks and valleys, the fertile ground and the barren stone, all equally sacred in their purpose.
                </p>
              </div>
            </div>

            {/* Chapter II - The Conversion Mysteries */}
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                <span className="understood-gradient-text">Chapter II: The Sacred Funnel</span>
              </h2>
              
              <div className="prose prose-lg md:prose-xl prose-invert mx-auto leading-relaxed space-y-6">
                <p className="text-white/90 text-lg md:text-xl leading-relaxed">
                  Every part of the conversion strategy becomes a ritual of understanding—who are these mortals, really? Not in their idealized form, but in their true essence: their habitats, their rhythms, their secret longings.
                </p>
                
                <div className="bg-white/5 rounded-xl p-8 border border-white/10 my-8">
                  <h3 className="text-2xl font-bold mb-6 text-white">The Four Pillars of Recognition</h3>
                  <div className="space-y-4 text-lg text-white/85">
                    <div><strong className="text-white">Identity:</strong> Who they truly are beneath the personas</div>
                    <div><strong className="text-white">Territory:</strong> What spaces they inhabit, both physical and digital</div>
                    <div><strong className="text-white">Resonance:</strong> What content strikes their core frequencies</div>
                    <div><strong className="text-white">Familiarity:</strong> What patterns already exist in their world</div>
                  </div>
                </div>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  But here lies the profound truth: we do not seek to change them. We seek to understand what they already do, what actions flow naturally from their being, and how to weave our offerings into the existing fabric of their lives.
                </p>
              </div>
            </div>

            {/* Chapter III - Breaking the 2D Paradigm */}
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                <span className="sun-gradient-text">Chapter III: The Dimensional Transcendence</span>
              </h2>
              
              <div className="prose prose-lg md:prose-xl prose-invert mx-auto leading-relaxed space-y-6">
                <p className="text-white/90 text-lg md:text-xl leading-relaxed">
                  Before souls can enter the depths of our offering, we must shatter the prison of flat pixels and linear thinking. The 2D paradigm is Plato's cave—shadows on the wall that mortals mistake for reality itself.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  We engineer experiences that <em>move</em>—not merely animations, but genuine resonance that awakens something deeper within the observer. Like Orpheus with his lyre, we must create something that stirs the very atoms of being, that breaks through the numbing veil of digital habituation.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  This is the alchemical moment: transforming passive consumption into active participation, flat engagement into dimensional presence. Only when consciousness itself is activated can true value exchange begin.
                </p>
              </div>
            </div>

            {/* Chapter IV - The Value Architecture */}
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                <span className="being-gradient-text">Chapter IV: The Eternal Exchange</span>
              </h2>
              
              <div className="prose prose-lg md:prose-xl prose-invert mx-auto leading-relaxed space-y-6">
                <p className="text-white/90 text-lg md:text-xl leading-relaxed">
                  Value is not a transaction—it is a living ecosystem. How do mortals truly assign worth? Not through arbitrary pricing, but through alignment with their deepest needs and highest aspirations.
                </p>
                
                <div className="bg-white/5 rounded-xl p-8 border border-white/10 my-8">
                  <h3 className="text-2xl font-bold mb-6 text-white">The Continuous Value Cycle</h3>
                  <div className="space-y-4 text-lg text-white/85">
                    <div><strong className="text-white">Immediate Value:</strong> Instant utility that proves worth</div>
                    <div><strong className="text-white">Participatory Value:</strong> Engagement that feels meaningful</div>
                    <div><strong className="text-white">Evolutionary Value:</strong> Growth that compounds over time</div>
                    <div><strong className="text-white">Network Value:</strong> Connection that expands possibility</div>
                  </div>
                </div>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  The sacred truth we embody: people are not isolated islands of tech consumption. They live full, rich lives with relationships, rituals, and rhythms. Our designs must honor and enhance this reality, not compete with it.
                </p>
              </div>
            </div>

            {/* Chapter V - The Design Philosophy */}
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                <span className="understood-gradient-text">Chapter V: The Human-Centered Cosmos</span>
              </h2>
              
              <div className="prose prose-lg md:prose-xl prose-invert mx-auto leading-relaxed space-y-6">
                <p className="text-white/90 text-lg md:text-xl leading-relaxed">
                  We design with the full spectrum of human states in mind—the exhausted parent at midnight, the energized entrepreneur at dawn, the contemplative soul in quiet moments, the social being in crowded spaces.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  <strong>Physiology matters.</strong> The tension in shoulders, the rhythm of breath, the quality of light falling across the screen. <strong>Presence matters.</strong> Whether attention is scattered or focused, whether the moment is rushed or spacious. <strong>Energy matters.</strong> The subtle frequencies that emerge from different emotional and mental states.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  Every interface becomes a mirror reflecting back the user's state while gently guiding toward more optimal configurations. We are not building software—we are crafting experiences that honor the full dimensionality of human existence.
                </p>
              </div>
            </div>

            {/* The Practical Implementation */}
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                <span className="sun-gradient-text">The Practical Mysteries</span>
              </h2>
              
              <div className="prose prose-lg md:prose-xl prose-invert mx-auto leading-relaxed space-y-6">
                <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10 rounded-xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold mb-6 text-white">Implementation Framework</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-3">Ecosystem Mapping</h4>
                      <p className="text-white/85">Research and understand the complete landscape—aligned and non-aligned populations, their natural habitats, and existing behavioral patterns.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-3">Conversion Architecture</h4>
                      <p className="text-white/85">Design each touchpoint as a ritual of recognition—who they are, where they exist, what resonates, what feels familiar.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-3">Dimensional Breaking</h4>
                      <p className="text-white/85">Create experiences that transcend flat interaction—movement, resonance, and presence that activate consciousness itself.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-3">Value Ecosystem</h4>
                      <p className="text-white/85">Build continuous value cycles that honor the full richness of human life, not just digital engagement.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-3">State-Aware Design</h4>
                      <p className="text-white/85">Account for physiology, presence, and energetic states in every design decision—interfaces that mirror and guide human consciousness.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Revelation */}
            <div className="text-center py-16 border-t border-white/20 mt-20">
              <p className="text-2xl md:text-3xl text-white/80 italic font-light mb-8">
                "Technology serves consciousness, not the reverse."
              </p>
              
              <p className="text-lg md:text-xl text-white/70 mb-12 max-w-3xl mx-auto">
                The Salience Stack is not a methodology—it is a philosophy of designing with the full spectrum of human experience, honoring both the seen and unseen dimensions of consciousness.
              </p>
              
              <div className="space-y-4">
                <Link href="/">
                  <Button
                    size="lg"
                    className="rounded-full px-8 py-4 text-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md shadow-lg shadow-black/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Return to the Origin
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
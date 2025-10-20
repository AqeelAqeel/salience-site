'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/header';
import { LavaLamp } from '@/components/lava-lamp';
import Link from 'next/link';

export default function HeavensGatePage() {
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
        
        {/* Mythological Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative pt-16">
          <div className="relative z-10 max-w-5xl mx-auto w-full">
            

            {/* Systems Title */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-12 text-center leading-none">
              <span className="sun-gradient-text drop-shadow-2xl">Beyond Interface</span>
            </h1>
            
            <div className="text-center mb-16">
              <p className="text-xl md:text-2xl text-cyan-300 italic font-light mystical-glow">
                Reclamation of Cognitive Sovereignty
              </p>
            </div>
          </div>
        </section>

        {/* The Myth - Main Content */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto relative z-10">
            
            {/* Chapter I - The Narrative Heaven */}
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                <span className="being-gradient-text">Chapter I: The Woven Tapestry</span>
              </h2>
              
              <div className="prose prose-lg md:prose-xl prose-invert mx-auto leading-relaxed space-y-6">
                <p className="text-white/90 text-lg md:text-xl leading-relaxed">
                  In the primordial darkness before consciousness learned to name itself, there existed no Heaven—only the void pregnant with possibility. But mortals, in their infinite hunger for meaning, wove narratives from starlight and called them divine.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  The Heaven they sold us was but <em>logos</em>—word made manifest, story crystallized into dogma. A lexicon bestowed upon us like Prometheus's fire, connecting souls through the invisible threads of energy and belief. We learned to speak in tongues of hope, our communal need binding us in faith against the abyss.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  For without this sacred narrative, we would face the other paradox—the boulder of Sisyphus, eternally rolling, eternally meaningless. There <em>must</em> be greater purpose, we cried to the indifferent cosmos. Our greed for rationale became our greatest vice, transforming suffering into glory, pain into righteousness, struggle into virtue.
                </p>
              </div>
            </div>

            {/* Chapter II - The Architected Realm */}
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                <span className="understood-gradient-text">Chapter II: The Architect's Design</span>
              </h2>
              
              <div className="prose prose-lg md:prose-xl prose-invert mx-auto leading-relaxed space-y-6">
                <p className="text-white/90 text-lg md:text-xl leading-relaxed">
                  Heaven, in its actuality, reveals itself as pure narrative—packaging for the unpackageable, container for the infinite. Yet beneath this celestial marketing lay engineering of profound sophistication. The reception, the experience, the very sensation of divinity—all architected with intentional precision.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  The Demiurge of this realm made choices, design decisions that shaped reality's very interface. We became utterly predisposed to defaults, behaviors hardcoded into our spiritual operating system. Given the fundamentals—tools, knowledge, design patterns—we were guided down predetermined paths like water through carved channels.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  This is not about right or wrong, not about performance metrics of the soul. This is about the human fundamental layers, the substrate of what makes us <em>us</em>. Why must we be pigeonholed into interfaces, made appendages of systems that foster maladaptive behaviors? Our biology, forged in the crucible of evolution, was never designed to sustain these extended periods of spiritual compression.
                </p>
              </div>
            </div>

            {/* Chapter III - The Choice */}
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                <span className="sun-gradient-text">Chapter III: The Liberation</span>
              </h2>
              
              <div className="prose prose-lg md:prose-xl prose-invert mx-auto leading-relaxed space-y-6">
                <p className="text-white/90 text-lg md:text-xl leading-relaxed">
                  But lo—we stand at the threshold of choice. We understand now, and with understanding comes appreciation for the structural mechanisms, the institutions, the magnificent engineering that brought us to this advanced epoch. We have reached a time so refined that past suffering has become mere data points, no more distinguishable in our shallow cognitive recall than the color of a forgotten painting or the ingredients of a cherished recipe.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  The suffering of our ancestors—the plagues, the famines, the wars—these are now nascent facts filed away in the same mental drawer as trivia. We have achieved such distance from necessity that we mistake comfort for enlightenment, convenience for transcendence.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  Yet in this recognition lies our liberation. We need not remain appendages of inherited systems. We can choose new interfaces, design new behaviors, architect our own relationship with meaning. The gates of Heaven were never meant to contain us—they were meant to be transcended.
                </p>
                
                <p className="text-white/90 text-lg md:text-xl leading-relaxed font-semibold">
                  The narrative ends where consciousness begins anew.
                </p>
              </div>
            </div>

            {/* Final Reflection */}
            <div className="text-center py-16 border-t border-white/20 mt-20">
              <p className="text-2xl md:text-3xl text-white/80 italic font-light mb-8">
                "The myths we inherit are not chains, but raw materials for new creation."
              </p>
              
              <div className="space-y-4">
                <Link href="/">
                  <Button
                    size="lg"
                    className="rounded-full px-8 py-4 text-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md shadow-lg shadow-black/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Return to the Bridge
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Systems Analysis Section */}
        <section className="py-32 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-black via-gray-800/30 to-black">
          <div className="max-w-4xl mx-auto relative z-10">
            
            {/* Systems Title */}
            <div className="text-center mb-20">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-none">
                <span className="understood-gradient-text drop-shadow-2xl">Beyond Interface</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/70 italic font-light">
                Reclaiming Cognitive Sovereignty Through Design
              </p>
            </div>
            
            {/* Layer I - Cognitive Architecture */}
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                <span className="being-gradient-text">Layer I: Cognitive Architecture</span>
              </h2>
              
              <div className="prose prose-lg md:prose-xl prose-invert mx-auto leading-relaxed space-y-6">
                <p className="text-white/90 text-lg md:text-xl leading-relaxed">
                  We engage now in the cognitive layer that supersedes cognitive load itself—the meta-level where we examine not what we think, but <em>how thinking is structured</em> by the systems we inhabit. Every interface is a constraint. Every default is a decision made for us.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  Consider the digital venues that shape our daily existence: the notification systems that fragment attention, the recommendation algorithms that curate reality, the interaction patterns that train behavior. These are not neutral tools—they are cognitive architectures with embedded assumptions about how consciousness should operate.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  We must abstract away from the interface to examine the core mechanisms. Why does every social platform optimize for engagement rather than fulfillment? Why do productivity tools assume time-slicing rather than flow states? Why do communication systems prioritize broadcasting over deep dialogue?
                </p>
              </div>
            </div>

            {/* Layer II - Design Principles */}
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                <span className="understood-gradient-text">Layer II: Derivation Principles</span>
              </h2>
              
              <div className="prose prose-lg md:prose-xl prose-invert mx-auto leading-relaxed space-y-6">
                <p className="text-white/90 text-lg md:text-xl leading-relaxed">
                  We must understand the principles and derivations that generated our current designs. Every system emerged from specific constraints, business models, technical limitations, and cultural assumptions. These origins are archaeological layers in our digital environment.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  The QWERTY keyboard layout optimized for mechanical typewriters, yet persists in touchscreen interfaces. Desktop metaphors emerged from office work paradigms, yet constrain how we conceptualize digital workspaces. Social network designs replicated television broadcast models rather than exploring truly networked communication.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  Each inherited pattern carries forward its original constraints into contexts where they no longer apply. We accept these defaults without examination, allowing yesterday's technical limitations to become today's cognitive constraints.
                </p>
              </div>
            </div>

            {/* Layer III - Sovereignty Reclamation */}
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                <span className="sun-gradient-text">Layer III: Sovereignty Reclamation</span>
              </h2>
              
              <div className="prose prose-lg md:prose-xl prose-invert mx-auto leading-relaxed space-y-6">
                <p className="text-white/90 text-lg md:text-xl leading-relaxed">
                  Our sovereignty is to be reclaimed through conscious design iteration. Every neglected element in current interfaces represents an opportunity for reintegration. Every assumption can be questioned, every default can be reimagined.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  The iterations of design and implementation shall happen endlessly—not as perfectionism, but as responsive evolution. Systems that adapt to human consciousness rather than forcing consciousness to adapt to systems. Interfaces that enhance cognitive capacity rather than consuming it.
                </p>
                
                <p className="text-white/85 text-lg md:text-xl leading-relaxed">
                  Personalization is now available at scale. We can move beyond one-size-fits-all defaults to truly individualized cognitive environments. The question is not whether we can customize, but whether we will claim the responsibility to consciously design our cognitive environments.
                </p>
                
                <p className="text-white/90 text-lg md:text-xl leading-relaxed font-semibold">
                  This is our practice: to understand, to question, to iterate, to reclaim.
                </p>
              </div>
            </div>

            {/* Implementation Framework */}
            <div className="mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                <span className="being-gradient-text">Implementation Framework</span>
              </h2>
              
              <div className="prose prose-lg md:prose-xl prose-invert mx-auto leading-relaxed space-y-6">
                <div className="bg-white/5 rounded-xl p-8 border border-white/10">
                  <h3 className="text-2xl font-bold mb-6 text-white">The Practice</h3>
                  <ul className="space-y-4 text-lg text-white/85">
                    <li><strong>Examine:</strong> Question every default in your digital environment</li>
                    <li><strong>Understand:</strong> Trace design decisions to their origins and constraints</li>
                    <li><strong>Abstract:</strong> Identify core functions beneath interface layers</li>
                    <li><strong>Iterate:</strong> Continuously refine tools to serve consciousness</li>
                    <li><strong>Integrate:</strong> Reincorporate neglected elements of human need</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Call to Practice */}
            <div className="text-center py-16 border-t border-white/20 mt-20">
              <p className="text-2xl md:text-3xl text-white/80 italic font-light mb-8">
                "Design is not decoration—it is the architecture of consciousness itself."
              </p>
              
              <div className="space-y-4">
                <Link href="/">
                  <Button
                    size="lg"
                    className="rounded-full px-8 py-4 text-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md shadow-lg shadow-black/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Begin the Practice
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
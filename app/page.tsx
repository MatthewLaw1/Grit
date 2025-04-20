"use client";

import { motion } from "framer-motion";
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Code2, GitBranch, Rocket, Lightbulb, Users, School, ActivitySquare, BookOpenCheck, Layers, Smartphone, BarChart3 } from 'lucide-react'; // Icons
import './globals.css';

export default function LandingPage() {
  const thumbnails: string[] = [
    '/thumbnail-1.png',
    '/thumbnail-2.png',
    '/thumbnail-3.png',
    '/thumbnail-4.png',
    '/thumbnail-5.png',
  ];
  const [active, setActive] = useState<number>(0);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--secondary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur bg-[var(--foreground)] bg-opacity-80 shadow-md">
        <div className="container mx-auto flex items-center justify-between py-4 px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-3"
          >
            <Image src="/icon-black.png" alt="Logo" width={48} height={48} />
            <span className="text-2xl font-bold">Grit</span>
          </motion.div>

          <nav className="hidden md:flex space-x-6">
            {['Features', 'Pricing', 'Docs'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="hover:text-[var(--primary)] transition"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <Button size="sm" variant="primary">Log In</Button>
            <Button size="sm" variant="secondary">Sign Up</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center pt-12 px-6 space-y-24 lg:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-2xl"
        >
          <Image src="/icon-black.png" alt="Grit Logo" width={72} height={72} className="mx-auto mb-4" />
          <h1 className="text-5xl lg:text-6xl font-extrabold text-[var(--secondary)]">
            Reveal AI&apos;s Chain<br />of Thought
          </h1>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
            Engage with each step of an AI&apos;s reasoning. Dive deeper, ask questions,
            and learn interactively.
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={() => window.location.href = "/dashboard"}
              className="px-6 py-2 bg-[var(--primary)] text-white rounded-full hover:opacity-90 transition"
            >
              Get Started
            </button>
            <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition"
            >
              Learn More
            </button>
          </div>
        </motion.div>
      </section>

      {/* Thumbnail Section */}
      <section className="flex flex-col lg:flex-row items-center justify-center mt-12 px-6 space-y-6 lg:space-y-0 lg:space-x-12">
        <div className="flex flex-col space-y-4">
          {thumbnails.map((thumbnail, idx) => (
            <motion.div
              key={thumbnail} // <-- use thumbnail as key, not idx
              whileHover={{ scale: 1.1 }}
              className={`w-20 h-auto rounded-lg overflow-hidden cursor-pointer transition ${active === idx ? "ring-4 ring-[var(--primary)]" : "opacity-60"}`}
              onClick={() => setActive(idx)}
            >
              <img src={thumbnail} alt={`Thumbnail ${idx + 1}`} className="object-cover w-full h-full" />
            </motion.div>
          ))}
        </div>

        <motion.div
          key={thumbnails[active]} // <-- key with the image path for clean re-rendering
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl rounded-xl overflow-hidden shadow-2xl"
        >
          <Image 
            src={thumbnails[active]} 
            alt={`Thumbnail ${active + 1}`} 
            width={1200} 
            height={800} 
            className="w-full h-auto object-cover" 
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 lg:px-20">
        <h2 className="text-4xl font-bold text-center text-[var(--secondary)] mb-12">Features</h2>
        <div className="container mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Brain, title: 'Live Visualization', desc: 'Watch token-by-token reasoning unfold in real time.' },
            { icon: GitBranch, title: 'Deep Dive Branches', desc: 'Explore sub-thoughts without losing context.' },
            { icon: Code2, title: 'Multimodal Support', desc: 'Render code, math, diagrams seamlessly.' },
          ].map((feature, i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow bg-[var(--foreground)]">
              <CardHeader className="flex flex-col items-center">
                <feature.icon className="w-10 h-10 text-[var(--primary)] mb-4" />
                <CardTitle className="text-xl text-[var(--primary)]">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* What's Next Section */}
      <section className="py-20 px-6 lg:px-20 bg-gray-50">
        <h2 className="text-4xl font-bold text-center text-[var(--secondary)] mb-12">What&apos;s Next for Grit</h2>
        <div className="container mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: School, title: 'Product Launch', desc: 'Launch our product as an Embedded Tool in Educaide AI, reaching 700,000 educators globally.' },
            { icon: ActivitySquare, title: 'Activation Extraction', desc: 'Surface latent activation patterns for deeper AI insights.' },
            { icon: BookOpenCheck, title: 'Mini-Course Generator', desc: 'Auto-compile reasoning flows into custom study plans.' },
            { icon: Layers, title: 'Multi-Model Support', desc: 'Pick from different reasoning styles and compare outputs.' },
            { icon: Smartphone, title: 'Mobile & Collaborative Modes', desc: 'iOS/Android apps and shared reasoning sessions for teams.' },
            { icon: BarChart3, title: 'Learning Analytics', desc: 'Analyze anonymized paths to suggest resources and improvements.' },
          ].map((future, i) => (
            <Card key={i} className="bg-[var(--primary)] hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-col items-center">
                <future.icon className="w-10 h-10 text-[var(--foreground)] mb-4" />
                <CardTitle className="text-xl text-center text-[var(--foreground)]">{future.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center text-[var(--foreground)]">{future.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--secondary)] text-gray-200 py-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6 lg:px-20">
          <span>&copy; {new Date().getFullYear()} Grit. All rights reserved.</span>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {['Privacy', 'Terms', 'Contact'].map((item) => (
              <a key={item} href="#" className="hover:text-white transition">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

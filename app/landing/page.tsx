"use client"

import { motion } from "framer-motion"
import Image from 'next/image'
import { useState } from 'react'

export default function LandingPage() {
    const thumbnails: number[] = [1, 2, 3, 4]
    const [active, setActive] = useState<number>(0)

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="sticky top-0 z-50 bg-white bg-opacity-60 backdrop-blur flex justify-between items-center py-4 px-8 shadow-sm">
            <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
            >
            <Image src="/icon-black.png" alt="Logo" width={50} height={50} />
            <span className="text-xl font-semibold text-[var(--primary)]">Grit</span>
            </motion.div>

            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-x-3"
            >
            <button className="px-4 py-2 font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                Log In
            </button>
            <button className="px-4 py-2 font-medium bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition">
                Sign Up
            </button>
            </motion.div>
        </header>

        <main className="flex-1 space-y-24">
            <motion.section
            className="text-center pt-12 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            >
            <Image
                src="/icon-black.png"
                alt="Grit Logo"
                width={72}
                height={72}
                className="mx-auto mb-4"
            />
            <h1 className="text-5xl font-bold">Grit</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
                Explore the actual reasoning behind an AI’s response—step by step—
                creating an interactive, exploratory learning experience.
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
            </motion.section>

            <section className="flex flex-col lg:flex-row items-center justify-center px-6 space-y-6 lg:space-y-0 lg:space-x-12">
                <div className="flex flex-col space-y-4">
                    {thumbnails.map((_, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.1 }}
                            className={`w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition ${
                                active === idx ? "ring-4 ring-[var(--primary)]" : "opacity-60"
                            }`}
                            onClick={() => setActive(idx)}
                        >
                            <img
                                src={`https://via.placeholder.com/100?text=Thumb+${idx + 1}`}
                                alt={`Thumbnail ${idx + 1}`}
                                className="object-cover w-full h-full"
                            />
                        </motion.div>
                    ))}
                </div>
                <motion.div
                    key={active}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-3xl rounded-xl overflow-hidden shadow-2xl"
                >
                    <img
                        src={`https://via.placeholder.com/800x500?text=Preview+${active + 1}`}
                        alt={`Preview ${active + 1}`}
                        className="w-full h-auto"
                    />
                </motion.div>
            </section>

            <section id="features" className="py-20 px-6 bg-white">
                <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
                    Features
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5, boxShadow: "0 15px 25px rgba(0,0,0,0.1)" }}
                        className="p-6 bg-gray-50 rounded-2xl shadow transition-transform"
                    >
                        <div className="w-full h-40 bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] rounded-lg mb-4" />
                        <h3 className="text-2xl font-semibold mb-2">Feature {i}</h3>
                        <p className="text-gray-600">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                        do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                    </motion.div>
                    ))}
                </div>
            </section>
        </main>

        <footer className="bg-gray-800 py-4">
            <div className="text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} Grit. All rights reserved.</p>
                <div className="flex justify-center space-x-4 mt-2">
                    {["Privacy Policy", "Terms of Service", "Contact Us"].map((label) => (
                    <button
                        key={label}
                        onClick={() => alert(`${label} clicked`)}
                        className="hover:text-white transition bg-transparent border-none cursor-pointer"
                    >
                        {label}
                    </button>
                    ))}
                </div>
            </div>
        </footer>
        </div>
    )
}

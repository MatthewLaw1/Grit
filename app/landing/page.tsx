"use client"

import { NextPage } from 'next'
import Link from 'next/link'
import { useState } from 'react'

export default function LandingPage() {
    const thumbnails: number[] = [1, 2, 3, 4]
    const [active, setActive] = useState<number>(0)

    return (
        <div className="min-h-screen flex flex-col">
        {/* NAV */}
        <header className="flex justify-end p-4 space-x-2 bg-white">
        <Link href="/login" className="px-4 py-2 border rounded hover:bg-gray-100">
            Log In
        </Link>
        <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Sign Up
        </Link>
        </header>

        <main className="flex-1 space-y-24">
            {/* HERO */}
            <section className="text-center pt-12">
            {/* logo placeholder */}
            <div className="mx-auto w-12 h-12 bg-gray-300 rounded mb-4">
                {/* TODO: swap for your robot SVG */}
            </div>
            <h1 className="text-5xl font-bold">Grit</h1>
            <p className="mt-4 text-lg text-gray-600">
                explore the actual reasoning behind an AI’s response—step‑by‑step—creating an interactive, exploratory learning experience
            </p>
            <div className="mt-6 space-x-4">
                <button className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">
                Get Started
                </button>
                <button className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">
                Learn More
                </button>
            </div>
            </section>

            {/* IMAGE + THUMBNAILS */}
            <section className="flex items-start justify-center space-x-8 px-4">
            {/* Thumbnails */}
            <div className="flex flex-col space-y-4">
                {thumbnails.map((_, idx) => (
                <img
                    key={idx}
                    src={`https://via.placeholder.com/100?text=Thumb+${idx + 1}`}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`
                    w-24 h-24 object-cover rounded cursor-pointer transition-opacity
                    ${active === idx 
                        ? 'opacity-100 border-2 border-blue-500' 
                        : 'opacity-50 hover:opacity-100'}
                    `}
                    onClick={() => setActive(idx)}
                />
                ))}
            </div>
            {/* Main preview */}
            <div className="w-3/5 rounded-lg overflow-hidden shadow-lg">
                <img
                src={`https://via.placeholder.com/600x400?text=Preview+${active + 1}`}
                alt={`Preview ${active + 1}`}
                className="w-full h-auto"
                />
            </div>
            </section>

            {/* FEATURES */}
            <section className="px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4 p-6 bg-white rounded-lg shadow">
                    <div className="w-full h-40 bg-gray-200 rounded" />
                    <h3 className="text-2xl font-semibold">Feature {i}</h3>
                    <p className="text-gray-600">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.
                    </p>
                </div>
                ))}
            </div>
            </section>

            {/* BIG CALL‑OUT */}
            <section className="px-4">
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-xl text-gray-700">
                Placeholder for your big call‑out or testimonial section.
                </p>
            </div>
            </section>
        </main>
        </div>
    )
}

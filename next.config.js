/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    MAX_TOKENS: process.env.MAX_TOKENS,
  },
}
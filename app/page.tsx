"use client"

import React from "react"
import { motion } from "framer-motion"
import { Inter } from "next/font/google"
import { MessageSquare, Code, Brain, BarChart, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

const inter = Inter({ subsets: ["latin"] })

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
}

const glowingText = {
  hidden: { opacity: 0, textShadow: "0 0 0 rgba(255,255,255,0)" },
  visible: {
    opacity: 1,
    textShadow: ["0 0 10px rgba(255,255,255,0.5)", "0 0 20px rgba(255,255,255,0.3)", "0 0 10px rgba(255,255,255,0.5)"],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
    },
  },
}

// Features Component
const features = [
  {
    icon: MessageSquare,
    title: "Natural Language Processing",
    description: "Chat with our AI like you would with a human. It understands context and nuance.",
  },
  {
    icon: Brain,
    title: "Personalized Interactions",
    description: "Our AI remembers your preferences and past conversations for a tailored experience.",
  },
  {
    icon: Code,
    title: "Code Analysis & Generation",
    description: "Get help with coding tasks, from debugging to generating boilerplate code.",
  },
]

function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerChildren}
      >
        <motion.h2 className="text-3xl sm:text-4xl font-bold text-center mb-12" variants={fadeInUp}>
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-filter backdrop-blur-lg"
              variants={fadeInUp}
            >
              <feature.icon className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

// About Component
function About() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900 to-indigo-900">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerChildren}
      >
        <motion.h2 className="text-3xl sm:text-4xl font-bold mb-6" variants={fadeInUp}>
          About Our AI
        </motion.h2>
        <motion.p className="text-lg mb-8" variants={fadeInUp}>
          Our AI is built on cutting-edge technology, combining natural language processing, machine learning, and deep
          neural networks. It's designed to understand and respond to your queries with human-like intelligence.
        </motion.p>
        <motion.p className="text-lg" variants={fadeInUp}>
          Whether you're looking for a coding assistant, a data analyst, or just a friendly chat, our AI is here to
          help. It's more than just a tool – it's your intelligent companion in the digital world.
        </motion.p>
      </motion.div>
    </section>
  )
}

// Use Cases Component
const useCases = [
  {
    icon: Code,
    title: "Code Assistance",
    description: "Get help with debugging, code optimization, and even generating boilerplate code.",
  },
  {
    icon: BarChart,
    title: "Data Analysis",
    description: "Analyze complex datasets and generate insightful reports with natural language queries.",
  },
  {
    icon: MessageCircle,
    title: "Conversational AI",
    description: "Engage in natural, context-aware conversations on a wide range of topics.",
  },
]

function UseCases() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerChildren}
      >
        <motion.h2 className="text-3xl sm:text-4xl font-bold text-center mb-12" variants={fadeInUp}>
          Use Cases
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-purple-800 to-indigo-800 rounded-lg p-6 shadow-lg"
              variants={fadeInUp}
            >
              <useCase.icon className="w-12 h-12 text-purple-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
              <p className="text-gray-300">{useCase.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

// CTA Component
function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerChildren}
      >
        <motion.h2 className="text-3xl sm:text-4xl font-bold mb-6" variants={fadeInUp}>
          Be Among the First to Experience the Future of AI
        </motion.h2>
        <motion.p className="text-xl mb-8" variants={fadeInUp}>
          Our AI-powered platform is currently in beta testing. Join our exclusive group of early adopters and help
          shape the future of AI interaction.
        </motion.p>
        <motion.div variants={fadeInUp}>
          <Link href="/sign-up">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full">
              Join the Beta
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

// Rename the local Hero component to LandingHero
function LandingHero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div className="text-center max-w-3xl mx-auto" initial="hidden" animate="visible" variants={staggerChildren}>
        <motion.h1 className="text-4xl sm:text-6xl font-bold mb-6" variants={fadeInUp}>
          Welcome to the Future of
          <motion.span
            className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
            variants={glowingText}
          >
            AI Interaction
          </motion.span>
        </motion.h1>
        <motion.p className="text-xl sm:text-2xl mb-12 max-w-2xl mx-auto text-gray-200" variants={fadeInUp}>
          Experience natural conversations, personalized interactions, and powerful code analysis with our cutting-edge AI.
        </motion.p>
        <motion.div className="flex items-center justify-center gap-4" variants={fadeInUp}>
          <Link href="/sign-in">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-xl">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-transparent border-2 border-purple-600 hover:bg-purple-600/20 text-white px-8 py-6 text-lg rounded-xl">
              Sign Up
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden flex flex-col items-center justify-center">
      <div className="w-full max-w-[1920px]">
        <LandingHero />
        <Features />
        <About />
        <UseCases />
        <CTA />
      </div>
    </main>
  )
}

"use client"

import React from "react"
import { motion } from "framer-motion"
import { Inter } from "next/font/google"
import { MessageSquare, Code, Brain, BarChart, MessageCircle, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
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
    textShadow: ["0 0 10px rgba(100,181,246,0.5)", "0 0 20px rgba(33,150,243,0.3)", "0 0 10px rgba(21,101,192,0.5)"],
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
    description: "Chat with FinovaAI like you would with a human. It understands context and nuance.",
  },
  {
    icon: Brain,
    title: "Personalized Interactions",
    description: "FinovaAI remembers your preferences and past conversations for a tailored experience.",
  },
  {
    icon: Code,
    title: "Financial Analysis",
    description: "Get help with financial tasks, such as investment analysis and portfolio management.",
  },
]

function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <motion.div
        className="max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerChildren}
      >
        <motion.h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-blue-100" variants={fadeInUp}>
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-b from-blue-900/40 to-slate-900/40 rounded-lg p-6 backdrop-blur-lg border border-blue-800/20 shadow-lg"
              variants={fadeInUp}
            >
              <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-blue-100">{feature.title}</h3>
              <p className="text-blue-200">{feature.description}</p>
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-950 to-slate-900">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerChildren}
      >
        <motion.h2 className="text-3xl sm:text-4xl font-bold mb-6 text-blue-100" variants={fadeInUp}>
          About FinovaAI
        </motion.h2>
        <motion.p className="text-lg mb-8 text-blue-200" variants={fadeInUp}>
          At the intersection of finance and innovation, FinovaAI combines cutting-edge technology with financial expertise. Built on advanced natural language processing and machine learning, it's designed to be your intelligent financial companion.
        </motion.p>
        <motion.p className="text-lg text-blue-200" variants={fadeInUp}>
          Whether you're looking for a financial assistant, a data analyst, or just a friendly chat, FinovaAI is here to help. Scroll down to try it out now!
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


// CTA Component
function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-3xl mx-auto text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerChildren}
      >
        <motion.h2 className="text-3xl sm:text-4xl font-bold mb-6 text-blue-100" variants={fadeInUp}>
          Be Among the First to Experience FinovaAI
        </motion.h2>
        <motion.p className="text-xl mb-8 text-blue-200" variants={fadeInUp}>
          Our platform is currently in beta testing. Join our exclusive group of early adopters and help shape the future of AI Interaction.
        </motion.p>
        <motion.div variants={fadeInUp}>
          <Link href="/sign-up">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-lg rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]">
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
  const handleScroll = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      const yOffset = -20; 
      const y = featuresSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black opacity-70"></div>
      </div>
      <motion.div className="text-center relative z-10 w-full" initial="hidden" animate="visible" variants={staggerChildren}>
        <motion.h1 className="text-4xl sm:text-6xl font-bold mb-2 text-white" variants={fadeInUp}>
          Welcome to the Future of AI Interaction
        </motion.h1>
        <motion.p className="text-xl sm:text-2xl mb-12 max-w-2xl mx-auto text-blue-50" variants={fadeInUp}>
          Experience natural conversations, personalized interactions, and powerful financial analysis with FinovaAI
        </motion.p>
        <motion.div className="flex items-center justify-center gap-4 mb-16" variants={fadeInUp}>
          <Link href="/sign-in">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-lg rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-transparent border-2 border-blue-500 hover:bg-blue-500/20 text-white px-8 py-6 text-lg rounded-full">
              Sign Up
            </Button>
          </Link>
        </motion.div>
        <motion.div 
          className="flex justify-center cursor-pointer hover:text-blue-300 transition-colors"
          animate={{ y: [0, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          onClick={handleScroll}
        >
          <ChevronDown className="w-12 h-12 text-blue-400" />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black -z-10"></div>
      <div className="relative z-0">
        <LandingHero />
        <Features />
        <About />
        <CTA />
      </div>
    </main>
  )
}

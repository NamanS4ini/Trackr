'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, TrendingUp, Calendar, Settings, Flame, Zap, BarChart3, Target, Award } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const startPage = localStorage.getItem('trackr-start-page');
    if (startPage === 'track') {
      router.push('/track');
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  const features = [
    {
      icon: CheckCircle2,
      title: 'Priority-Based Tracking',
      description: 'Assign priority levels to habits and earn points based on their importance.',
      color: 'bg-blue-500/20 border-blue-500/30',
    },
    {
      icon: Flame,
      title: 'Streak Tracking',
      description: 'Track "All Killed" and "At Least One" streaks to stay motivated.',
      color: 'bg-orange-500/20 border-orange-500/30',
    },
    {
      icon: BarChart3,
      title: 'Visual Analytics',
      description: 'View your progress with charts, graphs, and yearly heatmaps.',
      color: 'bg-purple-500/20 border-purple-500/30',
    },
    {
      icon: Calendar,
      title: 'Year Archive',
      description: 'Automatically archive data each year and review past performance.',
      color: 'bg-green-500/20 border-green-500/30',
    },
    {
      icon: TrendingUp,
      title: 'Progress Insights',
      description: 'Track daily, weekly, and monthly progress with detailed statistics.',
      color: 'bg-yellow-500/20 border-yellow-500/30',
    },
    {
      icon: Settings,
      title: 'Drag & Reorder',
      description: 'Easily organize habits by dragging them into your preferred order.',
      color: 'bg-indigo-500/20 border-indigo-500/30',
    },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, delay: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl relative z-10">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm text-blue-400 font-medium">Transform Your Daily Habits</span>
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-7xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Welcome to{' '}
            <span className="text-blue-400">
              Trackr
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Build better habits with <span className="text-blue-400 font-semibold">priority-based tracking</span>, 
            visual analytics, and smart insights. Transform your daily routine into consistent progress.
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/track">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                  <CheckCircle2 className="h-5 w-5" />
                  Start Tracking
                </Button>
              </motion.div>
            </Link>
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="gap-2 border-zinc-700 hover:border-blue-500/50 hover:bg-blue-500/5">
                  <BarChart3 className="h-5 w-5" />
                  View Dashboard
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Banner */}
        <motion.div 
          className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.div 
            className="text-center p-6 rounded-xl bg-zinc-900/50 border border-zinc-800"
            whileHover={{ scale: 1.05, borderColor: 'rgb(59 130 246 / 0.3)' }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Target className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">Priority</div>
            <div className="text-xs text-muted-foreground">Based Scoring</div>
          </motion.div>
          <motion.div 
            className="text-center p-6 rounded-xl bg-zinc-900/50 border border-zinc-800"
            whileHover={{ scale: 1.05, borderColor: 'rgb(168 85 247 / 0.3)' }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Award className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">Unlimited</div>
            <div className="text-xs text-muted-foreground">Habit Tracking</div>
          </motion.div>
          <motion.div 
            className="text-center p-6 rounded-xl bg-zinc-900/50 border border-zinc-800"
            whileHover={{ scale: 1.05, borderColor: 'rgb(34 197 94 / 0.3)' }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Flame className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">Streak</div>
            <div className="text-xs text-muted-foreground">Motivation</div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="mb-20">
          <motion.h2 
            className="text-4xl font-bold text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Powerful Features
          </motion.h2>
          <motion.p 
            className="text-center text-muted-foreground mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Everything you need to build and maintain great habits
          </motion.p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="border-zinc-800 bg-zinc-900/30 backdrop-blur-sm h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3 mb-2">
                        <motion.div 
                          className={`p-2 rounded-lg border ${feature.color}`}
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Icon className="h-5 w-5" />
                        </motion.div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <motion.h2 
            className="text-4xl font-bold text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            How It Works
          </motion.h2>
          <motion.p 
            className="text-center text-muted-foreground mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Get started in three simple steps
          </motion.p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: 1,
                title: 'Create Habits',
                description: 'Add habits with priorities (Low, Medium, High, Critical) to earn points.',
                icon: CheckCircle2,
              },
              {
                step: 2,
                title: 'Track Daily',
                description: 'Check off habits each day, add notes, and watch your points grow.',
                icon: Zap,
              },
              {
                step: 3,
                title: 'Analyze Progress',
                description: 'Review charts, heatmaps, and streaks to stay motivated.',
                icon: TrendingUp,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={item.step} 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <motion.div 
                    className="relative mb-6"
                    whileHover={{ scale: 1.1, rotate: 6 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-2xl font-bold text-blue-400 mx-auto">
                      {item.step}
                    </div>
                  </motion.div>
                  <motion.div 
                    className="mb-3"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm max-w-2xl mx-auto overflow-hidden">
              <CardContent className="p-10">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <CheckCircle2 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-4">Ready to Build Better Habits?</h2>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  Everything is stored <span className="text-blue-400 font-semibold">locally in your browser</span>. 
                  No account required, no data sent to servers.
                </p>
                <Link href="/track">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                      <CheckCircle2 className="h-5 w-5" />
                      Get Started Now
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-16 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Link href="/manage" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Settings className="h-4 w-4" />
            </motion.div>
            Settings & Data Management
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

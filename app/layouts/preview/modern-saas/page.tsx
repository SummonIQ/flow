'use client';

import Link from 'next/link';
import { ArrowLeft, Package, Truck, Cpu, Globe } from 'lucide-react';
import {
  HeroSection,
  RainbowGodBeams,
  ServicesSection,
  IndustriesSection,
  TestimonialsSection,
  CTASection,
  FooterSection,
} from '../../components';

export default function ModernSaaSPreview() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Simple Back Navigation */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/layouts"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-background/80 backdrop-blur-sm border rounded-md text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Layouts
        </Link>
      </div>

      {/* Template Content */}
      <div>
        <RainbowGodBeams className="absolute top-0 left-0 right-0 z-0 h-screen" />

        <HeroSection
          badge="Now available for early access"
          headline="Build something amazing today."
          subheadline="A modern platform designed to help you create, scale, and succeed. Get started in minutes with our intuitive tools and comprehensive documentation."
          primaryCta={{ label: 'Get Started Free', href: '#' }}
          secondaryCta={{ label: 'Book a Demo', href: '#' }}
          stats={[
            { value: '10K+', label: 'developers' },
            { value: '99.9%', label: 'uptime' },
          ]}
          categories={[
            { icon: Package, label: 'Modular' },
            { icon: Truck, label: 'Fast' },
            { icon: Cpu, label: 'Smart' },
            { icon: Globe, label: 'Global' },
          ]}
          cardTitle="Product Spotlight"
          cardSubtitle="Explore our latest features"
          features={[
            {
              name: 'AI Copilot',
              initials: 'AI',
              title: 'Intelligent Assistance',
              subtitle: 'Enterprise Ready',
              metric: 'New',
              location: 'Available Now',
              tags: ['AI', 'Automation'],
              color: 'bg-blue-500/20',
              ringColor: 'ring-blue-500/30',
              textColor: 'text-blue-500',
            },
            {
              name: 'Analytics Pro',
              initials: 'AP',
              title: 'Real-time Insights',
              subtitle: 'Production Ready',
              metric: 'Popular',
              location: 'v2.0',
              tags: ['Dashboard', 'Reports'],
              color: 'bg-teal/20',
              ringColor: 'ring-teal/30',
              textColor: 'text-teal',
            },
            {
              name: 'Team Hub',
              initials: 'TH',
              title: 'Collaboration Suite',
              subtitle: 'Beta',
              metric: 'Coming',
              location: 'Q2 2025',
              tags: ['Teams', 'Projects'],
              color: 'bg-purple-500/20',
              ringColor: 'ring-purple-500/30',
              textColor: 'text-purple-500',
            },
          ]}
          unlockLabel="Explore All Features"
          unlockHref="#"
        />

        <ServicesSection
          badge="How We Work"
          headline="Built for speed and precision"
          subheadline="Modern solutions for modern challenges. We combine deep expertise with technology-forward processes to deliver exceptional results."
        />

        <IndustriesSection
          badge="Specialization"
          headline="Deep expertise where it matters"
          subheadline="We focus exclusively on key industries and verticals. This specialization means faster delivery, better results, and higher success rates."
        />

        <TestimonialsSection
          badge="Testimonials"
          headline="Trusted by industry leaders"
          subheadline="From startups to Fortune 500 enterprises, we help companies build exceptional products and teams."
        />

        <CTASection
          leftBadge="For Businesses"
          leftHeadline="Ready to get started?"
          leftDescription="Schedule a 30-minute consultation to discuss your needs. We'll share relevant insights and outline a strategy."
          rightBadge="For Developers"
          rightHeadline="Exploring new tools?"
          rightDescription="Join our community to stay updated on the latest features and get early access to new releases."
        />

        <FooterSection
          brandName="Brand"
          brandDescription="A modern platform designed to help you create, scale, and succeed."
        />
      </div>
    </div>
  );
}

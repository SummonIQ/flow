'use client';

import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSectionProps {
  brandName?: string;
  brandDescription?: string;
  sections?: {
    title: string;
    links: FooterLink[];
  }[];
  socialLinks?: { label: string; href: string; icon?: React.ReactNode }[];
  copyright?: string;
  legalLinks?: FooterLink[];
}

export function FooterSection({
  brandName = 'Brand',
  brandDescription = 'A modern platform designed to help you create, scale, and succeed. Get started in minutes.',
  sections = [
    {
      title: 'Products',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Integrations', href: '/integrations' },
        { label: 'API', href: '/api' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '/docs' },
        { label: 'Guides', href: '/guides' },
        { label: 'Blog', href: '/blog' },
        { label: 'Case Studies', href: '/case-studies' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
        { label: 'Press', href: '/press' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Status', href: '/status' },
        { label: 'Community', href: '/community' },
        { label: 'Feedback', href: '/feedback' },
      ],
    },
  ],
  socialLinks = [
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'Twitter', href: 'https://twitter.com' },
  ],
  copyright = `© ${new Date().getFullYear()} Brand. All rights reserved.`,
  legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}: FooterSectionProps) {
  return (
    <footer className="bg-secondary text-muted-foreground">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="font-display font-bold text-2xl text-foreground"
            >
              {brandName}
            </Link>
            <p className="mt-4 text-sm leading-relaxed">{brandDescription}</p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                  aria-label={link.label}
                >
                  {link.icon || (
                    <span className="text-sm font-medium">{link.label}</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {sections.map(section => (
            <div key={section.title}>
              <h4 className="font-semibold text-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">{copyright}</p>
          <div className="flex gap-6 text-sm">
            {legalLinks.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

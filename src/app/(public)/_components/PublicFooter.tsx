import { CrossIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const footerLinks = [
    {
        title: "Company",
        links: [
            { name: "About Us", href: "/about" },
            { name: "Our Team", href: "/team" },
            { name: "Careers", href: "/careers" },
            { name: "Contact Us", href: "/contact" },
        ],
    },
    {
        title: "Products",
        links: [
            { name: "Feature 1", href: "/products/feature1" },
            { name: "Feature 2", href: "/products/feature2" },
            { name: "Feature 3", href: "/products/feature3" },
            { name: "Pricing", href: "/pricing" },
        ],
    },
    {
        title: "Resources",
        links: [
            { name: "Blog", href: "/blog" },
            { name: "Documentation", href: "/documentation" },
            { name: "FAQ", href: "/faq" },
            { name: "Support", href: "/support" },
        ],
    },
    {
        title: "Legal",
        links: [
            { name: "Terms of Service", href: "/terms" },
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Cookie Policy", href: "/cookies" },
            { name: "Security", href: "/security" },
        ],
    },
];

const socialLinks = [
    { name: "Facebook", href: "https://facebook.com", icon: <CrossIcon /> },
    { name: "Twitter", href: "https://twitter.com", icon: <CrossIcon /> },
    { name: "Instagram", href: "https://instagram.com", icon: <CrossIcon /> },
    { name: "LinkedIn", href: "https://linkedin.com", icon: <CrossIcon /> },
    { name: "GitHub", href: "https://github.com", icon: <CrossIcon /> },
];


export default function PublicFooter() {
    return (
        <section className="mysection border-t-[1px] border-color-border">
            <div className="mycontainer !py-20">

                <div className="flex flex-col gap-10 md:flex-row md:justify-between">
                    {/* Footer Links */}
                    {footerLinks.map((section) => (
                        <div key={section.title}>
                            <p className="mb-4">{section.title}</p>
                            <ul className="space-y-2">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href}>
                                            <p>{link.name}</p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    {/* Social Links */}
                    <div>
                        <p className="mb-4">Connect With Us</p>
                        <div className="flex gap-6">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-color-muted-text hover:text-color-text"
                                >
                                    <span className="sr-only">{social.name}</span>
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
        
                {/* Copyright */}
                <div className="mt-20 md:mt-40 text-center">
                    <p>&copy; {new Date().getFullYear()} Tithely. All rights reserved.</p>
                </div>

            </div>
        </section>
    )
}

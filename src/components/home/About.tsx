'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useMessages } from '@/lib/i18n/useMessages';
import type { ResearchTheme } from '@/types/page';

interface AboutProps {
    content: string;
    title?: string;
    themes?: ResearchTheme[];
}

export default function About({ content, title, themes }: AboutProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.about;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
            <h2 className="text-2xl font-serif font-bold text-primary mb-4">{resolvedTitle}</h2>
            <div className="text-neutral-700 dark:text-neutral-600 leading-relaxed">
                <ReactMarkdown
                    components={{
                        h1: ({ children }) => <h1 className="text-3xl font-serif font-bold text-primary mt-8 mb-4">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-2xl font-serif font-bold text-primary mt-8 mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xl font-semibold text-primary mt-6 mb-3">{children}</h3>,
                        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 ml-4">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 ml-4">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        a: ({ ...props }) => (
                            <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
                            />
                        ),
                        blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-accent/50 pl-4 italic my-4 text-neutral-600 dark:text-neutral-500">
                                {children}
                            </blockquote>
                        ),
                        strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                        em: ({ children }) => <em className="italic text-neutral-600 dark:text-neutral-500">{children}</em>,
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
            {themes && themes.length > 0 && (
                <div className="mt-6 space-y-5">
                    {themes.map((theme) => (
                        <div key={theme.title} className="border-l-[3px] border-neutral-200 pl-5">
                            <h3 className="text-lg font-serif font-bold text-primary leading-snug">
                                {theme.link ? (
                                    <a
                                        href={theme.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group transition-colors duration-200 hover:text-accent"
                                    >
                                        {theme.title}
                                        <span aria-hidden="true" className="inline-block ml-1.5 text-neutral-400 transition-transform duration-200 group-hover:translate-x-0.5">›</span>
                                    </a>
                                ) : (
                                    theme.title
                                )}
                            </h3>
                            {theme.description && (
                                <p className="mt-1.5 text-[0.95rem] italic text-neutral-500 leading-relaxed">
                                    {theme.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </motion.section>
    );
}

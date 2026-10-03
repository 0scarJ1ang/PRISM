'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Publication } from '@/types/publication';
import { useMessages } from '@/lib/i18n/useMessages';
import { Github, Globe } from 'lucide-react';

interface SelectedPublicationsProps {
    publications: Publication[];
    title?: string;
    enableOnePageMode?: boolean;
}

export default function SelectedPublications({ publications, title, enableOnePageMode = false }: SelectedPublicationsProps) {
    const messages = useMessages();
    const resolvedTitle = title || messages.home.selectedPublications;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif font-bold text-primary">{resolvedTitle}</h2>
                <Link
                    href={enableOnePageMode ? "/#publications" : "/publications"}
                    prefetch={true}
                    className="text-accent hover:text-accent-dark text-sm font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
                >
                    {messages.home.viewAll} →
                </Link>
            </div>
            <div className="space-y-4">
                {publications.map((pub, index) => (
                    <motion.div
                        key={pub.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-[rgba(148,163,184,0.24)] hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                    >
                        <h3 className="font-semibold text-primary mb-2 leading-tight">
                            {pub.title}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-1">
                            {pub.authors.map((author, idx) => (
                                <span key={idx}>
                                    <span>
                                        {author.name}
                                    </span>
                                    {author.isCoAuthor && <sup>*</sup>}
                                    {author.isCorresponding && (
                                        <sup>†</sup>
                                    )}
                                    {idx < pub.authors.length - 1 && ', '}
                                </span>
                            ))}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-2">
                            {pub.journal || pub.conference}
                        </p>
                        {pub.description && (
                            <p className="text-sm text-neutral-500 dark:text-neutral-500 line-clamp-2">
                                {pub.description}
                            </p>
                        )}
                        {(pub.url || pub.code) && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {pub.url && (
                                    <a
                                        href={pub.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                    >
                                        <Globe className="h-3 w-3 mr-1.5 shrink-0" aria-hidden="true" />
                                        {messages.publications.website}
                                    </a>
                                )}
                                {pub.code && (
                                    <a
                                        href={pub.code}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-accent hover:text-white transition-colors"
                                    >
                                        <Github className="h-3 w-3 mr-1.5 shrink-0" aria-hidden="true" />
                                        {messages.publications.code}
                                    </a>
                                )}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}

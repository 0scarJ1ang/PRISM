'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface PublicationPreviewProps {
    preview: string;
    previewVideo?: string;
    title: string;
    className?: string;
}

export default function PublicationPreview({ preview, previewVideo, title, className = '' }: PublicationPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [reducedMotion, setReducedMotion] = useState(true);
    const [visible, setVisible] = useState(false);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const [videoFailed, setVideoFailed] = useState(false);
    const src = `/papers/${preview}`;
    const showVideo = previewVideo && !reducedMotion && hasBeenVisible && !videoFailed;

    useEffect(() => {
        if (!previewVideo || !containerRef.current) return;

        const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updatePreference = () => setReducedMotion(preference.matches);
        updatePreference();
        preference.addEventListener('change', updatePreference);

        const observer = new IntersectionObserver(([entry]) => {
            setVisible(entry.isIntersecting);
            if (entry.isIntersecting) setHasBeenVisible(true);
        }, { threshold: 0.1 });
        observer.observe(containerRef.current);

        return () => {
            preference.removeEventListener('change', updatePreference);
            observer.disconnect();
        };
    }, [previewVideo]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (visible && showVideo) {
            // Autoplay may be blocked by the browser; native controls remain available.
            void video.play().catch(() => {});
        } else {
            video.pause();
        }
    }, [visible, showVideo]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white ${previewVideo ? 'aspect-video' : 'aspect-[4/3]'} ${className}`}
        >
            {showVideo ? (
                <video
                    ref={videoRef}
                    src={`/papers/${previewVideo}`}
                    poster={src}
                    muted
                    loop
                    playsInline
                    controls
                    preload="metadata"
                    aria-label={`${title}: robot task demonstration`}
                    className="h-full w-full object-contain"
                    onError={() => setVideoFailed(true)}
                />
            ) : (
                <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${previewVideo ? 'demonstration image' : 'method figure'} for ${title}`}
                    className="absolute inset-0 block transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
                >
                    <Image
                        src={src}
                        alt={`${title}: ${previewVideo ? 'robot task demonstration' : 'method overview'}`}
                        fill
                        className={`object-contain ${previewVideo ? '' : 'p-2'}`}
                        sizes="(min-width: 1024px) 256px, (min-width: 640px) 208px, 100vw"
                    />
                </a>
            )}
        </div>
    );
}

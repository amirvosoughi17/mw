import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";


interface HeroGridProps {
    title?: ReactNode | string;
    subtitle?: ReactNode | string;
    primaryCtaText?: string;
    secondaryCtaText?: string;
    onPrimaryCtaClick?: () => void;
    onSecondaryCtaClick?: () => void;
    className?: string;
}

export function HeroGridSection() {
    return (
        <Hero
            title="Smart Investment"
            subtitle="A modern platform that helps investors to take logical decision."
            primaryCtaText="Request Demo"
            secondaryCtaText="Get Started For Free"
        />
    );
}

export function Hero({
    title = "Smart Investment",
    subtitle = "A modern platform that helps investors to take logical decision.",
    primaryCtaText = "Request Demo",
    secondaryCtaText = "Get Started For Free",
    onPrimaryCtaClick,
    onSecondaryCtaClick,
    className,
}: HeroGridProps) {
    return (
        <section
            className={cn(
                "relative min-h-[calc(630px-var(--header-height))] overflow-hidden pb-10",
                className
            )}
        >
            {/* Background grid decoration */}
            <div
                className="absolute left-0 top-0 z-0 grid h-full w-full grid-cols-[clamp(28px,10vw,120px)_auto_clamp(28px,10vw,120px)] 
                   border-b border-[--border] dark:border-[--dark-border]"
            >
                <div className="col-span-1 flex h-full items-center justify-center" />
                <div
                    className="col-span-1 flex h-full items-center justify-center border-x 
                     border-[--border] dark:border-[--dark-border]"
                />
                <div className="col-span-1 flex h-full items-center justify-center" />
            </div>

            {/* Background glows */}
            <figure
                className="pointer-events-none absolute -bottom-[70%] left-1/2 z-0 block 
                   aspect-square w-[520px] -translate-x-1/2 rounded-full 
                   bg-[--accent-500-40] blur-[200px]"
            />
            <figure
                className="pointer-events-none absolute left-[4vw] top-[64px] z-20 hidden 
                   aspect-square w-[32vw] rounded-full bg-[--surface-primary] 
                   opacity-50 blur-[100px] dark:bg-[--dark-surface-primary] md:block"
            />
            <figure
                className="pointer-events-none absolute bottom-[-50px] right-[7vw] z-20 hidden 
                   aspect-square w-[30vw] rounded-full bg-[--surface-primary] 
                   opacity-50 blur-[100px] dark:bg-[--dark-surface-primary] md:block"
            />

            <div className="relative z-10 flex flex-col divide-y divide-[--border] pt-[35px] dark:divide-[--dark-border]">
                <div className="flex flex-col items-center justify-end">
                </div>

                <div>
                    <div
                        className="mx-auto flex min-h-[288px] max-w-[80vw] shrink-0 flex-col 
                       items-center justify-center gap-2 px-2 py-4 sm:px-16 lg:px-24"
                    >
                        <h1
                            className="!max-w-screen-lg text-pretty text-center text-[clamp(32px,7vw,64px)] 
                         font-medium leading-none tracking-[-1.44px] 
                         text-[--text-primary] dark:text-[--dark-text-primary] 
                         md:tracking-[-2.16px]"
                        >
                            {title}
                        </h1>

                        <h2
                            className="text-md max-w-2xl text-pretty text-center 
                         text-[--text-tertiary] dark:text-[--dark-text-tertiary] md:text-lg"
                        >
                            {subtitle}
                        </h2>
                    </div>
                </div>
                <div className="flex items-start justify-center px-8 sm:px-24">
                    <div
                        className="flex w-full max-w-[80vw] flex-col items-center justify-start 
                       md:!max-w-[392px]"
                    >
                    </div>
                </div>
            </div>
        </section>
    );
}
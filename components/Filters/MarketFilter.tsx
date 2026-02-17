"use client";

import { IoIosSearch } from "react-icons/io";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { IoFilter, IoTimerOutline } from "react-icons/io5";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { VscSettings } from "react-icons/vsc";
import { Slider } from "@/components/ui/slider";
import { mainCategories, categoryLabels } from "@/constants/categories";
import { PolymarketCategories } from "./PolymarketCategories";

interface MarketFilterProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;

    selectedCategory: string;
    onCategoryChange: (cat: string) => void;

    minYesProb: number;
    maxYesProb: number;
    onYesProbChange: (min: number, max: number) => void;

    sortKey: "volume" | "daysLeft" | null;
    sortOrder: "desc" | "asc";
    onToggleSort: (key: "volume" | "daysLeft") => void;
}

export function MarketFilter({
    searchTerm,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    minYesProb,
    maxYesProb,
    onYesProbChange,
    sortKey,
    sortOrder,
    onToggleSort,
}: MarketFilterProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[240px]">
                    <Input
                        type="search"
                        placeholder="Search Predictions..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="
              h-10 pl-10 pr-4 rounded-full border-none
              bg-neutral-800/70 backdrop-blur-sm text-white
              placeholder:text-neutral-400/90
            "
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IoIosSearch className="h-5 w-5 text-neutral-400" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={sortKey === "volume" ? "default" : "ghost"}
                        onClick={() => onToggleSort("volume")}
                        size="icon"
                        className="md:size-auto md:px-4 md:py-2 md:text-sm"
                    >
                        <ArrowUpDown className="h-5 w-5" />
                        <span className="hidden md:inline ml-2">Volume</span>
                    </Button>

                    <Button
                        variant={sortKey === "daysLeft" ? "default" : "ghost"}
                        onClick={() => onToggleSort("daysLeft")}
                        size="icon"
                        className="md:size-auto md:px-4 md:py-2 md:text-sm"
                    >
                        <IoTimerOutline className="h-5 w-5" />
                        <span className="hidden md:inline ml-2">Time Left</span>
                    </Button>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="secondary" size="icon" className="md:hidden">
                                <IoFilter />
                            </Button>
                        </SheetTrigger>
                        <SheetTrigger asChild>
                            <Button variant="secondary" className="hidden md:flex">
                                <VscSettings className="mr-2" />
                                Filters
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="right" className="w-full sm:w-96 bg-neutral-950">
                            <SheetHeader>
                                <SheetTitle className="text-xl mb-6">Filters</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-8 py-6">
                                <div>
                                    <label className="block text-gray-300 text-sm mb-4 font-medium text-center">
                                        Yes Probability
                                    </label>
                                    <div className="space-y-6">
                                        <div className="flex justify-between text-sm text-gray-400 px-1">
                                            <span>Min: {minYesProb}%</span>
                                            <span>Max: {maxYesProb}%</span>
                                        </div>
                                        <Slider
                                            value={[minYesProb, maxYesProb]}
                                            min={0}
                                            max={100}
                                            step={1}
                                            onValueChange={(values) => onYesProbChange(values[0], values[1])}
                                        />
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* ردیف دوم: دسته‌بندی‌ها */}
            <div className="relative w-full overflow-hidden">
                <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-neutral-950 to-transparent z-10" />
                <PolymarketCategories
                    onCategoryChange={onCategoryChange}
                    searchTerm={searchTerm}
                    selectedCategory={selectedCategory}
                />
            </div>
        </div>
    );
}
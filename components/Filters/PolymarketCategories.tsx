import { mainCategories, categoryLabels } from "@/constants/categories";

interface PolymarketCategoriesProps {
    searchTerm: string;

    selectedCategory: string;
    onCategoryChange: (cat: string) => void;

}

export function PolymarketCategories({
    selectedCategory,
    onCategoryChange,
}: PolymarketCategoriesProps) {
    return (
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {mainCategories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`text-[15px] px-4 py-2 font-medium rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${selectedCategory === cat
                        ? "text-white bg-neutral-700/50"
                        : "text-neutral-400 hover:text-neutral-200"
                        }`}
                >
                    {categoryLabels[cat]}
                </button>
            ))}
        </div>
    );
}
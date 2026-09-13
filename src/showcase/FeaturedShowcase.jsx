import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { categories } from "./projects";
import CategoryRow from "./CategoryRow";
import FullscreenShowcase from "./FullscreenShowcase";

export default function FeaturedShowcase() {
  const [open, setOpen] = useState(null);
  const activeCategory = open && categories.find((c) => c.id === open.categoryId);

  return (
    <>
      <div className="px-[clamp(20px,5vw,56px)] pt-[clamp(72px,12vh,140px)]">
        <h2 className="text-[clamp(1.8rem,4vw,2.75rem)] font-semibold tracking-tight text-white">
          Featured Systems &amp; Code
        </h2>
        <p className="mt-3 max-w-2xl text-white/50">
          Selected engineering projects demonstrating end-to-end system design, clean
          architecture, and practical problem-solving.
        </p>
      </div>

      <div className="pb-[clamp(48px,8vh,96px)]">
        {categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            onOpen={(index) => setOpen({ categoryId: category.id, index })}
          />
        ))}
      </div>

      <AnimatePresence>
        {activeCategory && (
          <FullscreenShowcase
            key={activeCategory.id}
            category={activeCategory}
            startIndex={open.index}
            onClose={() => setOpen(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

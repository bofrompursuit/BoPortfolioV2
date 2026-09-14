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
      <div className="px-[clamp(20px,5vw,56px)] pt-[clamp(40px,6vh,76px)]">
        <h2 className="text-[clamp(1.8rem,4vw,2.75rem)] font-semibold tracking-tight text-white">
          Tech Lookbook + Services
        </h2>
        <p className="mt-3 max-w-2xl text-white/50">
          Building automated workflows and smart AI tools that optimize finance
          workflows, eliminate operational bottlenecks, and help teams grow together.
        </p>
      </div>

      <div className="pb-[clamp(24px,4vh,48px)]">
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

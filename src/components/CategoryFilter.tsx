import { useInventoryStore } from "../store/inventoryStore";
import "./CategoryFilter.css";

export const CategoryFilter = () => {
  const { categories, selectedCategory, setSelectedCategory } =
    useInventoryStore();

  return (
    <div className="category-filter">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          className={`category-btn ${selectedCategory === category ? "active" : ""}`}
        >
          {category === "all" ? "Все" : category}
        </button>
      ))}
    </div>
  );
};

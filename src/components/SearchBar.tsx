import { useInventoryStore } from "../store/inventoryStore";
import "./SearchBar.css";

export const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useInventoryStore();

  return (
    <div className="search-bar">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="🔍 Поиск по названию или месту..."
      />
    </div>
  );
};

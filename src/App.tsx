import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useInventoryStore } from "./store/inventoryStore";
import { ItemCard } from "./components/ItemCard";
import { AddItemModal } from "./components/AddItemModal";
import { SearchBar } from "./components/SearchBar";
import { CategoryFilter } from "./components/CategoryFilter";
import { DataManager } from "./components/DataManager";
import "./App.css";

function App() {
  const { items, isLoading, loadItems, searchQuery, selectedCategory } =
    useInventoryStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const handleDataImported = () => {
    loadItems();
  };

  const handleDataCleared = () => {
    loadItems(); // Перезагружаем данные после очистки
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app">
      <Toaster position="top-right" />

      <header className="header">
        <div className="container">
          <h1>🏠 Home Inventory</h1>
          <p>Где лежат мои вещи?</p>
        </div>
      </header>

      <main className="container main-content">
        <SearchBar />
        <CategoryFilter />

        {isLoading ? (
          <div className="text-center">Загрузка...</div>
        ) : (
          <>
            <div className="results-count">
              Найдено: {filteredItems.length} предметов
            </div>

            <div className="items-grid">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="empty-state">
                <p>Ничего не найдено</p>
                <p className="empty-state-sub">
                  Добавьте первый предмет в инвентарь
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <button onClick={() => setIsModalOpen(true)} className="fab">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      <DataManager
        onDataImported={handleDataImported}
        onDataCleared={handleDataCleared}
      />

      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default App;

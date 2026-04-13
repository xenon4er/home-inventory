import { useTheme } from "../context/useTheme";
import "./ThemeToggle.css";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={
        theme === "light" ? "Включить темную тему" : "Включить светлую тему"
      }
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
};

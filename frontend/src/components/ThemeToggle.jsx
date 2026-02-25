import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const getInitial = () => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved;
      return "dark";
    } catch (e) {
      return "dark";
    }
  };

  const [theme, setTheme] = useState(getInitial);

  useEffect(() => {
    // apply class on documentElement for global CSS hooks
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="p-1 rounded-md hover:bg-white/5 text-sm"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700" />
      )}
    </button>
  );
}

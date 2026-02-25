import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved || 'dark'; // Default to dark (matches our Eco-Tech Dark Glass design)
    });

    useEffect(() => {
        const root = window.document.documentElement;
        const body = document.body;

        // Remove old classes
        root.classList.remove('light', 'dark');
        body.classList.remove('light-mode', 'dark-mode');

        // Add current theme classes
        // 'dark' on <html> → activates Tailwind dark: variants AND .dark CSS vars
        root.classList.add(theme);
        body.classList.add(theme === 'dark' ? 'dark-mode' : 'light-mode');

        // Smooth background transition on <html> itself
        root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        root.style.backgroundColor = theme === 'dark' ? '#0f172a' : '#f6fff9';

        // Persist
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};

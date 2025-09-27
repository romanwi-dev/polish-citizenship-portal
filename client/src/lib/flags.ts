// QA Mode flag for development and debugging features
export const QA_MODE = (import.meta.env.VITE_QA_MODE || "OFF").toUpperCase() === "ON";
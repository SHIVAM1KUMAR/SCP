export function applyTheme(config) {

    const root = document.documentElement;
  
    if (config.primary)
      root.style.setProperty("--primary", config.primary);
  
    if (config.secondary)
      root.style.setProperty("--secondary", config.secondary);
  
    if (config.radius)
      root.style.setProperty("--radius", config.radius + "px");
  
  }
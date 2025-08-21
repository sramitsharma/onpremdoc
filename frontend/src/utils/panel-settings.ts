import { STORAGE_KEYS, DEFAULT_VALUES } from "../constants";

interface PanelSettings {
  panelWidth: number;
  collapsed: boolean;
}

/**
 * Reset panel settings to default values
 * Useful for clearing old pixel-based values and setting new percentage-based defaults
 */
export const resetPanelSettings = (): boolean => {
  try {
    // Clear the old storage key
    localStorage.removeItem(STORAGE_KEYS.TOC_PREFERENCES);
    
    // Set new default values (15% left panel, 85% right panel)
    const newSettings: PanelSettings = {
      panelWidth: DEFAULT_VALUES.PANEL_WIDTH, // 15%
      collapsed: false
    };
    
    localStorage.setItem(STORAGE_KEYS.TOC_PREFERENCES, JSON.stringify(newSettings));
    
    console.log('Panel settings reset to defaults:', newSettings);
    return true;
  } catch (error) {
    console.error('Failed to reset panel settings:', error);
    return false;
  }
};

/**
 * Get current panel settings
 */
export const getPanelSettings = (): PanelSettings | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TOC_PREFERENCES);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get panel settings:', error);
    return null;
  }
};

/**
 * Check if panel settings need migration (old pixel values or old percentage)
 */
export const needsMigration = (): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TOC_PREFERENCES);
    if (!stored) return false;
    
    const parsed = JSON.parse(stored) as any;
    // Check for old pixel values (>100) or old percentages (30, 12)
    return parsed && typeof parsed === 'object' && parsed.panelWidth && (parsed.panelWidth > 100 || parsed.panelWidth === 30 || parsed.panelWidth === 12);
  } catch (error) {
    return false;
  }
};

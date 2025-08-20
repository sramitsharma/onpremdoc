# Utils Folder

This folder contains all utility functions used throughout the application, organized by functionality.

## Structure

```
src/utils/
├── index.js          # Main exports - import from here
├── cn.js            # Class name utilities (clsx + tailwind-merge)
├── panel-settings.js # Panel settings and localStorage management
├── storage.js       # General localStorage utilities
└── README.md        # This file
```

## Usage

### Import from main index
```javascript
import { cn, resetPanelSettings, getStorageItem } from '../utils';
```

### Import specific utilities
```javascript
import { cn } from '../utils/cn';
import { resetPanelSettings } from '../utils/panel-settings';
import { getStorageItem } from '../utils/storage';
```

## Utilities

### `cn.js` - Class Name Utilities
- **`cn(...inputs)`**: Merges class names with Tailwind CSS optimization
- Uses `clsx` for conditional classes and `tailwind-merge` for deduplication

### `panel-settings.js` - Panel Settings
- **`resetPanelSettings()`**: Reset panel width to default (15%)
- **`getPanelSettings()`**: Get current panel settings from localStorage
- **`needsMigration()`**: Check if settings need migration from old values

### `storage.js` - General Storage
- **`getStorageItem(key, defaultValue)`**: Safely get item from localStorage
- **`setStorageItem(key, value)`**: Safely set item in localStorage
- **`removeStorageItem(key)`**: Safely remove item from localStorage
- **`clearStorage()`**: Clear all localStorage items

## Benefits

1. **Centralized**: All utilities in one place
2. **Organized**: Grouped by functionality
3. **Consistent**: Standardized error handling
4. **Reusable**: Can be imported anywhere in the app
5. **Maintainable**: Easy to find and update utilities

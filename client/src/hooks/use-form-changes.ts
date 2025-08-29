import { useEffect, useMemo, useState } from 'react';

/**
 * Hook to track changes in form data and determine if save button should be disabled
 * @param currentData - Current form data
 * @param originalData - Original data to compare against
 * @param options - Configuration options
 * @returns Object containing hasChanges boolean and comparison utilities
 */
export function useFormChanges<T extends Record<string, any>>(
  currentData: T,
  originalData: T | null | undefined,
  options: {
    // Fields to ignore in comparison (e.g., computed fields, timestamps)
    ignoreFields?: string[];
    // Custom comparison function for specific fields
    customComparisons?: Record<string, (current: any, original: any) => boolean>;
    // Whether to perform deep comparison (default: true)
    deepComparison?: boolean;
  } = {}
) {
  const { ignoreFields = [], customComparisons = {}, deepComparison = true } = options;

  const hasChanges = useMemo(() => {
    if (!originalData) return true; // If no original data, consider it changed (new form)

    // Helper function to normalize values for comparison
    const normalizeValue = (value: any): any => {
      // Convert empty strings to null for comparison
      if (value === '') return null;
      // Convert undefined to null for comparison
      if (value === undefined) return null;
      return value;
    };

    // Helper function to compare arrays
    const compareArrays = (arr1: any[], arr2: any[]): boolean => {
      if (arr1.length !== arr2.length) return false;
      if (deepComparison) {
        return arr1.every((item, index) => {
          const normalized1 = normalizeValue(item);
          const normalized2 = normalizeValue(arr2[index]);
          return JSON.stringify(normalized1) === JSON.stringify(normalized2);
        });
      }
      return arr1.every((item, index) => normalizeValue(item) === normalizeValue(arr2[index]));
    };

    // Helper function to compare objects
    const compareObjects = (obj1: any, obj2: any): boolean => {
      if (deepComparison) {
        return JSON.stringify(normalizeValue(obj1)) === JSON.stringify(normalizeValue(obj2));
      }
      return normalizeValue(obj1) === normalizeValue(obj2);
    };

    // Check each field for changes
    for (const key in currentData) {
      // Skip ignored fields
      if (ignoreFields.includes(key)) continue;

      const currentValue = currentData[key];
      const originalValue = originalData[key];

      // Use custom comparison if provided
      const customCompare = customComparisons[key];
      if (customCompare && typeof customCompare === 'function') {
        if (!customCompare(currentValue, originalValue)) {
          return true; // Custom comparison indicates change
        }
        continue;
      }

      // Normalize values
      const normalizedCurrent = normalizeValue(currentValue);
      const normalizedOriginal = normalizeValue(originalValue);

      // Handle arrays
      if (Array.isArray(normalizedCurrent) && Array.isArray(normalizedOriginal)) {
        if (!compareArrays(normalizedCurrent, normalizedOriginal)) {
          return true;
        }
        continue;
      }

      // Handle objects (excluding arrays and dates)
      if (
        normalizedCurrent && 
        normalizedOriginal &&
        typeof normalizedCurrent === 'object' && 
        typeof normalizedOriginal === 'object' &&
        !Array.isArray(normalizedCurrent) &&
        !Array.isArray(normalizedOriginal) &&
        !(normalizedCurrent instanceof Date) &&
        !(normalizedOriginal instanceof Date)
      ) {
        if (!compareObjects(normalizedCurrent, normalizedOriginal)) {
          return true;
        }
        continue;
      }

      // Handle dates
      if (normalizedCurrent instanceof Date && normalizedOriginal instanceof Date) {
        if (normalizedCurrent.getTime() !== normalizedOriginal.getTime()) {
          return true;
        }
        continue;
      }

      // Handle date strings (convert to Date for comparison)
      if (
        typeof normalizedCurrent === 'string' && 
        typeof normalizedOriginal === 'string' &&
        (normalizedCurrent.includes('-') || normalizedOriginal.includes('-')) &&
        (new Date(normalizedCurrent).toString() !== 'Invalid Date' || new Date(normalizedOriginal).toString() !== 'Invalid Date')
      ) {
        const currentDate = new Date(normalizedCurrent);
        const originalDate = new Date(normalizedOriginal);
        if (currentDate.toString() !== 'Invalid Date' && originalDate.toString() !== 'Invalid Date') {
          if (currentDate.getTime() !== originalDate.getTime()) {
            return true;
          }
          continue;
        }
      }

      // Handle primitive values
      if (normalizedCurrent !== normalizedOriginal) {
        return true;
      }
    }

    // Check for fields that exist in original but not in current
    for (const key in originalData) {
      if (ignoreFields.includes(key)) continue;
      if (!(key in currentData)) {
        const originalValue = normalizeValue(originalData[key]);
        if (originalValue !== null) {
          return true;
        }
      }
    }

    return false;
  }, [currentData, originalData, ignoreFields, customComparisons, deepComparison]);

  // Helper function to get specific field changes
  const getChangedFields = (): string[] => {
    if (!originalData) return Object.keys(currentData);

    const changedFields: string[] = [];
    
    for (const key in currentData) {
      if (ignoreFields.includes(key)) continue;
      
      const currentValue = currentData[key];
      const originalValue = originalData[key];
      
      // Normalize values for comparison
      const normalizedCurrent = currentValue === '' ? null : currentValue;
      const normalizedOriginal = originalValue === '' ? null : originalValue;
      
      if (JSON.stringify(normalizedCurrent) !== JSON.stringify(normalizedOriginal)) {
        changedFields.push(key);
      }
    }
    
    return changedFields;
  };

  // Helper function to reset form to original values
  const resetToOriginal = (): T | null => {
    return originalData ? { ...originalData } : null;
  };

  return {
    hasChanges,
    getChangedFields,
    resetToOriginal,
    // Computed properties for convenience
    canSave: hasChanges,
    shouldDisableSave: !hasChanges,
  };
}

/**
 * Hook specifically for user management forms
 */
export function useUserFormChanges(currentUser: any, originalUser: any) {
  return useFormChanges(currentUser, originalUser, {
    ignoreFields: ['id'], // Ignore ID field in comparisons
    customComparisons: {
      permissions: (current: string[], original: string[]) => {
        // Custom comparison for permissions array
        if (!Array.isArray(current) || !Array.isArray(original)) return false;
        if (current.length !== original.length) return false;
        const sortedCurrent = [...current].sort();
        const sortedOriginal = [...original].sort();
        return sortedCurrent.every((perm, index) => perm === sortedOriginal[index]);
      }
    }
  });
}

/**
 * Hook specifically for lead management forms
 */
export function useLeadFormChanges(currentLead: any, originalLead: any) {
  return useFormChanges(currentLead, originalLead, {
    ignoreFields: ['id', 'date_created', 'date_updated'], // Ignore system fields
    customComparisons: {
      selected_colors: (current: any, original: any) => {
        // Handle selected colors which might be stored as JSON string or array
        const parseColors = (colors: any) => {
          if (Array.isArray(colors)) return colors;
          if (typeof colors === 'string') {
            try {
              return JSON.parse(colors);
            } catch {
              return [];
            }
          }
          return [];
        };
        
        const currentColors = parseColors(current);
        const originalColors = parseColors(original);
        
        return JSON.stringify(currentColors.sort()) === JSON.stringify(originalColors.sort());
      },
      assigned_installer: (current: any, original: any) => {
        // Handle assigned installer which might be string or array
        const parseInstaller = (installer: any) => {
          if (Array.isArray(installer)) return installer.join(', ');
          return installer || '';
        };
        
        return parseInstaller(current) === parseInstaller(original);
      }
    }
  });
}

/**
 * Hook specifically for booklet management forms
 */
export function useBookletFormChanges(currentBooklet: any, originalBooklet: any) {
  return useFormChanges(currentBooklet, originalBooklet, {
    ignoreFields: ['id', 'date_created', 'date_updated'], // Ignore system fields
  });
}

/**
 * Hook specifically for repair request forms
 */
export function useRepairRequestFormChanges(currentRequest: any, originalRequest: any) {
  return useFormChanges(currentRequest, originalRequest, {
    ignoreFields: ['id', 'date_created', 'date_updated'], // Ignore system fields
  });
}

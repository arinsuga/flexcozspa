import { UomNormalization } from '@/services/uomNormalizationService';

/**
 * Creates a UOM normalizer with config-driven mapping
 * @param config Array of UOM normalization rules from backend
 * @returns Normalizer object with normalize function
 */
export function createUomNormalizer(config: UomNormalization[]) {
  // Build efficient lookup map from config
  const normalizationMap = new Map<string, string>();
  
  config.forEach(rule => {
    const key = rule.raw_uom_code.trim().toLowerCase();
    normalizationMap.set(key, rule.uom_code);
  });
  
  return {
    /**
     * Normalize a UOM value based on configured rules
     * @param value Raw UOM input from user
     * @returns Normalized UOM value or cleaned input if not in config
     */
    normalize: (value: string): string => {
      if (!value) return value;
      
      // Step 1: Clean input (trim and lowercase)
      const cleaned = value.trim().toLowerCase();
      
      // Step 2: Check config map for normalization rule
      const normalized = normalizationMap.get(cleaned);
      
      // Step 3: Return normalized value or original (cleaned) if not found
      return normalized || value.trim();
    }
  };
}

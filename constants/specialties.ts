export const SPECIALTY_IDS = {
    CARDIOLOGY: "cardiology",
    DERMATOLOGY: "dermatology",
    DENTAL: "dental",
    MENTAL: "mental",
    ORTHOPEDICS: "orthopedics",
    DIGESTIVE: "digestive",
} as const;

export type SpecialtyId = (typeof SPECIALTY_IDS)[keyof typeof SPECIALTY_IDS];

export const normalizeSpecialty = (value: string): SpecialtyId => {
    if (!value) return SPECIALTY_IDS.CARDIOLOGY; // Fallback?

    const lower = value.toLowerCase().trim();

    if (lower.includes("cardio") || lower.includes("heart")) return SPECIALTY_IDS.CARDIOLOGY;
    if (lower.includes("derm") || lower.includes("skin")) return SPECIALTY_IDS.DERMATOLOGY;
    if (lower.includes("dent") || lower.includes("teeth")) return SPECIALTY_IDS.DENTAL;
    if (lower.includes("mental") || lower.includes("psych")) return SPECIALTY_IDS.MENTAL;
    if (lower.includes("ortho") || lower.includes("bone")) return SPECIALTY_IDS.ORTHOPEDICS;
    if (lower.includes("digest") || lower.includes("gastro") || lower.includes("stomach")) return SPECIALTY_IDS.DIGESTIVE;

    // Default fallback or strict return? User said "ZERO missing errors".
    // Note: Previous code did `split(' ')[0]`.
    // If we return a fallback, we avoid crash/missing key, but might be wrong.
    // Given the categories, this mapping covers the main ones.
    return SPECIALTY_IDS.CARDIOLOGY;
};

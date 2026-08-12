import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Manual Alias Map for Hackathon Reliability
// Covers International & Common Regional Brands (Egypt/MENA)
const DRUG_ALIASES = {
    // --- PAIN & FEVER & NSAIDS ---
    "panadol": "paracetamol",
    "tylenol": "paracetamol",
    "adol": "paracetamol",
    "fevadol": "paracetamol",
    "calpol": "paracetamol",
    "abimol": "paracetamol",
    "cetal": "paracetamol",
    "paramol": "paracetamol",

    "brufen": "ibuprofen",
    "advil": "ibuprofen",
    "nurofen": "ibuprofen",
    "motrin": "ibuprofen",
    "marcofen": "ibuprofen",
    "profinal": "ibuprofen",

    "voltaren": "diclofenac",
    "cataflam": "diclofenac",
    "olfen": "diclofenac",
    "diclac": "diclofenac",
    "declophen": "diclofenac",
    "diclofen": "diclofenac",

    "aspirin": "aspirin",
    "aspocid": "aspirin",
    "juvepirine": "aspirin",
    "aspegic": "aspirin",
    "rivo": "aspirin",

    "naprosyn": "naproxen",
    "aleve": "naproxen",
    "proxen": "naproxen",

    "mobic": "meloxicam",
    "mexicam": "meloxicam",
    "movelat": "meloxicam",

    "celebrex": "celecoxib",
    "arythrex": "celecoxib",

    "feldene": "piroxicam",
    "ketofan": "ketoprofen",

    // --- ANTIBIOTICS ---
    "augmentin": "amoxicillin-clavulanate",
    "curam": "amoxicillin-clavulanate",
    "hibiotic": "amoxicillin-clavulanate",
    "megamox": "amoxicillin-clavulanate",
    "clavimox": "amoxicillin-clavulanate",

    "amoxil": "amoxicillin",
    "e-mox": "amoxicillin",
    "ospamox": "amoxicillin",

    "zithromax": "azithromycin",
    "zithrokan": "azithromycin",
    "zimax": "azithromycin",
    "azrolid": "azithromycin",

    "suprax": "cefixime",
    "magnacef": "cefixime",

    "zinnat": "cefuroxime",
    "cefuzone": "cefuroxime",

    "cipro": "ciprofloxacin",
    "ciprobay": "ciprofloxacin",
    "ciprocin": "ciprofloxacin",

    "tavanic": "levofloxacin",
    "levanic": "levofloxacin",

    "flagyl": "metronidazole",
    "amrizole": "metronidazole",
    "entocid": "metronidazole", // Roughly

    "klacid": "clarithromycin",
    "klarimix": "clarithromycin",

    "vibramycin": "doxycycline",
    "doxycost": "doxycycline",

    // --- ALLERGY ---
    "zyrtec": "cetirizine",
    "cetrak": "cetirizine",
    "zirtek": "cetirizine",

    "claritin": "loratadine",
    "mosedin": "loratadine",
    "lorano": "loratadine",

    "telfast": "fexofenadine",
    "allegra": "fexofenadine",
    "fastel": "fexofenadine",

    "aerius": "desloratadine",
    "desla": "desloratadine",

    "xyzal": "levocetirizine",
    "levocet": "levocetirizine",

    "avil": "pheniramine",
    "anallerge": "chlorpheniramine",

    // --- GI / ACID ---
    "nexium": "esomeprazole",
    "ezgast": "esomeprazole",
    "esomep": "esomeprazole",

    "losec": "omeprazole",
    "prilosec": "omeprazole",
    "gastrozale": "omeprazole",
    "omeprezole": "omeprazole",
    "risek": "omeprazole",

    "controloc": "pantoprazole",
    "pantoloc": "pantoprazole",
    "zurcal": "pantoprazole",
    "proton": "pantoprazole",

    "antodine": "famotidine",
    "pepcid": "famotidine",
    "famotin": "famotidine",

    "zantac": "ranitidine", // Note: Recalled in many places, but users still search it
    "rani": "ranitidine",

    "gaviscon": "antacid",
    "maalox": "antacid",
    "coloverin": "mebeverine",
    "duspatalin": "mebeverine",
    "antinal": "nifuroxazide",

    // --- RESPIRATORY ---
    "ventolin": "salbutamol",
    "vair": "salbutamol",

    "pulmicort": "budesonide",
    "symbicort": "budesonide", // Simplified mapping
    "flixotide": "fluticasone",
    "seretide": "fluticasone", // Simplified
    "atrovent": "ipratropium",

    // --- CARDIAC / BP ---
    "norvasc": "amlodipine",
    "alkapress": "amlodipine",
    "amlo": "amlodipine",

    "concor": "bisoprolol",
    "bisocard": "bisoprolol",

    "tritace": "ramipril",
    "zestril": "lisinopril",
    "capoten": "captopril",
    "natrilix": "indapamide",
    "lasix": "furosemide",
    "aldactone": "spironolactone",

    "inderal": "propranolol",
    "tenormin": "atenolol",
    "lokelma": "sodium-zirconium", // Rare but ok

    "co-diovan": "valsartan", // Simplified
    "tareg": "valsartan",
    "atka": "candesartan",
    "micardis": "telmisartan",

    // --- LIPIDS ---
    "lipitor": "atorvastatin",
    "ator": "atorvastatin",
    "crestor": "rosuvastatin",
    "justor": "rosuvastatin",
    "zocor": "simvastatin",

    // --- DIABETES ---
    "glucophage": "metformin",
    "cidophage": "metformin",
    "siofor": "metformin",

    "amaryl": "glimepiride",
    "dolcil": "glimepiride",

    "diamicron": "gliclazide",
    "diabetron": "gliclazide",

    "januvia": "sitagliptin",
    "galvus": "vildagliptin",

    // --- CNS / PSYCH ---
    "xanax": "alprazolam",
    "prazolam": "alprazolam",
    "valium": "diazepam",
    "neuril": "diazepam",
    "prozac": "fluoxetine",
    "philozac": "fluoxetine",
    "cipralex": "escitalopram",
    "cipram": "citalopram",
    "anafranil": "clomipramine",
    "lustral": "sertraline",

    // --- VITAMINS ---
    "neurobion": "vitamin-b-complex",
    "neuroton": "vitamin-b-complex",
    "milga": "vitamin-b-complex",
    "centrum": "multivitamin",
    "vitaminc": "vitamin-c",
    "sanso": "multivitamin",
    "osteocare": "calcium",
    "calcid": "calcium",
    "ferose": "iron",
    "fefol": "iron",
    "ferrograd": "iron"
};

/**
 * Normalizes a drug name to its standard generic name.
 * Priority:
 * 1. Manual Alias Map
 * 2. Raw Input Fallback
 */
export async function normalizeDrugName(rawDrugName) {
    const cleanName = rawDrugName.trim().toLowerCase();

    // 1. Try Manual Alias Map first (Fastest & Most Reliable for common drugs)
    if (DRUG_ALIASES[cleanName]) {
        console.log(`[AI-Service] ⚡ Alias Match: "${rawDrugName}" -> "${DRUG_ALIASES[cleanName]}"`);
        return DRUG_ALIASES[cleanName];
    }

    // Final Fallback: Check alias map again or return raw
    const fallback = DRUG_ALIASES[cleanName] || cleanName;
    console.log(`[AI-Service] ↪️  Fallback: "${fallback}"`);
    return fallback;
}

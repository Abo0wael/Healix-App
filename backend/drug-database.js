// Safe, controlled database of drug alternatives
// Organized by therapeutic class for Hackathon demo purposes.
// NOTE: Doses are approximate common adult starting doses. 
// ALWAYS consult a doctor before switching medications.

export const DRUG_DATABASE = {
    // ============================================================
    // 1. PAIN, FEVER & INFLAMMATION (Analgesics / NSAIDs)
    // ============================================================
    "paracetamol": [
        { name: "Ibuprofen", dose: "400mg every 6 hours", reason: "NSAID alternative for inflammation" },
        { name: "Aspirin", dose: "300mg every 6 hours", reason: "For adults only" }
    ],
    "ibuprofen": [
        { name: "Naproxen", dose: "250mg - 500mg every 12 hours", reason: "Longer lasting NSAID" },
        { name: "Diclofenac", dose: "50mg every 8 hours", reason: "Potent anti-inflammatory" },
        { name: "Paracetamol", dose: "1g every 6 hours", reason: "Safer on stomach (not anti-inflammatory)" }
    ],
    "diclofenac": [
        { name: "Naproxen", dose: "500mg twice daily", reason: "Cardio-safer NSAID option" },
        { name: "Meloxicam", dose: "15mg once daily", reason: "Once-daily dosing" },
        { name: "Celecoxib", dose: "200mg daily", reason: "COX-2 inhibitor (stomach friendly)" }
    ],
    "naproxen": [
        { name: "Ibuprofen", dose: "400mg every 4-6 hours", reason: "Shorter acting alternative" },
        { name: "Meloxicam", dose: "15mg daily", reason: "Once daily alternative" }
    ],
    "meloxicam": [
        { name: "Celecoxib", dose: "200mg daily", reason: "COX-2 inhibitor" },
        { name: "Piroxicam", dose: "20mg daily", reason: "Similar long-acting NSAID" },
        { name: "Diclofenac", dose: "50mg - 75mg twice daily", reason: "Standard NSAID" }
    ],
    "celecoxib": [
        { name: "Etoricoxib", dose: "60mg - 90mg daily", reason: "Similar COX-2 inhibitor" },
        { name: "Meloxicam", dose: "15mg daily", reason: "NSAID with good stomach tolerance" }
    ],
    "aspirin": [
        { name: "Clopidogrel", dose: "75mg daily", reason: "Alternative antiplatelet (Consult Doctor)" },
        { name: "Ibuprofen", dose: "400mg", reason: "For pain relief only (not heart)" }
    ],
    "ketoprofen": [
        { name: "Ibuprofen", dose: "400mg - 600mg", reason: "Widely available alternative" },
        { name: "Naproxen", dose: "500mg", reason: "Longer duration" }
    ],

    // ============================================================
    // 2. ANTIBIOTICS (Infections)
    // ============================================================
    "amoxicillin": [
        { name: "Amoxicillin-Clavulanate", dose: "625mg - 1g every 12 hours", reason: "Broader spectrum" },
        { name: "Azithromycin", dose: "500mg daily", reason: "For penicillin allergy" },
        { name: "Cefuroxime", dose: "500mg every 12 hours", reason: "Cephalosporin class" }
    ],
    "amoxicillin-clavulanate": [
        { name: "Cefdinir", dose: "300mg every 12 hours", reason: "3rd gen Cephalosporin" },
        { name: "Levofloxacin", dose: "500mg daily", reason: "Fluoroquinolone (Adults Only)" },
        { name: "Clarithromycin", dose: "500mg every 12 hours", reason: "Macrolide class" }
    ],
    "azithromycin": [
        { name: "Clarithromycin", dose: "500mg every 12 hours", reason: "Similar Macrolide antibiotic" },
        { name: "Doxycycline", dose: "100mg twice daily", reason: "Alternative for respiratory/skin" }
    ],
    "ciprofloxacin": [
        { name: "Levofloxacin", dose: "500mg daily", reason: "Once daily fluoroquinolone" },
        { name: "Ofloxacin", dose: "200mg - 400mg every 12 hours", reason: "Similar spectrum" }
    ],
    "cefixime": [
        { name: "Cefuroxime", dose: "500mg twice daily", reason: "2nd gen Cephalosporin" },
        { name: "Amoxicillin-Clavulanate", dose: "1g twice daily", reason: "Standard broad spectrum" }
    ],
    "cefuroxime": [
        { name: "Cefixime", dose: "400mg daily", reason: "Once daily option" },
        { name: "Cefdinir", dose: "300mg every 12 hours", reason: "Alternative cephalosporin" }
    ],
    "metronidazole": [
        { name: "Tinidazole", dose: "2g single dose", reason: "Similar antiprotozoal/anaerobic" },
        { name: "Clindamycin", dose: "300mg every 6 hours", reason: "Alternative for anaerobic infections" }
    ],
    "clarithromycin": [
        { name: "Azithromycin", dose: "500mg daily", reason: "Shorter course (3-5 days)" },
        { name: "Erythromycin", dose: "500mg every 6 hours", reason: "Older macrolide" }
    ],
    "levofloxacin": [
        { name: "Moxifloxacin", dose: "400mg daily", reason: "Respiratory fluoroquinolone" },
        { name: "Ciprofloxacin", dose: "500mg twice daily", reason: "Better for urinary/gut" }
    ],
    "doxycycline": [
        { name: "Minocycline", dose: "100mg twice daily", reason: "Similar tetracycline" },
        { name: "Azithromycin", dose: "500mg daily", reason: "Alternative for atypical bacteria" }
    ],

    // ============================================================
    // 3. ALLERGY & ANTIHISTAMINES
    // ============================================================
    "cetirizine": [
        { name: "Levocetirizine", dose: "5mg daily", reason: "More potent isomer" },
        { name: "Loratadine", dose: "10mg daily", reason: "Often less sedating" },
        { name: "Fexofenadine", dose: "180mg daily", reason: "Least sedating antihistamine" }
    ],
    "loratadine": [
        { name: "Desloratadine", dose: "5mg daily", reason: "Active metabolite" },
        { name: "Cetirizine", dose: "10mg daily", reason: "Fast onset" }
    ],
    "fexofenadine": [
        { name: "Loratadine", dose: "10mg daily", reason: "Cost effective" },
        { name: "Bilastine", dose: "20mg daily", reason: "Non-sedating modern option" }
    ],
    "levocetirizine": [
        { name: "Cetirizine", dose: "10mg daily", reason: "Standard alternative" },
        { name: "Desloratadine", dose: "5mg daily", reason: "Different class" }
    ],
    "desloratadine": [
        { name: "Loratadine", dose: "10mg daily", reason: "Parent drug" },
        { name: "Fexofenadine", dose: "180mg daily", reason: "Non-drowsy" }
    ],
    "chlorpheniramine": [
        { name: "Diphenhydramine", dose: "25mg - 50mg", reason: "Also sedating (good for night)" },
        { name: "Cetirizine", dose: "10mg", reason: "Non-sedating option" }
    ],

    // ============================================================
    // 4. GI, ACID REFLUX & IBS
    // ============================================================
    "omeprazole": [
        { name: "Esomeprazole", dose: "40mg daily", reason: "Isomer of Omeprazole" },
        { name: "Pantoprazole", dose: "40mg daily", reason: "Stable PPI option" },
        { name: "Lansoprazole", dose: "30mg daily", reason: "Fast acting" }
    ],
    "esomeprazole": [
        { name: "Rabeprazole", dose: "20mg daily", reason: "Potent PPI" },
        { name: "Pantoprazole", dose: "40mg daily", reason: "Widely used alternative" }
    ],
    "pantoprazole": [
        { name: "Omeprazole", dose: "20mg daily", reason: "Standard PPI" },
        { name: "Famotidine", dose: "40mg daily", reason: "H2 Blocker (Non-PPI)" }
    ],
    "lansoprazole": [
        { name: "Dexlansoprazole", dose: "60mg daily", reason: "Extended release form" },
        { name: "Omeprazole", dose: "20mg daily", reason: "Standard alternative" }
    ],
    "famotidine": [
        { name: "Ranitidine", dose: "150mg twice daily", reason: "Similar H2 blocker (check availability)" },
        { name: "Omeprazole", dose: "20mg daily", reason: "Stronger acid suppression" }
    ],
    "mebeverine": [
        { name: "Trimebutine", dose: "200mg 3 times daily", reason: "IBS symptom relief" },
        { name: "Peppermint Oil", dose: "0.2ml caps", reason: "Natural antispasmodic" }
    ],

    // ============================================================
    // 5. CARDIAC, BLOOD PRESSURE & LIPIDS
    // ============================================================
    "amlodipine": [
        { name: "Felodipine", dose: "5mg daily", reason: "Calcium Channel Blocker" },
        { name: "Nifedipine", dose: "30mg ER daily", reason: "Alternative CCB" },
        { name: "Lercanidipine", dose: "10mg daily", reason: "Less leg cooling side effect" }
    ],
    "bisoprolol": [
        { name: "Atenolol", dose: "50mg daily", reason: "Cardioselective Beta-blocker" },
        { name: "Metoprolol", dose: "100mg daily", reason: "Standard Beta-blocker" },
        { name: "Nebivolol", dose: "5mg daily", reason: "Vasodilating Beta-blocker" }
    ],
    "ramipril": [
        { name: "Lisinopril", dose: "10mg daily", reason: "Once daily ACE inhibitor" },
        { name: "Enalapril", dose: "10mg twice daily", reason: "Short acting ACE-I" },
        { name: "Perindopril", dose: "5mg daily", reason: "Long acting option" }
    ],
    "lisinopril": [
        { name: "Ramipril", dose: "5mg daily", reason: "Alternative ACE-I" },
        { name: "Losartan", dose: "50mg daily", reason: "ARB (if ACE-I causes cough)" }
    ],
    "valsartan": [
        { name: "Losartan", dose: "50mg - 100mg daily", reason: "Standard ARB" },
        { name: "Candesartan", dose: "8mg - 16mg daily", reason: "Potent ARB" },
        { name: "Telmisartan", dose: "40mg daily", reason: "Long half-life ARB" }
    ],
    "atorvastatin": [
        { name: "Rosuvastatin", dose: "10mg daily", reason: "More potent statin" },
        { name: "Simvastatin", dose: "20mg - 40mg (Night)", reason: "Standard statin" }
    ],
    "rosuvastatin": [
        { name: "Atorvastatin", dose: "20mg daily", reason: "Common high-intensity statin" },
        { name: "Pravastatin", dose: "40mg daily", reason: "Fewer muscle side effects" }
    ],

    // ============================================================
    // 6. DIABETES
    // ============================================================
    "metformin": [
        { name: "Metformin XR", dose: "1g daily", reason: "Extended release (less stomach upset)" },
        { name: "Vildagliptin", dose: "50mg twice daily", reason: "Add-on therapy (consult doctor)" }
    ],
    "gliclazide": [
        { name: "Glimepiride", dose: "2mg - 4mg daily", reason: "Once daily sulfonylurea" },
        { name: "Repaglinide", dose: "1mg with meals", reason: "Short acting secretagogue" }
    ],
    "glimepiride": [
        { name: "Gliclazide MR", dose: "60mg daily", reason: "Modified release option" },
        { name: "Sitagliptin", dose: "100mg daily", reason: "DPP-4 Inhibitor (No hypo risk)" }
    ],
    "sitagliptin": [
        { name: "Vildagliptin", dose: "50mg twice daily", reason: "Similar DPP-4 inhibitor" },
        { name: "Linagliptin", dose: "5mg daily", reason: "Safe in kidney issues" }
    ],

    // ============================================================
    // 7. RESPIRATORY / ASTHMA (Inhalers)
    // ============================================================
    "salbutamol": [
        { name: "Levalbuterol", dose: "Inhaler", reason: "Less jittery isomer" },
        { name: "Terbutaline", dose: "Inhaler / Tablet", reason: "Alternative bronchodilator" }
    ],
    "budesonide": [
        { name: "Fluticasone", dose: "Inhaler", reason: "Inhaled corticosteroid" },
        { name: "Beclometasone", dose: "Inhaler", reason: "Standard maintenance steroid" }
    ],
    "fluticasone": [
        { name: "Budesonide", dose: "Inhaler", reason: "Alternative steroid" },
        { name: "Mometasone", dose: "Inhaler", reason: "Once daily potent steroid" }
    ],

    // ============================================================
    // 8. CNS / PSYCHIATRY (Careful substitutions)
    // ============================================================
    "fluoxetine": [
        { name: "Sertraline", dose: "50mg daily", reason: "SSRI (Similar class)" },
        { name: "Escitalopram", dose: "10mg daily", reason: "SSRI (Generally better tolerated)" },
        { name: "Citalopram", dose: "20mg daily", reason: "SSRI" }
    ],
    "escitalopram": [
        { name: "Citalopram", dose: "20mg daily", reason: "Parent drug" },
        { name: "Sertraline", dose: "50mg daily", reason: "Alternative SSRI" }
    ],
    "alprazolam": [
        { name: "Bromazepam", dose: "3mg", reason: "Benzodiazepine (Anxiety)" },
        { name: "Lorazepam", dose: "1mg", reason: "Short acting Benzodiazepine" },
        { name: "Buspirone", dose: "10mg", reason: "Non-benzo anxiolytic (Safer)" }
    ],
    "diazepam": [
        { name: "Clonazepam", dose: "0.5mg - 2mg", reason: "Long acting benzo" },
        { name: "Lorazepam", dose: "1mg - 2mg", reason: "Shorter half-life" }
    ],

    // ============================================================
    // 9. VITAMINS & SUPPLEMENTS
    // ============================================================
    "vitamin-b-complex": [
        { name: "Thiamine (B1)", dose: "100mg", reason: "Specific nerve support" },
        { name: "Methylcobalamin (B12)", dose: "1000mcg", reason: "Nerve regeneration form" }
    ],
    "multivitamin": [
        { name: "Vitamin C + Zinc", dose: "1000mg", reason: "Immunity support" },
        { name: "Omega 3", dose: "1000mg", reason: "General health support" }
    ],
    "iron": [
        { name: "Ferrous Fumarate", dose: "200mg", reason: "High elemental iron" },
        { name: "Iron Bisglycinate", dose: "28mg", reason: "Gentle on stomach" }
    ],
    "calcium": [
        { name: "Calcium Citrate", dose: "500mg", reason: "Better absorption (any time)" },
        { name: "Calcium Carbonate", dose: "500mg", reason: "Take with food" }
    ],
    "vitamin-d": [
        { name: "Cholecalciferol (D3)", dose: "1000 IU - 5000 IU", reason: "Active form" },
        { name: "Ergocalciferol (D2)", dose: "50000 IU (Weekly)", reason: "Plant based form" }
    ],

    // ============================================================
    // 10. DIGESTIVE / ANTIDIARRHEAL
    // ============================================================
    "nifuroxazide": [
        { name: "Racecadotril", dose: "100 mg", reason: "Antisecretory agent" },
        { name: "Loperamide", dose: "2 mg", reason: "Anti-motility agent" },
        { name: "Diosmectite", dose: "3 g sachet", reason: "Adsorbent" }
    ]
};

// Return alternatives or null
export const getAlternativesFor = (genericName) => {
    if (!genericName) return null;
    const normalized = genericName.toLowerCase().trim();
    return DRUG_DATABASE[normalized] || null;
};

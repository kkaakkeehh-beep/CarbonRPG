// =============================================================
// en-q4.js — 英語の問題：第 4 章（ペリ環状反応・対称と鏡像）
// =============================================================
I18N.add('en', { q: {
  // ---------------- Undergrad I ----------------
  'c4-1-01': {
    q: "The Diels–Alder reaction is a reaction between what and what?",
    choices: ["A conjugated diene and an alkene (dienophile)", "An aldehyde and an amine", "An alkyl halide and an alkoxide", "An ester and an enolate"],
    explain: "A conjugated diene (4π) and a dienophile (2π) join in a concerted [4+2] cycloaddition to form a six-membered ring. Two new σ bonds form at the same time.",
  },
  'c4-1-02': {
    q: "1,3-Butadiene and ethene were heated to undergo a Diels–Alder reaction. What is the product?",
    choices: ["Cyclohexene", "Benzene", "Cyclobutane", "1,5-Hexadiene"],
    mols: ["1,3-Butadiene", "Ethene"],
    explain: "The ends of the diene (C1 and C4) bond to the two carbons of ethene, and a new double bond remains in the middle of the diene (C2–C3). The unsubstituted pair reacts slowly and in practice needs high temperature and pressure.",
  },
  'c4-1-03': {
    q: "What conformation must the diene adopt for a Diels–Alder reaction?",
    choices: ["s-cis (both C=C on the same side of the single bond)", "s-trans (the C=C on opposite sides of the single bond)", "A chair", "A boat"],
    explain: "Both ends of the diene must reach the dienophile at once, which requires the s-cis conformation. Cyclopentadiene is locked s-cis by its ring, so it is very reactive.",
  },
  'c4-1-04': {
    q: "What is an electrocyclic reaction?",
    choices: ["The two ends of one π system bond to close a ring", "Two separate molecules form two bonds to make a ring", "A σ bond migrates along a conjugated π system", "An electrophile attaches to an aromatic ring"],
    explain: "The p orbitals at the ends of the chain rotate and overlap to form a σ bond. The second option is a cycloaddition and the third a sigmatropic rearrangement; all are pericyclic reactions.",
  },
  'c4-1-05': {
    q: "In the thermal electrocyclic ring closure of a 6π system (a hexatriene), how do the ends rotate?",
    choices: ["Disrotatory (opposite directions)", "Conrotatory (the same direction)", "Only one end rotates", "It closes without rotating"],
    explain: "Thermally, the ends rotate so that the HOMO's terminal lobes match in phase. Thermal 6π (4n+2) is disrotatory; thermal 4π (4n) is conrotatory. Photochemically it's the reverse.",
  },
  'c4-1-06': {
    q: "What ring shape does the transition state of a Cope rearrangement ([3,3] of a 1,5-diene) usually take?",
    choices: ["A six-membered chair", "A planar four-membered ring", "A five-membered ring", "An eight-membered ring"],
    mols: ["1,5-Hexadiene"],
    explain: "It passes through a cyclic array of six carbons as the σ bond shifts to the [3,3] position. As with cyclohexane, the chair is usually favored.",
  },
  'c4-1-07': {
    q: "Heating allyl vinyl ether causes a Claisen rearrangement. What is the product?",
    choices: ["4-Pentenal (a γ,δ-unsaturated aldehyde)", "2-Pentenal (an α,β-unsaturated aldehyde)", "Allyl alcohol and acetaldehyde", "2-Vinyloxetane"],
    mols: ["Allyl vinyl ether"],
    explain: "In this [3,3] sigmatropic rearrangement a C–O bond breaks and a C–C bond forms. Forming a strong C=O drives it, so it's essentially irreversible.",
  },
  'c4-1-08': {
    q: "What ring forms in the 1,3-dipolar cycloaddition of an organic azide (R–N₃) with an alkyne?",
    choices: ["A 1,2,3-triazole", "A pyridine", "A furan", "An aziridine"],
    explain: "An azide is a three-atom, 4π-electron 1,3-dipole, which undergoes [3+2] cycloaddition with an alkyne (2π) to form a five-membered ring (Huisgen cycloaddition). With a copper catalyst it is fast and regioselective (click chemistry).",
  },
  'c4-1-09': {
    q: "Which is true of the [2+2] cycloaddition of two alkenes to give a cyclobutane?",
    choices: ["Hard by heat, but it happens under light", "It happens neither by heat nor by light", "By heat it happens, but not by light", "With a catalyst it always goes thermally"],
    explain: "A supra–supra [2+2] is forbidden thermally (ground state) because the orbital phases don't match. Photoexcitation changes the symmetry of the orbitals involved, making it allowed.",
  },
  'c4-1-10': {
    q: "In a normal Diels–Alder reaction (electron-rich diene + electron-poor dienophile), which orbitals mainly overlap?",
    choices: ["The diene's HOMO and the dienophile's LUMO", "The diene's LUMO and the dienophile's HOMO", "The diene's HOMO and the dienophile's HOMO", "The diene's LUMO and the dienophile's LUMO"],
    explain: "Frontier molecular orbital (FMO) theory: the HOMO–LUMO pair closest in energy interacts most strongly. An electron-rich diene has a high HOMO, and a dienophile with electron-withdrawing groups a low LUMO. The opposite pairing is “inverse electron demand.”",
  },
  'c4-1-11': {
    q: "Which is the most reactive dienophile for a Diels–Alder reaction?",
    choices: ["Maleic anhydride", "Ethene", "2-Methylpropene", "Ethyl vinyl ether"],
    explain: "Electron-withdrawing groups such as C=O lower the dienophile's LUMO toward the diene's HOMO. Maleic anhydride has two carbonyls and is an excellent dienophile. Electron-donating groups (alkyl, alkoxy) have the opposite effect.",
  },
  'c4-1-12': {
    q: "If a molecule has a mirror plane (plane of symmetry), the molecule is…",
    choices: ["Achiral (superimposable on its mirror image)", "Always chiral, whatever else it has", "Always optically active in solution", "Always free of any stereocenters"],
    explain: "With a mirror plane, a molecule superimposes on its mirror image, so it is achiral. Some, like meso compounds, have stereocenters and a mirror plane.",
  },
  'c4-1-13': {
    q: "How many mirror planes does dichloromethane (CH₂Cl₂) have?",
    choices: ["2", "1", "0", "4"],
    mols: ["Dichloromethane"],
    explain: "One containing both Cl's and one containing both H's. Their line of intersection is a C₂ axis (point group C₂ᵥ).",
  },
  'c4-1-14': {
    q: "What is the point group of water (H₂O)?",
    choices: ["C₂ᵥ", "D∞h", "Td", "C₁"],
    explain: "One C₂ axis through O, and two mirror planes containing it (the molecular plane and the plane perpendicular to it).",
  },
  'c4-1-15': {
    q: "What is the point group of methane (CH₄)?",
    choices: ["Td", "Oh", "D₃h", "C₃ᵥ"],
    explain: "A regular tetrahedron: four C₃ axes, three C₂ axes and six mirror planes. Only when all four groups differ do the symmetry elements vanish (C₁, a stereocenter).",
  },
  'c4-1-16': {
    q: "What do you call stereoisomers that are not mirror images of each other?",
    choices: ["Diastereomers", "Enantiomers", "Constitutional isomers", "Tautomers"],
    explain: "Stereoisomers that are mirror images are enantiomers; all others are diastereomers. Diastereomers differ in physical properties such as melting point and solubility.",
  },
  'c4-1-17': {
    q: "How are (2R,3R)-tartaric acid and (2S,3S)-tartaric acid related?",
    choices: ["Enantiomers", "Diastereomers", "The same compound", "Both meso forms"],
    mols: ["(2R,3R)-Tartaric acid", "(2S,3S)-Tartaric acid"],
    explain: "Both stereocenters are inverted, so they are mirror images. (2R,3S) is meso-tartaric acid, a diastereomer of the (2R,3R) form.",
  },
  'c4-1-18': {
    q: "Which describes a meso compound correctly?",
    choices: ["Has stereocenters, but an internal mirror makes it achiral", "A compound with no stereocenters at all", "A 1:1 mixture of the R and S enantiomers", "A crystal of a single optically active compound"],
    explain: "The third option is a racemate (a mixture). A meso compound is a single compound in which R and S centers face each other as mirror images, canceling the optical rotation.",
  },
  'c4-1-19': {
    q: "(2R,3R)-Tartaric acid has a C₂ rotation axis. Is it chiral?",
    choices: ["Chiral (a rotation axis alone doesn't make it achiral)", "Achiral (because the molecule is symmetric)", "It can't be decided either way from this", "It changes with the temperature of the sample"],
    mols: ["(2R,3R)-Tartaric acid"],
    explain: "What decides superimposability on the mirror image is a mirror plane, an inversion center or an improper axis (Sn). A molecule can have a rotation axis (Cn) and still be chiral. That's why natural tartaric acid rotates polarized light.",
  },
  'c4-1-20': {
    q: "Which symmetry element can a chiral molecule have?",
    choices: ["A rotation axis (Cn)", "A mirror plane (σ)", "An inversion center (i)", "An improper axis (Sn)"],
    explain: "Any one of a mirror plane, inversion center or improper axis makes a molecule superimposable on its mirror image, so achiral (σ = S₁, i = S₂). Many chiral molecules have only rotation axes (BINAP, (R,R)-tartaric acid…).",
  },
  'c4-1-21': {
    q: "What do you call separating a racemate into its enantiomers?",
    choices: ["Optical resolution", "Racemization", "Recrystallization", "Asymmetric synthesis"],
    explain: "Also simply “resolution.” The reverse, a pure enantiomer turning into a 1:1 mixture, is racemization.",
  },
  'c4-1-22': {
    q: "What is the classic, widely used way to resolve a racemic amine?",
    choices: ["Form diastereomeric salts with a chiral acid; crystallize one", "Form salts with an achiral acid and distill them apart", "Heat the amine until it racemizes completely", "Dissolve it in water and let the crystals sort themselves"],
    explain: "The (R)-amine·(R,R)-acid and (S)-amine·(R,R)-acid salts are diastereomers, so their solubilities differ. Crystallize one out, then treat with base to recover the amine.",
  },

  // ---------------- Undergrad II ----------------
  'c4-2-01': {
    q: "Why does the Diels–Alder reaction of cyclopentadiene with maleic anhydride give mainly the endo adduct?",
    choices: ["Secondary orbital overlap of C=O with diene C2/C3 stabilizes it", "The endo adduct is the thermodynamically more stable one", "The exo adduct simply can't form for steric reasons", "The solvent dissolves only the endo adduct and pulls it over"],
    mols: ["Cyclopentadiene", "Maleic anhydride"],
    explain: "The endo rule. The endo adduct is the kinetic product; thermodynamically the exo adduct is often more stable (heating for a long time can increase exo via the reverse reaction).",
  },
  'c4-2-02': {
    q: "What is the product of the Diels–Alder reaction of 1,3-butadiene with dimethyl maleate (a cis diester)?",
    choices: ["Dimethyl cis-4-cyclohexene-1,2-dicarboxylate", "Dimethyl trans-4-cyclohexene-1,2-dicarboxylate", "A 1:1 mixture of cis and trans", "No reaction"],
    mols: ["Dimethyl maleate"],
    explain: "The Diels–Alder reaction is concerted and stereospecific: a cis relationship in the dienophile stays cis in the product. Dimethyl fumarate (trans) gives the trans product (racemic). This cis product is a meso compound with an internal mirror plane.",
  },
  'c4-2-03': {
    q: "In the Diels–Alder reaction of 1-methoxy-1,3-butadiene with acrolein, which regioisomer mainly forms?",
    choices: ["The “ortho” (1,2-) product, substituents adjacent", "The “meta” (1,3-) product, substituents one apart", "The “para” (1,4-) product, substituents opposite", "All three in equal amounts"],
    mols: ["1-Methoxy-1,3-butadiene", "Acrolein"],
    explain: "The diene's HOMO has its larger coefficient at the end far from the donor (C4), and the dienophile's LUMO at its β carbon. Bonding the large coefficients together gives the “ortho” product. A 2-substituted diene gives mainly “para.”",
  },
  'c4-2-04': {
    q: "cis-3,4-Dimethylcyclobutene was heated and ring-opened. What is the product?",
    choices: ["(2E,4Z)-2,4-Hexadiene", "(2E,4E)-2,4-Hexadiene", "(2Z,4Z)-2,4-Hexadiene", "1,5-Hexadiene"],
    mols: ["cis-3,4-Dimethylcyclobutene"],
    explain: "Cyclobutene ring opening is a 4π electrocyclic reaction, conrotatory by heat. When the two cis methyls rotate the same way, one ends up outside and the other inside, giving the (E,Z) diene.",
  },
  'c4-2-05': {
    q: "(2E,4Z,6E)-2,4,6-Octatriene was heated to close the ring. What is the product?",
    choices: ["cis-5,6-Dimethyl-1,3-cyclohexadiene", "trans-5,6-Dimethyl-1,3-cyclohexadiene", "A 1:1 mixture of cis and trans", "It doesn't close"],
    cl: ["meso", "racemic", null, null],
    mols: ["(2E,4Z,6E)-2,4,6-Octatriene"],
    explain: "Thermal 6π ring closure is disrotatory. The two end methyls face the same side as the ring closes, giving the cis product. Disrotation preserves a mirror plane throughout, so the product is meso. Photochemical closure is conrotatory and gives the trans product.",
  },
  'c4-2-06': {
    q: "Allyl phenyl ether was heated to about 200 °C (aromatic Claisen rearrangement). What is the major product?",
    choices: ["2-Allylphenol", "4-Allylphenol", "Phenol and propene", "Allylbenzene"],
    mols: ["Allyl phenyl ether"],
    explain: "In the [3,3] shift, the allyl group moves via its terminal carbon to the position ortho to oxygen. The cyclohexadienone formed tautomerizes back to an aromatic phenol. If both ortho positions are blocked, a following Cope rearrangement carries it to para.",
  },
  'c4-2-07': {
    q: "5-Methyl-1,3-cyclopentadiene gradually turns into the 1-methyl and 2-methyl isomers at room temperature. What is the main cause?",
    choices: ["Suprafacial [1,5]-hydrogen shifts", "Diels–Alder dimerization reactions", "Carbocation (hydride) rearrangements", "Radical chain hydrogen transfers"],
    mols: ["5-Methyl-1,3-cyclopentadiene"],
    explain: "A thermally allowed [1,5] shift, in which hydrogen slides across one face of the π system to the carbon five atoms away. In cyclopentadienes it's fast even at room temperature. Suprafacial [1,3] and [1,7] shifts are thermally forbidden.",
  },
  'c4-2-08': {
    q: "What mainly forms when an azide and a terminal alkyne react with a copper(I) catalyst (CuAAC, click chemistry)?",
    choices: ["The 1,4-disubstituted 1,2,3-triazole", "The 1,5-disubstituted 1,2,3-triazole", "A 1:1 mixture of the 1,4 and 1,5 isomers", "A tetrazole"],
    explain: "The purely thermal Huisgen cycloaddition gives a mixture of 1,4 and 1,5 isomers, but CuAAC, going through a copper acetylide, gives only the 1,4 isomer. A ruthenium catalyst (RuAAC) gives the 1,5 isomer.",
  },
  'c4-2-09': {
    q: "A mixture of 2-cyclohexenone and ethene was irradiated. What skeleton mainly forms?",
    choices: ["A bicyclic ketone with a fused cyclobutane", "The Diels–Alder adduct of the two", "A ring-contracted cyclopentanone", "The epoxide of the enone C=C"],
    mols: ["2-Cyclohexenone"],
    explain: "The enone is excited to its triplet state and bonds stepwise with the alkene in a [2+2] photocycloaddition (bicyclo[4.2.0]octan-2-one). A standard way to build cyclobutane rings, impossible thermally, in natural product synthesis.",
  },
  'c4-2-10': {
    q: "Why is the supra–supra [2+2] cycloaddition of two ethenes thermally forbidden?",
    choices: ["HOMO and LUMO can't match in phase at both ends at once", "Cyclobutane is far too strained and unstable to form", "Ethene's HOMO is much too low in energy to react", "Three σ bonds would have to form at the same time"],
    explain: "Ethene's LUMO (π*) has opposite phases at its two ends. Approaching on the same face, one end overlaps in a bonding way and the other cancels out. In [4+2], the diene's LUMO (ψ₃) and ethene's HOMO match at both ends, so it's allowed.",
  },
  'c4-2-11': {
    q: "How do you get cyclopentadiene for a Diels–Alder reaction from commercial dicyclopentadiene?",
    choices: ["Heat it to crack it (retro-Diels–Alder) and distill", "Hydrogenate it over palladium on carbon", "Treat it with a strong acid such as H₂SO₄", "Irradiate it with UV light at low temperature"],
    mols: ["Dicyclopentadiene"],
    explain: "Cyclopentadiene dimerizes by a Diels–Alder reaction with itself at room temperature. Heating to about 170 °C reverses it (retro-Diels–Alder), so you distill off the monomer, keep it cold and use it right away.",
  },
  'c4-2-12': {
    q: "Which is true of a molecule with an inversion center?",
    choices: ["It is always achiral", "It is always chiral", "It always has a mirror plane too", "It always has a C₂ axis too"],
    explain: "An inversion center is the same as an S₂ improper axis. Molecules with an Sn axis superimpose on their mirror images, so they're achiral. Some molecules have an inversion center but no mirror plane (such as the anti conformer of meso-tartaric acid).",
  },
  'c4-2-13': {
    q: "What is the point group of trans-1,2-dichloroethene?",
    choices: ["C₂h", "C₂ᵥ", "D₂h", "Cs"],
    mols: ["trans-1,2-Dichloroethene"],
    explain: "It has a C₂ axis perpendicular to the molecular plane, the molecular plane itself as a mirror (σh), and an inversion center. The cis isomer is C₂ᵥ.",
  },
  'c4-2-14': {
    q: "What is the point group of benzene?",
    choices: ["D₆h", "C₆ᵥ", "D₃h", "Oh"],
    explain: "A C₆ axis perpendicular to the plane, six in-plane C₂ axes, and the molecular plane as σh. A Kekulé structure with localized double bonds would be D₃h, but in reality all six bonds are equal.",
  },
  'c4-2-15': {
    q: "How are (2R,3R)-2,3-dibromobutane and meso-2,3-dibromobutane related?",
    choices: ["Diastereomers", "Enantiomers", "The same compound", "Constitutional isomers"],
    mols: ["(2R,3R)-2,3-Dibromobutane", "meso-2,3-Dibromobutane"],
    explain: "Only one stereocenter is inverted. A meso compound has no enantiomer (its mirror image is itself).",
  },
  'c4-2-16': {
    q: "A sample of the (R) isomer is 90% ee. What is the ratio of (R) to (S)?",
    choices: ["95 : 5", "90 : 10", "99 : 1", "85 : 15"],
    explain: "ee = R − S (with R + S = 100). Solving R − S = 90 gives R = 95, S = 5.",
  },
  'c4-2-17': {
    q: "Of cis- and trans-1,2-dimethylcyclopropane, which is chiral?",
    choices: ["The trans isomer (C₂ axis only)", "The cis isomer (has a mirror plane)", "Both", "Neither"],
    mols: ["cis isomer", "trans isomer (1R,2R)"],
    explain: "The cis isomer is meso, with a mirror plane through the CH₂ bisecting the C1–C2 bond. The trans isomer has no mirror plane, only a C₂ axis, so it's chiral (with enantiomers (1R,2R) and (1S,2S)).",
  },
  'c4-2-18': {
    q: "Why is BINAP (2,2′-bis(diphenylphosphino)-1,1′-binaphthyl) chiral?",
    choices: ["Rotation about the binaphthyl bond is blocked", "It contains two asymmetric carbon atoms", "Its two phosphorus atoms are stereocenters", "The whole molecule lies flat in one plane"],
    explain: "Bulky substituents keep the two naphthalene rings from lying in one plane. The direction of twist defines (R) or (S). The molecule has a C₂ axis but no mirror plane. It is the ligand in Noyori's asymmetric hydrogenation.",
  },
  'c4-2-19': {
    q: "Which of these is a meso compound?",
    choices: ["(2R,3S)-2,3-Butanediol", "(2R,3R)-2,3-Butanediol", "(R)-1,2-Propanediol", "(2R,3R)-Tartaric acid"],
    explain: "In (2R,3S)-2,3-butanediol, the two stereocenters face each other as mirror images, creating an internal mirror plane. The (2R,3R) diol and (2R,3R)-tartaric acid are chiral with only a C₂ axis. (R)-1,2-Propanediol has just one stereocenter.",
  },
  'c4-2-20': {
    q: "Why can diastereomeric salts be used for optical resolution?",
    choices: ["Diastereomers differ in properties like solubility", "Enantiomers differ in solubility in water", "Forming the salt destroys one enantiomer", "Forming the salt stops all racemization"],
    explain: "Enantiomers have nearly identical properties in an achiral environment, so they are hard to separate directly. Pairing them with a chiral partner makes diastereomers, which can be separated by their different properties.",
  },
  'c4-2-21': {
    q: "Why can enantiomers be separated on a chiral stationary phase (chiral HPLC)?",
    choices: ["Each forms a diastereomeric complex of different stability", "The two enantiomers have different molecular weights", "The phase decomposes one of the enantiomers", "The two enantiomers have different polarities"],
    explain: "Interactions with a chiral partner aren't the same for R and S. That difference changes the retention times, splitting the peak in two. Also used to measure ee.",
  },
  'c4-2-22': {
    q: "1,3-Dichloroallene (ClCH=C=CHCl) is chiral even though it has no stereogenic carbon. Why?",
    choices: ["The ends lie in perpendicular planes (axial chirality)", "The central carbon is a stereogenic carbon", "The whole molecule is planar", "The two chlorines absorb polarized light"],
    mols: ["1,3-Dichloroallene"],
    explain: "The two π bonds of an allene are perpendicular, so the substituents at the two ends lie in planes twisted by 90°. With two different groups at each end there is no mirror plane, only a C₂ axis.",
  },

  // ---------------- Grad Entrance Exam ----------------
  'c4-3-01': {
    q: "Danishefsky's diene and an aldehyde were reacted with a Lewis acid, then worked up with acid. What skeleton is obtained?",
    choices: ["2,3-Dihydro-4H-pyran-4-one", "Cyclohexenone", "Tetrahydrofuran", "A butenolide"],
    mols: ["Danishefsky's diene"],
    explain: "A hetero-Diels–Alder reaction in which the aldehyde C=O is the dienophile (or a Mukaiyama-aldol-type addition then cyclization). Acid removes the silyl enol ether and the methoxy group to give the dihydropyranone.",
  },
  'c4-3-02': {
    q: "Adding a Lewis acid (AlCl₃, etc.) speeds up the Diels–Alder reaction of methyl acrylate and raises its endo selectivity. What is the main reason?",
    choices: ["Binding C=O lowers the dienophile LUMO toward the diene HOMO", "Binding the diene lowers its HOMO energy", "It lowers the polarity of the reaction solvent", "It locks the diene in the s-trans conformation"],
    explain: "A lower LUMO shrinks the HOMO–LUMO gap, speeding up the reaction. The polarization of the LUMO coefficients and the carbonyl's secondary orbital interactions also grow, so regio- and endo selectivity both rise.",
  },
  'c4-3-03': {
    q: "(2E,4E)-2,4-Hexadiene reacted with maleic anhydride in a Diels–Alder reaction. On the product ring, how are the two methyls that were on the diene's ends related?",
    choices: ["cis (same side of the ring)", "trans (opposite sides of the ring)", "cis and trans 1:1", "The methyls stay on the double bond"],
    mols: ["(2E,4E)-2,4-Hexadiene", "Maleic anhydride"],
    explain: "In the E,E diene, both end methyls point “outside” in the s-cis conformation. Because bonding is concerted, the two outside groups end up on the same side (cis) in the product. The (E,Z) diene would give trans.",
  },
  'c4-3-04': {
    q: "trans-3,4-Dimethylcyclobutene was heated and ring-opened. What is the major product?",
    choices: ["(2E,4E)-2,4-Hexadiene", "(2E,4Z)-2,4-Hexadiene", "(2Z,4Z)-2,4-Hexadiene", "1,3-Hexadiene"],
    mols: ["trans-3,4-Dimethylcyclobutene"],
    explain: "Thermal 4π ring opening is conrotatory. With conrotation, the trans methyls either both rotate outward (E,E) or both inward (Z,Z). Inward is sterically crowded, so the (E,E) diene dominates.",
  },
  'c4-3-05': {
    q: "In the Nazarov cyclization (divinyl ketone + Lewis acid → cyclopentenone), what is the ring-closing step?",
    choices: ["4π conrotatory", "6π disrotatory", "4π disrotatory", "2π conrotatory"],
    mols: ["Divinyl ketone (1,4-pentadien-3-one)"],
    explain: "Coordination of the Lewis acid to oxygen creates a pentadienyl cation (4π electrons) over five carbons. As a thermal 4π electrocyclization it closes conrotatorily, giving a cyclopentenone via an oxyallyl cation.",
  },
  'c4-3-06': {
    q: "Treating 1,5-hexadien-3-ol with KH and 18-crown-6 speeds its Cope rearrangement by over 10¹⁰ (anionic oxy-Cope). After workup, what is the product?",
    choices: ["5-Hexenal (a δ,ε-unsaturated aldehyde)", "2-Hexenal (an α,β-unsaturated aldehyde)", "1,5-Hexadien-3-ol (no rearrangement)", "2-Cyclohexenol"],
    mols: ["1,5-Hexadien-3-ol"],
    explain: "The alkoxide's negative charge weakens the neighboring C–C bond, greatly accelerating the [3,3] shift. The rearrangement gives an enolate, which becomes the aldehyde on workup. C3–C4 breaks and C1–C6 bonds, leaving the double bond δ,ε to the carbonyl.",
  },
  'c4-3-07': {
    q: "Heating meso-3,4-dimethyl-1,5-hexadiene (Cope rearrangement) gives almost only (2E,6Z)-2,6-octadiene. What does this show?",
    choices: ["The shift goes through a six-membered chair transition state", "The shift goes through a boat transition state", "It proceeds stepwise through a radical pair", "The rearrangement requires light"],
    mols: ["meso-3,4-Dimethyl-1,5-hexadiene", "(2E,6Z)-2,6-Octadiene"],
    explain: "Doering and Roth's experiment. In a chair transition state, one methyl of the meso isomer is equatorial and the other axial, giving (E,Z). A boat would give (E,E) and (Z,Z). The racemate gives mainly (E,E) via the chair.",
  },
  'c4-3-08': {
    q: "What five-membered ring forms in the 1,3-dipolar cycloaddition of a nitrone with an alkene?",
    choices: ["An isoxazolidine", "A pyrrolidine", "An oxazole", "A 4,5-dihydro-1,2,3-triazole"],
    explain: "A nitrone (R₂C=N⁺(R)–O⁻) is a 1,3-dipole spanning C–N–O. Adding to an alkene gives a five-membered ring containing an N–O bond. Reductive N–O cleavage then gives a 1,3-amino alcohol.",
  },
  'c4-3-09': {
    q: "What is the first step of a Norrish type II reaction?",
    choices: ["The excited C=O oxygen abstracts a γ-hydrogen in the same molecule", "Homolysis of the bond between the C=O and the α carbon", "[2+2] addition of the C=O to an alkene", "Protonation of the carbonyl group"],
    explain: "The γ-H moves through a six-membered transition state to give a 1,4-biradical, which either cleaves its C–C bond into an enol and an alkene, or recombines into a cyclobutanol (Yang cyclization). The second option is Norrish type I; the third is the Paternò–Büchi reaction.",
  },
  'c4-3-10': {
    q: "(2E,4Z,6E)-2,4,6-Octatriene was irradiated to close the ring. What is the product?",
    choices: ["trans-5,6-Dimethyl-1,3-cyclohexadiene", "cis-5,6-Dimethyl-1,3-cyclohexadiene", "A 1:1 mixture of cis and trans", "It doesn't close"],
    cl: ["racemic", "meso", null, null],
    mols: ["(2E,4Z,6E)-2,4,6-Octatriene"],
    explain: "On photoexcitation even a 6π system closes conrotatorily. The end methyls point to opposite sides, giving the trans product. Conrotation preserves a C₂ axis, so the product is a C₂-symmetric chiral molecule with no mirror plane (racemic, since both senses of rotation are equally likely).",
  },
  'c4-3-11': {
    q: "By the Woodward–Hoffmann rules, what total number of π electrons makes a (supra–supra) cycloaddition thermally allowed?",
    choices: ["4n+2 (6, 10, …)", "4n (4, 8, …)", "An odd number", "It doesn't depend on the count"],
    explain: "The [4+2] Diels–Alder (6 electrons) is thermally allowed; [2+2] (4 electrons) is thermally forbidden and photochemically allowed. A 4n system becomes thermally allowed if one partner reacts antarafacially (as in ketene [2+2]).",
  },
  'c4-3-12': {
    q: "What is the point group of allene (H₂C=C=CH₂)?",
    choices: ["D₂d", "D₂h", "C₂ᵥ", "D∞h"],
    mols: ["Allene"],
    explain: "The two CH₂ ends are perpendicular. The molecular axis is an S₄ axis, with two C₂ axes perpendicular to it and two mirror planes, each containing one CH₂.",
  },
  'c4-3-13': {
    q: "What is the point group of the conformer of (2R,3R)-tartaric acid with its two carboxyl groups anti?",
    choices: ["C₂", "Cs", "Ci", "C₂h"],
    mols: ["(2R,3R)-Tartaric acid"],
    explain: "It has only a C₂ axis through the midpoint of the C2–C3 bond, with no mirror plane or inversion center, so it's chiral. The same conformer of meso-tartaric acid has an inversion center: Ci.",
  },
  'c4-3-14': {
    q: "A molecule has no mirror plane and no inversion center, only an S₄ axis (rotate 90°, then reflect through the perpendicular plane). It is…",
    choices: ["Achiral", "Chiral", "Always optically active", "Undecidable"],
    explain: "A molecule with an improper axis Sn superimposes on its mirror image. A mirror plane (S₁) and an inversion center (S₂) are special cases of Sn. Achiral molecules with only an S₄ axis have actually been synthesized.",
  },
  'c4-3-15': {
    q: "What symmetry element does the conformer of meso-tartaric acid with its two carboxyl groups anti have?",
    choices: ["An inversion center (i)", "A C₂ axis", "A mirror plane (σ)", "No symmetry element"],
    mols: ["meso-Tartaric acid"],
    explain: "In the anti conformer, the midpoint of the C2–C3 bond is an inversion center (point group Ci). An eclipsed conformer has a mirror plane (Cs). A meso compound is achiral in every conformation.",
  },
  'c4-3-16': {
    q: "Why are so many asymmetric catalyst ligands C₂-symmetric (DIOP, BINAP, BOX, etc.)?",
    choices: ["Fewer distinct metal geometries, so fewer competing TSs", "C₂-symmetric molecules are always achiral", "They can always be made in a single step", "They don't bind to the metal at all"],
    explain: "Two positions related by the C₂ axis are equivalent, so the substrate gets the same transition state whichever side it approaches from. Fewer pathways to distinguish makes selectivity easier to predict and control (Kagan's DIOP was the pioneer).",
  },
  'c4-3-17': {
    q: "trans-Cyclooctene is chiral and can be resolved into enantiomers. Where does its chirality come from?",
    choices: ["The twisted trans C=C faces one side of the ring", "A stereogenic carbon atom sits in the ring", "Free rotation about its C–C single bonds", "The size of the eight-membered ring itself"],
    explain: "Putting a trans double bond in a small ring forces it to twist up out of the ring plane. Which face it points toward creates a mirror-image pair (C₂-symmetric). In the eight-membered ring, inversion is slow enough to resolve at room temperature.",
  },
  'c4-3-18': {
    q: "In a kinetic resolution of a racemate, what is the maximum yield of unreacted starting material recovered in high ee?",
    choices: ["50%", "100%", "25%", "75%"],
    explain: "One enantiomer reacts fast and the slow one is left behind, so at most half remains. An example is the resolution of secondary allylic alcohols by Katsuki–Sharpless asymmetric epoxidation.",
  },
  'c4-3-19': {
    q: "Dynamic kinetic resolution (DKR) can in theory give one enantiomer's product from a racemate in 100% yield. How?",
    choices: ["The slow enantiomer racemizes fast, feeding the fast one", "Both enantiomers react at the same rate", "The product itself racemizes afterward", "The catalyst resolves the product afterward"],
    explain: "If the starting enantiomers interconvert faster than the resolving reaction, everything can go through the fast pathway. Examples: Noyori's asymmetric hydrogenation of α-substituted β-keto esters (the α position racemizes by enolization), and enzyme–ruthenium combinations.",
  },
  'c4-3-20': {
    q: "When a racemate crystallizes as separate crystals of pure R and pure S, what is it called?",
    choices: ["A conglomerate", "A racemic compound", "A pseudoracemate (solid solution)", "A meso compound"],
    explain: "Most racemates form a “racemic compound,” with R and S ordered in the same lattice. Conglomerates are only about 5–10%. Pasteur's tartrate salt is one, which is why its crystals could be sorted by hand.",
  },
  'c4-3-21': {
    q: "How are the two hydrogens of the CH₂ in ethanol (CH₃CH₂OH) related?",
    choices: ["Enantiotopic", "Diastereotopic", "Homotopic", "Constitutionally different"],
    mols: ["Ethanol"],
    explain: "Replacing each with D in turn gives (R)- and (S)-1-deuterioethanol, a pair of enantiomers. They can't be told apart in an achiral environment, but enzymes (alcohol dehydrogenase) do distinguish them.",
  },
  'c4-3-22': {
    q: "How are the two hydrogens on C3 (CH₂) of (R)-2-butanol related?",
    choices: ["Diastereotopic (can give separate NMR signals)", "Enantiotopic", "Homotopic", "Always equivalent, being on one carbon"],
    mols: ["(R)-2-Butanol"],
    explain: "The molecule already has a stereocenter, so replacing each with D in turn gives diastereomers. Even in an achiral solvent, their ¹H NMR chemical shifts can differ.",
  },

  // ---------------- PhD (Brutal) ----------------
  'c4-4-01': {
    q: "In the reaction of a tetrazine with trans-cyclooctene (an inverse-electron-demand Diels–Alder), which orbitals mainly interact?",
    choices: ["The dienophile's HOMO and the diene (tetrazine) LUMO", "The diene's HOMO and the dienophile's LUMO", "The HOMOs of both partners", "The LUMOs of both partners"],
    mols: ["1,2,4,5-Tetrazine"],
    explain: "With four nitrogens, tetrazine is an electron-poor diene with a very low LUMO. It interacts with the HOMO of a strained, electron-rich alkene. After addition, N₂ is lost, making it irreversible: a fast ligation usable inside living systems (bioorthogonal chemistry).",
  },
  'c4-4-02': {
    q: "Why is the Diels–Alder reaction strongly accelerated at high pressure (around 10 kbar)?",
    choices: ["Its activation volume is large and negative (the TS is smaller)", "High pressure freezes the solvent", "High pressure locks the diene s-trans", "High pressure makes the reaction more exothermic"],
    explain: "The transition state, in which two molecules merge into a ring, has a smaller volume than the reactants (ΔV‡ ≈ −30 to −40 cm³/mol). Pressure favors the smaller transition state.",
  },
  'c4-4-03': {
    q: "In the thermal (conrotatory) ring opening of a 3-alkoxycyclobutene, which way does the alkoxy group prefer to rotate? (torquoselectivity)",
    choices: ["Outward (E in the diene formed)", "Inward (Z position)", "Outward and inward 1:1", "Its direction doesn't depend on substituents"],
    explain: "Houk's torquoselectivity. Rotating outward lets a donor avoid an unfavorable interaction with the σ* of the breaking σ bond. Acceptors (such as CHO) can rotate inward. Size alone doesn't explain it.",
  },
  'c4-4-04': {
    q: "In the endiandric acid cascade (Black's hypothesis, Nicolaou's synthesis), which two electrocyclizations does the polyene undergo first?",
    choices: ["8π conrotatory → 6π disrotatory", "6π disrotatory → 8π conrotatory", "4π conrotatory → 6π conrotatory", "8π disrotatory → 6π conrotatory"],
    explain: "The conjugated tetraene (8π) closes conrotatorily on heating to a cyclooctatriene, then 6π disrotatory closure gives a bicyclo[4.2.0] skeleton, followed by an intramolecular Diels–Alder. That the natural products are found racemic is explained by these non-enzymatic thermal reactions.",
  },
  'c4-4-05': {
    q: "Bullvalene (C₁₀H₁₀) undergoes degenerate Cope rearrangements nonstop. About how many distinguishable arrangements of its atoms are there?",
    choices: ["About 1.2 million (10!/3)", "10", "About 3,600", "Infinitely many"],
    mols: ["Bullvalene"],
    explain: "Counting the 10 CH units as distinct gives 10! arrangements; dividing out those related by the molecule's threefold axis gives 10!/3 ≈ 1.2×10⁶. The rearrangement is so fast that at high temperature the ¹H NMR shows all 10 H's as a single signal.",
  },
  'c4-4-06': {
    q: "Deprotonating allyl benzyl ether at the benzylic position with n-BuLi triggers a [2,3]-Wittig rearrangement. What is the product?",
    choices: ["A homoallylic alcohol", "Allyl alcohol + toluene", "2-Phenyloxetane", "Benzaldehyde + propene"],
    mols: ["Allyl benzyl ether"],
    explain: "The benzylic carbanion attacks the terminal allyl carbon as the C–O bond breaks (a [2,3] sigmatropic shift via a five-membered transition state). It runs at low temperature, giving good control of alkene geometry and new stereocenters. The [1,2]-Wittig is a separate, radical-pair pathway.",
  },
  'c4-4-07': {
    q: "In alkene ozonolysis, what happens first (step one of the Criegee mechanism)?",
    choices: ["1,3-Dipolar cycloaddition of O₃ gives a primary ozonide", "Ozone abstracts a C–H hydrogen", "The alkene undergoes [2+2] photocycloaddition", "Two carbonyl oxides dimerize"],
    explain: "Ozone is a three-atom, 4π-electron 1,3-dipole. After [3+2] addition to the alkene (giving a 1,2,3-trioxolane), a retro-1,3-dipolar cycloaddition splits it into a carbonyl compound and a carbonyl oxide, which recombine the other way round into the secondary ozonide (1,2,4-trioxolane).",
  },
  'c4-4-08': {
    q: "Irradiating a mixture of benzophenone and 2-methylpropene (Paternò–Büchi reaction) gives what?",
    choices: ["An oxetane", "A cyclobutane", "An epoxide", "A 1,3-dioxolane"],
    mols: ["Benzophenone"],
    explain: "The oxygen of the excited carbonyl (n,π*) attaches to the alkene, and the ring closes via a 1,4-biradical. A [2+2] photocycloaddition of C=O with C=C that doesn't happen thermally.",
  },
  'c4-4-09': {
    q: "cis-Stilbene was irradiated with a little iodine in air (Mallory reaction). What is the product?",
    choices: ["Phenanthrene", "Anthracene", "Only trans-stilbene", "Biphenyl"],
    mols: ["cis-Stilbene"],
    explain: "Light closes the 6π (hexatriene) system conrotatorily to trans-4a,4b-dihydrophenanthrene, which iodine or oxygen oxidizes to aromatic phenanthrene. Under light, cis- and trans-stilbene also interconvert.",
  },
  'c4-4-10': {
    q: "Sunlight (UV-B) turns 7-dehydrocholesterol into previtamin D₃. Which step then converts it to vitamin D₃ at body temperature?",
    choices: ["A [1,7]-hydrogen shift (antarafacial sigmatropic)", "A 6π electrocyclic ring opening", "A suprafacial [1,5]-hydrogen shift", "A Diels–Alder reaction"],
    explain: "The light step is a 6π conrotatory ring opening (the B ring opens to give previtamin D₃). The thermal step that follows is an antarafacial [1,7] shift, with the hydrogen crossing to the opposite face of the twisted triene: thermally allowed.",
  },
  'c4-4-11': {
    q: "Singlet oxygen (¹O₂), made with rose bengal and light, undergoes a Schenck ene reaction with an alkene bearing allylic hydrogens. What is the product?",
    choices: ["An allylic hydroperoxide (C=C shifted)", "A vicinal 1,2-diol", "An epoxide of the alkene", "Two carboxylic acids by cleavage"],
    explain: "¹O₂ acts as the enophile, attaching to one end of the double bond while abstracting an allylic hydrogen (the double bond shifts by one). A pericyclic ene reaction. Reduction gives an allylic alcohol.",
  },
  'c4-4-12': {
    q: "What is the point group of ferrocene in its staggered conformation?",
    choices: ["D₅d", "D₅h", "C₅ᵥ", "D∞h"],
    explain: "In the staggered form, with the two cyclopentadienyl rings offset by 36°, there's an inversion center: D₅d. The eclipsed form is D₅h. In the gas phase, eclipsed is thought slightly more stable, and the barrier to ring rotation is tiny.",
  },
  'c4-4-13': {
    q: "What is the point group of fullerene C₆₀?",
    choices: ["Ih", "Oh", "Td", "D₆h"],
    explain: "Icosahedral symmetry: six C₅ axes, ten C₃ axes, fifteen C₂ axes, fifteen mirror planes and an inversion center (120 symmetry operations in all).",
  },
  'c4-4-14': {
    q: "Which point group belongs to molecules that are chiral?",
    choices: ["D₃", "D₃h", "C₃ᵥ", "S₆"],
    explain: "Chiral point groups contain only proper rotations (Cn, Dn, T, O, I). D₃h and C₃ᵥ contain mirror planes; S₆ contains an improper axis (and an inversion center). Tris(ethylenediamine)cobalt(III) is a D₃ example.",
  },
  'c4-4-15': {
    q: "Treating meso-2,3-dibromobutane with NaI/acetone removes the bromines by anti elimination. What alkene forms?",
    choices: ["(E)-2-Butene", "(Z)-2-Butene", "E and Z 1:1", "1-Butene"],
    mols: ["meso-2,3-Dibromobutane"],
    explain: "Elimination occurs from the conformer with the two Br's antiperiplanar. For the meso isomer, the two methyls are then anti as well, giving E. The (2R,3R) isomer gives Z. A stereospecific reaction.",
  },
  'c4-4-16': {
    q: "Which landmark asymmetric reaction uses the C₂-symmetric chiral ligand (R,R)-diethyl tartrate (L-(+)-DET)?",
    choices: ["Katsuki–Sharpless asymmetric epoxidation", "Sharpless asymmetric dihydroxylation", "Noyori asymmetric hydrogenation", "The CBS reduction"],
    mols: ["(R,R)-Diethyl tartrate"],
    explain: "Asymmetric epoxidation of allylic alcohols (Ti(Oi-Pr)₄, t-BuOOH). DET and the substrate bind to titanium, and DET's orientation selects which face receives the oxygen. (+)-DET and (−)-DET give epoxides of opposite faces. Nobel Prize in Chemistry, 2001.",
  },
  'c4-4-17': {
    q: "What is the point group of the diequatorial chair of (1R,2R)-trans-1,2-dimethylcyclohexane?",
    choices: ["C₂", "Cs", "C₂h", "C₁"],
    mols: ["(1R,2R)-trans-1,2-Dimethylcyclohexane"],
    explain: "It has a C₂ axis through the midpoints of the C1–C2 and C4–C5 bonds, but no mirror plane. A chair of the cis isomer is C₁, but fast ring flipping converts it to its mirror-image conformer, so the cis isomer is achiral overall.",
  },
  'c4-4-18': {
    q: "Preferential crystallization (seeding a supersaturated racemic solution with one enantiomer so that only it crystallizes first) works for which racemates?",
    choices: ["Those that form conglomerates", "Those that form racemic compounds", "Those that form solid solutions (pseudoracemates)", "Any racemate at all"],
    explain: "In a conglomerate, R and S crystals grow separately, and crystals matching the seed grow fastest. In a racemic compound R and S share one crystal, so this method can't separate them.",
  },
  'c4-4-19': {
    q: "Conglomerate crystals stirred with glass beads under conditions where the solution racemizes eventually all become one enantiomer. What is this phenomenon called?",
    choices: ["Viedma ripening", "Kinetic resolution", "Preferential crystallization", "Ostwald's rule of stages"],
    explain: "Crystals are ground and dissolve, racemize in solution, and recrystallize. Over many cycles, the slightly more abundant crystal form wins out. It is also discussed as a model for the origin of biological homochirality.",
  },
  'c4-4-20': {
    q: "In CIP nomenclature, what kind of stereocenter is labeled with lowercase r / s?",
    choices: ["A pseudoasymmetric center with an R and an S group", "A stereocenter whose priorities are hard to rank", "The configuration of an axially chiral molecule", "Any stereocenter within a racemic mixture"],
    explain: "For example C3 of 2,3,4-trihydroxyglutaric acid. Reflecting it just swaps the (R) and (S) groups, so the descriptor of that center doesn't change in the mirror image. Priority is set as R group > S group.",
  },
  'c4-4-21': {
    q: "An asymmetric catalyst made from a low-ee ligand can give product with higher ee than the ligand (a positive nonlinear effect). What is the usual explanation?",
    choices: ["Inert heterochiral dimers leave a higher-ee active catalyst", "The ligand resolves itself as the reaction runs", "The product is unusually resistant to racemization", "The reaction solvent itself is chiral"],
    explain: "Discovered by Kagan and co-workers, and known for diethylzinc additions to aldehydes (Noyori's DAIB). Depending on how the catalyst aggregates, ee can be “amplified” or “depleted.”",
  },
  'c4-4-22': {
    q: "Which is an example of asymmetric autocatalysis, where a tiny ee is amplified with each round to over 99%?",
    choices: ["iPr₂Zn addition to pyrimidine aldehydes (Soai reaction)", "Katsuki–Sharpless asymmetric epoxidation", "The proline-catalyzed asymmetric aldol", "A thermal Diels–Alder cycloaddition"],
    explain: "The pyrimidyl alkanol product (as its zinc alkoxide) catalyzes formation of more product with its own handedness. Even slight asymmetry such as circularly polarized light or quartz can set the ee, so it drew attention in debates on the origin of homochirality.",
  },
} });

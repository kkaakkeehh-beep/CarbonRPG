// =============================================================
// en-q1.js — 英語の問題：第 1 章（立体化学・SN1/SN2/E1/E2・転位）
// 問題の id ごとに、q・choices（日本語と同じ順）・explain・mols（構造式に添える名前）・cl
// =============================================================
I18N.add('en', { q: {
  // ---------------- Undergrad I ----------------
  'c1-1-01': {
    q: "What is the configuration of the stereocenter in this compound?",
    choices: ["R", "S", "Meso", "There is no stereocenter"],
    explain: "Priorities: Br > CH₂CH₃ > CH₃ > H. With H pointing away, Br → Et → Me runs clockwise, so it is R.",
  },
  'c1-1-02': {
    q: "Which of these compounds is chiral?",
    choices: ["2-Butanol", "2-Propanol", "3-Pentanol", "1-Butanol"],
    explain: "C2 of 2-butanol carries four different groups: H, OH, CH₃ and CH₂CH₃. C3 of 3-pentanol has two ethyl groups, so it is achiral.",
  },
  'c1-1-03': {
    q: "Which substrate undergoes SN2 fastest? (Same nucleophile and conditions.)",
    choices: ["CH₃Br", "CH₃CH₂Br", "(CH₃)₂CHBr", "(CH₃)₃CBr"],
    explain: "SN2 is a backside attack, so the less crowded the reacting carbon, the faster. Methyl > primary > secondary ≫ tertiary (tertiary barely reacts).",
  },
  'c1-1-04': {
    q: "Which substrate undergoes SN1 (solvolysis) in water fastest?",
    choices: ["(CH₃)₃CBr", "(CH₃)₂CHBr", "CH₃CH₂Br", "CH₃Br"],
    explain: "The rate-determining step of SN1 is carbocation formation. The tertiary cation, stabilized by hyperconjugation, forms most easily.",
  },
  'c1-1-05': {
    q: "Which is the best leaving group?",
    choices: ["I⁻", "Cl⁻", "F⁻", "HO⁻"],
    explain: "Good leaving groups are weak bases. HI is the strongest acid, so its conjugate base I⁻ leaves most readily. HO⁻ is a strong base and a poor leaving group.",
  },
  'c1-1-06': {
    q: "Which solvent makes the SN2 reaction of NaN₃ with 1-bromobutane go fastest?",
    choices: ["DMSO", "Methanol", "Water", "Hexane"],
    mols: ["1-Bromobutane"],
    explain: "Polar aprotic solvents (DMSO, DMF, …) solvate cations well but don't wrap anions in hydrogen bonds. The “naked” N₃⁻ becomes much more nucleophilic.",
  },
  'c1-1-07': {
    q: "(R)-2-Bromobutane was treated with NaN₃ in DMF. What is the major product?",
    choices: ["(S)-2-Azidobutane", "(R)-2-Azidobutane", "Racemic 2-azidobutane", "No reaction"],
    cl: ["", "", "racemic", ""],
    explain: "SN2 is a backside attack, so the configuration inverts (Walden inversion). Both Br and N₃ are priority 1, so the descriptor also changes from R to S.",
  },
  'c1-1-08': {
    q: "Optically active (R)-3-bromo-3-methylhexane was solvolyzed in water. What alcohol forms?",
    choices: ["Nearly racemic", "Complete retention", "Complete inversion", "No reaction"],
    mols: ["(R)-3-Bromo-3-methylhexane"],
    explain: "The reaction goes through a planar carbocation, so water can attack from either face. In practice the leaving group is still nearby as an ion pair, so the inverted product is often slightly favored.",
  },
  'c1-1-09': {
    q: "2-Bromobutane was heated with NaOEt / EtOH. What is the major alkene?",
    choices: ["(E)-2-Butene", "(Z)-2-Butene", "1-Butene", "Butane"],
    mols: ["2-Bromobutane"],
    explain: "By Zaitsev's rule the more substituted alkene (2-butene) dominates, and of those, the less hindered E isomer is favored.",
  },
  'c1-1-10': {
    q: "What is the rate law of an SN2 reaction?",
    choices: ["v = k[RX][Nu⁻]", "v = k[RX]", "v = k[Nu⁻]", "v = k[RX]²"],
    explain: "Substrate and nucleophile collide in a single bimolecular step, so the rate is first order in each. For SN1, v = k[RX].",
  },

  // ---------------- Undergrad II ----------------
  'c1-2-01': {
    q: "This compound was treated with t-BuOK / t-BuOH. What is the major product?",
    choices: ["2-Methyl-1-butene", "2-Methyl-2-butene", "2-(tert-Butoxy)-2-methylbutane", "3-Methyl-1-butene"],
    explain: "Bulky t-BuO⁻ can't reach the crowded internal β-H, so it removes an H from the outer CH₃ (the Hofmann product, about 72%). With EtO⁻, 2-methyl-2-butene dominates (about 70%).",
  },
  'c1-2-02': {
    q: "To make tert-butyl methyl ether by Williamson synthesis, which combination is right?",
    choices: ["t-BuOK + CH₃I", "CH₃ONa + t-BuBr", "CH₃OH + t-BuOH", "CH₃ONa + t-BuOH"],
    mols: ["tert-Butyl methyl ether"],
    explain: "SN2 doesn't happen at a tertiary carbon. CH₃ONa + t-BuBr gives isobutene by E2. Put the bulk on the alkoxide and use a methyl halide.",
  },
  'c1-2-03': {
    q: "3-Methyl-2-butanol was treated with concentrated HBr. What is the major product?",
    choices: ["2-Bromo-2-methylbutane", "2-Bromo-3-methylbutane", "1-Bromo-3-methylbutane", "2-Methyl-2-butene"],
    explain: "The secondary cation undergoes a 1,2-hydride shift to the more stable tertiary cation, which is then captured by Br⁻. To avoid rearrangement, use PBr₃ (SN2).",
  },
  'c1-2-04': {
    q: "2-Bromopropane was treated with NaOEt in EtOH. Which pathway mainly operates?",
    choices: ["E2", "SN2", "SN1", "E1"],
    mols: ["2-Bromopropane"],
    explain: "Secondary substrate + strong base favors E2 (about 80% propene, 20% ether). For substitution, use a weakly basic nucleophile such as N₃⁻ or RS⁻.",
  },
  'c1-2-05': {
    q: "For E2 in a cyclohexane ring, how must the leaving group and the β-H be arranged?",
    choices: ["Both axial (trans-diaxial)", "Both equatorial", "Leaving group axial, β-H equatorial", "The arrangement doesn't matter"],
    explain: "E2 needs an antiperiplanar arrangement (180° dihedral). In a chair cyclohexane, only trans-diaxial satisfies this.",
  },
  'c1-2-06': {
    q: "Why is the Finkelstein reaction (R–Br + NaI → R–I) run in acetone?",
    choices: ["NaBr precipitates, pulling the equilibrium over", "Acetone acts as the nucleophile toward R–Br", "NaI is insoluble in acetone and stays solid", "Acetone suppresses the competing E2 pathway"],
    explain: "NaI dissolves in acetone, but NaBr and NaCl don't. The salt byproduct leaves the solution as a precipitate, so by Le Chatelier's principle the reaction goes to completion.",
  },
  'c1-2-07': {
    q: "(R)-2-Butanol was treated with TsCl / pyridine, then with NaN₃ / DMF. What is the product?",
    choices: ["(S)-2-Azidobutane", "(R)-2-Azidobutane", "Racemic 2-azidobutane", "2-Butene"],
    explain: "Tosylation only forms an O–S bond; the C–O bond isn't broken (retention). The following SN2 inverts it. Retention + inversion = inversion.",
  },
  'c1-2-08': {
    q: "Which halide ion is the most nucleophilic in methanol?",
    choices: ["I⁻", "Br⁻", "Cl⁻", "F⁻"],
    explain: "In protic solvents, small, charge-dense F⁻ is held tightest by hydrogen bonds. Large, polarizable I⁻ is the most nucleophilic.",
  },
  'c1-2-09': {
    q: "Why is the SN2 reaction of 1-bromo-2,2-dimethylpropane (neopentyl bromide) extremely slow?",
    choices: ["The β tert-butyl group blocks backside attack", "It is actually a tertiary alkyl halide", "Its carbocation is far too stable to react", "Bromide is a poor leaving group here"],
    explain: "Neopentyl bromide is primary, but the next carbon carries three methyl groups. They block the nucleophile's path to the back of the C–Br bond.",
  },
  'c1-2-10': {
    q: "(S)-2-Butanol was treated with PBr₃. What is the product?",
    choices: ["(R)-2-Bromobutane", "(S)-2-Bromobutane", "Racemic 2-bromobutane", "2-Bromo-2-methylpropane"],
    cl: ["", "", "racemic", ""],
    explain: "The OH is activated as O–PBr₂ and Br⁻ attacks from the back (SN2). The configuration inverts, and since no carbocation forms, there is no rearrangement.",
  },

  // ---------------- Grad Entrance Exam ----------------
  'c1-3-01': {
    q: "Optically active 2-iodooctane was placed in acetone containing radioactive Na¹²⁸I. How does the rate of racemization compare with the rate of radioiodine uptake?",
    choices: ["Twice as fast", "Equal", "Half as fast", "Unrelated"],
    mols: ["2-Iodooctane"],
    explain: "The experiment of Hughes and co-workers. Each substitution inverts one molecule, which then cancels the rotation of one unreacted molecule, so rotation is lost two molecules at a time. Hence twice the rate: proof that every substitution inverts (SN2).",
  },
  'c1-3-02': {
    q: "Which halide ion is the most nucleophilic in DMSO?",
    choices: ["F⁻", "Cl⁻", "Br⁻", "I⁻"],
    explain: "In aprotic solvents anions aren't wrapped in hydrogen bonds, so the more basic F⁻ is the strongest. The order is the reverse of that in protic solvents.",
  },
  'c1-3-03': {
    q: "Menthyl chloride was subjected to E2 elimination with NaOEt / EtOH. What forms?",
    choices: ["Only 2-menthene", "Only 3-menthene", "75% 3-menthene / 25% 2-menthene", "No reaction"],
    mols: ["Menthyl chloride"],
    explain: "In the chair with Cl axial, menthyl chloride has an antiperiplanar β-H only on the C2 side. So, against Zaitsev's rule, only 2-menthene forms. Neomenthyl chloride gives mainly 3-menthene.",
  },
  'c1-3-04': {
    q: "trans-2-Acetoxycyclohexyl tosylate was solvolyzed in acetic acid. What is the major product?",
    choices: ["trans-1,2-Diacetoxycyclohexane (racemic)", "cis-1,2-Diacetoxycyclohexane", "Cyclohexene", "No reaction"],
    mols: ["trans-2-Acetoxycyclohexyl tosylate"],
    explain: "The neighboring acetoxy group attacks from the back to form an acetoxonium ion (first inversion), which AcOH then attacks (second inversion). Net result: the trans isomer with retention. Far faster than the cis isomer (Winstein).",
  },
  'c1-3-05': {
    q: "4-Hydroxy-4-methyl-2-pentanone (diacetone alcohol) was dehydrated under basic conditions. What is the mechanism?",
    choices: ["E1cB", "E2", "E1", "SN1"],
    explain: "The α-H of the carbonyl is removed to give an enolate (the conjugate base), which then expels HO⁻. HO⁻ is a poor leaving group, but the reaction proceeds because a stable conjugated enone forms.",
  },
  'c1-3-06': {
    q: "The E2 rate of (CD₃)₂CHBr was about 1/7 that of (CH₃)₂CHBr. What does this show?",
    choices: ["C–H cleavage occurs in the rate-determining step", "A carbocation is formed as an intermediate", "Only C–Br cleavage is rate-determining", "The reaction is really proceeding by SN2"],
    explain: "A primary kinetic isotope effect (kH/kD ≈ 6.7). The β-H is removed in the rate-determining step, evidence for a concerted E2.",
  },
  'c1-3-07': {
    q: "Which is the best leaving group?",
    choices: ["TfO⁻ (triflate)", "TsO⁻ (tosylate)", "MsO⁻ (mesylate)", "I⁻"],
    explain: "TfOH is a superacid; the strongly electron-withdrawing CF₃ group stabilizes the negative charge of TfO⁻. Roughly TfO⁻ ≫ TsO⁻ ≈ MsO⁻ > I⁻.",
  },
  'c1-3-08': {
    q: "3-Chloro-1-butene and 1-chloro-2-butene were each solvolyzed in water. What happens?",
    choices: ["Both give alcohol mixtures in nearly the same ratio", "Each gives only the product with Cl replaced by OH", "Only 3-chloro-1-butene reacts", "Both give only 1,3-butadiene"],
    mols: ["3-Chloro-1-butene", "1-Chloro-2-butene"],
    explain: "Both go through the same allyl cation (positive charge shared by both ends through resonance). Water can attack either end, so the same mixture forms whichever starting material you use.",
  },
  'c1-3-09': {
    q: "(R)-2-Octanol underwent a Mitsunobu reaction with PPh₃ / DEAD / p-nitrobenzoic acid, and the ester was hydrolyzed. What alcohol is obtained?",
    choices: ["(S)-2-Octanol", "(R)-2-Octanol", "Racemic 2-octanol", "2-Octanone"],
    explain: "The carboxylate attacks the alkoxyphosphonium from the back, so the esterification step inverts. Hydrolysis cleaves the acyl–oxygen bond, so it retains configuration. Overall: inversion.",
  },
  'c1-3-10': {
    q: "Two rapidly interconverting conformers each give a different product. What determines the product ratio?",
    choices: ["The free-energy gap between the two transition states", "The population ratio of the two conformers", "The relative stability of the two products", "How fast the two conformers interconvert"],
    explain: "The Curtin–Hammett principle. When conformers interconvert much faster than they react, the product ratio depends only on the energy difference between the transition states, not on the conformer populations.",
  },

  // ---------------- PhD (Brutal) ----------------
  'c1-4-01': {
    q: "Optically active exo-2-norbornyl brosylate was solvolyzed in acetic acid. What forms?",
    choices: ["Racemic exo-2-norbornyl acetate", "Optically active exo-2-norbornyl acetate", "endo-2-Norbornyl acetate", "Racemic endo-2-norbornyl acetate"],
    mols: ["exo-2-Norbornyl brosylate"],
    explain: "Winstein's experiment. The exo isomer reacts about 350 times faster than the endo, and gives only racemic exo product. This was taken as evidence for a symmetric nonclassical cation with σ participation of the C1–C6 bond (the stage for a long debate with Brown).",
  },
  'c1-4-02': {
    q: "In the Grunwald–Winstein equation log(k/k₀) = mY, which reference substrate is defined to have m = 1?",
    choices: ["tert-Butyl chloride", "Methyl bromide", "2-Adamantyl tosylate", "Benzyl chloride"],
    explain: "Solvent ionizing power Y is defined from the solvolysis rate of t-BuCl, relative to 80% ethanol. Later scales such as Y_OTs used 2-adamantyl substrates, which have no nucleophilic solvent participation.",
  },
  'c1-4-03': {
    q: "Replacing the H at the reacting carbon (α) with D gave kH/kD ≈ 1.2. Which reaction fits best?",
    choices: ["SN1 (sp³ → sp² in the rate-determining step)", "SN2 (pentacoordinate transition state)", "E2 (β-H breaks in the rate-determining step)", "Radical hydrogen abstraction"],
    explain: "A secondary α-deuterium isotope effect. As the carbon approaches sp² during cation formation, the out-of-plane bending vibration loosens, giving kH/kD of about 1.1–1.25. For SN2 it is close to 1 (0.95–1.05).",
  },
  'c1-4-04': {
    q: "Cyclopropylmethyl chloride was solvolyzed in water. What are the main products?",
    choices: ["Cyclopropylmethanol and cyclobutanol (~1:1), a little 3-buten-1-ol", "Cyclopropylmethanol only, with no ring-expanded product", "3-Buten-1-ol only, from ring opening of the cation", "Cyclobutanol only, from complete ring expansion"],
    mols: ["Cyclopropylmethyl chloride"],
    explain: "The cyclopropylmethyl, cyclobutyl and homoallyl cations interconvert rapidly (Roberts). A cyclopropyl group strongly stabilizes an adjacent cation, so the reaction itself is also very fast.",
  },
  'c1-4-05': {
    q: "In Winstein's “special salt effect,” what was a small amount of LiClO₄ thought to trap?",
    choices: ["The solvent-separated ion pair", "The contact ion pair", "The free carbocation", "The substrate molecule itself"],
    explain: "LiClO₄ exchanges with the leaving group of the solvent-separated ion pair, stopping its return to the starting substrate (external ion-pair return). Solvolysis then speeds up sharply.",
  },
  'c1-4-06': {
    q: "What is the stereochemistry of the Cope elimination of a heated amine oxide?",
    choices: ["Syn elimination (5-membered cyclic transition state)", "Anti elimination (antiperiplanar)", "Not stereospecific", "Both stereochemistries equally, as in E1"],
    explain: "An intramolecular (Ei) elimination: the N–O⁻ oxygen removes a β-H on the same side. Ester pyrolysis (6-membered ring) and the Chugaev reaction are also syn eliminations.",
  },
  'c1-4-07': {
    q: "Taking ethyl bromide as 1, what is the approximate relative SN2 rate of neopentyl bromide?",
    choices: ["10⁻⁵", "10⁻¹", "10⁻²", "10"],
    mols: ["Ethyl bromide", "Neopentyl bromide"],
    explain: "Roughly: methyl ≈ 30, ethyl 1, isopropyl ≈ 0.02, neopentyl ≈ 10⁻⁵. Though primary, it is far slower than a secondary halide.",
  },
  'c1-4-08': {
    q: "Which compound did Walden use when he discovered stereochemical inversion (the Walden inversion)?",
    choices: ["Malic acid", "Tartaric acid", "Lactic acid", "Glyceraldehyde"],
    explain: "In 1896, (−)-malic acid was converted to chlorosuccinic acid with PCl₅, and back with Ag₂O and water, giving (+)-malic acid. It showed that the route can swap the configuration.",
  },
  'c1-4-09': {
    q: "Why could Pasteur sort crystals of racemic sodium ammonium tartrate into right- and left-handed forms with tweezers?",
    choices: ["Below a certain temperature, R and S crystallize separately (a conglomerate)", "R and S pack together in a regular way within one crystal", "Only one enantiomer crystallized; the other stayed in solution", "The right- and left-handed crystals differed in color"],
    explain: "Most racemates form a “racemic compound” with R and S in the same crystal. This salt forms a conglomerate at low temperature, and the crystal shapes show right- and left-handedness (hemihedral faces). A discovery helped by good luck.",
  },
  'c1-4-10': {
    q: "For SN2 between a neutral substrate and an anionic nucleophile (R–Br + N₃⁻), what usually happens to the rate in a more polar protic solvent?",
    choices: ["It decreases", "It increases", "It doesn't change", "It switches to SN1 and speeds up"],
    explain: "The Hughes–Ingold solvent rules. In the reactants the charge is concentrated on N₃⁻; in the transition state it is spread out. A more polar solvent stabilizes the anionic reactant more, raising the activation energy.",
  },

  // ---------------- Undergrad I (more) ----------------
  'c1-1-11': {
    q: "What is the specific rotation of meso-tartaric acid?",
    choices: ["0°", "+12°", "−12°", "It varies from molecule to molecule"],
    mols: ["meso-Tartaric acid"],
    explain: "It has two stereocenters but an internal plane of symmetry, so it is achiral and does not rotate plane-polarized light.",
  },
  'c1-1-12': {
    q: "Which value differs between (R)-2-butanol and (S)-2-butanol?",
    choices: ["The sign of the specific rotation", "The boiling point at 1 atm", "The density at 20 °C", "The solubility in water"],
    mols: ["(R)-2-Butanol", "(S)-2-Butanol"],
    explain: "In an achiral environment, enantiomers share almost every physical property. Only their interaction with polarized (chiral) light is reversed, so their rotations have opposite signs.",
  },
  'c1-1-13': {
    q: "What is the enantiomeric excess (ee) of a mixture of 75% (R) and 25% (S)?",
    choices: ["50%", "75%", "25%", "100%"],
    explain: "ee = |R − S| / (R + S) = (75 − 25) / 100 = 50%. A racemate is 0%; a single pure enantiomer is 100%.",
  },
  'c1-1-14': {
    q: "How many stereoisomers does 2,3-dibromobutane have in total?",
    choices: ["3", "4", "2", "1"],
    mols: ["2,3-Dibromobutane"],
    explain: "Two stereocenters allow at most 2² = 4, but (2R,3S) and (2S,3R) are the same meso compound with a plane of symmetry. So: (2R,3R), (2S,3S) and the meso form, three in all.",
  },
  'c1-1-15': {
    q: "How are (2R,3R)-2,3-dibromopentane and (2R,3S)-2,3-dibromopentane related?",
    choices: ["Diastereomers", "Enantiomers", "The same compound", "Constitutional isomers"],
    mols: ["(2R,3R)-2,3-Dibromopentane", "(2R,3S)-2,3-Dibromopentane"],
    explain: "Only one stereocenter differs. If all are inverted they are enantiomers; if only some, diastereomers. Pentane has different ends, so neither is meso.",
  },
  'c1-1-16': {
    q: "Which carbocation is the most stable?",
    choices: ["(CH₃)₃C⁺", "(CH₃)₂CH⁺", "CH₃CH₂⁺", "CH₃⁺"],
    explain: "Hyperconjugation from neighboring C–H bonds (and induction) means more alkyl groups give more stability: tertiary > secondary > primary > methyl.",
  },
  'c1-1-17': {
    q: "In an SN1 reaction, what happens to the rate if you double the nucleophile concentration?",
    choices: ["No change", "It doubles", "It quadruples", "It halves"],
    explain: "The rate-determining step of SN1 is just ionization of the substrate, so v = k[RX]. The nucleophile reacts after that step.",
  },
  'c1-1-18': {
    q: "What is the intermediate in an SN1 reaction?",
    choices: ["A carbocation", "A carbanion", "A radical", "A pentacoordinate carbon"],
    explain: "The leaving group departs first, giving a planar carbocation. The pentacoordinate structure is the SN2 transition state, not an intermediate.",
  },
  'c1-1-19': {
    q: "Which is a strong base but a weak nucleophile?",
    choices: ["t-BuOK", "NaI", "NaN₃", "NaSMe"],
    explain: "t-BuO⁻ is bulky and can't get close to carbon, so it is a poor nucleophile. It can still pluck off a small H, so it is used as a base for E2 eliminations.",
  },
  'c1-1-20': {
    q: "Which of these is a protic solvent?",
    choices: ["Ethanol", "DMSO", "Acetone", "DMF"],
    explain: "Protic solvents have O–H or N–H bonds and can donate protons in hydrogen bonds. DMSO, acetone and DMF are polar but aprotic.",
  },

  // ---------------- Undergrad II (more) ----------------
  'c1-2-11': {
    q: "What is the configuration of the stereocenter of D-glyceraldehyde?",
    choices: ["R", "S", "Meso", "There is no stereocenter"],
    explain: "Priorities: OH > CHO > CH₂OH > H. D-Glyceraldehyde is (R). D/L (the direction of the OH in a Fischer projection) and R/S are defined differently and don't always agree.",
  },
  'c1-2-12': {
    q: "In the stable chair conformation of trans-1,2-dimethylcyclohexane, the two methyl groups are…",
    choices: ["Both equatorial", "Both axial", "One axial, one equatorial", "Both conformers are equally stable"],
    mols: ["trans-1,2-Dimethylcyclohexane"],
    explain: "The trans-1,2 isomer can be diequatorial or diaxial. The diequatorial form, free of 1,3-diaxial interactions, is more stable.",
  },
  'c1-2-13': {
    q: "Which undergoes E2 elimination with NaOEt faster?",
    choices: ["cis-1-tert-Butyl-4-chlorocyclohexane", "trans-1-tert-Butyl-4-chlorocyclohexane", "Both at the same rate", "Neither undergoes E2"],
    explain: "The t-Bu group is locked almost entirely equatorial. In the cis isomer, Cl is then axial and can be trans-diaxial to a β-H. In the trans isomer Cl is equatorial, and E2 is very slow.",
  },
  'c1-2-14': {
    q: "Which reacts quickly by both SN1 and SN2?",
    choices: ["Benzyl bromide", "Neopentyl bromide", "Bromobenzene", "2-Bromo-2-methylpropane"],
    explain: "The benzylic carbon is primary with an open back side, so SN2 is fast; the cation is also resonance-stabilized by the benzene ring, so SN1 is fast too.",
  },
  'c1-2-15': {
    q: "What is the main reason bromobenzene doesn't undergo SN2 with NaOH?",
    choices: ["The ring blocks the back, and the sp² C–Br bond is strong", "Bromide is a poor leaving group from any carbon", "NaOH is too weak a base to react with an aryl halide", "The phenol product is unstable and reverts at once"],
    mols: ["Bromobenzene"],
    explain: "A backside attack would have to pass through the ring. The sp² C–Br bond is short and strong, and the phenyl cation is unstable, so SN1 doesn't happen either.",
  },
  'c1-2-16': {
    q: "Why does E2 of 2-bromobutane give more (E)-2-butene than (Z)-2-butene?",
    choices: ["The antiperiplanar conformer with the methyls anti is more stable", "The (Z) isomer forms first, then isomerizes to (E)", "The base selectively destroys the (Z) isomer", "The reaction actually proceeds by an E1 pathway"],
    mols: ["2-Bromobutane"],
    explain: "There are two conformers with H and Br antiperiplanar; they differ in whether the methyls are gauche or anti. The less strained anti conformer gives the E isomer.",
  },
  'c1-2-17': {
    q: "HBr was added to 2-methylpropene. What is the major product?",
    choices: ["2-Bromo-2-methylpropane", "1-Bromo-2-methylpropane", "2-Methylpropane", "1,2-Dibromo-2-methylpropane"],
    explain: "H⁺ adds to the terminal CH₂ to give the more stable tertiary cation (Markovnikov's rule), which Br⁻ then captures.",
  },
  'c1-2-18': {
    q: "(S)-2-Octanol was treated with SOCl₂ / pyridine. What is the product?",
    choices: ["(R)-2-Chlorooctane", "(S)-2-Chlorooctane", "Racemic 2-chlorooctane", "2-Octene"],
    explain: "After the chlorosulfite forms, the Cl⁻ released with pyridine attacks from the back (SN2, inversion). Without pyridine, Cl can be delivered intramolecularly (SNi), sometimes with retention.",
  },
  'c1-2-19': {
    q: "3,3-Dimethyl-2-butanol was treated with HBr. What is the major product?",
    choices: ["2-Bromo-2,3-dimethylbutane", "2-Bromo-3,3-dimethylbutane", "1-Bromo-3,3-dimethylbutane", "3,3-Dimethyl-1-butene"],
    explain: "Next to the secondary cation there is no hydrogen, only methyl groups. A 1,2-methyl shift gives a tertiary cation, which Br⁻ then captures.",
  },
  'c1-2-20': {
    q: "How do you turn an alcohol's OH into a good leaving group without changing the stereochemistry?",
    choices: ["TsCl / pyridine", "PBr₃", "Concentrated HBr", "SOCl₂ / pyridine"],
    explain: "Tosylation only forms an O–S bond; the C–O bond stays intact. PBr₃ and SOCl₂/pyridine go on to substitute with inversion, and HBr goes via a cation that can racemize or rearrange.",
  },

  // ---------------- Grad Entrance Exam (more) ----------------
  'c1-3-11': {
    q: "meso-1,2-Dibromo-1,2-diphenylethane underwent E2 with KOH (1 equiv). What is the major product?",
    choices: ["(E)-1-Bromo-1,2-diphenylethene", "(Z)-1-Bromo-1,2-diphenylethene", "A 1:1 mixture of (E) and (Z)", "Diphenylacetylene"],
    mols: ["meso-1,2-Dibromo-1,2-diphenylethane"],
    explain: "Eliminating from the conformer with H and Br antiperiplanar puts the two phenyl groups on the same side. By CIP priority, Br and the Ph on the other carbon end up on opposite sides, so it is E. The racemate gives the Z isomer.",
  },
  'c1-3-12': {
    q: "According to Hammond's postulate, what does the transition state of the rate-determining step of SN1 (ionization) resemble?",
    choices: ["The carbocation intermediate", "The starting material", "The final product", "The SN2 transition state"],
    explain: "Ionization is strongly endothermic, so the transition state resembles the species closest in energy: the carbocation. That's why anything that stabilizes the cation speeds up the reaction.",
  },
  'c1-3-13': {
    q: "In SN1 solvolysis, why is racemization often incomplete, with slightly more inversion?",
    choices: ["The leaving group still shields one face (ion pair)", "The carbocation is pyramidal rather than planar", "Part of the substrate reacts by E2 instead", "The solvent itself is optically active"],
    explain: "Right after ionization, the leaving group is still next to the cation (a contact ion pair). The solvent attacks more easily from the open side, so inversion is slightly favored.",
  },
  'c1-3-14': {
    q: "Why does 1-bromobicyclo[2.2.1]heptane (1-norbornyl bromide) react extremely slowly by both SN1 and SN2?",
    choices: ["A bridgehead cation can't be planar, and the cage blocks the back", "The bromine sits on an unreactive primary carbon", "The molecule is too nonpolar to dissolve in the solvent", "The bridgehead C–Br bond is so weak that it just reverts"],
    mols: ["1-Bromobicyclo[2.2.1]heptane"],
    explain: "Cations prefer a planar sp² geometry, but the bridgehead is locked in a cage and can't flatten. The back side faces the inside of the cage, so a nucleophile can't get in either.",
  },
  'c1-3-15': {
    q: "2-Butyltrimethylammonium iodide was treated with Ag₂O and heated (Hofmann elimination). What is the major product?",
    choices: ["1-Butene", "(E)-2-Butene", "(Z)-2-Butene", "2-Butanol"],
    mols: ["2-Butyltrimethylammonium iodide"],
    explain: "The NMe₃⁺ leaving group is large and leaves reluctantly. The transition state is carbanion-like, so the more acidic (less substituted) CH₃ hydrogen is removed. This is where Hofmann's rule gets its name.",
  },
  'c1-3-16': {
    q: "2-Fluorohexane underwent elimination with NaOMe / MeOH. What is the major product?",
    choices: ["1-Hexene", "(E)-2-Hexene", "(Z)-2-Hexene", "2-Methoxyhexane"],
    mols: ["2-Fluorohexane"],
    explain: "F⁻ is a poor leaving group, so the C–F bond is slow to break and the transition state is carbanion-like (toward E1cB). The more acidic terminal H is removed, and the Hofmann product dominates (about 70%). 2-Iodohexane gives mainly the Zaitsev product.",
  },
  'c1-3-17': {
    q: "Why does 2-chloroethyl ethyl sulfide hydrolyze orders of magnitude faster than an ordinary primary chloride?",
    choices: ["Sulfur attacks from next door to form an episulfonium ion", "Its C–Cl bond is unusually weak", "A tertiary cation forms", "Water coordinates to sulfur and becomes more nucleophilic"],
    mols: ["2-Chloroethyl ethyl sulfide"],
    explain: "A sulfur lone pair pushes out Cl intramolecularly, forming a three-membered episulfonium ion, which water then attacks. This reactivity is also behind the toxicity of mustard gas.",
  },
  'c1-3-18': {
    q: "HOO⁻ is less basic than HO⁻, yet more nucleophilic. What is this phenomenon called?",
    choices: ["The α-effect", "Hammond's postulate", "A solvation effect", "The Curtin–Hammett principle"],
    explain: "A nucleophile with a lone-pair-bearing atom next to it (at the α position) is more nucleophilic than its basicity predicts. Hydrazine, hydroxylamine and ClO⁻ show it too.",
  },
  'c1-3-19': {
    q: "trans-2-Methylcyclohexyl tosylate underwent E2 with NaOEt. What is the major product?",
    choices: ["3-Methylcyclohexene", "1-Methylcyclohexene", "Methylenecyclohexane", "A 1:1 mixture of 1- and 3-methylcyclohexene"],
    mols: ["trans-2-Methylcyclohexyl tosylate"],
    explain: "When OTs is axial, the methyl is axial too (trans-1,2-diaxial), so C2 has no antiperiplanar H. Only the axial H on C6 can be used, giving 3-methylcyclohexene against Zaitsev's rule.",
  },
  'c1-3-20': {
    q: "What is the geometry of the central carbon in the SN2 transition state?",
    choices: ["Trigonal bipyramidal (nucleophile and leaving group at 180°)", "Tetrahedral", "Trigonal planar (nucleophile and leaving group both far away)", "Square pyramidal"],
    explain: "The three substituents lie in a plane, with the incoming nucleophile and departing leaving group partially bonded above and below. The configuration flips like an umbrella turning inside out.",
  },

  // ---------------- PhD (Brutal, more) ----------------
  'c1-4-11': {
    q: "In 2013, which technique directly showed that the 2-norbornyl cation has a nonclassical (bridged) structure?",
    choices: ["Low-temperature X-ray crystallography", "Optical rotation", "Mass spectrometry", "UV–vis absorption spectroscopy"],
    explain: "Scholz and co-workers solved a single crystal of the [Al₂Br₇]⁻ salt at about 40 K and saw the symmetric bridged structure. Before that, Olah's NMR studies in superacid had given strong evidence.",
  },
  'c1-4-12': {
    q: "In the extended Grunwald–Winstein equation log(k/k₀) = lN + mY, what does the coefficient l represent?",
    choices: ["Sensitivity to solvent nucleophilicity", "Sensitivity to solvent ionizing power", "The ability of the leaving group to leave", "Temperature dependence"],
    explain: "N is solvent nucleophilicity and Y ionizing power. A large l means nucleophilic solvent participation (SN2-like); a large m means ionization matters most (SN1-like).",
  },
  'c1-4-13': {
    q: "In the Swain–Scott equation log(k/k₀) = sn, which nucleophile is defined to have n = 0?",
    choices: ["Water", "Iodide ion", "Methanol", "Hydroxide ion"],
    explain: "Using reactions with methyl bromide (s = 1) in water at 25 °C, each nucleophile's n was set relative to water (n = 0).",
  },
  'c1-4-14': {
    q: "In Mayr's equation log k(20 °C) = s_N(N + E), what does E represent?",
    choices: ["The electrophilicity of the electrophile", "The nucleophilicity of the nucleophile", "The activation energy", "The ionizing power of the solvent"],
    explain: "N and s_N are parameters of the nucleophile (and solvent); E belongs to the electrophile. Combining them estimates rate constants for a huge range of polar reactions.",
  },
  'c1-4-15': {
    q: "cis-4-tert-Butylcyclohexyl tosylate solvolyzes faster than the trans isomer. What is the main reason?",
    choices: ["Ionization relieves the axial OTs of 1,3-diaxial strain", "The cis C–O bond is stronger", "The trans isomer only undergoes E2", "The cis isomer forms a tertiary carbocation"],
    mols: ["cis-4-tert-Butylcyclohexyl tosylate", "trans isomer"],
    explain: "In the cis isomer, t-Bu is locked equatorial and OTs is forced axial. That ground-state strain is released on ionization, giving steric acceleration (a few-fold).",
  },
  'c1-4-16': {
    q: "In an allylic halide, the nucleophile attacks the far end of the double bond, the double bond shifts, and the leaving group departs. What is this reaction called?",
    choices: ["SN2′", "SN1", "SNi", "E1cB"],
    explain: "A concerted substitution with allylic transposition. Organocopper reagents and others can make it selective, and its syn/anti stereochemistry is also studied.",
  },
  'c1-4-17': {
    q: "What do you call the diagram that plots the E2 transition state on two axes: progress of C–H cleavage and progress of C–X cleavage?",
    choices: ["A More O’Ferrall–Jencks diagram", "A Hammett ρσ plot", "An Eyring activation plot", "A Walden inversion cycle"],
    explain: "Reactants sit at the bottom left and products at the top right; the other two corners are E1 (cation) and E1cB (anion). Which side of the diagonal the transition state lies on tells you whether it is E1-like or E1cB-like.",
  },
  'c1-4-18': {
    q: "Optically active threo-3-phenyl-2-butyl tosylate was solvolyzed in acetic acid. What forms?",
    choices: ["Racemic threo acetate", "Optically active threo acetate", "erythro acetate", "Optically active erythro acetate"],
    mols: ["threo-3-Phenyl-2-butyl tosylate"],
    explain: "Cram's experiment. The neighboring phenyl participates to form a phenonium ion. The phenonium ion from the threo isomer has a mirror plane and is achiral, so attack at either carbon gives racemic threo product. The erythro isomer gives erythro product with retention.",
  },
  'c1-4-19': {
    q: "During solvolysis of a carboxylic ester, carbonyl ¹⁸O in the unreacted ester scrambles into the ether oxygen. What does this show?",
    choices: ["Internal return from a contact ion pair", "Direct SN2 attack by the solvent", "Reaction by acyl–oxygen cleavage", "A radical mechanism"],
    explain: "After ionization, the two oxygens of the carboxylate become equivalent. If the contact ion pair recombines, the original ether and carbonyl oxygens swap places (work of Goering and co-workers).",
  },
  'c1-4-20': {
    q: "Which reaction was used to define Brown's σ⁺ substituent constants?",
    choices: ["Solvolysis of substituted cumyl chlorides", "Ionization of substituted benzoic acids", "Ionization of substituted phenols", "Cyanide addition to substituted benzaldehydes"],
    explain: "Solvolysis of 2-aryl-2-chloropropanes in 90% aqueous acetone forms benzylic cations in which the positive charge conjugates directly with the substituent. σ⁺ was defined from those rates (ρ ≈ −4.5).",
  },

  // ---------------- Identify the structure ----------------
  'c1-1-21': {
    q: "Which one is (S)-2-butanol?",
    choices: ["(S)-2-Butanol", "(R)-2-Butanol", "(S)-2-Pentanol", "1-Butanol"],
    explain: "Priorities: OH > CH₂CH₃ > CH₃ > H. With H pointing away, OH → Et → Me counterclockwise means S. Check the carbon count too (2-pentanol has five carbons).",
  },
  'c1-2-21': {
    q: "Which one is meso-2,3-dibromobutane?",
    choices: ["(2R,3S)-2,3-Dibromobutane (meso)", "(2R,3R)-2,3-Dibromobutane", "(2S,3S)-2,3-Dibromobutane", "1,2-Dibromobutane"],
    cl: ["", "", "", "racemic"],
    explain: "When the two stereocenters are one R and one S, the molecule has an internal plane (or center) of symmetry and is an achiral meso compound. (R,R) and (S,S) are enantiomers of each other.",
  },
  'c1-3-21': {
    q: "(R)-2-Bromobutane was treated with NaCN / DMSO. Which is the major product?",
    choices: ["(S)-2-Methylbutanenitrile", "(R)-2-Methylbutanenitrile", "Racemic 2-methylbutanenitrile", "(E)-2-Butene"],
    cl: ["", "", "racemic", ""],
    explain: "Even at a secondary carbon, CN⁻ is not very basic, so SN2 dominates in a polar aprotic solvent. Backside attack inverts the configuration and adds one carbon. C≡N outranks Et, so the descriptor also changes from R to S.",
  },
} });

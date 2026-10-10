// =============================================================
// en-q2.js — 英語の問題：第 2 章（カルボニル化学）
// =============================================================
I18N.add('en', { q: {
  // ---------------- Undergrad I ----------------
  'c2-1-01': {
    q: "Cyclohexanone was reduced with NaBH₄ / MeOH. Which is the product?",
    choices: ["Cyclohexanol", "Cyclohexane", "Cyclohexene", "1,2-Cyclohexanediol"],
    mols: ["Cyclohexanone"],
    explain: "Hydride (H⁻) attacks the carbonyl carbon, and the resulting alkoxide takes a proton from the solvent to give a secondary alcohol.",
  },
  'c2-1-02': {
    q: "CH₃MgBr was reacted with formaldehyde, followed by acidic workup. What is the product?",
    choices: ["Ethanol", "Methanol", "2-Propanol", "Acetic acid"],
    mols: ["Formaldehyde"],
    explain: "A Grignard reagent adds to formaldehyde to give a primary alcohol, one carbon longer: CH₃–CH₂OH.",
  },
  'c2-1-03': {
    q: "CH₃MgBr was reacted with acetone, followed by acidic workup. Which is the product?",
    choices: ["2-Methyl-2-propanol", "2-Propanol", "2-Butanone", "Butane"],
    mols: ["Acetone"],
    explain: "A Grignard reagent adds to a ketone to give a tertiary alcohol. An aldehyde gives a secondary alcohol, formaldehyde a primary one.",
  },
  'c2-1-04': {
    q: "Which is most easily attacked by a nucleophile?",
    choices: ["Formaldehyde", "Acetaldehyde", "Acetone", "Di-tert-butyl ketone"],
    explain: "Alkyl groups donate electrons, weakening the δ+ on the carbonyl carbon, and they also get in the way sterically. Formaldehyde, with only H's, is the most reactive.",
  },
  'c2-1-05': {
    q: "Which correctly describes the carbon of a carbonyl group?",
    choices: ["Polarized δ+, electrophilic", "Polarized δ−, nucleophilic", "A radical with an unpaired electron", "Unpolarized and unreactive"],
    explain: "Oxygen is more electronegative, so the C=O electrons lean toward oxygen. The carbon becomes δ+ and is attacked by nucleophiles.",
  },
  'c2-1-06': {
    q: "Under acid catalysis, two molecules of alcohol add to an aldehyde and one water is lost. What is the product?",
    choices: ["An acetal", "A hemiacetal", "An ester", "An ether"],
    explain: "After one alcohol adds you have a hemiacetal. Its OH is then protonated and leaves as water, and a second alcohol adds to give the acetal.",
  },
  'c2-1-07': {
    q: "What forms when an aldehyde reacts with a primary amine?",
    choices: ["An imine", "An enamine", "An amide", "A nitrile"],
    explain: "Water is lost from the carbinolamine adduct to form a C=N bond. With a secondary amine, no H is left on N, so an enamine forms instead.",
  },
  'c2-1-08': {
    q: "Keto and enol forms of acetone: which predominates at equilibrium?",
    choices: ["Keto (overwhelmingly)", "Enol (overwhelmingly)", "About 1:1", "It always flips with temperature"],
    mols: ["Keto form", "Enol form"],
    explain: "A C=O bond is much stronger than a C=C bond, so for ordinary ketones the keto form is overwhelmingly more stable. Acetone has only a trace of enol.",
  },
  'c2-1-09': {
    q: "Roughly what is the pKa of the α-H of acetone (in water)?",
    choices: ["About 20", "About 5", "About 35", "About 50"],
    mols: ["Acetone"],
    explain: "Far more acidic than an ordinary C–H (pKa about 50), because the negative charge of the enolate is delocalized onto the carbonyl oxygen.",
  },
  'c2-1-10': {
    q: "Where is the negative charge of an enolate delocalized?",
    choices: ["The α carbon and the oxygen", "Only the carbonyl carbon", "The β and γ carbons", "The metal ion"],
    explain: "By resonance, the negative charge sits on both the α carbon and the oxygen, so an enolate can react at either (C-alkylation vs O-alkylation).",
  },
  'c2-1-11': {
    q: "Acetaldehyde was treated with dilute aqueous NaOH (cold). Which is the product?",
    choices: ["3-Hydroxybutanal", "2-Butenal", "Ethanol", "Acetic acid"],
    mols: ["Acetaldehyde"],
    explain: "The enolate adds to a second aldehyde molecule (aldol addition). On heating, it dehydrates to 2-butenal (crotonaldehyde).",
  },
  'c2-1-12': {
    q: "What tends to form when an aldol adduct (a β-hydroxy carbonyl compound) is heated?",
    choices: ["An α,β-unsaturated carbonyl", "An epoxide ring compound", "A carboxylic ester", "A cyclic acetal"],
    explain: "The α-H leaves and the OH is expelled (E1cB), giving a C=C conjugated with the carbonyl. Conjugation makes this dehydration favorable (aldol condensation).",
  },
  'c2-1-13': {
    q: "Which gives a yellow precipitate in the iodoform test (I₂ / NaOH)?",
    choices: ["2-Butanone", "3-Pentanone", "Benzaldehyde", "Methanol"],
    explain: "Methyl ketones CH₃–C(=O)– (or CH₃CH(OH)–, which is oxidized to one) test positive. The methyl becomes CI₃, is cleaved off, and yellow CHI₃ precipitates.",
  },
  'c2-1-14': {
    q: "Which can reduce an ester all the way to an alcohol?",
    choices: ["LiAlH₄", "NaBH₄ (room temperature, in methanol)", "H₂O", "NaOH"],
    explain: "LiAlH₄ is a powerful hydride donor and reduces esters, acids and even amides. NaBH₄ is milder and normally reduces only aldehydes and ketones.",
  },
  'c2-1-15': {
    q: "What is the product of HCN adding to acetaldehyde?",
    choices: ["A cyanohydrin", "Propanenitrile", "Acetamide", "2-Butanone"],
    mols: ["Acetaldehyde"],
    explain: "CN⁻ attacks the carbonyl carbon and the oxygen picks up a proton. Hydrolysis of a cyanohydrin gives an α-hydroxy acid.",
  },
  'c2-1-16': {
    q: "Which is most reactive toward nucleophilic acyl substitution?",
    choices: ["An acid chloride", "An acid anhydride", "An ester", "An amide"],
    explain: "The better the leaving group, and the less it stabilizes the carbonyl by resonance, the more reactive: acid chloride > anhydride > ester > amide.",
  },
  'c2-1-17': {
    q: "In a Wittig reaction, what does the carbonyl C=O become?",
    choices: ["C=C", "C–OH", "C–H₂", "C≡N"],
    explain: "The phosphorus ylide adds to the carbonyl to form a four-membered ring, which loses Ph₃P=O to give an alkene. CR₂ takes the place of the O.",
  },
  'c2-1-18': {
    q: "What mainly forms when a primary alcohol is oxidized with PCC?",
    choices: ["An aldehyde", "A carboxylic acid", "A ketone", "An ether"],
    explain: "PCC works in the absence of water, so it stops at the aldehyde. With water present, the aldehyde forms a hydrate that is easily oxidized on to the acid (as in Jones oxidation).",
  },
  'c2-1-19': {
    q: "Which has the highest proportion of enol form?",
    choices: ["2,4-Pentanedione", "Acetone", "Acetaldehyde", "Ethyl acetate"],
    explain: "The enol of a 1,3-dicarbonyl compound is stabilized by conjugation of C=C with C=O and by a six-membered intramolecular hydrogen bond. Under some conditions it is the major form.",
  },
  'c2-1-20': {
    q: "Which has no α-hydrogen and cannot enolize?",
    choices: ["Benzaldehyde", "Acetaldehyde", "Acetone", "Cyclohexanone"],
    explain: "The carbon next to benzaldehyde's carbonyl is a ring carbon with no H. Formaldehyde is the same. So they can never be the enolate partner in an aldol reaction.",
  },

  // ---------------- Undergrad II ----------------
  'c2-2-01': {
    q: "You want to reduce only the ester of a keto ester with LiAlH₄. How do you protect the ketone first?",
    choices: ["Form an acetal with ethylene glycol / H⁺", "Reduce it with NaBH₄ beforehand", "Add a Grignard reagent to it first", "Saponify the compound with NaOH"],
    explain: "Acetals are stable to bases and hydrides. After the reduction, aqueous acid turns it back into the ketone.",
  },
  'c2-2-02': {
    q: "Under what conditions is an acetal stable?",
    choices: ["Basic and neutral conditions", "Aqueous acid", "It decomposes under any conditions", "Only anhydrous strong acid"],
    explain: "Acetals survive bases, nucleophiles and hydrides, but aqueous acid hydrolyzes them back to the carbonyl. The basis of choosing when to protect and deprotect.",
  },
  'c2-2-03': {
    q: "What forms when cyclohexanone reacts with pyrrolidine (a secondary amine) under acid catalysis?",
    choices: ["An enamine", "An imine", "An amide", "An amino alcohol"],
    mols: ["Cyclohexanone", "Pyrrolidine"],
    explain: "An iminium ion forms; with no H on N, an α-H is lost to give the C=C–N enamine. An enamine is the nitrogen version of an enol, with a nucleophilic α carbon.",
  },
  'c2-2-04': {
    q: "In a Wittig reaction of an unstabilized ylide (Ph₃P=CHCH₃) with an aldehyde, which alkene mainly forms?",
    choices: ["The (Z)-alkene", "The (E)-alkene", "E:Z = 1:1", "No alkene forms"],
    explain: "With unstabilized ylides, the kinetically formed oxaphosphetane gives mainly the Z alkene. Ylides stabilized by an ester or similar give mainly E.",
  },
  'c2-2-05': {
    q: "Excess benzaldehyde and acetone were reacted in aqueous NaOH. What is the major product?",
    choices: ["Dibenzylideneacetone", "4-Hydroxy-4-methyl-2-pentanone", "Benzoic acid", "Benzyl alcohol"],
    mols: ["Benzaldehyde", "Acetone"],
    explain: "A crossed aldol (Claisen–Schmidt condensation). Benzaldehyde has no α-H, so it can only accept; both methyls of acetone form enolates and add and dehydrate twice.",
  },
  'c2-2-06': {
    q: "Ethyl acetate was treated with NaOEt, then acidic workup. Which is the product?",
    choices: ["Ethyl acetoacetate", "Ethyl butyrate", "2,4-Pentanedione", "Ethyl acetate (no change)"],
    mols: ["Ethyl acetate"],
    explain: "The ester enolate attacks a second ester molecule and EtO⁻ leaves (Claisen condensation), giving a β-keto ester.",
  },
  'c2-2-07': {
    q: "Why does the Claisen condensation need at least one equivalent of base?",
    choices: ["Deprotonating the β-keto ester drives the equilibrium", "The base is destroyed, so it must be replaced", "The starting ester can't react with less base", "Extra base is needed to dry the solvent"],
    explain: "Each step of the condensation is an equilibrium and roughly uphill. Only when the H between the product's two carbonyls (pKa about 11) is removed does the equilibrium shift strongly to product.",
  },
  'c2-2-08': {
    q: "Diethyl malonate was alkylated with NaOEt and CH₃CH₂Br, then hydrolyzed and heated (decarboxylation). Which is the product?",
    choices: ["Butanoic acid", "Propanoic acid", "Diethyl ethylmalonate", "Pentanoic acid"],
    mols: ["Diethyl malonate"],
    explain: "The malonic ester synthesis. An ethyl group goes onto the CH₂, hydrolysis gives the malonic acid, and heating loses one CO₂. Net result: acetic acid with an alkyl group on its α carbon.",
  },
  'c2-2-09': {
    q: "Ethyl acetoacetate was methylated with NaOEt and CH₃I, then hydrolyzed and decarboxylated. What is the product?",
    choices: ["2-Butanone", "Acetone", "3-Pentanone", "2-Methylpropanoic acid"],
    mols: ["Ethyl acetoacetate"],
    explain: "The acetoacetic ester synthesis. The CH₂ between the two carbonyls is methylated, and hydrolysis plus decarboxylation leaves a methyl ketone: CH₃CO–CH₂–CH₃.",
  },
  'c2-2-10': {
    q: "Methyl benzoate was treated with excess PhMgBr, then acidic workup. What is the product?",
    choices: ["Triphenylmethanol", "Benzophenone", "Benzyl alcohol", "Benzoic acid"],
    mols: ["Methyl benzoate"],
    explain: "The first equivalent gives a ketone (benzophenone), but the ketone is more reactive than the ester, so a second equivalent adds right away to give a tertiary alcohol.",
  },
  'c2-2-11': {
    q: "An ester was treated with DIBAL-H (1 equiv) at −78 °C, then worked up. What is the major product?",
    choices: ["An aldehyde", "A primary alcohol", "A carboxylic acid", "An ether"],
    explain: "At low temperature, the aluminum-bound tetrahedral intermediate survives intact. It only becomes the aldehyde on workup, so over-reduction is avoided.",
  },
  'c2-2-12': {
    q: "Why is NaBH₃CN popular for reductive amination?",
    choices: ["At pH 6–7 it reduces iminium ions, not ketones", "It is the strongest available hydride donor", "It is the only borohydride stable in water", "It oxidizes the amine to the imine first"],
    explain: "The electron-withdrawing cyano group weakens it as a hydride donor. At pH 6–7 it selectively reduces the protonated iminium, so the carbonyl and amine can be mixed together.",
  },
  'c2-2-13': {
    q: "Where does the enolate of diethyl malonate add to methyl vinyl ketone (MVK)?",
    choices: ["The β carbon (1,4-addition)", "The carbonyl carbon (1,2-addition)", "The α carbon", "The carbonyl oxygen"],
    mols: ["Methyl vinyl ketone", "Diethyl malonate"],
    explain: "A stabilized, soft enolate adds in conjugate fashion to the β carbon of an α,β-unsaturated carbonyl (Michael addition).",
  },
  'c2-2-14': {
    q: "2-Cyclohexenone was treated with Me₂CuLi, then worked up. Which is the major product?",
    choices: ["3-Methylcyclohexanone", "1-Methyl-2-cyclohexen-1-ol", "2-Methylcyclohexanone", "3-Methyl-2-cyclohexenone"],
    mols: ["2-Cyclohexenone"],
    explain: "Organocuprates (Gilman reagents) are soft nucleophiles and add 1,4 to the β carbon. The resulting enolate is protonated on workup to give the ketone.",
  },
  'c2-2-15': {
    q: "2-Cyclohexenone was treated with MeMgBr, then worked up. Which is the major product?",
    choices: ["1-Methyl-2-cyclohexen-1-ol", "3-Methylcyclohexanone", "2-Methylcyclohexanone", "3-Methyl-2-cyclohexenone"],
    mols: ["2-Cyclohexenone"],
    explain: "Grignard reagents are hard nucleophiles and tend to add 1,2, directly to the carbonyl carbon. A cuprate would add 1,4.",
  },
  'c2-2-16': {
    q: "In the base-promoted haloform reaction, why does the methyl group go all the way to CX₃?",
    choices: ["Each halogen makes the remaining α-H more acidic", "Each halogen makes the α-H less acidic", "The base activates the halogen", "The carbonyl gets reduced"],
    explain: "Each electron-withdrawing halogen makes the remaining H's on that carbon easier to remove, so it doesn't stop until CX₃, which is finally cleaved off as a leaving group.",
  },
  'c2-2-17': {
    q: "Acid-catalyzed α-bromination of a ketone tends to stop after one bromine. Why?",
    choices: ["Br makes the C=O less basic, so enolizing again is slow", "Once one Br is in, there are no α-H's left to remove", "All the bromine has been used up by that point", "The monobromo ketone precipitates out of solution"],
    explain: "Under acid, enolization is rate-determining, and it begins with protonation of the carbonyl oxygen. An electron-withdrawing Br makes the oxygen less basic, so the second round is slower. The opposite of the basic (haloform) case.",
  },
  'c2-2-18': {
    q: "What forms when benzaldehyde is treated with concentrated aqueous NaOH?",
    choices: ["Benzyl alcohol and sodium benzoate", "Benzoin", "Benzene and formic acid", "An aldol adduct"],
    mols: ["Benzaldehyde"],
    explain: "The Cannizzaro reaction. With no α-H, no aldol can happen. From the HO⁻ adduct, a hydride transfers to a second aldehyde: half is reduced, half oxidized.",
  },
  'c2-2-19': {
    q: "Ethyl acetate was hydrolyzed with aqueous NaOH (saponification). What forms?",
    choices: ["Sodium acetate and ethanol", "An equilibrium mixture of acetic acid and ethanol", "Acetaldehyde and ethanol", "Ethyl acetate (no change)"],
    mols: ["Ethyl acetate"],
    explain: "HO⁻ adds to the carbonyl and EtO⁻ leaves. The carboxylic acid is immediately deprotonated to the carboxylate, so the reaction is irreversible.",
  },
  'c2-2-20': {
    q: "In water, which has the highest proportion of hydrate (gem-diol)?",
    choices: ["Formaldehyde", "Acetaldehyde", "Acetone", "Benzaldehyde"],
    explain: "Formaldehyde is almost completely hydrated in water (over 99%). Alkyl groups and a conjugated benzene ring stabilize the carbonyl and make hydration less favorable.",
  },

  // ---------------- Grad Entrance Exam ----------------
  'c2-3-01': {
    q: "2-Methylcyclohexanone was treated with LDA / THF / −78 °C, then CH₃I. Which is the major product?",
    choices: ["2,6-Dimethylcyclohexanone", "2,2-Dimethylcyclohexanone", "2-Methylcyclohexanone (no change)", "1-Methoxy-6-methylcyclohexene"],
    mols: ["2-Methylcyclohexanone"],
    explain: "Bulky LDA at low temperature deprotonates irreversibly, removing the H on the less crowded C6 side fastest (the kinetic enolate). That carbon gets methylated.",
  },
  'c2-3-02': {
    q: "2-Methylcyclohexanone was converted to a silyl enol ether under equilibrating conditions (Et₃N / TMSCl / DMF, heat). What mainly forms?",
    choices: ["The silyl enol ether with the C=C toward the more substituted C2", "The silyl enol ether with the C=C toward the less substituted C6", "No O-silylation; the C-silylated product", "Always a 1:1 mixture of both"],
    mols: ["2-Methylcyclohexanone"],
    explain: "Under thermodynamic control, the enol derivative with the more substituted alkene (C1=C2) is more stable and dominates. Cold LDA gives the C6 (kinetic) side instead.",
  },
  'c2-3-03': {
    q: "The Robinson annulation combines which two reactions?",
    choices: ["Michael addition + intramolecular aldol condensation", "Diels–Alder cycloaddition + acid-catalyzed dehydration", "Claisen condensation + thermal decarboxylation", "Wittig olefination + hydride reduction of the ketone"],
    explain: "A ketone enolate does a Michael addition to MVK to give a 1,5-diketone, which then undergoes an intramolecular aldol condensation to build a cyclohexenone ring.",
  },
  'c2-3-04': {
    q: "Robinson annulation of 2-methylcyclohexane-1,3-dione with MVK gives which key intermediate for steroid synthesis?",
    choices: ["The Wieland–Miescher ketone", "The Hajos–Parrish ketone", "Camphor", "Testosterone"],
    mols: ["2-Methylcyclohexane-1,3-dione", "MVK"],
    explain: "A fused bicyclic enone. With proline catalysis it can be made enantioselectively (the Hajos–Parrish–Eder–Sauer–Wiechert reaction). The five-membered-ring version is the Hajos–Parrish ketone.",
  },
  'c2-3-05': {
    q: "Diethyl adipate was treated with NaOEt, then acidic workup. Which is the product?",
    choices: ["Ethyl 2-oxocyclopentanecarboxylate", "Cyclopentanone", "Ethyl 2-oxocyclohexanecarboxylate", "Diethyl adipate (no change)"],
    mols: ["Diethyl adipate"],
    explain: "An intramolecular Claisen (Dieckmann condensation). A 1,6-diester gives a five-membered β-keto ester; a 1,7-diester gives a six-membered ring.",
  },
  'c2-3-06': {
    q: "What forms when a ketone, formaldehyde and dimethylamine react under acidic conditions?",
    choices: ["A β-amino ketone (Mannich base)", "An α-amino ketone", "An enamine of the ketone", "An N,N-dimethylamide"],
    explain: "Formaldehyde and the amine form an iminium ion, which the ketone's enol attacks. It is an aldol where the acceptor is an iminium.",
  },
  'c2-3-07': {
    q: "In the Baeyer–Villiger oxidation, which group migrates most readily?",
    choices: ["Tertiary alkyl", "Secondary alkyl", "Primary alkyl", "Methyl"],
    explain: "The migrating group moves to oxygen while carrying partial positive charge, so groups that support positive charge migrate best: tertiary > secondary ≈ phenyl > primary > methyl. Configuration is retained.",
  },
  'c2-3-08': {
    q: "Cyclohexanone was oxidized with mCPBA. Which is the product?",
    choices: ["ε-Caprolactone", "Cyclohexanone (no change)", "Cyclohexanol", "Cyclohexene oxide"],
    mols: ["Cyclohexanone"],
    explain: "The peracid adds to the carbonyl (the Criegee intermediate), and a ring C–C bond migrates to oxygen. One oxygen is inserted into the ring, giving a seven-membered lactone.",
  },
  'c2-3-09': {
    q: "What mainly forms in a Horner–Wadsworth–Emmons reaction (phosphonate ester + base + aldehyde)?",
    choices: ["An (E)-α,β-unsaturated ester", "A (Z)-α,β-unsaturated ester", "A β-hydroxy ester", "An epoxide"],
    explain: "The phosphonate carbanion is stabilized and its addition is reversible, so the thermodynamically favored E isomer dominates. The phosphate byproduct is water-soluble and easy to remove, another plus.",
  },
  'c2-3-10': {
    q: "What is the four-membered-ring intermediate in the Wittig reaction?",
    choices: ["An oxaphosphetane", "A betaine (always isolable)", "An epoxide", "A phosphorane"],
    explain: "A ring of phosphorus, carbon, carbon and oxygen. Under Li-salt-free conditions, ylide and carbonyl are thought to close it directly, [2+2]-style. It breaks down to Ph₃P=O and the alkene.",
  },
  'c2-3-11': {
    q: "What is the advantage of the Stork enamine synthesis (ketone → enamine → alkyl halide → hydrolysis)?",
    choices: ["Easy monoalkylation without a strong base", "O-Alkylation always occurs", "It works with any alkyl halide", "It always inverts stereochemistry"],
    explain: "Enamines are neutral, mild nucleophiles. There is no need to make an enolate with strong base, and multiple alkylation is less likely. It pairs well with reactive halides (allylic, benzylic, α-halo carbonyls).",
  },
  'c2-3-12': {
    q: "In the aldol reaction of a (Z)-enolate with an aldehyde, which diastereomer mainly forms?",
    choices: ["The syn product", "The anti product", "syn:anti = 1:1", "It doesn't depend on the enolate geometry"],
    explain: "The Zimmerman–Traxler model. In a metal-containing chair six-membered transition state, the aldehyde substituent sits equatorial, so Z enolates give syn and E enolates give anti.",
  },
  'c2-3-13': {
    q: "Benzaldehyde and diethyl malonate were reacted with piperidine as catalyst. What is the major product?",
    choices: ["Diethyl benzylidenemalonate", "Ethyl cinnamate (already decarboxylated)", "Benzyl alcohol", "Dibenzylideneacetone"],
    mols: ["Benzaldehyde", "Diethyl malonate"],
    explain: "The Knoevenagel condensation. An active methylene compound forms an enolate even with a weak base, adds to the aldehyde, then dehydrates to form a C=C.",
  },
  'c2-3-14': {
    q: "Which metal is used in the Reformatsky reaction (α-bromo ester + aldehyde)?",
    choices: ["Zinc", "Lithium", "Magnesium", "Palladium"],
    explain: "Zinc inserts into the C–Br bond to give a zinc enolate. Being mild, it doesn't attack the ester itself, but adds to aldehydes and ketones to give β-hydroxy esters.",
  },
  'c2-3-15': {
    q: "Which foul-smelling byproduct comes from the Swern oxidation (DMSO / (COCl)₂ / Et₃N)?",
    choices: ["Dimethyl sulfide", "Sulfur dioxide", "Hydrogen sulfide", "Methanethiol"],
    explain: "The alcohol binds to activated DMSO, and Me₂S is released when Et₃N breaks it down. CO and CO₂ are also formed. Run at −78 °C.",
  },
  'c2-3-16': {
    q: "What happens to the carbonyl in a Wolff–Kishner reduction (hydrazine, KOH, heat)?",
    choices: ["C=O becomes CH₂, releasing N₂", "C=O becomes CH–OH", "C=O becomes C=C", "C=O stays as C=N–NH₂"],
    explain: "After the hydrazone forms, strong base and high temperature remove N–H protons, and N₂ leaves to give CH₂. Nitrogen gas evolution is the driving force.",
  },
  'c2-3-17': {
    q: "You want to turn a ketone into CH₂ in a compound with acid-sensitive groups. What should you use?",
    choices: ["Wolff–Kishner reduction", "Clemmensen reduction", "NaBH₄ reduction", "Swern oxidation"],
    explain: "The Clemmensen reduction (Zn(Hg) / concentrated HCl) is strongly acidic. The strongly basic Wolff–Kishner spares acid-sensitive groups (and for base-sensitive ones, use Clemmensen).",
  },
  'c2-3-18': {
    q: "What forms when dimethylsulfonium methylide (the Corey–Chaykovsky reagent) acts on a ketone?",
    choices: ["An epoxide", "An alkene", "A tertiary alcohol", "A cyclopropane"],
    explain: "The ylide carbon adds to the carbonyl, and the alkoxide pushes out Me₂S intramolecularly to close a three-membered ring. A phosphorus ylide (Wittig) would give an alkene.",
  },
  'c2-3-19': {
    q: "The rate of acid-catalyzed bromination of acetone does not depend on [Br₂]. What does this show?",
    choices: ["Enolization is rate-determining", "Br₂ acts as a catalyst", "The mechanism is radical", "The product decomposes right away"],
    mols: ["Acetone"],
    explain: "After slow enolization, the enol reacts with Br₂ quickly. That is also why, for an optically active ketone, the rates of halogenation, racemization and deuterium exchange are nearly equal.",
  },
  'c2-3-20': {
    q: "2-Cyclohexenone was reduced with NaBH₄ / CeCl₃ (Luche reduction). What is the major product?",
    choices: ["2-Cyclohexen-1-ol (1,2-reduction)", "Cyclohexanone (1,4-reduction)", "Cyclohexanol", "Cyclohexene"],
    mols: ["2-Cyclohexenone"],
    explain: "Ce³⁺ activates the carbonyl, and the hard alkoxyborohydride formed in methanol adds 1,2. NaBH₄ alone also gives some 1,4-reduction.",
  },

  // ---------------- PhD (Brutal) ----------------
  'c2-4-01': {
    q: "In the Felkin–Anh model, which conformation explains nucleophilic attack on a carbonyl with an α stereocenter?",
    choices: ["Largest group perpendicular to C=O; Nu attacks opposite it, past the smallest group", "Largest group eclipsing the C=O oxygen; Nu attacks past the largest group", "The carbonyl and all α substituents in one plane", "Nu always attacks within the carbonyl plane"],
    explain: "The largest group L is set perpendicular to C=O, and the nucleophile comes in opposite L at the Bürgi–Dunitz angle (about 107°), passing the smaller S rather than M. Overlap with σ*C–L also stabilizes the transition state.",
  },
  'c2-4-02': {
    q: "A Grignard reagent was added to an α-alkoxy ketone under chelating conditions (Mg²⁺, etc.). What explains the stereoselectivity?",
    choices: ["Cram's chelation model", "The Felkin–Anh model (nonchelated)", "The Zimmerman–Traxler model", "The Bürgi–Dunitz trajectory alone"],
    explain: "The metal binds both the carbonyl oxygen and the α-alkoxy oxygen in a five-membered chelate, locking the conformation. The nucleophile attacks from the side of the smaller group, often giving the opposite selectivity to Felkin–Anh.",
  },
  'c2-4-03': {
    q: "What is the shape of the aldol transition state in the Zimmerman–Traxler model?",
    choices: ["A metal-containing six-membered chair", "An open, acyclic transition state", "A four-membered boat", "A planar five-membered ring"],
    explain: "The enolate's metal coordinates to the aldehyde oxygen, and M–O–C=C…C=O forms a six-membered chair. The aldehyde substituent prefers to be equatorial.",
  },
  'c2-4-04': {
    q: "In an Evans oxazolidinone aldol (Z boron enolate from Bu₂BOTf / i-Pr₂NEt) with an aldehyde, what mainly forms?",
    choices: ["The Evans syn product", "The anti product", "syn:anti = 1:1", "The enolate decomposes without reacting"],
    explain: "The Z boron enolate reacts through a chair transition state, and the auxiliary's substituent and dipole alignment decide which face adds. The auxiliary can then be removed, for example by hydrolysis.",
  },
  'c2-4-05': {
    q: "What is used as the nucleophile in the Mukaiyama aldol reaction?",
    choices: ["A silyl enol ether", "A lithium enolate", "A Grignard reagent", "An enamine"],
    explain: "Pairing a neutral silyl enol ether with a Lewis-acid-activated aldehyde made crossed aldols controllable. Teruaki Mukaiyama, 1973.",
  },
  'c2-4-06': {
    q: "What is the rate-determining step of the Cannizzaro reaction?",
    choices: ["Hydride transfer to a second aldehyde", "Addition of HO⁻ to the carbonyl", "Deprotonation of the carboxylic acid", "Protonation of the benzyl alkoxide"],
    explain: "The rate law is second order in aldehyde and first order in base (second order in strong base). In D₂O no D ends up on the alcohol's C–H, so the hydride comes directly from the aldehyde, not the solvent.",
  },
  'c2-4-07': {
    q: "Roughly what is the angle of nucleophilic attack on a carbonyl (the Bürgi–Dunitz angle)?",
    choices: ["About 107°", "90°", "180°", "About 60°"],
    explain: "Found from analysis of crystal structures. The nucleophile approaches at an obtuse angle to C=O, maximizing overlap with π*C=O while avoiding repulsion from the oxygen's electrons.",
  },
  'c2-4-08': {
    q: "In the Ireland–Claisen rearrangement, which intermediate undergoes the [3,3] sigmatropic rearrangement?",
    choices: ["A silyl ketene acetal from the allyl ester enolate", "An allyl vinyl ether, as in the Claisen", "An enamine made from the allyl ester", "An acyl anion equivalent of the ester"],
    explain: "The allyl ester is turned into its enolate with LDA and O-silylated with TMSCl. The silyl ketene acetal rearranges at low temperature to a γ,δ-unsaturated acid; the enolate geometry sets the stereochemistry.",
  },
  'c2-4-09': {
    q: "What enolate geometry mainly forms when 3-pentanone is treated with LDA / THF / −78 °C? (Adding HMPA reverses it.)",
    choices: ["The (E)-enolate", "The (Z)-enolate", "E:Z = 1:1", "No enolate forms"],
    mols: ["3-Pentanone"],
    explain: "Ireland's model. In THF, a chair transition state with Li bound to oxygen keeps the methyl out of a pseudo-axial position, so E dominates (about 77:23). When HMPA solvates the Li, Z dominates.",
  },
  'c2-4-10': {
    q: "In the proline-catalyzed direct asymmetric aldol reaction (List, Barbas and co-workers, 2000), what is the nucleophilic intermediate?",
    choices: ["An enamine", "An enolate", "A silyl enol ether", "An iminium ion"],
    explain: "The ketone and proline's secondary amine form an enamine, while the carboxylic acid hydrogen-bonds to the aldehyde, activating it and selecting the face. The same mechanism as class I aldolase enzymes.",
  },
  'c2-4-11': {
    q: "Which reaction showed, in the 1970s, a proline-catalyzed asymmetric intramolecular aldol of the Wieland–Miescher-ketone type?",
    choices: ["The Hajos–Parrish–Eder–Sauer–Wiechert reaction", "The Robinson–Gabriel reaction", "The Mukaiyama–Michael reaction", "The Sharpless asymmetric epoxidation"],
    explain: "Discovered in industrial steroid synthesis, it was a forerunner of organocatalysis: a triketone cyclizes enantioselectively with (S)-proline. Organocatalysis only took off after 2000.",
  },
  'c2-4-12': {
    q: "What catalyst is used in the CBS (Corey–Bakshi–Shibata) reduction?",
    choices: ["A chiral oxazaborolidine", "A Ru–BINAP complex", "Ti(Oi-Pr)₄ / diethyl tartrate", "Proline"],
    explain: "BH₃ binds to the nitrogen of the proline-derived oxazaborolidine and the ketone oxygen to its boron; hydride is delivered to one face through a six-membered transition state.",
  },
  'c2-4-13': {
    q: "What ligand is in the catalyst for Noyori's asymmetric hydrogenation of β-keto esters?",
    choices: ["BINAP", "DIPAMP", "Salen", "Bisoxazoline"],
    explain: "With a Ru(II)–BINAP complex, β-keto esters become β-hydroxy esters with nearly perfect enantiomeric excess. Nobel Prize in Chemistry, 2001.",
  },
  'c2-4-14': {
    q: "A Grignard reagent added to a Weinreb amide stops at the ketone. Why?",
    choices: ["A chelated tetrahedral intermediate survives until workup", "Ketones simply don't react with Grignard reagents", "The amide is reduced to an aldehyde before it can react", "A Grignard reagent can only ever add to a carbonyl once"],
    explain: "A five-membered chelate stabilizes the tetrahedral intermediate, so no ketone appears during the reaction. The ketone only forms on acidic workup, so a second addition can't happen.",
  },
  'c2-4-15': {
    q: "The anion from deprotonating 1,3-dithiane with n-BuLi serves as the equivalent of what?",
    choices: ["An acyl anion (umpolung)", "An enolate", "A carbocation", "A radical"],
    mols: ["1,3-Dithiane"],
    explain: "The Corey–Seebach umpolung. A carbonyl carbon, normally δ+, is masked as a dithiane and used as a nucleophilic anion, then unmasked to the carbonyl by hydrolysis.",
  },
  'c2-4-16': {
    q: "What is the classic catalyst for the benzoin condensation (two benzaldehydes → an α-hydroxy ketone)?",
    choices: ["Cyanide ion", "Hydroxide ion", "Palladium", "A protic acid"],
    mols: ["Benzaldehyde", "Benzoin"],
    explain: "CN⁻ adds to the aldehyde, and loss of the α-H gives an umpoled anion that attacks a second molecule. Thiazolium salts and N-heterocyclic carbenes (NHCs) do the same job (vitamin B₁).",
  },
  'c2-4-17': {
    q: "Under what conditions does O-alkylation of an enolate (reaction at O instead of C) tend to happen?",
    choices: ["Hard electrophile, HMPA-type solvent, free counterion", "Soft electrophile (MeI, etc.) in a nonpolar solvent", "Tightly Li⁺-bound enolate aggregates", "Any protic solvent, such as methanol"],
    explain: "Oxygen is the charge-dense, hard nucleophilic site. A “naked” enolate pulled away from its counterion, with a hard electrophile (TMSCl, dimethyl sulfate, triflates…), tends to react at O.",
  },
  'c2-4-18': {
    q: "2-Chlorocyclohexanone was treated with NaOMe / MeOH. Which is the major product?",
    choices: ["Methyl cyclopentanecarboxylate", "2-Methoxycyclohexanone", "2-Cyclohexenone", "Methyl cyclohexanecarboxylate"],
    mols: ["2-Chlorocyclohexanone"],
    explain: "The Favorskii rearrangement. The enolate on the other α carbon pushes out the C–Cl intramolecularly to form a cyclopropanone, which MeO⁻ opens. The ring shrinks by one.",
  },
  'c2-4-19': {
    q: "How does the enol content of 2,4-pentanedione change with solvent?",
    choices: ["Higher in less polar solvents", "Higher in more polar solvents", "The same in every solvent", "100% in water"],
    mols: ["2,4-Pentanedione"],
    explain: "The intramolecularly hydrogen-bonded enol is less polar. Polar solvents like water solvate and stabilize the more polar keto form and compete with the internal hydrogen bond. In hexane, over 90% is enol.",
  },
  'c2-4-20': {
    q: "In the Meerwein–Ponndorf–Verley reduction (Al(Oi-Pr)₃ / isopropanol), where does the hydride come from?",
    choices: ["From an Al-bound isopropoxide C–H (6-membered TS)", "From the O–H of the isopropanol solvent", "From an aluminum–hydrogen bond in the reagent", "From hydrogen gas formed in the flask"],
    explain: "The ketone and an isopropoxide sit on the same Al, and the hydride moves through a six-membered transition state. Acetone is the byproduct; the reaction is reversible, and the reverse is the Oppenauer oxidation.",
  },

  // ---------------- The Iodoform Brothers' specialties ----------------
  'c2-1-21': {
    q: "What is the yellow precipitate in the iodoform test?",
    choices: ["CHI₃ (iodoform)", "I₂", "NaI", "CH₃I"],
    explain: "The methyl of a methyl ketone becomes CI₃, is cleaved off, and picks up a proton to become CHI₃: a yellow, water-insoluble crystal with an antiseptic smell.",
  },
  'c2-1-22': {
    q: "Which alcohol gives a positive iodoform test?",
    choices: ["Ethanol", "Methanol", "1-Propanol", "2-Methyl-2-propanol"],
    explain: "Compounds with CH₃CH(OH)–, which I₂ and base can oxidize to a methyl carbonyl (CH₃–C=O), test positive. Ethanol reacts via acetaldehyde.",
  },
  'c2-2-21': {
    q: "Acetophenone was treated with excess aqueous NaOCl and finally acidified. What carboxylic acid is obtained?",
    choices: ["Benzoic acid", "Phenylacetic acid", "Acetic acid", "Cinnamic acid"],
    mols: ["Acetophenone"],
    explain: "The haloform reaction. The methyl becomes CCl₃ and leaves as CHCl₃, and the benzoyl group that remains becomes the carboxylic acid (salt). A way to turn a methyl ketone into an acid with one fewer carbon.",
  },
  'c2-2-22': {
    q: "2-Bromocyclohexanone was heated in pyridine. What is the major product?",
    choices: ["2-Cyclohexenone", "Cyclohexanone", "2-Hydroxycyclohexanone", "Cyclohexane-1,2-dione"],
    mols: ["2-Bromocyclohexanone"],
    explain: "Dehydrobromination (E2) of an α-bromo ketone, favored because the new double bond is conjugated with the carbonyl. Combined with α-halogenation, it is a standard route from a ketone to an α,β-unsaturated ketone.",
  },
  'c2-3-21': {
    q: "In the Hell–Volhard–Zelinsky reaction (carboxylic acid + Br₂ + catalytic PBr₃), where is bromine introduced, and why?",
    choices: ["α; the acid bromide made by PBr₃ enolizes easily", "β; a conjugate addition occurs", "The carboxyl O; O-bromination is fast", "α; the free acid itself enolizes most easily"],
    explain: "Carboxylic acids themselves barely enolize. PBr₃ converts the acid to its acid bromide, whose α-H is easier to remove, and the enol reacts with Br₂. Water at the end gives the α-bromo acid.",
  },
  'c2-3-22': {
    q: "In the haloform reaction, why is –CX₃ cleaved off a C–C bond as a leaving group?",
    choices: ["Three halogens make CX₃⁻ an unusually stable carbanion", "The C–X bonds break first, freeing the carbon", "–CX₃ leaves homolytically as a radical", "Hydroxide attacks the –CX₃ carbon directly"],
    explain: "CX₃⁻ is expelled from the tetrahedral intermediate formed when HO⁻ adds to the carbonyl. A haloform (CHX₃) has a pKa around 15, very low for a hydrocarbon, so CX₃⁻ is a good leaving group.",
  },
  'c2-4-21': {
    q: "2-Butanone was reacted with 1 equivalent of Br₂ under acidic conditions. Where is it mainly brominated?",
    choices: ["C3 (the more substituted α carbon)", "C1 (the methyl α carbon)", "Always C1 and C3 1:1", "The carbonyl oxygen"],
    mols: ["2-Butanone"],
    explain: "Under acid the reaction goes through the more substituted (thermodynamically more stable) enol, so C3 dominates. Under base, bromine goes on the faster-deprotonated methyl side and tends to carry on to the haloform reaction.",
  },
  'c2-4-22': {
    q: "α-Chloroacetone undergoes SN2 orders of magnitude faster than 1-chloropropane (about 10⁴×). What is the main reason?",
    choices: ["C=O π* overlaps the C–Cl σ* in the TS, stabilizing it", "α-Chloroacetone is really a tertiary halide", "It reacts by way of a carbocation instead", "The Cl first changes into a better leaving form"],
    mols: ["α-Chloroacetone", "1-Chloropropane"],
    explain: "In the SN2 transition state, the p orbital at the reacting carbon conjugates with the neighboring C=O π system and is stabilized. A carbocation would be unstable, so SN1 is actually slower. This is why α-halo carbonyls are “good SN2 substrates.”",
  },
} });

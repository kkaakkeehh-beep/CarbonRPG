// =============================================================
// en-q5.js — 英語の問題：第 5 章（合成戦略・不斉合成と光学分割）と、物語の中の決まった問題
// =============================================================
I18N.add('en', { q: {
  // ---------------- Undergrad I ----------------
  'c5-1-01': {
    q: "What is the idea behind retrosynthetic analysis?",
    choices: ["Work back from the target to starting materials by breaking bonds", "Try every reaction you can think of on the starting materials", "Break the product down to find its elemental composition", "Build the synthesis out of reverse reactions only"],
    explain: "An approach systematized by Corey. With the “⇒” arrow, you break the target down into simpler precursors. Where to cut depends on whether there is a reaction that can form that bond.",
  },
  'c5-1-02': {
    q: "Which pair makes 2-phenyl-2-propanol in a single Grignard reaction?",
    choices: ["PhMgBr and acetone", "MeMgBr and benzaldehyde", "PhMgBr and acetaldehyde", "MeMgBr and benzoic acid"],
    mols: ["2-Phenyl-2-propanol"],
    explain: "Remove one group from the carbinol carbon of a tertiary alcohol and a ketone remains: remove Ph and you get acetone + PhMgBr; remove Me and you get acetophenone + MeMgBr. Aldehydes give secondary alcohols, and benzoic acid's acidic H destroys the Grignard reagent.",
  },
  'c5-1-03': {
    q: "Which protecting group is most often used to protect an alcohol OH?",
    choices: ["TBS", "Boc", "Cbz", "Fmoc"],
    explain: "TBSCl and imidazole turn OH into a silyl ether (R–O–SiMe₂t-Bu), stable to bases and many oxidants and reductants. Boc, Cbz and Fmoc are all amine protecting groups.",
  },
  'c5-1-04': {
    q: "Which reagent is commonly used to remove a TBS ether and recover the alcohol?",
    choices: ["TBAF", "NaBH₄", "H₂ / Pd-C", "mCPBA"],
    explain: "TBAF (tetrabutylammonium fluoride) is an organic-soluble source of F⁻. The Si–F bond is much stronger than Si–O, so F⁻ attacks silicon and pulls it off oxygen, barely touching other functional groups.",
  },
  'c5-1-05': {
    q: "Under what conditions is an amine's Boc (tert-butoxycarbonyl) group removed?",
    choices: ["An acid such as TFA", "Aqueous NaOH", "H₂ / Pd-C", "TBAF"],
    explain: "Acid releases the tert-butyl cation, and the carbamic acid left behind loses CO₂ to regenerate the amine. Cbz comes off with H₂ / Pd-C (hydrogenolysis), Fmoc with base. Combining groups that come off differently lets you remove just one.",
  },
  'c5-1-06': {
    q: "Methyl 4-acetylbenzoate was reduced with NaBH₄ / EtOH. What is the major product?",
    choices: ["Only the ketone becomes an alcohol", "Only the ester becomes an alcohol", "Both ketone and ester become alcohols", "The ketone becomes CH₂"],
    mols: ["Methyl 4-acetylbenzoate"],
    explain: "NaBH₄ is a mild reductant: it reduces aldehydes and ketones but hardly touches esters. To reduce the ester too, use LiAlH₄.",
  },
  'c5-1-07': {
    q: "A molecule has both an aldehyde and a ketone. Which does 1 equivalent of nucleophile mainly react with?",
    choices: ["The aldehyde", "The ketone", "Both at the same rate", "Neither"],
    explain: "The aldehyde C=O carries only one H, so it's open and gets less electron donation from alkyl groups: a bigger δ+. Nucleophiles attack the aldehyde first.",
  },
  'c5-1-08': {
    q: "You can't make a Grignard reagent directly from 2-bromoethanol. Why?",
    choices: ["The OH proton instantly destroys the C–Mg formed", "The C–Br bond doesn't react with Mg", "Ethanol ends up acting as the solvent", "The OH coats the surface of the Mg"],
    mols: ["2-Bromoethanol"],
    explain: "A Grignard reagent is also a strong base, so an OH (or NH, COOH) in the same molecule destroys it immediately. Protect the OH first (as a TBS ether, say), then react with Mg.",
  },
  'c5-1-09': {
    q: "Five consecutive steps each give an 80% yield. What is the overall yield?",
    choices: ["About 33%", "80%", "About 16%", "About 64%"],
    explain: "0.8⁵ ≈ 0.33. Overall yield shrinks multiplicatively with each step, which is why cutting the number of steps matters so much in synthesis.",
  },
  'c5-1-10': {
    q: "What is the advantage of a “convergent synthesis,” where large fragments made separately are joined at the end?",
    choices: ["The longest sequence is shorter, raising overall yield", "It always uses fewer types of reaction", "It needs no protecting groups at all", "You no longer need to think about stereochemistry"],
    explain: "A linear (one-path) synthesis of 10 steps multiplies 10 yields. Joining two 5-step fragments makes the longest sequence only 6 steps.",
  },
  'c5-1-11': {
    q: "In retrosynthesis, what do you call the idealized fragments (R⁺, R⁻, etc.) you imagine when you break a bond?",
    choices: ["Synthons", "Synthetic equivalents", "Transition states", "Protecting groups"],
    explain: "A synthon is a fragment in your head and often doesn't exist as such. The reagent you actually use is its “synthetic equivalent”: for example, CH₃MgBr for the CH₃⁻ synthon.",
  },
  'c5-1-12': {
    q: "Pure (S) has a specific rotation of +40°. A sample shows +30°. What is its ee? (Assume rotation is proportional to ee.)",
    choices: ["75%", "30%", "87.5%", "25%"],
    explain: "Optical purity = 30 / 40 = 75%, so ee = 75%: a mixture of 87.5% (S) and 12.5% (R). In practice rotation isn't always proportional to ee, so check by HPLC or similar too.",
  },
  'c5-1-13': {
    q: "Two diastereomers formed in a 9 : 1 ratio. What is the diastereomeric excess (de)?",
    choices: ["80%", "90%", "10%", "45%"],
    explain: "de = (90 − 10) / (90 + 10) = 80%: the ee calculation applied to diastereomers. Diastereomers differ physically, so the ratio can be measured by NMR or an ordinary column.",
  },
  'c5-1-14': {
    q: "What is asymmetric synthesis?",
    choices: ["Making more of one enantiomer from achiral starting materials", "Separating a racemate into its two enantiomers", "Removing the stereocenters from a chiral molecule", "Always making the enantiomers 1:1"],
    explain: "The second is optical resolution. Resolution throws away up to half (the unwanted enantiomer), but asymmetric synthesis can turn all the starting material into the desired one.",
  },
  'c5-1-15': {
    q: "Using only achiral reagents on an achiral starting material, you make a product with a stereocenter. The product is…",
    choices: ["Racemic", "R only", "S only", "Meso"],
    explain: "The transition states to R and to S are mirror images with equal energies. To favor one, something chiral is needed somewhere: catalyst, auxiliary, reagent or solvent.",
  },
  'c5-1-16': {
    q: "What do you call starting from optically active natural compounds such as amino acids, sugars and terpenes?",
    choices: ["The chiral pool approach", "Kinetic resolution", "Asymmetric catalysis", "Preferential crystallization"],
    explain: "Stereocenters made by nature are carried straight into the target. L-Amino acids and D-glucose are cheap and plentiful, but the enantiomer nature doesn't make is harder to reach.",
  },
  'c5-1-17': {
    q: "Which describes how a chiral auxiliary is used?",
    choices: ["Attach it temporarily to set the stereochemistry, then remove it", "Add a catalytic amount and let it work many times", "Use it to separate a racemate by crystallization", "Leave it in the product permanently as a marker"],
    explain: "With the auxiliary attached, the reaction's two transition states are diastereomeric and differ in energy. The products are diastereomers too, so you can purify them on a column before removing the auxiliary, which can be recovered and reused.",
  },
  'c5-1-18': {
    q: "What is the biggest advantage of asymmetric catalysis?",
    choices: ["A little catalyst makes lots of chiral product", "No chiral compound is needed at all", "Any reaction always reaches 100% ee", "Reactions are always faster and cooler"],
    explain: "If one catalyst molecule turns over thousands of times, the “source” of chirality is multiplied thousands of times. A chiral auxiliary works only once per molecule. The 2001 Nobel Prize in Chemistry (Knowles, Noyori, Sharpless) honored asymmetric catalysis.",
  },
  'c5-1-19': {
    q: "Adding a lipase (an enzyme) and an acetate ester to a racemic alcohol acetylated only one enantiomer quickly. This is an example of what?",
    choices: ["Kinetic resolution", "Preferential crystallization", "Resolution by diastereomeric salts", "Racemization"],
    explain: "A chiral enzyme reacts the two enantiomers at different rates. Stop partway, and the fast one is an ester while the slow one stays an alcohol, so they can be separated.",
  },
  'c5-1-20': {
    q: "A racemic carboxylic acid was made into salts with (R)-1-phenylethylamine. How are the two salts related?",
    choices: ["Diastereomers", "Enantiomers", "The same compound", "Both meso"],
    mols: ["(R)-1-Phenylethylamine"],
    explain: "The combinations are (R)-acid·(R)-amine and (S)-acid·(R)-amine. A mirror would give (S)-acid·(S)-amine, so they aren't mirror images of each other. That's why their solubilities differ and they can be separated by crystallization.",
  },
  'c5-1-21': {
    q: "A racemic amine was resolved with (R,R)-tartaric acid, giving crystals of one salt. How do you recover the amine?",
    choices: ["Add aqueous NaOH and extract into an organic solvent", "Add HCl and take it out in the aqueous layer", "Heat it so that only the tartaric acid sublimes", "Distill the salt crystals as they are"],
    explain: "Base removes H⁺ from the ammonium ion, and the neutral amine moves into the organic layer. Tartaric acid stays in the aqueous layer as its disodium salt, ready to recover and reuse.",
  },
  'c5-1-22': {
    q: "Taking only (R)-thalidomide doesn't make it safe. What is the main reason?",
    choices: ["It racemizes quickly in the body, forming (S) too", "The (R) form is decomposed in the stomach", "The (R) form isn't absorbed at all", "The (R) and (S) forms are equally toxic"],
    explain: "The H on thalidomide's stereocenter sits next to the imide carbonyl and is acidic, so it enolizes and racemizes under physiological conditions. Give just one enantiomer, and both are soon present.",
  },

  // ---------------- Undergrad II ----------------
  'c5-2-01': {
    q: "You want p-nitrobenzoic acid from toluene. What is a good order?",
    choices: ["Nitrate, take the para isomer, then oxidize CH₃", "Oxidize CH₃ with KMnO₄ first, then nitrate", "Either order gives the same product", "Nitrate and oxidize in the same pot at once"],
    mols: ["Toluene", "p-Nitrobenzoic acid"],
    explain: "CH₃ directs ortho/para, so nitrating first gives the para isomer. Make COOH first and, as a meta director, it gives m-nitrobenzoic acid instead. The order you introduce groups sets their positions.",
  },
  'c5-2-02': {
    q: "You want to make a Grignard reagent from 4-bromobenzaldehyde and react it with CO₂. What do you do first?",
    choices: ["Protect the aldehyde as an acetal", "Reduce the aldehyde to an alcohol with NaBH₄", "React it with Mg as it is", "Swap Br for Cl, then react with Mg"],
    mols: ["4-Bromobenzaldehyde"],
    explain: "The Grignard reagent would attack the aldehyde in the same molecule. Acetals are stable to bases and nucleophiles, so do the Grignard chemistry protected and remove the acetal with aqueous acid at the end. As an alcohol, the OH would destroy the Grignard instead.",
  },
  'c5-2-03': {
    q: "A compound has a TBS ether and a Bn (benzyl) ether. Which reagent removes only the Bn?",
    choices: ["H₂ / Pd-C", "TBAF", "K₂CO₃ / MeOH", "DIBAL-H"],
    explain: "A Bn ether comes off by hydrogenolysis (H₂ / Pd-C) while TBS stays. Conversely, TBAF removes only TBS. Protecting groups removed in different ways are called “orthogonal.”",
  },
  'c5-2-04': {
    q: "You want to reduce only the carboxylic acid of monomethyl adipate and keep the ester. Which reagent?",
    choices: ["BH₃·THF", "LiAlH₄", "NaBH₄", "DIBAL-H (2 equiv)"],
    mols: ["Monomethyl adipate"],
    explain: "Borane is a Lewis acid, so it quickly reduces the electron-rich C=O of a carboxylic acid (via an acyloxyborane), while esters react slowly. LiAlH₄ reduces both; NaBH₄ hardly reduces either.",
  },
  'c5-2-05': {
    q: "You want to reduce only the C=C of 2-cyclohexenone to make cyclohexanone. What is a good method?",
    choices: ["H₂ / Pd-C (room temperature, 1 atm)", "NaBH₄ / CeCl₃ (Luche reduction)", "LiAlH₄", "Wolff–Kishner reduction"],
    mols: ["2-Cyclohexenone"],
    explain: "Hydrogenation over Pd reduces C=C faster than C=O. The Luche reduction does the opposite, reducing only C=O to an allylic alcohol; LiAlH₄ mainly adds 1,2 too. Wolff–Kishner turns C=O into CH₂.",
  },
  'c5-2-06': {
    q: "When you disconnect a β-hydroxy ketone retrosynthetically, what is the most natural cut and reaction?",
    choices: ["Cut between the α and β carbons (aldol reaction)", "Cut between the C=O carbon and the α carbon (Grignard)", "Cut between the β carbon and the OH (SN2)", "Cut the O–H bond (deprotonation)"],
    mols: ["4-Hydroxy-2-butanone"],
    explain: "Two oxygen functions in a 1,3 relationship are the signature of an aldol. Cutting the α–β bond gives an enolate (nucleophile) and an aldehyde (electrophile).",
  },
  'c5-2-07': {
    q: "When you disconnect a 1,5-dicarbonyl compound retrosynthetically, which reaction should you think of?",
    choices: ["Michael addition", "Aldol reaction", "Diels–Alder reaction", "Wittig reaction"],
    explain: "Cutting between the α carbon of one carbonyl and the β carbon of the other gives an enolate and an α,β-unsaturated carbonyl. 1,3 suggests aldol (or Claisen), 1,5 suggests Michael: the spacing of the oxygens picks the reaction.",
  },
  'c5-2-08': {
    q: "You want a ketone from an acid chloride. Which reagent stops at the ketone instead of going on to the tertiary alcohol?",
    choices: ["R₂CuLi (a Gilman reagent)", "RMgBr (2 equiv or more)", "RLi (2 equiv or more)", "LiAlH₄ with R–Br"],
    explain: "Organocuprates are mild: they react with highly reactive acid chlorides but barely with the ketone formed. Grignard and organolithium reagents add a second time to the ketone.",
  },
  'c5-2-09': {
    q: "What is the synthetic equivalent of the acyl anion (R–C⁻=O) synthon?",
    choices: ["A dithiane anion (2-lithio-1,3-dithiane)", "RMgBr (a Grignard reagent)", "R–CHO (an aldehyde)", "R–COCl (an acid chloride)"],
    mols: ["1,3-Dithiane"],
    explain: "A carbonyl carbon is normally δ+, but as a dithiane its C–H becomes acidic, and as C⁻ it can attack electrophiles (umpolung, Corey–Seebach). Removing the dithiane at the end with Hg²⁺ or similar regenerates the ketone.",
  },
  'c5-2-10': {
    q: "Brominating aniline gives the tribromo product. How do you make only p-bromoaniline?",
    choices: ["Acetylate, brominate, then hydrolyze", "Use more Br₂ and react for longer", "Add FeBr₃ to speed the reaction up", "Nitrate first, then brominate"],
    mols: ["Acetanilide", "p-Bromoaniline"],
    explain: "As an amide, the nitrogen lone pair is drawn toward the carbonyl, toning down activation so only one Br goes on. The bulky acetyl group also shields the ortho positions, so para dominates. Protecting groups can also “tune” reactivity.",
  },
  'c5-2-11': {
    q: "You want m-chloroaniline from benzene. What is a good order?",
    choices: ["Nitrate → chlorinate → reduce the nitro", "Chlorinate → nitrate → reduce the nitro", "Nitrate → reduce the nitro → chlorinate", "Chlorinate → aminate → nitrate"],
    mols: ["m-Chloroaniline"],
    explain: "Cl and NH₂ both direct ortho/para, so they can't be placed meta to each other directly. So chlorinate while the meta-directing NO₂ is on, then reduce NO₂ to NH₂ last (Sn / HCl or H₂ / Pd-C).",
  },
  'c5-2-12': {
    q: "You mix 10 g of (R) at 90% ee with 10 g of racemate. What is the ee of the mixture?",
    choices: ["45%", "90%", "50%", "95%"],
    explain: "The 90% ee material is 9.5 g (R) and 0.5 g (S); the racemate is 5 g of each. Together: 14.5 g (R) and 5.5 g (S), so ee = 9 / 20 = 45%. Or think of the 9 g “excess” diluted into 20 g total.",
  },
  'c5-2-13': {
    q: "10 g of racemate is resolved via diastereomeric salts. Without racemization, what is the most pure (R) you can get?",
    choices: ["5 g", "10 g", "2.5 g", "7.5 g"],
    explain: "A racemate is only half (R). Resolution just separates, so at most 50%. Racemizing the leftover (S) and resolving again raises the yield over repeated cycles.",
  },
  'c5-2-14': {
    q: "You want to resolve a racemic carboxylic acid. Which can serve as the resolving agent?",
    choices: ["(R)-1-Phenylethylamine", "(R,R)-Tartaric acid", "Racemic 1-phenylethylamine", "Triethylamine"],
    explain: "Making a salt with an acid needs a base, and the resolving agent must be optically active. Tartaric acid is an acid, used for resolving amines. A racemic or achiral amine won't give diastereomers.",
  },
  'c5-2-15': {
    q: "Which of these optically active resolving agents is used to resolve racemic acids?",
    choices: ["Brucine", "(R,R)-Tartaric acid", "(1S)-Camphor-10-sulfonic acid", "(R)-Mandelic acid"],
    explain: "Alkaloids such as brucine, quinine and strychnine are natural optically active bases, long used to resolve acids. Tartaric, camphorsulfonic and mandelic acids are acids, used to resolve bases (amines).",
  },
  'c5-2-16': {
    q: "An acyl group was put on an Evans oxazolidinone, turned into an enolate with LDA, and treated with an alkyl halide. What sets the stereochemistry?",
    choices: ["The auxiliary's substituent blocks one enolate face", "The THF solvent acts in a chiral way", "The alkyl halide itself is chiral", "Only the low temperature of −78 °C"],
    mols: ["(S)-4-Benzyl-2-oxazolidinone"],
    explain: "Li chelates the enolate O and the auxiliary's C=O, locking the shape. The electrophile approaches from the face away from the 4-substituent, so diastereoselectivity is very high.",
  },
  'c5-2-17': {
    q: "After alkylation with an Evans auxiliary, what conditions are commonly used to remove it and get the carboxylic acid?",
    choices: ["LiOH / H₂O₂", "TBAF", "H₂ / Pd-C", "O₃, then Me₂S"],
    explain: "HOO⁻ from H₂O₂ selectively attacks the less hindered exocyclic (acyl) carbonyl, so the auxiliary survives and can be recovered. LiOH alone can attack the ring carbonyl and open the auxiliary.",
  },
  'c5-2-18': {
    q: "What is the chiral component of AD-mix for the Sharpless asymmetric dihydroxylation?",
    choices: ["A ligand derived from cinchona alkaloids", "BINAP (an axially chiral phosphine)", "Diethyl tartrate", "L-Proline"],
    explain: "AD-mix contains an osmium salt, the reoxidant K₃Fe(CN)₆, K₂CO₃ and a chiral ligand: (DHQ)₂PHAL in α, (DHQD)₂PHAL in β, which deliver the two OH's to opposite faces of the alkene.",
  },
  'c5-2-19': {
    q: "Which substrates work well in the Katsuki–Sharpless asymmetric epoxidation (Ti(Oi-Pr)₄, diethyl tartrate, t-BuOOH)?",
    choices: ["Allylic alcohols", "Simple alkenes with no functional group", "Ketones", "Terminal alkynes"],
    explain: "The allylic OH binds to titanium, holding the double bond in the catalyst's chiral pocket. Alkenes without this “handle” give poor selectivity, so other methods such as the Jacobsen–Katsuki epoxidation (a salen Mn complex) are used.",
  },
  'c5-2-20': {
    q: "In a kinetic resolution, what do you call the ratio of the rate constants of the fast- and slow-reacting enantiomers?",
    choices: ["The selectivity factor s", "The ee (enantiomeric excess)", "The equilibrium constant K", "The diastereomeric ratio"],
    explain: "s = k_fast / k_slow. The larger s, the higher the ee at low conversion. Even with small s, pushing the reaction further raises the ee of the remaining starting material, at the cost of less material.",
  },
  'c5-2-21': {
    q: "Why can an enzyme react just one enantiomer of a racemate efficiently?",
    choices: ["The enzyme is chiral, so the TSs are diastereomeric", "The enzyme makes the solution a chiral solvent", "The enzyme destroys one enantiomer first", "Enzymes can only bind R molecules"],
    explain: "An enzyme's active site, built from L-amino acids, is chiral. The two enantiomers fit it like different keys in one lock, so their transition-state energies differ.",
  },
  'c5-2-22': {
    q: "What is the advantage of using an enzyme to hydrolyze just one ester of a meso diacetate (desymmetrization of a meso compound)?",
    choices: ["In theory, a 100% yield of a single enantiomer", "At most 50% yield, but easier to carry out", "The product is obtained as a racemate", "The same selectivity without the enzyme"],
    mols: ["cis-4-Cyclopentene-1,3-diol diacetate"],
    explain: "The meso compound's two esters sit at mirror-related (enantiotopic) positions. If the enzyme picks which one to cut, every molecule becomes the same enantiomer of the monoacetate. Unlike resolving a racemate, there's no half to throw away.",
  },

  // ---------------- Grad Entrance Exam ----------------
  'c5-3-01': {
    q: "A compound has a PMB (p-methoxybenzyl) ether and a Bn ether. Which reagent removes only the PMB?",
    choices: ["DDQ", "H₂ / Pd-C", "TBAF", "LiAlH₄"],
    explain: "Thanks to its methoxy group, PMB is electron-rich, so DDQ oxidizes it by one electron and it comes off via an oxocarbenium ion. Bn is too electron-poor to be removed by DDQ. H₂ / Pd-C removes both.",
  },
  'c5-3-02': {
    q: "You want to protect both OH's of a cis-1,2-diol at once. What is a good method?",
    choices: ["Make an acetonide (2,2-dimethoxypropane, H⁺)", "Add just 1 equivalent of TBSCl", "Make methyl ethers with MeI and NaH", "Acetylate in water with Ac₂O and NaOH"],
    explain: "1,2- and 1,3-diols form five- and six-membered acetals (acetonides) with acetone. One step protects both OH's, and aqueous acid removes it. Methyl ethers are hard to remove.",
  },
  'c5-3-03': {
    q: "A diol has a primary and a secondary OH. You want to protect only the primary one. What is a good method?",
    choices: ["Add just 1 equivalent of bulky TBDPSCl", "Add excess BnBr and NaH", "Add excess Ac₂O and pyridine", "Add excess MeI and Ag₂O"],
    explain: "Bulky silyl or trityl groups react much faster with an uncrowded primary OH: chemoselective protection by steric difference. A small reagent in excess protects both.",
  },
  'c5-3-04': {
    q: "A compound has an aldehyde and a ketone. Which conditions reduce only the ketone?",
    choices: ["NaBH₄ / CeCl₃ (aqueous ethanol)", "NaBH₄ / EtOH (−78 °C)", "LiAlH₄ (THF, −78 °C)", "DIBAL-H (toluene)"],
    explain: "Luche's method. With Ce³⁺ present, the more reactive aldehyde first forms an adduct with water or alcohol (hydrate or hemiacetal) and is temporarily protected, while only the ketone gets reduced. Under ordinary conditions, the aldehyde is reduced first.",
  },
  'c5-3-05': {
    q: "In the Pinnick oxidation (NaClO₂: aldehyde → carboxylic acid), why is 2-methyl-2-butene added?",
    choices: ["To capture the HOCl byproduct", "To serve as a solvent for the substrate", "To regenerate the sodium chlorite", "To neutralize the acid as a base"],
    explain: "When chlorous acid oxidizes the aldehyde, hypochlorous acid (HOCl) is released, which would attack the substrate's C=C or the chlorite itself. A large excess of electron-rich alkene soaks it up first.",
  },
  'c5-3-06': {
    q: "What is a useful move when planning a 1,6-dicarbonyl compound retrosynthetically?",
    choices: ["Reconnect the two C=O's: think from a cyclohexene", "Cut the central bond by an aldol reaction", "Cut between C3 and C4 by a Michael addition", "Think from esters via a Claisen condensation"],
    mols: ["Hexanedial", "Cyclohexene"],
    explain: "A 1,6 relationship is an “illogical” distance for enolate chemistry. So reconnect the two C=O's as a C=C, which gives a cyclohexene, something you can build by a Diels–Alder reaction and the like.",
  },
  'c5-3-07': {
    q: "A 1,4-dicarbonyl can't be made from an enolate plus an ordinary carbonyl compound. Which pairing is used instead?",
    choices: ["An enolate and an α-halo ketone", "A Grignard reagent and an aldehyde", "A diene and a dienophile", "An aldol of two aldehydes"],
    explain: "A 1,4 relationship requires joining two α carbons. One α carbon is normally nucleophilic, so the other must be an umpoled, electrophilic α carbon (an α-halo ketone). A Stork enamine with an α-bromo ketone is a common choice.",
  },
  'c5-3-08': {
    q: "You want to reduce only the nitro group of 3-nitroacetophenone to an amine and keep the ketone. Which reagent?",
    choices: ["SnCl₂ / HCl", "NaBH₄ / MeOH", "LiAlH₄ / THF", "Wolff–Kishner reduction"],
    mols: ["3-Nitroacetophenone"],
    explain: "Dissolving metals and Sn(II) selectively reduce the nitro group by electron transfer. NaBH₄ reduces only the ketone. LiAlH₄ turns aromatic nitro groups into azo compounds and reduces the ketone as well.",
  },
  'c5-3-09': {
    q: "You want 2-allyl-3-methylcyclohexanone from 2-cyclohexenone in one flask. What is a good method?",
    choices: ["1,4-Add Me₂CuLi, then trap the enolate with allyl bromide", "First allylate α with LDA / allyl bromide, then add MeMgBr", "1,2-Add MeMgBr, then add allyl bromide", "Form the enolate with LDA, then add Me₂CuLi"],
    mols: ["2-Cyclohexenone", "2-Allyl-3-methylcyclohexanone"],
    explain: "Cuprate conjugate addition gives exactly the enolate that is nucleophilic at C2. Trapping it with an electrophile installs groups at β and then α in sequence (mainly trans to each other). MeMgBr normally adds 1,2.",
  },
  'c5-3-10': {
    q: "In solid-phase peptide synthesis (Fmoc strategy), what removes the Fmoc group each time an amino acid is added?",
    choices: ["Piperidine (in DMF)", "TFA (in dichloromethane)", "H₂ / Pd-C", "HF (liquid)"],
    explain: "The fluorene C9–H of Fmoc is acidic; base removes it and the group falls off E1cB-style. Side chains carry acid-labile t-Bu-type groups, removed by TFA at the end together with cleavage from the resin: an orthogonal base/acid pairing.",
  },
  'c5-3-11': {
    q: "When can a tertiary alcohol R₂R′C–OH be made from an ester and a Grignard reagent (2+ equiv)?",
    choices: ["When two of the three groups are the same", "When all three groups are different", "Only when all three groups are the same", "It can never be made this way"],
    explain: "RMgBr adds once to the ester R′COOMe to give the ketone R′COR, which takes a second RMgBr right away. Two identical groups go on, so the disconnection removes two identical groups at once.",
  },
  'c5-3-12': {
    q: "In a kinetic resolution with s = 10, you want 99% ee for the unreacted starting material. What should you do?",
    choices: ["Run it to about 70% conversion", "Stop at exactly 50% conversion", "Stop at 10% conversion", "With s = 10, 99% ee is never reachable"],
    explain: "Putting s = 10 and ee = 0.99 into Kagan's equation s = ln[(1−c)(1−ee)] / ln[(1−c)(1+ee)] gives c ≈ 0.72. The slow enantiomer reacts a little too, so you push on until the fast one is “eaten up”; what's left is high ee, but there's less of it.",
  },
  'c5-3-13': {
    q: "A racemic terminal epoxide is resolved by Jacobsen's hydrolytic kinetic resolution (HKR). What are the catalyst and nucleophile?",
    choices: ["A (salen)Co complex and water", "A (salen)Mn complex and NaOCl", "Ti(Oi-Pr)₄ and t-BuOOH", "OsO₄ and NMO"],
    mols: ["Propylene oxide"],
    explain: "A chiral Co(III)–salen complex opens only one enantiomer with water to the 1,2-diol. With about 0.5 equivalent of water, both the leftover epoxide and the diol come out in high ee. Its strength is starting from cheap racemic epoxides.",
  },
  'c5-3-14': {
    q: "Hydrogenating a racemic α-substituted β-keto ester with Ru–BINAP gives one stereoisomer almost quantitatively. Why?",
    choices: ["The α carbon racemizes fast; only one is reduced fast", "The catalyst destroys one enantiomer", "The α stereochemistry is set after reduction", "One product crystallizes and drops out"],
    explain: "If the two enantiomers interconvert faster than they react, the slow one keeps turning into the fast one and reacting. Noyori's method sets the α and β stereocenters together, giving a single diastereomer as well.",
  },
  'c5-3-15': {
    q: "How does Mosher's method determine the absolute configuration of a chiral secondary alcohol by NMR?",
    choices: ["Make (R)- and (S)-MTPA esters and compare the signs of Δδ", "Run the alcohol's ¹H NMR as is in CDCl₃", "Just compare the sign of the rotation with the literature", "Count the peaks in the ¹³C NMR"],
    explain: "In the preferred conformation of an MTPA ester, the phenyl ring current shifts the H's of the substituent on one side upfield. The sign of the shift difference between the two diastereomers tells you which side of the stereocenter each group is on.",
  },
  'c5-3-16': {
    q: "What is the hydrogen source in Noyori's Ru–TsDPEN-catalyzed asymmetric transfer hydrogenation of ketones?",
    choices: ["Isopropanol or formic acid", "High-pressure H₂ gas", "The hydride of NaBH₄", "The hydride of LiAlH₄"],
    explain: "Instead of H₂ gas, the H's released as isopropanol becomes acetone, or formic acid becomes CO₂, are handed to the ketone. No high-pressure equipment needed, so it's easy to run.",
  },
  'c5-3-17': {
    q: "At room temperature (25 °C), the energy gap between the transition states to the two enantiomers, ΔΔG‡, is about 7.3 kJ/mol (1.75 kcal/mol). What is the ee, roughly?",
    choices: ["90%", "50%", "99%", "20%"],
    explain: "Product ratio = exp(ΔΔG‡ / RT) = exp(7300 / (8.314 × 298)) ≈ 19. That's 95 : 5, so ee ≈ 90%. 99% ee (199 : 1) needs about 13 kJ/mol at room temperature. Small energy gaps act exponentially.",
  },
  'c5-3-18': {
    q: "In preferential crystallization, R is being crystallized from R seed crystals. What happens if you wait too long?",
    choices: ["S starts to crystallize too, and the ee drops", "The ee of the crystals keeps rising", "The R crystals dissolve and disappear", "The crystals turn into a meso compound"],
    explain: "As R leaves, S becomes the excess (supersaturated) in solution. Eventually S nucleates too, so you filter and stop before that. Controlling time and temperature is the key.",
  },
  'c5-3-19': {
    q: "After filtering off the R crystals in preferential crystallization, what should you add to the mother liquor to keep resolving efficiently?",
    choices: ["More racemate, then S seed crystals", "R seed crystals", "A resolving agent", "Nothing; just keep cooling"],
    explain: "With R removed, the mother liquor has an excess of S. Add racemate and seed with S, and now S crystallizes. Alternately harvesting R and S this way is used industrially too (L-glutamic acid, for example).",
  },
  'c5-3-20': {
    q: "In a diastereomeric salt resolution, the salt of the (R)-amine you want is the more soluble one and stays in the mother liquor. What is a good fix?",
    choices: ["Switch to the other enantiomer of the resolving agent", "Use twice as much of the same resolving agent", "Heat it up so that everything dissolves", "There's nothing for it but to use the racemate"],
    explain: "The (R)-amine·(S)-acid salt is the enantiomer of the (S)-amine·(R)-acid salt, so the solubility relationship flips completely. That's why resolving agents available as both enantiomers (tartaric acid, etc.) are prized.",
  },
  'c5-3-21': {
    q: "What is Ellman's tert-butanesulfinamide mainly used to make?",
    choices: ["Chiral amines", "Chiral epoxides", "Chiral carboxylic acids", "Chiral allenes"],
    mols: ["tert-Butanesulfinamide"],
    explain: "It condenses with aldehydes and ketones to N-sulfinyl imines, to which Grignard reagents and others add. The sulfur stereocenter controls the direction of addition, and acid removes the sulfinyl group at the end to give a chiral primary amine.",
  },
  'c5-3-22': {
    q: "In lipase-catalyzed acetylation of alcohols, why use vinyl acetate as the acyl donor?",
    choices: ["The released enol becomes acetaldehyde: no reverse reaction", "Vinyl acetate is chiral and raises the selectivity", "Vinyl acetate activates the lipase enzyme", "Vinyl acetate polymerizes and protects the product"],
    mols: ["Vinyl acetate"],
    explain: "Ordinary transesterification is an equilibrium, and running backward erodes the ee of the resolution. The enol (vinyl alcohol) from vinyl acetate tautomerizes at once to acetaldehyde, so the reaction runs one way.",
  },

  // ---------------- PhD (Brutal) ----------------
  'c5-4-01': {
    q: "In a 10-step synthesis, 6 steps build skeletal bonds such as C–C, 1 is a redox step toward the target oxidation state, and 3 are protection/deprotection and functional-group shuffles. What is Baran's “ideality”?",
    choices: ["70%", "60%", "30%", "100%"],
    explain: "Ideality = (construction steps + strategic redox steps) / total steps × 100 = 7 / 10 × 100 = 70%. Protecting-group steps and back-and-forth redox count as “non-ideal” (Gaich and Baran, 2010).",
  },
  'c5-4-02': {
    q: "In Robinson's 1917 one-flask synthesis of tropinone, what were the three starting materials?",
    choices: ["Succinaldehyde, methylamine and acetone", "Glutaraldehyde, ammonia and acetone", "Cycloheptanone, methylamine and formaldehyde", "Pyrrole, acrolein and methanol"],
    mols: ["Tropinone"],
    explain: "Methylamine and the dialdehyde form iminium ions, and two successive Mannich reactions with acetone (via its enol) build the bicycle. Acetonedicarboxylic acid in place of acetone improves the yield. A classic of biomimetic synthesis, echoing biosynthesis in plants.",
  },
  'c5-4-03': {
    q: "W. S. Johnson's progesterone synthesis (1971) built four rings at once by cationic polyene cyclization. What inspired it?",
    choices: ["The biosynthesis of lanosterol from oxidosqualene", "The oxidative degradation of cholesterol", "Diels–Alder reactions between terpenes", "The biosynthesis of penicillin"],
    explain: "In the body, an enzyme opens an epoxide, and the cation engulfs the aligned double bonds one after another, closing the four steroid rings. Johnson showed that a polyene lined up with the right stereochemistry undergoes the same cascade without an enzyme.",
  },
  'c5-4-04': {
    q: "A β-hydroxy ketone was reduced with Me₄NBH(OAc)₃ (Evans–Saksena reduction). What mainly forms?",
    choices: ["The 1,3-anti diol", "The 1,3-syn diol", "syn : anti = 1 : 1", "The ketone isn't reduced"],
    explain: "The existing OH binds to boron to form an alkoxyborohydride, which delivers hydride intramolecularly. Through a chair transition state, hydride enters from the near side: anti. The Narasaka–Prasad reduction (Et₂BOMe chelation, then external NaBH₄) gives syn instead.",
  },
  'c5-4-05': {
    q: "A β-hydroxy ketone was chelated with Et₂BOMe and then reduced with NaBH₄ (Narasaka–Prasad reduction). What mainly forms?",
    choices: ["The 1,3-syn diol", "The 1,3-anti diol", "syn : anti = 1 : 1", "An epoxide"],
    explain: "Boron links the two oxygens into a six-membered chair chelate. External hydride attacks axially (from the less crowded face), giving syn: the complement of the intramolecular Evans–Saksena reduction (anti).",
  },
  'c5-4-06': {
    q: "Which silyl protecting group is hardest to remove under acidic conditions?",
    choices: ["TBDPS (tert-butyldiphenylsilyl)", "TMS (trimethylsilyl)", "TES (triethylsilyl)", "TBS (tert-butyldimethylsilyl)"],
    explain: "Acid stability runs roughly TMS < TES < TBS < TIPS < TBDPS. The bulkier the groups around silicon, the slower protonation of oxygen and nucleophilic attack at silicon. Differences in stability let you remove several silyl groups one at a time.",
  },
  'c5-4-07': {
    q: "You want to reduce an organic azide that also has an alkene and an ester to the amine, without touching the rest. How?",
    choices: ["PPh₃ and H₂O (Staudinger reduction)", "H₂ / Pd-C (1 atm)", "LiAlH₄ / THF", "Zn / conc. HCl, heated"],
    explain: "PPh₃ attacks the terminal N of the azide, N₂ is lost, and an iminophosphorane forms, which water hydrolyzes to the amine and Ph₃P=O. It touches neither the C=C nor the ester. H₂ / Pd-C would reduce the alkene, LiAlH₄ the ester.",
  },
  'c5-4-08': {
    q: "In Corey's prostaglandin synthesis (1969), which intermediate became the key branching point to many analogs?",
    choices: ["The Corey lactone", "The Wieland–Miescher ketone", "The Hajos–Parrish ketone", "Danishefsky's diene"],
    explain: "A bicyclic lactone with four stereocenters set on the cyclopentane ring. Attaching the two side chains by Wittig reactions and the like gives a wide range of prostaglandins. A prime example of finding a “common intermediate” in retrosynthesis.",
  },
  'c5-4-09': {
    q: "At the end of an Fmoc synthesis, why are “scavengers” such as triisopropylsilane and water added when removing side-chain protecting groups with TFA?",
    choices: ["To stop the cations formed from alkylating Trp or Cys", "To neutralize the TFA and protect the peptide", "To keep the peptide from leaving the resin", "To deliberately racemize the side chains"],
    explain: "Removing t-Bu esters, ethers and Boc groups releases a flood of reactive cations. The silane quenches them by donating hydride, and water and thiols also capture them, so indoles and thiols don't pick up “extra protecting groups.”",
  },
  'c5-4-10': {
    q: "1-Decene was oxidized with PdCl₂ / CuCl / O₂ in aqueous DMF (Wacker–Tsuji oxidation). What is the major product?",
    choices: ["2-Decanone", "Decanal", "1,2-Epoxydecane", "1,2-Decanediol"],
    explain: "Water attacks the Pd(II)-bound alkene at the more substituted end (Markovnikov), and steps including β-hydride elimination give the methyl ketone. CuCl and O₂ reoxidize Pd(0) to Pd(II). A terminal alkene can be carried along as a “masked methyl ketone.”",
  },
  'c5-4-11': {
    q: "In Corey's retrosynthetic vocabulary, a substructure that signals a usable reaction (a transform) is a “retron.” What is the retron for the Diels–Alder transform?",
    choices: ["A cyclohexene ring", "A 1,3-dicarbonyl", "A β-hydroxy carbonyl", "An epoxide"],
    explain: "Spot a cyclohexene ring in the target, then think of the retro-Diels–Alder and see whether it splits into a diene and a dienophile. If the retron isn't complete, adding or changing functional groups to create it is part of the strategy too.",
  },
  'c5-4-12': {
    q: "From a sample of 80% ee, two molecules are joined at random (regardless of configuration) to make a C₂-symmetric dimer. What is the ee of the chiral dimers (R,R and S,S)?",
    choices: ["About 98%", "80%", "64%", "90%"],
    explain: "R is 0.9 and S 0.1. R,R is 0.81, S,S is 0.01, and R,S (meso) is 0.18. ee of the chiral dimers = (0.81 − 0.01) / 0.82 ≈ 98%. The minor enantiomer is “soaked up” into the meso dimer, so the ee rises (Horeau's principle).",
  },
  'c5-4-13': {
    q: "How is the transition state of Noyori's Ru–TsDPEN transfer hydrogenation of ketones understood?",
    choices: ["Ru–H's H⁻ and N–H's H⁺ go to the C=O together", "The ketone binds Ru, then Ru–H inserts", "The ketone becomes a radical anion, then takes H", "The ligand's Ts group delivers the hydride"],
    explain: "A “bifunctional” catalyst in which metal and ligand cooperate. The ketone stays outside the Ru (outer sphere) and receives H⁻ and H⁺ at once. A CH/π interaction between the arene ligand and the ketone's substituent decides which face receives them.",
  },
  'c5-4-14': {
    q: "What was the very early kinetic resolution reported by Marckwald and McKenzie in 1899?",
    choices: ["Esterifying racemic mandelic acid with (−)-menthol", "Feeding racemic tartaric acid to a mold", "Sorting tartrate crystals with tweezers", "Destroying one enantiomer with circularly polarized light"],
    explain: "Reacting with a chiral alcohol makes the two enantiomers' transition states diastereomeric, so they react at different rates; stop partway and the remaining acid has an ee. The second option is Pasteur's biological resolution (1858), the third his crystal sorting (1848).",
  },
  'c5-4-15': {
    q: "Halpern and co-workers studied Rh–DIPAMP asymmetric hydrogenation of dehydroamino acid esters. Which catalyst–substrate complex did the major product come from?",
    choices: ["The minor (less stable) complex", "The major (more stable) complex", "Both complexes equally", "Neither: from the free substrate"],
    explain: "The two complexes interconvert rapidly (Curtin–Hammett conditions). The product ratio depends not on how much of each complex there is but on the energies of the transition states beyond. The minor complex reacts with H₂ orders of magnitude faster, so the major product came from it: the opposite of “lock and key” intuition.",
  },
  'c5-4-16': {
    q: "In Seebach's “self-regeneration of stereocenters,” how is the ee kept when the α position of L-proline is alkylated?",
    choices: ["A new acetal stereocenter remembers the old one", "The α enolate never becomes planar", "The alkylating agent itself is chiral", "The product is resolved afterward"],
    explain: "The original α stereocenter is used to create a new stereocenter at an acetal carbon. Forming the α enolate erases the original, but the bulky t-Bu on the acetal carbon blocks one face, so the electrophile enters from a set face. The acetal is removed at the end.",
  },
  'c5-4-17': {
    q: "In Kawabata's “memory of chirality,” why does ee survive when an amino acid derivative with an α stereocenter is α-alkylated via its enolate, with no external chiral source?",
    choices: ["The enolate keeps slowly rotating axial chirality", "No enolate actually forms in the first place", "The alkyl halide itself is chiral", "The solvent molecules are chiral"],
    explain: "The central chirality vanishes in the planar enolate, but it is “remembered” as conformational (axial) chirality around nitrogen. If the electrophile reacts within that lifetime, the ee survives: a race between racemization and reaction.",
  },
  'c5-4-18': {
    q: "What tendency of racemic crystals does Wallach's rule (1895) describe?",
    choices: ["Racemic crystals are often denser", "Most racemates form conglomerates", "Racemic crystals always melt lower", "Racemates don't crystallize at all"],
    explain: "Pairing R with S allows inversion centers and glide planes, so molecules pack tightly. That's why about 90% of racemates form racemic compounds, and conglomerates, which allow preferential crystallization, stay a minority.",
  },
  'c5-4-19': {
    q: "A 50% ee sample was purified on an achiral silica gel column. The early and late fractions differed greatly in ee. What is this phenomenon?",
    choices: ["Self-disproportionation of enantiomers", "The column was actually chiral", "It racemized inside the column", "Measurement error"],
    explain: "A sample with an ee forms homochiral (R·R) and heterochiral (R·S) aggregates in different proportions. The aggregates differ physically, so they separate even on an achiral column, or by sublimation or distillation (SDE). Be careful when measuring ee after purification.",
  },
  'c5-4-20': {
    q: "What is often seen in “Dutch resolution,” where several structurally similar resolving agents are added together?",
    choices: ["Salts crystallize fast and in high purity", "Only the racemate ever precipitates", "The resolving agents react and vanish", "No crystals form at all"],
    explain: "The similar agents are thought to enter the same crystal (a solid solution) and hinder nucleation of the more soluble salt. It saves the dozens of trials once needed to find a resolving agent.",
  },
  'c5-4-21': {
    q: "A catalyst giving 90% ee at room temperature (ΔΔG‡ ≈ 7.3 kJ/mol) is used at −78 °C. If ΔΔG‡ doesn't change, what is the ee, roughly?",
    choices: ["About 98%", "90% (no change)", "About 99.9%", "About 80%"],
    explain: "Ratio = exp(7300 / (8.314 × 195)) ≈ 90, so ee ≈ (90 − 1)/(90 + 1) ≈ 98%. The lower the temperature, the bigger the ratio from the same energy gap. In reality the balance of ΔΔH‡ and ΔΔS‡ sometimes makes ee drop at low temperature.",
  },
  'c5-4-22': {
    q: "In Takasago's industrial synthesis of l-menthol, what was the key asymmetric reaction?",
    choices: ["Rh–BINAP asymmetric isomerization of an allylamine", "A proline-catalyzed aldol reaction", "Katsuki–Sharpless asymmetric epoxidation", "Lipase-catalyzed kinetic resolution"],
    mols: ["l-Menthol"],
    explain: "Rh–BINAP shifts the allylamine's double bond to one side, giving an optically active enamine (Noyori, Otsuka and co-workers). Hydrolysis gives citronellal, which becomes menthol through cyclization and hydrogenation. A landmark of industrial asymmetric catalysis, running at a thousand tons a year.",
  },

  // ---------------- Story questions ----------------
  'c5-wake-1': {
    q: "You want to turn Enolas's CH₂ back into C=O. Which oxidant goes with White and Chen's iron catalyst Fe(PDP)?",
    choices: ["H₂O₂ (+ a little AcOH)", "NaBH₄", "LiAlH₄", "H₂ and Pd/C"],
    explain: "With H₂O₂, Fe(PDP) forms a high-valent iron–oxo species that abstracts a hydrogen from a C–H bond and inserts oxygen. A secondary C–H (CH₂) is oxidized via the alcohol all the way to the ketone. The other three are reductants.",
  },
  'c5-wake-2': {
    q: "What symmetry does the ligand (S,S)-PDP, grown by Achiral, have?",
    choices: ["Only a C₂ axis; chiral", "A mirror plane; achiral", "No symmetry elements", "An inversion center; achiral"],
    explain: "PDP is a ligand with two pyridylmethyl groups on a linked bis-pyrrolidine skeleton. It has a C₂ axis (a 180° turn superimposes it on itself) but no mirror plane: the same “symmetric yet chiral” shape as BINAP or (R,R)-tartaric acid.",
  },
  'c5-wake-3': {
    q: "Which C–H bonds does an electrophilic oxidant like Fe(PDP) prefer to oxidize?",
    choices: ["Electron-rich, sterically uncrowded C–H", "C–H right next to an electron-withdrawing group", "Always the C–H of a methyl group (CH₃)", "Only aromatic C–H"],
    explain: "The iron–oxo species is electrophilic, so it prefers electron-rich C–H bonds. It avoids those near electron-withdrawing groups and crowded sites. Ease of oxidation: tertiary > secondary ≫ primary.",
  },
  'c5-boka-1': {
    q: "When a racemate crystallizes, what do you call the case where R and S sit in pairs within the same crystal?",
    choices: ["A racemic compound", "A conglomerate", "A racemic solid solution", "A meso compound"],
    explain: "In a racemic compound, R and S enter the same unit cell in pairs. Most racemic crystals (about 90%) are racemic compounds.",
  },
  'c5-boka-2': {
    q: "What do you call the case where R and S precipitate as separate crystals?",
    choices: ["A conglomerate", "A racemic compound", "Diastereomeric salts", "A meso compound"],
    explain: "In a conglomerate, R crystals and S crystals form separately and lie mixed together. About 10% of racemates. Adding seed crystals can crystallize just one of them (preferential crystallization).",
  },
  'c5-boka-3': {
    q: "Why could Pasteur sort the crystals of a tartrate salt with tweezers?",
    choices: ["It formed a conglomerate; the crystals were mirror-image shapes", "The two kinds of crystal were different colors", "Only one kind of crystal dissolved in the water", "Only one kind of crystal grew large enough to see"],
    explain: "Sodium ammonium tartrate (tetrahydrate) forms a conglomerate when crystallized below about 27 °C. Right- and left-handed faces appear on the crystals, so they could be sorted by shape. At higher temperature it forms a racemic double salt.",
  },
  'c5-boka-q1': {
    q: "Are you glad you were chosen?",
    choices: ["I can't say I'm glad", "I don't know", "I don't think I was chosen"],
    replies: ["…That's honest. If it were me, I'd say I was glad.", "You don't know, huh. For twenty years, that's all I've thought about.", "…That's not fair. The ones who get chosen always say that."],
  },
  'c5-boka-q2': {
    q: "Then where should I have been?",
    choices: ["Next to me", "Wherever you choose"],
    replies: ["Inside the same crystal? …That's never coming back.", "Choose… Me? The one who wasn't chosen?"],
  },
} });

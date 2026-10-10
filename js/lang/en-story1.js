// =============================================================
// en-story1.js — 英語の台本：プロローグ・村・第 1 章「求核の森」
// 場面ごとに、日本語の台本の t のある行を、同じ順に並べる（行の数は tests.html で確かめる）
// =============================================================
I18N.add('en', { scenes: {
  prologue: [
    '(A white laboratory. The hum of a fume hood fan. On the bench, a carbon atom named Carbo opens its eyes.)',
    '…Good morning, Carbo. How do you feel?',
    'I have… four hands. None of them are holding anything yet.',
    "That's right. You're an sp³ carbon. Who you bond with using those four hands will decide your “right” and your “left.”",
    'Bond with four different partners, and you become a stereocenter. Something that can never be superimposed on its own reflection.',
    'Never superimposed… on my own reflection.',
    '(Glancing away for just a moment) …Now, choose your companions.',
    "(With all four hands filled, Carbo's body gained a handedness.)",
    "…I see. So you're 〈自分〉.",
    'Professor?',
    "No, it's nothing. Those are good hands. Take care of them.",
    'East of the village is the hermitage of Elder Benzene, eldest of the aromatics. Go and see him first.',
  ],
  lab_prof: [
    "Elder Benzene's hermitage is east of the village. Look for the hexagonal roof.",
    "If you're tired, rest on the bed in the back.",
  ],
  lab_prof2: [
    'The forest is north of the village. …Be careful out there, Carbo.',
  ],
  lab_prof3: [
    'I hear you cleared the fog from the forest. Well done.',
    "Port Carbonyl is down the east road out of the village. …Don't push yourself.",
  ],
  lab_prof_c2end: [
    'I hear Grigna at the port will take you to the Aromatic Kingdom by boat.',
    "…What happened with Enolas must have been hard. If you're tired, rest on the bed in the back.",
  ],
  lab_prof_c3: [
    "I've heard about the kingdom's pillars. Look after Elder Benzene for me.",
  ],
  lab_prof_c3end: [
    'The Mirror Cloister, is it…',
    "…No, it's nothing. For now, get some rest.",
  ],

  elder: [
    '(A hexagonal hermitage. Elder Benzene sits perfectly still.)',
    "Welcome, youngster. I'm Benzene, elder of the aromatics.",
    'Nice to meet you. The professor sent me.',
    "Something's amiss in the forest. Molecules are being “flattened” one after another, losing their handedness.",
    'Flattened…? You mean their stereochemistry is being erased?',
    'Aye. The culprits call themselves the Meso Order. Folk with a mirror inside them, so they say.',
    "Won't you come with us, Elder?",
    "On principle, I don't do addition reactions.",
    '……?',
    "Meaning I don't budge. My six π electrons keep me right here.",
    "(Whispering) So basically, he doesn't like getting up…",
    "I heard that. …The forest is north of the village. I'm counting on you, youngster.",
  ],
  elder_after: [
    "On principle, I don't do addition reactions. …The forest is to the north.",
  ],
  elder_after2: [
    'Well done, youngster. The birds are singing in the forest again.',
    "I don't do addition reactions, on principle… but I can still say thank you. Thank you.",
  ],
  guard: [
    "Past here is Nucleophile Forest. It's dangerous right now.",
    "I can't let you through without Elder Benzene's permission.",
  ],
  guard2: [
    'The elder told me about you. Take care.',
    'They say Meso Order folk are lurking in the forest grass.',
  ],
  guard3: [
    'The forest has gone quiet at last. Thank you.',
  ],
  gate_block: [
    "Whoa, hold on. You can't go into the forest without Elder Benzene's permission.",
  ],
  water: [
    "I'm H₂O. I'm polar, and I can give up a proton. The classic protic solvent, that's me.",
    'But you know, when I surround the little anions, they can hardly move. I hug them too tight with my hydrogen bonds.',
  ],
  methane: [
    'All four of my hands are hydrogens.',
    'So I look the same in a mirror! No right, no left.',
    'Carbo, all four of your hands are different, huh. That is so cool.',
  ],
  guard3_3: [
    'I hear the elder took a boat from the port to the kingdom.',
    "When was the last time he left his hermitage? Decades, surely. …Seeing that roof empty from here just doesn't sit right with me.",
  ],
  guard3_4: [
    "What a relief the elder's back. He smells a little of chlorine now, mind you.",
    'More to the point, lately the northern mountains shine like a mirror at night. …It dazzles me when I keep watch.',
  ],
  guard3_5: [
    'The light on the northern mountains went out, just like that.',
    "…That was you lot, wasn't it? The whole village is talking about it.",
  ],
  water_2: [
    'The fog has lifted from the forest? My laundry dries so much better now. …Though when I dry, I vanish myself.',
    "Off to the port? I sometimes cling to the carbonyl folk there. It's called hydration. Usually I let go right away, though.",
  ],
  water_3: [
    "I hear the elder's gone back to the kingdom.",
    "He doesn't dissolve in water one bit, you know. I cried when I saw him off, and he repelled every last tear.",
  ],
  water_4: [
    "The elder came back as chlorobenzene, didn't he.",
    "With a chlorine on him, he's picked up a touch of polarity. He seems easier to talk to than before. …He still won't dissolve, though.",
  ],
  water_5: [
    "I hear ripples have started on the northern lake?",
    "That's a good thing. Water is at its best when it sways a little.",
  ],
  methane_2: [
    'The fog in the forest cleared, right? I was fine in the fog. I never had a right or left anyway.',
    "…But having a direction you have to protect, like Carbo does… I'm a little jealous.",
  ],
  methane_3: [
    'I heard about the port. That Achiral person says having no right or left is best, right?',
    "I don't have a right or left… but I've never once thought that was a good thing.",
  ],
  methane_4: [
    "The elder got a chlorine! If I got a chlorine, I'd be chloromethane.",
    "…I'd still look the same in a mirror, though. If I swapped two more hands for different ones, could I be like Carbo?",
  ],
  methane_5: [
    'Is it true you shook hands with that Achiral person?',
    'All four of my hands are the same, so I can shake with any of them. Pretty handy, huh?',
  ],

  forest_entry: [
    '(A figure in a perfectly symmetric mask leaps out from between the trees.)',
    'Symmetry! Symmetry! You there, stereocenter, halt!',
    'Who are you?!',
    "We are the Meso Order! Handedness is the root of all strife! We'll flatten your stereochemistry too!",
    'Careful, Carbo. They shake your heart with chemistry questions.',
    'Answer right and their masks crack. Answer wrong… and we take the hit.',
    "Y-you'll pay for this…! Deep in the forest awaits our executive, Lady Cationne!",
    '(The Meso Acolyte fled deeper into the forest.)',
    "Cationne… So that's the executive ravaging this forest.",
    "There may be more acolytes hiding in the grass. Let's head deeper in.",
  ],
  victim: [
    '…Right hand… left hand…',
    "Which one was mine, I wonder… Ever since the fog wrapped around me, I can't remember.",
  ],
  lumber: [
    'In that fog, we tertiaries were the first to go down.',
    "With three carbons lending a hand to prop us up, we make stable cations. That's exactly what did us in.",
    'Watch yourself. Word is that woman can “transform” into an even more stable shape.',
  ],
  victim_2: [
    "The fog's cleared, and I can see the sun again.",
    "I still can't remember which hand was mine. …But sitting here in the sun, I don't feel too bad.",
  ],
  victim_3: [
    'I heard about the lighthouse child at the port. Had the whole C=O erased.',
    'All I did was forget which way my hands go. …I suppose I got off lightly.',
  ],
  victim_4: [
    'They say the pillars of the kingdom stayed aromatic, scars and all.',
    "Even if I never remember which way my hands go, I'm still me. …That's what I've decided.",
  ],
  lumber_2: [
    'With the fog gone, I can cut wood again. Thanks.',
    'That woman vanished with the fog. Shift a neighboring hydrogen or methyl, and a carbocation rearranges into something more stable. …No wonder she got away so fast.',
  ],
  lumber_3: [
    'I heard about the phantom thief at the port. The one with a different face by day and by night.',
    "Come to think of it, old man Benzene took a boat to the kingdom. Him, moving? It'll be snowing next.",
  ],
  lumber_4: [
    "The old man's back from the kingdom. Heard he picked up a chlorine, but he was sitting there as solid as ever.",
    'More to the point, the northern mountains. Lately the peaks shine like a mirror. Sometimes it dazzles me while I chop.',
  ],
  lumber_5: [
    "The light on the northern mountains is gone. …You did something again, didn't you.",
    'Work is going great now. Tertiary is stable, but out in the sun I feel even more stable.',
  ],
  sisters: [
    '(A flower field. A minty scent mingles with a caraway scent. Two girls sit huddled on the ground.)',
    'Are you okay?',
    "We're the Carvone sisters. I'm the elder, the (R) one. I smell of spearmint.",
    "I'm (S). I smell of caraway. …I used to, anyway.",
    '“Used to”?',
    "When the fog came, my sister's hand went “flat” for a moment. After that, we got harder and harder to tell apart…",
    "Now even we can't tell whose scent is whose.",
    "Enantiomers have almost all the same properties. You can only tell them apart with something that's chiral too… like the receptors in your nose.",
    'Becoming the same… is so lonely.',
    "…I'll put you back the way you were. I promise.",
    '(From deep in the fog comes the sound of approaching footsteps.)',
  ],
  sisters_after: [
    "There's someone in a red dress deep in the fog. …Be careful.",
  ],
  sisters_after2: [
    'The fog cleared, and we can see the sky now.',
    "Our scents are still mixed up. But… as long as I'm with my big sister, I'm okay.",
  ],
  sisters_c4end: [
    'The light on the northern mountains went out. The nights are properly dark again. You can see the stars.',
    "Our scents are still mixed. …But I'm starting to feel that the mixed scent is ours, too.",
  ],
  duo: [
    '(In a gap in the fog, two Meso Acolytes stand back to back.)',
    'Symmetry!',
    'Yrtemmys!',
    "…Hey, don't say it backwards.",
    "That's how it looks in a mirror!",
    '(Whispering) …They seem to get along pretty well.',
    '(When the duo fell, the thick fog blocking the way began to clear.)',
  ],
  boss: [
    '(The fog swirls, and at its center floats a woman in a red dress, a flat fan spread open.)',
    "My, there's still a child left with four hands.",
    "So you're Cationne. You're the one flattening the molecules of the forest.",
    "I'm doing them a favor. Once they're flat, they look the same from above and below, don't they?",
    "No right, no left. No one chosen, no one abandoned. Isn't that lovely?",
    'The Carvone sisters were crying.',
    'Everyone says that at first. But they soon get used to it. Being racemic is easy.',
    "Careful, Carbo. She's a carbocation. That empty p orbital pulls in anything.",
    "(Carbo and the others' electrons pour straight into Cationne's empty p orbital. The fog begins to lift.)",
    '…To fill my empty p orbital, of all things. Unfair child.',
    "Put the forest's molecules back the way they were.",
    "Once something has gone flat, it doesn't come back. But… the fog will lift. Nothing more will be flattened.",
    "Remember this. Defeating me alone won't stop the Order. No one can stop Grand Master Achiral's ideal now…",
    '(Cationne vanished along with the fog.)',
    "Grand Master Achiral… So that's the head of the Meso Order.",
    '(The flower field, free of fog. The Carvone sisters are on their feet.)',
    "Our scents… are still mixed. But now that the fog's gone, I feel like I can tell my own scent, just a little.",
    "Thank you. Even mixed up, we'll stay together, the two of us.",
    "(Professor Mirrorfield's voice comes over the communicator.)",
    'Carbo, well done. …Did Cationne say anything?',
    'She mentioned a name: “Grand Master Achiral.” The head of the Order, apparently.',
    '(A long silence) …I see.',
    "Next, head for Port Carbonyl. I hear the merchants there are having the stereocenters at their α-positions erased, night after night.",
    '(Carbo gazed at those four hands. No one will ever flatten these.)',
  ],
} });

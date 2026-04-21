// ── Word Database ────────────────────────────────────────
const WORDS = [
    // ── SIMPLE ──────────────────────────────────────────────
    {
        id: 'simple-01', word: 'Candid', pronunciation: '/ˈkæn.dɪd/', partOfSpeech: 'adjective',
        etymology: 'Latin "candidus" meaning white, pure, sincere',
        meaning: 'Truthful and straightforward; frank.',
        usage: 'Her candid feedback helped the team improve the product before launch.',
        synonyms: ['frank', 'honest', 'forthright', 'direct'],
        antonyms: ['deceptive', 'guarded', 'evasive'],
        mnemonic: 'Think of a CANDIDate who must be honest to win votes.',
        level: 'simple',
        homonyms: [{ meaning: 'A photograph taken informally, without the subject posing.', usage: 'The photographer captured beautiful candid shots at the wedding.' }]
    },
    {
        id: 'simple-02', word: 'Keen', pronunciation: '/kiːn/', partOfSpeech: 'adjective',
        etymology: 'Old English "cēne" meaning bold, brave',
        meaning: 'Eager or enthusiastic; having a sharp edge or intellect.',
        usage: 'She has a keen interest in artificial intelligence and its applications.',
        synonyms: ['eager', 'enthusiastic', 'sharp', 'perceptive'],
        antonyms: ['apathetic', 'indifferent', 'dull'],
        mnemonic: 'KEEN sounds like "key in" — you KEY IN to things you\'re eager about.',
        level: 'simple',
        homonyms: [{ meaning: 'To wail in grief for the dead.', usage: 'The women keened at the funeral, their cries echoing through the valley.' }]
    },
    {
        id: 'simple-03', word: 'Quaint', pronunciation: '/kweɪnt/', partOfSpeech: 'adjective',
        etymology: 'Old French "cointe" meaning clever, from Latin "cognitus" (known)',
        meaning: 'Attractively unusual or old-fashioned.',
        usage: 'The quaint little bookshop on the corner has been there since 1923.',
        synonyms: ['charming', 'picturesque', 'old-fashioned', 'whimsical'],
        antonyms: ['modern', 'ordinary', 'ugly'],
        mnemonic: 'QUAINT rhymes with PAINT — imagine painting a charming old cottage.',
        level: 'simple'
    },
    {
        id: 'simple-04', word: 'Serene', pronunciation: '/sɪˈriːn/', partOfSpeech: 'adjective',
        etymology: 'Latin "serenus" meaning clear, calm',
        meaning: 'Calm, peaceful, and untroubled.',
        usage: 'The lake was perfectly serene at dawn, not a ripple on its surface.',
        synonyms: ['calm', 'peaceful', 'tranquil', 'placid'],
        antonyms: ['agitated', 'turbulent', 'anxious'],
        mnemonic: 'SERENE = the SCENE is so peaceful, you feel at REST.',
        level: 'simple'
    },
    {
        id: 'simple-05', word: 'Ample', pronunciation: '/ˈæm.pəl/', partOfSpeech: 'adjective',
        etymology: 'Latin "amplus" meaning large, spacious',
        meaning: 'Enough or more than enough; plentiful.',
        usage: 'There is ample evidence to suggest the strategy is working.',
        synonyms: ['plentiful', 'abundant', 'sufficient', 'generous'],
        antonyms: ['insufficient', 'scarce', 'meager'],
        mnemonic: 'AMPLE has AMPLE letters — more than enough for a short word.',
        level: 'simple'
    },
    {
        id: 'simple-06', word: 'Brisk', pronunciation: '/brɪsk/', partOfSpeech: 'adjective',
        etymology: 'Probably from French "brusque" meaning lively',
        meaning: 'Active, fast, and energetic.',
        usage: 'A brisk walk in the morning can boost your productivity for the entire day.',
        synonyms: ['quick', 'lively', 'energetic', 'vigorous'],
        antonyms: ['sluggish', 'slow', 'lethargic'],
        mnemonic: 'BRISK sounds like RISK — you take risks when you move fast.',
        level: 'simple'
    },
    {
        id: 'simple-07', word: 'Deft', pronunciation: '/dɛft/', partOfSpeech: 'adjective',
        etymology: 'Middle English "deft" meaning gentle, meek, from Old English "gedæfte"',
        meaning: 'Demonstrating skill and cleverness; nimble.',
        usage: 'The surgeon\'s deft hands made the complex procedure look effortless.',
        synonyms: ['skillful', 'adroit', 'nimble', 'dexterous'],
        antonyms: ['clumsy', 'awkward', 'inept'],
        mnemonic: 'DEFT = D(exterously) EFF(icient) T(echnique).',
        level: 'simple'
    },
    {
        id: 'simple-08', word: 'Ponder', pronunciation: '/ˈpɒn.dər/', partOfSpeech: 'verb',
        etymology: 'Latin "ponderare" meaning to weigh, consider',
        meaning: 'To think about something carefully before making a decision.',
        usage: 'She sat by the window to ponder the implications of the new policy.',
        synonyms: ['contemplate', 'deliberate', 'reflect', 'muse'],
        antonyms: ['ignore', 'disregard', 'neglect'],
        mnemonic: 'PONDER = POND + ER — sitting by a POND, thinking deeply.',
        level: 'simple'
    },
    {
        id: 'simple-09', word: 'Wary', pronunciation: '/ˈwɛə.ri/', partOfSpeech: 'adjective',
        etymology: 'Old English "wær" meaning aware, cautious',
        meaning: 'Feeling or showing caution about possible dangers.',
        usage: 'Investors are wary of putting money into volatile markets.',
        synonyms: ['cautious', 'watchful', 'vigilant', 'guarded'],
        antonyms: ['reckless', 'careless', 'trusting'],
        mnemonic: 'WARY = WAR + Y — in WAR, you must always be on guard.',
        level: 'simple'
    },
    {
        id: 'simple-10', word: 'Zeal', pronunciation: '/ziːl/', partOfSpeech: 'noun',
        etymology: 'Greek "zelos" meaning ardor, eager rivalry',
        meaning: 'Great energy or enthusiasm in pursuit of a cause or objective.',
        usage: 'His zeal for environmental conservation inspired the entire community.',
        synonyms: ['enthusiasm', 'passion', 'fervor', 'ardor'],
        antonyms: ['apathy', 'indifference', 'lethargy'],
        mnemonic: 'ZEAL starts with Z — the last letter, but first in energy!',
        level: 'simple'
    },

    // ── MEDIUM ──────────────────────────────────────────────
    {
        id: 'medium-01', word: 'Pragmatic', pronunciation: '/præɡˈmæt.ɪk/', partOfSpeech: 'adjective',
        etymology: 'Greek "pragmatikos" meaning fit for action, from "pragma" (deed)',
        meaning: 'Dealing with things sensibly and practically rather than ideally.',
        usage: 'The CEO took a pragmatic approach to restructuring, focusing on what could realistically be achieved.',
        synonyms: ['practical', 'realistic', 'sensible', 'matter-of-fact'],
        antonyms: ['idealistic', 'impractical', 'unrealistic'],
        mnemonic: 'PRAGMATIC = PRACTICAL + AUTOMATIC — practically automatic good sense.',
        level: 'medium'
    },
    {
        id: 'medium-02', word: 'Ephemeral', pronunciation: '/ɪˈfɛm.ər.əl/', partOfSpeech: 'adjective',
        etymology: 'Greek "ephemeros" meaning lasting only a day',
        meaning: 'Lasting for a very short time.',
        usage: 'Social media fame is often ephemeral — here today, forgotten tomorrow.',
        synonyms: ['fleeting', 'transient', 'brief', 'momentary'],
        antonyms: ['permanent', 'enduring', 'eternal'],
        mnemonic: 'E-FEM-ERAL: a FEMME in a fairy tale — beautiful but vanishes at midnight.',
        level: 'medium'
    },
    {
        id: 'medium-03', word: 'Lucid', pronunciation: '/ˈluː.sɪd/', partOfSpeech: 'adjective',
        etymology: 'Latin "lucidus" meaning bright, clear, from "lux" (light)',
        meaning: 'Expressed clearly; easy to understand. Also: mentally clear.',
        usage: 'Her lucid explanation of quantum computing made even beginners understand the concept.',
        synonyms: ['clear', 'coherent', 'intelligible', 'transparent'],
        antonyms: ['confusing', 'vague', 'muddled', 'obscure'],
        mnemonic: 'LUCID = LUCY IS always CLEAR-headed.',
        level: 'medium'
    },
    {
        id: 'medium-04', word: 'Arduous', pronunciation: '/ˈɑːr.dʒu.əs/', partOfSpeech: 'adjective',
        etymology: 'Latin "arduus" meaning steep, difficult',
        meaning: 'Involving or requiring strenuous effort; difficult and tiring.',
        usage: 'The arduous hike to the summit took twelve hours, but the view was worth it.',
        synonyms: ['strenuous', 'grueling', 'laborious', 'demanding'],
        antonyms: ['easy', 'effortless', 'simple'],
        mnemonic: 'ARDUOUS = HARD + U + OUS — it\'s HARD on YOU.',
        level: 'medium'
    },
    {
        id: 'medium-05', word: 'Benevolent', pronunciation: '/bɪˈnɛv.ə.lənt/', partOfSpeech: 'adjective',
        etymology: 'Latin "bene" (well) + "volent" (wishing)',
        meaning: 'Well-meaning and kindly; generous.',
        usage: 'The benevolent donor funded scholarships for hundreds of underprivileged students.',
        synonyms: ['kind', 'charitable', 'generous', 'altruistic'],
        antonyms: ['malevolent', 'cruel', 'selfish'],
        mnemonic: 'BENE = good (like "benefit"), VOLENT = wanting. Wanting good for others.',
        level: 'medium'
    },
    {
        id: 'medium-06', word: 'Cogent', pronunciation: '/ˈkoʊ.dʒənt/', partOfSpeech: 'adjective',
        etymology: 'Latin "cogere" meaning to compel, drive together',
        meaning: 'Clear, logical, and convincing.',
        usage: 'The lawyer presented a cogent argument that swayed the jury\'s decision.',
        synonyms: ['compelling', 'convincing', 'persuasive', 'forceful'],
        antonyms: ['weak', 'unconvincing', 'vague'],
        mnemonic: 'CO-GENT = a CO-worker who is a GENT(leman) always speaks convincingly.',
        level: 'medium'
    },
    {
        id: 'medium-07', word: 'Diligent', pronunciation: '/ˈdɪl.ɪ.dʒənt/', partOfSpeech: 'adjective',
        etymology: 'Latin "diligens" meaning attentive, careful, from "diligere" (to value highly)',
        meaning: 'Having or showing care and conscientiousness in one\'s work or duties.',
        usage: 'The diligent researcher spent months verifying every source in her paper.',
        synonyms: ['industrious', 'hardworking', 'meticulous', 'assiduous'],
        antonyms: ['lazy', 'careless', 'negligent'],
        mnemonic: 'DILIGENT = DILL (the herb) + I + GENT — a gentleman who carefully grows dill.',
        level: 'medium'
    },
    {
        id: 'medium-08', word: 'Eloquent', pronunciation: '/ˈɛl.ə.kwənt/', partOfSpeech: 'adjective',
        etymology: 'Latin "eloquens" meaning speaking out, from "e-" (out) + "loqui" (to speak)',
        meaning: 'Fluent or persuasive in speaking or writing.',
        usage: 'Martin Luther King Jr. was renowned for his eloquent speeches that moved millions.',
        synonyms: ['articulate', 'expressive', 'fluent', 'silver-tongued'],
        antonyms: ['inarticulate', 'tongue-tied', 'mumbling'],
        mnemonic: 'ELO-QUENT = sounds like "HELLO, QUEEN" — speaking grandly to royalty.',
        level: 'medium'
    },
    {
        id: 'medium-09', word: 'Fortuitous', pronunciation: '/fɔːrˈtʃuː.ɪ.təs/', partOfSpeech: 'adjective',
        etymology: 'Latin "fortuitus" meaning happening by chance, from "fors" (chance)',
        meaning: 'Happening by accident or chance rather than design; often with a lucky outcome.',
        usage: 'A fortuitous meeting at a conference led to the partnership that saved the startup.',
        synonyms: ['lucky', 'fortunate', 'serendipitous', 'providential'],
        antonyms: ['planned', 'deliberate', 'unfortunate'],
        mnemonic: 'FORTUITOUS contains FORTUNE — good fortune by chance.',
        level: 'medium'
    },
    {
        id: 'medium-10', word: 'Gregarious', pronunciation: '/ɡrɪˈɡɛə.ri.əs/', partOfSpeech: 'adjective',
        etymology: 'Latin "gregarius" meaning belonging to a flock, from "grex" (flock)',
        meaning: 'Fond of company; sociable.',
        usage: 'The gregarious host made every guest feel welcome at the dinner party.',
        synonyms: ['sociable', 'outgoing', 'convivial', 'affable'],
        antonyms: ['introverted', 'reclusive', 'antisocial'],
        mnemonic: 'GREG-ARIOUS: GREG is always at every AREA of the party — so sociable!',
        level: 'medium'
    },

    // ── COMPLEX ─────────────────────────────────────────────
    {
        id: 'complex-01', word: 'Perspicacious', pronunciation: '/ˌpɜːr.spɪˈkeɪ.ʃəs/', partOfSpeech: 'adjective',
        etymology: 'Latin "perspicax" meaning sharp-sighted, from "perspicere" (to look through)',
        meaning: 'Having a ready insight into and understanding of things; shrewd.',
        usage: 'Her perspicacious reading of the market trends saved the firm millions in potential losses.',
        synonyms: ['astute', 'perceptive', 'shrewd', 'discerning'],
        antonyms: ['obtuse', 'unperceptive', 'dull'],
        mnemonic: 'PER-SPIC-ACIOUS: like "perspective" — someone who SEES THROUGH things clearly.',
        level: 'complex'
    },
    {
        id: 'complex-02', word: 'Sycophant', pronunciation: '/ˈsɪk.ə.fænt/', partOfSpeech: 'noun',
        etymology: 'Greek "sykophantes" meaning informer, literally "fig-shower"',
        meaning: 'A person who acts obsequiously toward someone important to gain advantage; a flatterer.',
        usage: 'The CEO surrounded himself with sycophants who never challenged his decisions.',
        synonyms: ['flatterer', 'toady', 'yes-man', 'bootlicker'],
        antonyms: ['critic', 'detractor', 'opponent'],
        mnemonic: 'SYCO-PHANT: a SICK ELEPHANT that follows you around, always agreeing.',
        level: 'complex'
    },
    {
        id: 'complex-03', word: 'Obfuscate', pronunciation: '/ˈɒb.fʌ.skeɪt/', partOfSpeech: 'verb',
        etymology: 'Latin "obfuscare" from "ob-" (over) + "fuscare" (to darken)',
        meaning: 'To render obscure, unclear, or unintelligible; to deliberately make confusing.',
        usage: 'The politician tried to obfuscate the issue by introducing irrelevant data points.',
        synonyms: ['obscure', 'confuse', 'muddle', 'bewilder'],
        antonyms: ['clarify', 'illuminate', 'elucidate'],
        mnemonic: 'OB-FUS-CATE: it\'s like FUSS + KATE — creating such a FUSS that things become unclear.',
        level: 'complex'
    },
    {
        id: 'complex-04', word: 'Magnanimous', pronunciation: '/mæɡˈnæn.ɪ.məs/', partOfSpeech: 'adjective',
        etymology: 'Latin "magnus" (great) + "animus" (soul)',
        meaning: 'Very generous or forgiving, especially toward a rival or less powerful person.',
        usage: 'In a magnanimous gesture, the winning candidate praised her opponent\'s campaign.',
        synonyms: ['generous', 'noble', 'benevolent', 'big-hearted'],
        antonyms: ['petty', 'vindictive', 'mean-spirited'],
        mnemonic: 'MAGNA-NIMOUS = MAGNA (great) + ANIMUS (spirit). A great-spirited person.',
        level: 'complex'
    },
    {
        id: 'complex-05', word: 'Pernicious', pronunciation: '/pərˈnɪʃ.əs/', partOfSpeech: 'adjective',
        etymology: 'Latin "perniciosus" from "pernicies" meaning destruction',
        meaning: 'Having a harmful effect, especially in a gradual or subtle way.',
        usage: 'The pernicious influence of misinformation on social media erodes public trust.',
        synonyms: ['harmful', 'destructive', 'damaging', 'noxious'],
        antonyms: ['beneficial', 'harmless', 'wholesome'],
        mnemonic: 'PER-NICIOUS: sounds like "per-VICIOUS" — something persistently vicious and harmful.',
        level: 'complex'
    },
    {
        id: 'complex-06', word: 'Recalcitrant', pronunciation: '/rɪˈkæl.sɪ.trənt/', partOfSpeech: 'adjective',
        etymology: 'Latin "recalcitrare" meaning to kick back, from "re-" (back) + "calcitrare" (to kick)',
        meaning: 'Having an obstinately uncooperative attitude; resistant to authority.',
        usage: 'The recalcitrant employee refused to follow the new company guidelines despite repeated warnings.',
        synonyms: ['defiant', 'unruly', 'obstinate', 'rebellious'],
        antonyms: ['obedient', 'compliant', 'docile'],
        mnemonic: 'RE-CALC-ITRANT: you RE-CALCulate, but it\'s still RESISTANT to change.',
        level: 'complex'
    },
    {
        id: 'complex-07', word: 'Sanguine', pronunciation: '/ˈsæŋ.ɡwɪn/', partOfSpeech: 'adjective',
        etymology: 'Latin "sanguineus" meaning of blood — medieval belief that blood = optimism',
        meaning: 'Optimistically cheerful and confident.',
        usage: 'Despite the economic downturn, the investors remained sanguine about the company\'s long-term prospects.',
        synonyms: ['optimistic', 'hopeful', 'positive', 'buoyant'],
        antonyms: ['pessimistic', 'gloomy', 'despondent'],
        mnemonic: 'SANG-WINE: after SINGING over WINE, you feel optimistic!',
        level: 'complex'
    },
    {
        id: 'complex-08', word: 'Truculent', pronunciation: '/ˈtrʌk.jə.lənt/', partOfSpeech: 'adjective',
        etymology: 'Latin "truculentus" meaning fierce, savage, from "trux" (fierce)',
        meaning: 'Eager or quick to argue or fight; aggressively defiant.',
        usage: 'The truculent negotiator slammed the table and refused every compromise offered.',
        synonyms: ['aggressive', 'combative', 'belligerent', 'pugnacious'],
        antonyms: ['peaceful', 'agreeable', 'amiable'],
        mnemonic: 'TRUCK-ULENT: imagine an angry TRUCK driver — road rage!',
        level: 'complex'
    },
    {
        id: 'complex-09', word: 'Vicissitude', pronunciation: '/vɪˈsɪs.ɪ.tjuːd/', partOfSpeech: 'noun',
        etymology: 'Latin "vicissitudo" meaning change, alternation, from "vicis" (turn, change)',
        meaning: 'A change of circumstances or fortune, typically unwelcome or unpleasant.',
        usage: 'The company weathered the vicissitudes of the market and emerged stronger.',
        synonyms: ['fluctuation', 'change', 'upheaval', 'shift'],
        antonyms: ['stability', 'constancy', 'permanence'],
        mnemonic: 'VICISSI-TUDE: life\'s VICIOUS changes in aTTITUDE.',
        level: 'complex'
    },
    {
        id: 'complex-10', word: 'Ameliorate', pronunciation: '/əˈmiː.li.ə.reɪt/', partOfSpeech: 'verb',
        etymology: 'Latin "melior" meaning better, influenced by French "améliorer"',
        meaning: 'To make something bad or unsatisfactory better.',
        usage: 'The new policies were designed to ameliorate working conditions in the factory.',
        synonyms: ['improve', 'better', 'enhance', 'alleviate'],
        antonyms: ['worsen', 'aggravate', 'deteriorate'],
        mnemonic: 'A-MELIO-RATE: sounds like "A MELON RATE" — rate your melon to make it better!',
        level: 'complex'
    },

    // ── COMPETITIVE ─────────────────────────────────────────
    {
        id: 'competitive-01', word: 'Loquacious', pronunciation: '/loʊˈkweɪ.ʃəs/', partOfSpeech: 'adjective',
        etymology: 'Latin "loquax" meaning talkative, from "loqui" (to speak)',
        meaning: 'Tending to talk a great deal; talkative.',
        usage: 'The loquacious professor often ran over the allotted lecture time by thirty minutes.',
        synonyms: ['talkative', 'garrulous', 'verbose', 'chatty'],
        antonyms: ['taciturn', 'reticent', 'laconic'],
        mnemonic: 'LO-QUACIOUS: a duck goes "QUACK" a lot — very talkative!',
        level: 'competitive'
    },
    {
        id: 'competitive-02', word: 'Recondite', pronunciation: '/ˈrɛk.ən.daɪt/', partOfSpeech: 'adjective',
        etymology: 'Latin "reconditus" meaning hidden, put away, from "re-" + "condere" (to store)',
        meaning: 'Little known; abstruse; dealing with obscure subject matter.',
        usage: 'The philosopher\'s recondite theories were accessible only to the most dedicated scholars.',
        synonyms: ['obscure', 'abstruse', 'esoteric', 'arcane'],
        antonyms: ['simple', 'straightforward', 'obvious'],
        mnemonic: 'RE-CON-DITE: knowledge so hidden you need to RE-CONduct a search to find it.',
        level: 'competitive'
    },
    {
        id: 'competitive-03', word: 'Pulchritude', pronunciation: '/ˈpʌl.krɪ.tjuːd/', partOfSpeech: 'noun',
        etymology: 'Latin "pulchritudo" meaning beauty, from "pulcher" (beautiful)',
        meaning: 'Beauty; physical comeliness.',
        usage: 'The pulchritude of the Italian countryside has inspired artists for centuries.',
        synonyms: ['beauty', 'loveliness', 'attractiveness', 'comeliness'],
        antonyms: ['ugliness', 'homeliness', 'plainness'],
        mnemonic: 'PULCHRITUDE: ironically, this UGLY-sounding word means BEAUTY.',
        level: 'competitive'
    },
    {
        id: 'competitive-04', word: 'Enervate', pronunciation: '/ˈɛn.ər.veɪt/', partOfSpeech: 'verb',
        etymology: 'Latin "enervare" from "e-" (out of) + "nervus" (sinew, nerve)',
        meaning: 'To cause someone to feel drained of energy or vitality; to weaken.',
        usage: 'The tropical heat enervated the explorers, leaving them barely able to walk by midday.',
        synonyms: ['exhaust', 'weaken', 'debilitate', 'sap'],
        antonyms: ['energize', 'invigorate', 'strengthen'],
        mnemonic: 'E-NERVE-ATE: it eats your NERVES away, leaving you weak (NOT energized!).',
        level: 'competitive'
    },
    {
        id: 'competitive-05', word: 'Laconic', pronunciation: '/ləˈkɒn.ɪk/', partOfSpeech: 'adjective',
        etymology: 'Greek "Lakonikos" — people of Laconia (Sparta) were known for brief speech',
        meaning: 'Using very few words; concise to the point of seeming rude.',
        usage: 'When asked if he would surrender, the laconic general replied simply: "No."',
        synonyms: ['terse', 'concise', 'succinct', 'pithy'],
        antonyms: ['verbose', 'loquacious', 'wordy'],
        mnemonic: 'LACONIC = like a Spartan from LACONIA — Spartans used few words.',
        level: 'competitive'
    },
    {
        id: 'competitive-06', word: 'Mendacious', pronunciation: '/mɛnˈdeɪ.ʃəs/', partOfSpeech: 'adjective',
        etymology: 'Latin "mendax" meaning lying, deceitful',
        meaning: 'Not telling the truth; lying; habitually dishonest.',
        usage: 'The mendacious politician was eventually exposed by investigative journalists.',
        synonyms: ['dishonest', 'deceitful', 'untruthful', 'duplicitous'],
        antonyms: ['honest', 'truthful', 'candid'],
        mnemonic: 'MEN-DA-CIOUS: MEN who are AUDACIOUS enough to lie.',
        level: 'competitive'
    },
    {
        id: 'competitive-07', word: 'Nugatory', pronunciation: '/ˈnjuː.ɡə.tɔː.ri/', partOfSpeech: 'adjective',
        etymology: 'Latin "nugatorius" meaning trifling, from "nugari" (to trifle)',
        meaning: 'Having no purpose or value; useless; futile.',
        usage: 'The committee\'s recommendations proved nugatory as management ignored them entirely.',
        synonyms: ['worthless', 'futile', 'trivial', 'pointless'],
        antonyms: ['valuable', 'significant', 'important'],
        mnemonic: 'NUG-ATORY: a chicken NUGGET in an ORATORY (speech) — useless!',
        level: 'competitive'
    },
    {
        id: 'competitive-08', word: 'Obstreperous', pronunciation: '/əbˈstrɛp.ər.əs/', partOfSpeech: 'adjective',
        etymology: 'Latin "obstreperus" meaning clamorous, from "ob-" (against) + "strepere" (to make noise)',
        meaning: 'Noisy and difficult to control; unruly.',
        usage: 'The obstreperous crowd made it impossible for the speaker to be heard.',
        synonyms: ['unruly', 'rowdy', 'boisterous', 'clamorous'],
        antonyms: ['quiet', 'docile', 'orderly'],
        mnemonic: 'OB-STREP-EROUS: like strep throat — everyone\'s LOUD and OBNOXIOUS.',
        level: 'competitive'
    },
    {
        id: 'competitive-09', word: 'Pusillanimous', pronunciation: '/ˌpjuː.sɪˈlæn.ɪ.məs/', partOfSpeech: 'adjective',
        etymology: 'Latin "pusillus" (very small) + "animus" (spirit, mind)',
        meaning: 'Showing a lack of courage or determination; timid; cowardly.',
        usage: 'The pusillanimous manager avoided every difficult conversation, letting problems fester.',
        synonyms: ['cowardly', 'timid', 'spineless', 'faint-hearted'],
        antonyms: ['brave', 'courageous', 'bold'],
        mnemonic: 'PUSILL-ANIMOUS: PUSSY (cat) + ANIMAL — a scaredy-cat animal.',
        level: 'competitive'
    },
    {
        id: 'competitive-10', word: 'Querulous', pronunciation: '/ˈkwɛr.ə.ləs/', partOfSpeech: 'adjective',
        etymology: 'Latin "querulus" meaning complaining, from "queri" (to complain)',
        meaning: 'Complaining in a petulant or whining manner.',
        usage: 'The querulous customer demanded to speak with the manager for the third time that week.',
        synonyms: ['whiny', 'petulant', 'peevish', 'grumbling'],
        antonyms: ['content', 'cheerful', 'uncomplaining'],
        mnemonic: 'QUER-ULOUS: always QUERying and questioning everything — so whiny!',
        level: 'competitive'
    }
];

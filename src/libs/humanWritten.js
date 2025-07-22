const natural = require('natural');
const pos = require('pos');
const nlp = require('compromise');
const randomWords = require('random-words');
const britishSlang = require('british-slang');
const synonyms = require('synonyms');
const wordnet = new natural.WordNet();
const { SentimentAnalyzer, PorterStemmer } = natural;
const analyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");

// Comprehensive idiom and colloquialism dictionaries
const idioms = require('./idioms.json');  // You'll need to create this file
const colloquialisms = require('./colloquialisms.json');  // You'll need to create this file

// New: Advanced NLP model for contextual synonym replacement
const advancedNLP = require('advanced-nlp-model');  // Hypothetical advanced NLP model

function shuffleArray(array) {
for (let i = array.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[array[i], array[j]] = [array[j], array[i]];
}
return array;
}

function getRandomElement(arr) {
return arr[Math.floor(Math.random() * arr.length)];
}

function introducePunctuation(text) {
const punctuations = [',', ';', ':', '!', '?'];
return text.replace(/\s+/g, (match) => {
return Math.random() < 0.1 ? `${match}${getRandomElement(punctuations)} ` : match;
});
}

function introduceTypos(text) {
const commonTypos = {
'the': 'teh',
'and': 'adn',
'to': 'ot',
'of': 'fo',
'a': 'sa',
'in': 'ni',
'is': 'si',
'it': 'ti',
'you': 'yuo',
'that': 'taht'
};

return text.replace(/\b\w+\b/g, (word) => {
return Math.random() < 0.05 && commonTypos[word.toLowerCase()] ? commonTypos[word.toLowerCase()] : word;
});
}

function addFillerWords(text) {
const fillers = ['um', 'uh', 'like', 'you know', 'I mean', 'sort of', 'kind of', 'basically', 'literally'];
return text.replace(/\./g, (match) => {
return Math.random() < 0.2 ? `. ${getRandomElement(fillers)}` : match;
});
}

function varyContractions(text) {
const contractions = {
'is not': "isn't",
'are not': "aren't",
'was not': "wasn't",
'were not': "weren't",
'have not': "haven't",
'has not': "hasn't",
'had not': "hadn't",
'will not': "won't",
'would not': "wouldn't",
'cannot': "can't",
'could not': "couldn't",
'do not': "don't",
'does not': "doesn't",
'did not': "didn't",
};

Object.keys(contractions).forEach(key => {
const regex = new RegExp(`\\b${key}\\b`, 'gi');
text = text.replace(regex, () => Math.random() < 0.5 ? contractions[key] : key);
});

return text;
}

function varyCapitalization(text) {
return text.replace(/\b\w+\b/g, (word) => {
if (word.length > 3 && Math.random() < 0.02) {
return word.toUpperCase();
}
return word;
});
}

async function getContextualSynonym(word, context) {
// Use advanced NLP model for better contextual understanding
const synonyms = await advancedNLP.getSynonyms(word, context);
return synonyms.length > 0 ? getRandomElement(synonyms) : word;
}

async function replaceWithSynonymsAndIdioms(sentence, context) {
const words = new natural.WordTokenizer().tokenize(sentence);
const taggedWords = new pos.Tagger().tag(words);

for (let i = 0; i < taggedWords.length; i++) {
const [word, tag] = taggedWords[i];
if (['NN', 'VB', 'JJ', 'RB'].includes(tag)) {
if (Math.random() < 0.3) {
if (idioms[word.toLowerCase()] && Math.random() < 0.5) {
words[i] = getRandomElement(idioms[word.toLowerCase()]);
} else {
const synonym = await getContextualSynonym(word, context);
words[i] = synonym || word;
}
}
}
}

return words.join(' ');
}

function addColloquialisms(text) {
Object.keys(colloquialisms).forEach(key => {
const regex = new RegExp(`\\b${key}\\b`, 'gi');
text = text.replace(regex, () => Math.random() < 0.3 ? getRandomElement(colloquialisms[key]) : key);
});

return text;
}

function adjustStyleBasedOnContext(text, context) {
const sentimentScore = analyzer.getSentiment(new natural.WordTokenizer().tokenize(text));

if (sentimentScore > 0.5) {
text = text.replace(/\b(good|great)\b/gi, 'awesome');
} else if (sentimentScore < -0.5) {
text = text.replace(/\b(bad|poor)\b/gi, 'terrible');
}

if (context.includes('technical') || context.includes('scientific')) {
text = text.replace(/\b(approximately|about)\b/gi, 'circa');
} else if (context.includes('casual') || context.includes('informal')) {
text = text.replace(/\b(approximately|about)\b/gi, 'roughly');
}

return text;
}

function generateBusinessJargon() {
const buzzwords = ['synergy', 'paradigm', 'leverage', 'optimize', 'streamline', 'ideate', 'disruptive', 'scalable'];
const verbs = ['implement', 'facilitate', 'strategize', 'innovate', 'revolutionize'];
const nouns = ['solution', 'framework', 'methodology', 'initiative', 'roadmap'];

return `${getRandomElement(verbs)} a ${getRandomElement(buzzwords)} ${getRandomElement(nouns)}`;
}

function introduceDiverseSentenceStructures(text) {
const sentences = text.split(/[.!?]+/);
return sentences.map(sentence => {
if (Math.random() < 0.1) {
// Create a sentence fragment
return sentence.split(' ').slice(0, Math.floor(sentence.split(' ').length / 2)).join(' ');
} else if (Math.random() < 0.1) {
// Create a run-on sentence
return sentence + ' and ' + getRandomElement(sentences);
}
return sentence;
}).join('. ');
}

function addPersonalTouch(text) {
const personalPhrases = [
"In my experience,",
"I've always thought that",
"You know what they say,",
"Call me crazy, but",
"I can't help but wonder if"
];
const sentences = text.split(/[.!?]+/);
const randomIndex = Math.floor(Math.random() * sentences.length);
sentences[randomIndex] = getRandomElement(personalPhrases) + ' ' + sentences[randomIndex].toLowerCase();
return sentences.join('. ');
}

function introduceDeliberateMistakes(text) {
    // List of common typos and grammatical errors
    const mistakes = [
    { regex: /\btheir\b/g, replacement: "there" },
    { regex: /\byou're\b/g, replacement: "your" },
    { regex: /\bit's\b/g, replacement: "its" },
    { regex: /\btwo\b/g, replacement: "to" },
    { regex: /\btoo\b/g, replacement: "to" },
    // Add more common mistakes here
    ];
    
    mistakes.forEach(({ regex, replacement }) => {
    if (Math.random() < 0.1) {
    text = text.replace(regex, replacement);
    }
    });
    
    return text;
    }
    
    function addRecentReferences(text) {
    const recentReferences = [
    "Did you catch that viral TikTok trend?",
    "It's giving major 2023 vibes.",
    "This is about as reliable as those ChatGPT stock predictions.",
    "I'm as excited about this as I am about the next Marvel movie.",
    "This makes about as much sense as crypto prices."
    ];
    
    if (Math.random() < 0.2) {
    const sentences = text.split(/[.!?]+/);
    const randomIndex = Math.floor(Math.random() * sentences.length);
    sentences[randomIndex] += ' ' + getRandomElement(recentReferences);
    text = sentences.join('. ');
    }
    
    return text;
    }
    
    function implementTopicDrift(text) {
    const driftPhrases = [
    "Speaking of which,",
    "That reminds me,",
    "On a completely unrelated note,",
    "Not to change the subject, but",
    "This might be off-topic, but"
    ];
    
    if (Math.random() < 0.2) {
    const sentences = text.split(/[.!?]+/);
    const randomIndex = Math.floor(Math.random() * sentences.length);
    sentences[randomIndex] = getRandomElement(driftPhrases) + ' ' + sentences[randomIndex].toLowerCase();
    text = sentences.join('. ');
    }
    
    return text;
    }
    
    async function processText(text, context = '') {
    let doc = nlp(text);
    
    // Use compromise to identify and potentially replace certain parts of speech
    doc.verbs().toInfinitive();
    doc.adjectives().forEach(adj => {
    if (Math.random() < 0.3) {
    const newAdj = randomWords({ exactly: 1, maxLength: 8 })[0];
    adj.replaceWith(newAdj);
    }
    });
    
    text = doc.text();
    
    let sentences = text.split(/[.!?]+/);
    let processedSentences = [];
    
    for (let sentence of sentences) {
    sentence = await replaceWithSynonymsAndIdioms(sentence, context);
    sentence = addColloquialisms(sentence);
    sentence = adjustStyleBasedOnContext(sentence, context);
    
    // Occasionally insert random business jargon
    if (Math.random() < 0.2) {
    sentence += ` We need to ${generateBusinessJargon()}.`;
    }
    
    processedSentences.push(sentence);
    }
    
    text = processedSentences.join('. ').trim() + '.';
    
    // Apply humanizing techniques
    text = varyContractions(text);
    text = introducePunctuation(text);
    text = introduceTypos(text);
    text = addFillerWords(text);
    text = varyCapitalization(text);
    
    // Apply additional enhancements
    text = introduceDiverseSentenceStructures(text);
    text = addPersonalTouch(text);
    text = introduceDeliberateMistakes(text);
    text = addRecentReferences(text);
    text = implementTopicDrift(text);
    
    return text;
    }
    
    module.exports = { processText };
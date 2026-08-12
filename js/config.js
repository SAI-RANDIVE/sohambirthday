/* =========================================================================
   SOHAMVERSE — CONFIGURATION
   -------------------------------------------------------------------------
   This is the only file you should need to edit to make this "yours".
   Change names, dates, photo lists, quiz questions and the final message
   here. Everything else in /js reads from this file.
   ========================================================================= */

const SOHAM_CONFIG = {
  name: "Soham",
  turningAge: 18,

  // ISO string WITH the +05:30 (IST) offset baked in. JS parses this
  // correctly regardless of what timezone the visitor's device is in —
  // do not remove the +05:30.
  targetDateTimeIST: "2026-08-13T00:00:00+05:30",

  // Shown while "17" is still current, before the big reveal.
  currentAge: 17,
};

/* -------------------------------------------------------------------------
   PHOTOS
   Drop files into: assets/images/
   Use the filename you actually saved — these are just suggested names.
   Missing files are skipped automatically, so it's safe to leave some in
   this list even before you've added the picture.
   ------------------------------------------------------------------------- */
const SOHAM_PHOTOS = [
  { src: "assets/images/smilingsoham.jpeg",      title: "THE BEGINNING",       caption: "And then the adventure began..." },
  { src: "assets/images/lazysoham.jpeg",          title: "LITTLE SOHAM",        caption: "Chaos, in its earliest form." },
  { src: "assets/images/sohamschool.jpeg",        title: "THE SCHOOL ERA",      caption: "Leveling up, one year at a time." },
  { src: "assets/images/sohamandmom.jpeg",        title: "THE FAMILY CHAPTER",  caption: "Where every hero's story starts." },
  { src: "assets/images/sohamwithmom2.jpeg",      title: "THE ORIGIN STORY",    caption: "The ones who trained him." },
  { src: "assets/images/sohamwithdad.jpeg",       title: "THE SIDEKICK ARC",    caption: "Every hero needs comic relief." },
  { src: "assets/images/sohamwithbrother.jpeg",   title: "THE ALLIANCE",        caption: "Stronger together." },
  { src: "assets/images/sohamfunny.jpeg",         title: "THE CHAOS ERA",       caption: "Exhibit A." },
  { src: "assets/images/sohamcrazy.jpeg",         title: "THE SIGNATURE MOVE",  caption: "Unmistakable." },
  { src: "assets/images/stylishsoham.jpeg",       title: "THE LEGEND CONTINUES",caption: "Closer to Level 18 than ever." },
  { src: "assets/images/swagsoham.jpeg",          title: "THE THRESHOLD",       caption: "One night away." },
  { src: "assets/images/sohamandchicken.jpeg",    title: "THE COMEDY POWER-UP", caption: "Somewhere between chaos and class." },
  { src: "assets/images/sohamsstudytensionwithbrother.jpeg", title: "THE STRESS TEST", caption: "A legendary sibling side quest." },
  { src: "assets/images/sleepingsoham.jpeg",      title: "MISSION PAUSE",      caption: "Even heroes need a rest screen." },
];

// The photo used on the very final "Happy Birthday" screen.
const SOHAM_FINAL_PHOTO = "assets/images/smilingsoham.jpeg";

/* -------------------------------------------------------------------------
   VIDEOS
   Drop files into: assets/videos/
   Missing files are skipped automatically.
   ------------------------------------------------------------------------- */
const SOHAM_VIDEOS = [
  { src: "assets/videos/SohamVideoChildhood.mp4", title: "THE EARLY YEARS" },
  { src: "assets/videos/SohamVideoFriends.mp4",   title: "THE FRIENDSHIP ARC" },
  { src: "assets/videos/SohamFunnyVideo.mp4",     title: "THE CHAOS ARCHIVE" },
  { src: "assets/videos/Soham18Video.mp4",        title: "THE FINAL LOG" },
];

/* -------------------------------------------------------------------------
   AUDIO
   Drop files into: assets/audio/
   Missing files simply mean silence for that moment — nothing breaks.
   ------------------------------------------------------------------------- */
const SOHAM_AUDIO = {
  intro:        "assets/audio/The Avengers - Alan Silvestri.mp3",
  countdown33:  "assets/audio/count down 33s.mp3",
  loopbeforetimer: "assets/audio/loopbeforetimer.mp3",
  midnight:     "assets/audio/The Avengers - Alan Silvestri.mp3",
  hero:         "assets/audio/The Avengers - Alan Silvestri.mp3",
  game:         "assets/audio/The Avengers - Alan Silvestri.mp3",
  finalMusic:   "assets/audio/The Avengers - Alan Silvestri.mp3",
  birthday:     "assets/audio/The Avengers - Alan Silvestri.mp3",

  click:        "assets/audio/click.mp3",
  hover:        "assets/audio/hover.mp3",
  success:      "assets/audio/success.mp3",
  wrong:        "assets/audio/wrong.mp3",
  levelup:      "assets/audio/levelup.mp3",
  tick:         "assets/audio/countdown_tick.mp3",
  boom:         "assets/audio/midnight_boom.mp3",
  whoosh:       "assets/audio/whoosh.mp3",
  gameStart:    "assets/audio/game_start.mp3",
  finalReveal:  "assets/audio/final_reveal.mp3",
};

/* -------------------------------------------------------------------------
   MARVEL KNOWLEDGE QUIZ — "THE MARVEL ARCHIVES"
   Edit / replace freely. `a` is the index (0-3) of the correct option.
   ------------------------------------------------------------------------- */
const MARVEL_QUIZ = [
  { q: "What metal is Captain America's shield made of?", options: ["Adamantium", "Vibranium", "Titanium", "Uru"], a: 1 },
  { q: "What is the name of Thor's hammer?", options: ["Stormbreaker", "Gungnir", "Mjolnir", "Excalibur"], a: 2 },
  { q: "What is Tony Stark's superhero name?", options: ["War Machine", "Iron Man", "Star-Lord", "Ant-Man"], a: 1 },
  { q: "Which city does Spider-Man primarily protect?", options: ["Gotham", "Metropolis", "New York City", "Chicago"], a: 2 },
  { q: "Who leads the Guardians of the Galaxy?", options: ["Rocket", "Drax", "Star-Lord", "Groot"], a: 2 },
  { q: "What causes Bruce Banner to become the Hulk?", options: ["Fear", "Anger", "Cosmic rays", "A curse"], a: 1 },
  { q: "What is the name of Black Panther's home country?", options: ["Sokovia", "Wakanda", "Genosha", "Latveria"], a: 1 },
  { q: "Doctor Strange is a master of which mystical art?", options: ["Alchemy", "Necromancy", "The Mystic Arts", "Illusion Magic"], a: 2 },
  { q: "What object usually opens a portal for Doctor Strange?", options: ["A wand", "The Sling Ring", "A crystal", "A key"], a: 1 },
  { q: "Which Infinity Stone is green?", options: ["Power Stone", "Time Stone", "Mind Stone", "Soul Stone"], a: 1 },
];

/* -------------------------------------------------------------------------
   "WHO KNOWS SOHAM?" — fully personalized. Edit these freely.
   ------------------------------------------------------------------------- */
const SOHAM_QUIZ = [
  { q: "What is Soham's favourite food?", options: ["Pizza", "Biryani", "Pasta", "Momos"], a: 0 },
  { q: "What does Soham do when he's bored?", options: ["Sleeps", "Scrolls his phone", "Annoys his brother", "Goes for a walk"], a: 2 },
  { q: "Which movie genre does Soham like most?", options: ["Horror", "Action / Superhero", "Romance", "Documentary"], a: 1 },
  { q: "Who is Soham's favourite superhero?", options: ["Batman", "Spider-Man", "Iron Man", "Thor"], a: 2 },
  { q: "What's Soham's funniest habit?", options: ["Talking in his sleep", "Losing his phone constantly", "Overreacting to small things", "Forgetting names"], a: 1 },
];

/* -------------------------------------------------------------------------
   FINAL MESSAGE
   ------------------------------------------------------------------------- */
const SOHAM_MESSAGE = {
  heading: "Dear Soham,",
  paragraphs: [
    "18 years. 18 years of memories, madness, laughter, fights, adventures and moments we'll never forget.",
    "You may officially be 18 now… but you'll always be my little brother.",
    "Keep dreaming big. Keep laughing. Keep being yourself.",
    "And remember — no matter how old you get, you'll always have your brother beside you.",
  ],
  signoff: "Happy 18th Birthday, Soham ❤️",
  closing: "Your next chapter starts now.",
};

const HERO_QUOTES = [
  "Heroes are built in the chaos, not the comfort.",
  "The best power is the one that makes people smile.",
  "Real legends don't need a spotlight — they create one.",
  "Level 18 is not the end. It is the beginning of the best arc.",
  "A good vibe can beat a perfect plan any day.",
  "The strongest people still know how to laugh at themselves.",
  "Every great story needs a little drama and a lot of heart.",
  "The next chapter is always brighter when it starts with courage."
];

/* -------------------------------------------------------------------------
   HERO PROFILE — humour section, edit freely
   ------------------------------------------------------------------------- */
const HERO_PROFILE = {
  power: "UNKNOWN",
  mission: "ENJOY LIFE",
  specialAbility: "ANNOYING LITTLE BROTHER",
  weakness: "FREE FOOD",
  ultimatePower: "SELECTIVE HEARING",
};

/* -------------------------------------------------------------------------
   RANKS — based on total score
   ------------------------------------------------------------------------- */
const RANKS = [
  { min: 0,     max: 1999,  name: "ROOKIE" },
  { min: 2000,  max: 3999,  name: "HERO IN TRAINING" },
  { min: 4000,  max: 5999,  name: "SUPERHERO" },
  { min: 6000,  max: 7999,  name: "AVENGER" },
  { min: 8000,  max: 9999,  name: "EARTH'S MIGHTIEST" },
  { min: 10000, max: Infinity, name: "LEGEND" },
];

function getRankForScore(score) {
  return (RANKS.find(r => score >= r.min && score <= r.max) || RANKS[0]).name;
}
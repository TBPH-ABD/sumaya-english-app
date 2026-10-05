import { levels, type LevelId } from "@/data/curriculum";

// Question bank shared by the placement test and the practice section.
// Every row lists the correct option first; options are shuffled when questions are drawn.

export type Skill = "reading" | "writing" | "listening" | "speaking";

export type BankQuestion = {
  id: string;
  skill: Skill;
  level: LevelId;
  // Reading: the passage shown. Listening: the script that is spoken (not shown).
  text?: string;
  // Reading / listening: the question. Writing: a sentence with ___. Speaking: the situation.
  prompt: string;
  options: string[];
  answer: string;
};

type Rows = Record<LevelId, string[][]>;

// [passage, question, correct, wrong, wrong, wrong]
const reading: Rows = {
  a1: [
    ["My name is Sara. I am ten years old. I have one brother.", "How old is Sara?", "Ten", "Eight", "Twelve", "One"],
    ["Tom has a red car. He drives it to work every day.", "What colour is Tom's car?", "Red", "Blue", "Black", "White"],
    ["The shop opens at nine and closes at five.", "When does the shop close?", "At five", "At nine", "At four", "At noon"],
    ["Mona likes apples. She does not like bananas.", "What does Mona like?", "Apples", "Bananas", "Oranges", "Grapes"],
    ["It is Monday. Ali is at school. His father is at work.", "Where is Ali?", "At school", "At work", "At home", "At the park"],
    ["There are two cats and one dog in the garden.", "How many cats are in the garden?", "Two", "One", "Three", "Four"],
  ],
  a2: [
    ["Last weekend, Huda visited her grandmother in Aden. They cooked fish together and talked for hours.", "What did they cook?", "Fish", "Chicken", "Rice", "Bread"],
    ["The museum is closed on Mondays. On other days it is open from 10 a.m. to 6 p.m.", "When is the museum closed?", "On Mondays", "On Fridays", "Every morning", "At weekends"],
    ["Sami wanted to buy a new phone, but it was too expensive, so he bought a second-hand one.", "Why didn't Sami buy a new phone?", "It cost too much", "He didn't like it", "The shop was closed", "He already had one"],
    ["Take the first street on the left. The pharmacy is opposite the bakery.", "Where is the pharmacy?", "Opposite the bakery", "Next to the school", "Behind the bank", "On the right"],
    ["Layla usually walks to work, but today it is raining, so she is taking the bus.", "How is Layla going to work today?", "By bus", "On foot", "By car", "By taxi"],
    ["Our flight was two hours late because of bad weather.", "Why was the flight late?", "Because of bad weather", "Because of a strike", "Because of a lost bag", "Because the pilot was ill"],
  ],
  b1: [
    ["Although the hotel was far from the city centre, the guests were happy because the staff were friendly and the rooms were clean.", "What was the hotel's disadvantage?", "Its location", "Its staff", "Its rooms", "Its price"],
    ["Many people now work from home. They save time on travel, but some of them feel lonely without colleagues around.", "What problem do some home workers have?", "They feel lonely", "They waste time travelling", "They earn less money", "They work longer hours"],
    ["The company will refund your ticket if you cancel at least 24 hours before the journey.", "When can you get your money back?", "If you cancel a day or more in advance", "If you cancel at any time", "Only if the train is late", "If you buy another ticket"],
    ["Nadia had never ridden a horse before, so she was nervous at first. By the end of the lesson, however, she didn't want to stop.", "How did Nadia feel at the end?", "She was enjoying it", "She was still nervous", "She was bored", "She was angry"],
    ["Recycling reduces waste, but experts say that buying fewer things is even more effective.", "According to experts, what is more effective than recycling?", "Buying less", "Recycling more", "Burning waste", "Using plastic bags"],
    ["The film received excellent reviews, yet very few people went to see it.", "What is surprising about the film?", "It was praised but not popular", "It was popular but badly reviewed", "It was long but exciting", "It was cheap but successful"],
  ],
  b2: [
    ["The new policy was intended to cut costs; ironically, it ended up increasing them, as staff needed extra training.", "What was the result of the policy?", "Costs went up", "Costs went down", "Staff were dismissed", "Training was cancelled"],
    ["While critics praised the novel's originality, many readers found its plot difficult to follow.", "What did many readers think?", "The story was hard to follow", "The novel was unoriginal", "The critics were right", "The book was too short"],
    ["Had the engineers tested the bridge more thoroughly, the fault would have been discovered much earlier.", "What does the sentence imply?", "The bridge was not tested thoroughly enough", "The bridge had no fault", "The engineers found the fault early", "The tests were too expensive"],
    ["Sales rose steadily throughout the year before dropping sharply in December.", "What happened in December?", "Sales fell suddenly", "Sales rose slowly", "Sales stayed the same", "Sales reached a peak"],
    ["The scientist was reluctant to publish her findings until they had been confirmed by an independent laboratory.", "Why did she delay publishing?", "She wanted independent confirmation", "She had lost her data", "The laboratory refused to help", "The findings were wrong"],
    ["Far from discouraging him, the criticism made him even more determined to succeed.", "How did the criticism affect him?", "It motivated him", "It discouraged him", "It confused him", "It made him quit"],
  ],
  c1: [
    ["The report stops short of blaming the management outright, but its tone leaves little doubt as to where responsibility lies.", "What does the report suggest?", "Management is responsible, though this is not stated directly", "Management is clearly innocent", "The report directly blames management", "Nobody is responsible"],
    ["Notwithstanding its commercial success, the series has been dismissed by scholars as derivative.", "How do scholars view the series?", "As unoriginal", "As commercially unsuccessful", "As groundbreaking", "As too academic"],
    ["The minister's remarks, though ostensibly conciliatory, did little to defuse the tension.", "What effect did the remarks have?", "They hardly reduced the tension", "They ended the tension", "They were openly hostile", "They were widely praised"],
    ["Scarcely had the merger been announced when rumours of redundancies began to circulate.", "When did the rumours start?", "Immediately after the announcement", "Long before the merger", "A year after the merger", "Before the announcement"],
    ["The theory, once regarded as fringe, has gradually gained traction among mainstream researchers.", "What has happened to the theory?", "It has become more widely accepted", "It has been abandoned", "It was always mainstream", "It has been disproved"],
    ["Her memoir is less a record of events than a meditation on how memory distorts them.", "What is the memoir mainly about?", "How memory changes events", "A precise record of events", "Other people's memories", "Historical facts only"],
  ],
};

// [sentence with ___, correct, wrong, wrong, wrong]
const writing: Rows = {
  a1: [
    ["She ___ a student.", "is", "am", "are", "be"],
    ["I ___ coffee every morning.", "drink", "drinks", "drinking", "to drink"],
    ["There ___ two books on the table.", "are", "is", "am", "be"],
    ["This is ___ apple.", "an", "a", "any", "many"],
    ["He ___ football on Fridays.", "plays", "play", "playing", "to play"],
    ["___ is your name?", "What", "Where", "When", "How"],
  ],
  a2: [
    ["Yesterday we ___ to the market.", "went", "go", "gone", "going"],
    ["This bag is ___ than that one.", "cheaper", "cheap", "cheapest", "more cheap"],
    ["I have lived here ___ 2019.", "since", "for", "from", "at"],
    ["She ___ TV when I called her.", "was watching", "watches", "is watching", "watch"],
    ["There isn't ___ milk in the fridge.", "any", "some", "many", "a"],
    ["You ___ wear a seat belt in the car. It's the law.", "must", "can", "might", "would"],
  ],
  b1: [
    ["If it rains tomorrow, we ___ at home.", "will stay", "stayed", "would stay", "staying"],
    ["The report ___ by the manager last week.", "was written", "wrote", "has written", "is writing"],
    ["I'm not used to ___ up so early.", "getting", "get", "got", "gets"],
    ["She has been working here ___ five years.", "for", "since", "during", "from"],
    ["He asked me ___ I could help him.", "if", "that", "what", "do"],
    ["I'm looking forward to ___ you next week.", "seeing", "see", "saw", "be seen"],
  ],
  b2: [
    ["If I ___ more time, I would have finished the project.", "had had", "have had", "would have", "have"],
    ["He denied ___ the window.", "breaking", "to break", "break", "broke"],
    ["By next June, she ___ here for ten years.", "will have worked", "will work", "has worked", "works"],
    ["I wish I ___ harder when I was at school.", "had studied", "study", "would study", "have studied"],
    ["The house needs ___ before winter.", "painting", "paint", "to paint", "painted"],
    ["Not only ___ late, but he also forgot the documents.", "did he arrive", "he arrived", "he did arrive", "arrived he"],
  ],
  c1: [
    ["Hardly ___ the room when the phone rang.", "had I entered", "I had entered", "I entered", "did I enter"],
    ["Her argument was so ___ that nobody could refute it.", "compelling", "compelled", "compulsive", "compulsory"],
    ["It is essential that every applicant ___ the form in person.", "submit", "submits", "submitted", "will submit"],
    ["Little ___ that the decision would change her life.", "did she know", "she knew", "she did know", "knew she"],
    ["The project was completed on time, ___ the many obstacles.", "despite", "although", "however", "even though"],
    ["___ I known about the delay, I would have left later.", "Had", "If", "Should", "Would"],
  ],
};

// [spoken script, question, correct, wrong, wrong, wrong]
const listening: Rows = {
  a1: [
    ["I get up at seven o'clock every day.", "What time does the speaker get up?", "At seven", "At six", "At eight", "At nine"],
    ["My sister is a doctor. She works in a hospital.", "Where does the sister work?", "In a hospital", "In a school", "In a shop", "In a bank"],
    ["Can I have a cup of tea, please?", "What does the speaker want?", "A cup of tea", "A cup of coffee", "A glass of water", "A sandwich"],
    ["The bus stop is next to the bank.", "Where is the bus stop?", "Next to the bank", "Behind the school", "In front of the hotel", "Near the park"],
  ],
  a2: [
    ["I'd like to book a table for four people at eight o'clock tonight.", "How many people is the table for?", "Four", "Two", "Eight", "Six"],
    ["The train to London leaves from platform three at half past nine.", "Which platform does the train leave from?", "Platform three", "Platform nine", "Platform two", "Platform five"],
    ["I can't come to the party because I have an exam tomorrow.", "Why can't the speaker come?", "They have an exam", "They are ill", "They are travelling", "They have to work"],
    ["It will be sunny in the morning, but it will rain in the afternoon.", "What will the weather be like in the afternoon?", "Rainy", "Sunny", "Snowy", "Windy"],
  ],
  b1: [
    ["I was going to take the job, but in the end I decided to stay at my old company.", "What did the speaker do?", "Stayed at the old company", "Took the new job", "Lost the job", "Started a business"],
    ["You'd better take an umbrella. The forecast says it might rain later.", "What does the speaker suggest?", "Taking an umbrella", "Staying at home", "Checking the forecast", "Wearing a coat"],
    ["The meeting has been moved from Tuesday to Thursday because the manager is away.", "When is the meeting now?", "On Thursday", "On Tuesday", "On Monday", "Next month"],
    ["I used to play tennis every week, but I gave it up when I moved abroad.", "What is true about the speaker?", "They no longer play tennis", "They play tennis every week", "They have just started tennis", "They never played tennis"],
  ],
  b2: [
    ["Frankly, I'd rather we postponed the launch than release a product that isn't ready.", "What does the speaker prefer?", "Delaying the launch", "Releasing the product now", "Cancelling the product", "Launching early"],
    ["She must have missed the train, otherwise she would be here by now.", "What does the speaker think?", "She probably missed the train", "She is definitely here", "She took a taxi", "She arrived early"],
    ["The lecture was supposed to last an hour, but it went on for nearly two.", "How long was the lecture?", "Almost two hours", "Exactly one hour", "Half an hour", "Three hours"],
    ["I wouldn't have found the place if you hadn't given me directions.", "What happened?", "The speaker found the place thanks to the directions", "The speaker got lost", "Nobody gave directions", "The speaker didn't go"],
  ],
  c1: [
    ["By no means am I suggesting that we abandon the plan; I simply think it needs refining.", "What is the speaker's view?", "The plan should be improved, not dropped", "The plan should be abandoned", "The plan is perfect", "The plan has already failed"],
    ["He's hardly what you'd call punctual; he turned up forty minutes late again.", "What do we learn about him?", "He is often late", "He is always on time", "He arrived early", "He didn't come"],
    ["Were it not for the grant, the research would have ground to a halt years ago.", "What does the speaker mean?", "The grant kept the research going", "The research stopped years ago", "The grant was refused", "The research needs no funding"],
    ["I can't say I was overly impressed with the proposal, to put it mildly.", "How does the speaker feel about the proposal?", "Unimpressed", "Delighted", "Confused", "Enthusiastic"],
  ],
};

// [situation, best reply, wrong, wrong, wrong]
const speaking: Rows = {
  a1: [
    ["Someone says: \"How are you?\"", "I'm fine, thank you.", "I'm ten years old.", "I'm from Yemen.", "It's Monday."],
    ["Someone says: \"What's your name?\"", "My name is Omar.", "I'm fine.", "I'm a student.", "It's five o'clock."],
    ["You meet a friend in the morning.", "Good morning!", "Good night!", "Goodbye!", "You're welcome."],
    ["Someone says: \"Thank you.\"", "You're welcome.", "Yes, please.", "I'm sorry.", "Good morning."],
  ],
  a2: [
    ["You are in a restaurant and want to order.", "Could I have the chicken, please?", "Give me chicken.", "I want that you bring chicken.", "Chicken is my food."],
    ["A friend says: \"Would you like to go to the cinema tonight?\"", "Sure, what time?", "Yes, I like.", "I am cinema.", "No, I wouldn't to."],
    ["You didn't hear what someone said.", "Sorry, could you repeat that?", "Repeat.", "What you say?", "I no hear."],
    ["You are late for a meeting.", "I'm sorry I'm late.", "I'm late, thank you.", "It's late for you.", "Don't be late."],
  ],
  b1: [
    ["A colleague says: \"I failed my driving test.\"", "Oh, I'm sorry to hear that.", "Congratulations!", "You're welcome.", "That's a good idea."],
    ["You want to give a friend advice about a headache.", "If I were you, I'd see a doctor.", "You must to see a doctor.", "You see doctor.", "I advise you seeing a doctor."],
    ["You disagree politely in a discussion.", "I see your point, but I'm not sure I agree.", "You are wrong.", "No.", "I don't agree nothing."],
    ["You want to interrupt someone politely.", "Sorry to interrupt, but may I add something?", "Stop talking.", "Listen to me now.", "I interrupt you."],
  ],
  b2: [
    ["You want to politely refuse an invitation.", "I'd love to, but I'm afraid I already have plans.", "I don't want.", "No, I can't to come.", "I refuse your invitation, thanks."],
    ["You are giving a presentation and moving to the next point.", "Let's move on to the next point.", "Now I say other thing.", "Next is coming.", "I pass the next."],
    ["You want to ask a stranger a favour politely.", "I was wondering if you could help me.", "Help me.", "You will help me?", "I want help from you now."],
    ["You want to check that you understood correctly.", "So, if I understand correctly, the deadline has changed?", "You say deadline change?", "I am understanding the deadline?", "Repeat the deadline."],
  ],
  c1: [
    ["You want to soften strong criticism of a colleague's draft.", "It's a solid start, though I wonder whether the argument could be tightened.", "This draft is bad.", "I don't like nothing here.", "You must rewrite all."],
    ["You need to buy time before answering a difficult question.", "That's an interesting question; let me think about it for a moment.", "I don't know nothing.", "Wait.", "Question is difficult, no answer."],
    ["You want to concede a point but maintain your position.", "I take your point, but I'd still argue that the risks outweigh the benefits.", "You are right and I am right.", "Your point is taken but no.", "I agree but disagree it."],
    ["You want to hedge a claim in a formal discussion.", "It would seem that the data point in that direction.", "The data is this, sure.", "Data say it, finish.", "It is seeming the data."],
  ],
};

export const levelOrder: LevelId[] = levels.map((level) => level.id);
export const skillOrder: Skill[] = ["reading", "writing", "listening", "speaking"];

function build(skill: Skill, rows: Rows, hasText: boolean): BankQuestion[] {
  return levelOrder.flatMap((level) =>
    rows[level].map((row, i) => {
      const text = hasText ? row[0] : undefined;
      const [prompt, ...options] = hasText ? row.slice(1) : row;
      return { id: `${skill}-${level}-${i + 1}`, skill, level, text, prompt, options, answer: options[0] };
    }),
  );
}

export const bank: BankQuestion[] = [
  ...build("reading", reading, true),
  ...build("writing", writing, false),
  ...build("listening", listening, true),
  ...build("speaking", speaking, false),
];

// Everything below uses Math.random: call it from event handlers, never during render.

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const withShuffledOptions = (question: BankQuestion) => ({ ...question, options: shuffle(question.options) });

// Placement test: per level, this many questions of each skill. 10 per level x 5 levels = 50.
const TEST_PLAN: Record<Skill, number> = { reading: 3, writing: 3, listening: 2, speaking: 2 };
export const TEST_LENGTH = levelOrder.length * skillOrder.reduce((sum, skill) => sum + TEST_PLAN[skill], 0);

// Easiest level first; skills mixed inside a level. Questions in `excludeIds` (the previous
// attempt) are avoided, which the bank allows because each cell holds twice what one test takes.
export function drawTest(excludeIds: string[]): BankQuestion[] {
  return levelOrder.flatMap((level) => {
    const picked = skillOrder.flatMap((skill) => {
      const cell = bank.filter((question) => question.level === level && question.skill === skill);
      const fresh = cell.filter((question) => !excludeIds.includes(question.id));
      const pool = fresh.length >= TEST_PLAN[skill] ? fresh : cell;
      return shuffle(pool).slice(0, TEST_PLAN[skill]);
    });
    return shuffle(picked).map(withShuffledOptions);
  });
}

// Each band of 10 correct answers moves the learner up one level.
export function placeLevel(score: number): LevelId {
  const band = Math.max(0, Math.ceil(score / (TEST_LENGTH / levelOrder.length)) - 1);
  return levelOrder[Math.min(band, levelOrder.length - 1)];
}

export function drawPractice(skill: Skill, level: LevelId | "all", size: number): BankQuestion[] {
  const pool = bank.filter((question) => question.skill === skill && (level === "all" || question.level === level));
  return shuffle(pool).slice(0, size).map(withShuffledOptions);
}

export function fullSentence(question: BankQuestion): string {
  return question.prompt.replace("___", question.answer);
}

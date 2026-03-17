import type { JSONContent } from '@tiptap/react';

import { format, subDays } from 'date-fns';
import { getISOWeek } from 'date-fns/getISOWeek';
import { getISOWeekYear } from 'date-fns/getISOWeekYear';

import { putRecord } from '../storage/db-cache';

function p(text: string): JSONContent {
  return { content: [{ text, type: 'text' }], type: 'paragraph' };
}

function h2(text: string): JSONContent {
  return { attrs: { level: 2 }, content: [{ text, type: 'text' }], type: 'heading' };
}

function li(text: string): JSONContent {
  return { content: [{ content: [{ text, type: 'text' }], type: 'paragraph' }], type: 'listItem' };
}

function ul(...items: JSONContent[]): JSONContent {
  return { content: items, type: 'bulletList' };
}

function doc(...nodes: JSONContent[]): JSONContent {
  return { content: nodes, type: 'doc' };
}

const dailySamples: JSONContent[] = [
  doc(
    h2('Morning thoughts'),
    p('Had a great idea for the garden layout while making coffee. Need to sketch it out before I forget.'),
    ul(
      li('Move the herb planter closer to the kitchen window'),
      li('Research companion planting for tomatoes'),
      li('Order seeds before the weekend'),
    ),
    h2('Reading notes'),
    p('Finished the chapter on spaced repetition. The key insight: spacing reviews at increasing intervals works because it forces your brain to actively reconstruct the memory each time.'),
  ),
  doc(
    p('Quiet day. Spent most of it reorganizing the bookshelf and catching up on emails.'),
    h2('Things to remember'),
    ul(
      li('Call the dentist about rescheduling'),
      li('The library book is due Thursday'),
      li('Try that new pasta recipe from the food blog'),
    ),
  ),
  doc(
    h2('Project update'),
    p('Finally figured out the layout issue. The trick was simpler than I thought: just needed to let the container grow instead of forcing a fixed height.'),
    p('Note to self: when something feels overly complicated, step back and question the constraints.'),
    h2('Evening'),
    p('Went for a walk after dinner. The neighborhood is starting to bloom. Spotted the first cherry blossoms of the season.'),
  ),
  doc(
    h2('Cooking experiment'),
    p('Tried making homemade focaccia for the first time. The dough was way stickier than expected, but the result was incredible. Crispy outside, pillowy inside.'),
    ul(
      li('Key: don\'t skimp on olive oil'),
      li('Let it proof longer than you think'),
      li('Dimple aggressively'),
    ),
  ),
  doc(
    p('Started the morning with a long run. Something about the rhythm of running loosens up my thinking.'),
    h2('Ideas that came up'),
    ul(
      li('A weekend trip to the coast would be nice'),
      li('Start a small journal for sketches'),
      li('Look into that ceramics class'),
    ),
    p('The weather is supposed to be perfect this weekend. No excuses.'),
  ),
];

const weeklySample = doc(
  h2('This week'),
  ul(
    li('Wrap up the garden planning'),
    li('Finish reading chapter 4'),
    li('Try at least one new recipe'),
    li('Schedule that appointment'),
  ),
  h2('Reflections'),
  p('Feeling more settled this week. The daily writing habit is starting to stick. Even short entries help me notice patterns in my thinking.'),
  p('Next week: focus on one thing at a time instead of juggling everything.'),
);

export function loadSampleData(): void {
  const now = new Date();

  for (let i = 0; i < dailySamples.length; i++) {
    const date = subDays(now, i);
    const noteId = `daily:${format(date, 'yyyy-MM-dd')}`;
    const content = dailySamples[i];
    if (content) {
      putRecord({ content, id: noteId, updatedAt: Date.now() - i * 86400000 });
    }
  }

  const week = getISOWeek(now);
  const year = getISOWeekYear(now);
  const weekId = `weekly:${String(year)}-W${String(week).padStart(2, '0')}`;
  putRecord({ content: weeklySample, id: weekId, updatedAt: Date.now() });
}

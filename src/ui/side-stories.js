import { sideStories, storyStages, readerForStory } from '../content/side-stories.js';
import { readers } from '../content/readers.js';
import {
  loadStoryState,
  saveStoryState,
  freshStoryState,
  availableStoryStage,
} from '../game/story-state.js';

export function createSideStories({
  root,
  panel,
  getGame,
  openPanel,
  closePanel,
  travel,
  think,
  sound,
  escape,
}) {
  let storage;
  try {
    storage = localStorage;
  } catch {}
  let memory = loadStoryState(storage),
    parting;
  const stage = () => availableStoryStage(getGame());
  const lowerFirst = (text) => text[0].toLowerCase() + text.slice(1);
  const key = (id, i) => `${id}:${i}`;
  const seen = (id, i = stage()) => memory.seen.includes(key(id, i));
  function persist() {
    saveStoryState(storage, memory);
    sync();
  }
  function sync() {
    const discovered = sideStories.filter((story) =>
      story.scenes.some((_, i) => i <= stage() && seen(story.id, i)),
    ).length;
    root.querySelector('#side-stories-button').textContent = `Chuyện trong phòng · ${discovered}/6`;
  }
  const button = document.createElement('button');
  button.id = 'side-stories-button';
  button.className = 'reader-link';
  button.setAttribute('aria-haspopup', 'dialog');
  root.querySelector('#reader-button').after(button);
  button.addEventListener('click', journal);
  const quote = ([speaker, text]) =>
    `<blockquote class="side-dialogue"><cite>${escape(speaker)}</cite><p>${escape(text)}</p></blockquote>`;
  function open(id, index = stage()) {
    const story = sideStories.find((item) => item.id === id);
    if (!story) return;
    index = Math.max(0, Math.min(stage(), index));
    const entry = story.scenes[index],
      entryKey = key(id, index);
    parting = null;
    if (!seen(id, index)) memory.seen.push(entryKey);
    memory.visits[id] = (memory.visits[id] || 0) + 1;
    persist();
    think('');
    sound.play(story.sound);
    const selected = memory.choices[entryKey],
      related = sideStories.find((item) => item.id === story.related);
    const remembered = entry.questions[selected];
    parting = remembered
      ? [`Nhớ lời ${lowerFirst(remembered.speaker)} · Hư cấu`, remembered.text]
      : ['SUY NGHĨ', entry.reflection];
    openPanel(
      story.label,
      'CHUYỆN TRONG PHÒNG · HƯ CẤU',
      `<article class="side-story">
      <p class="side-origin">${escape(story.arrival)}</p>
      <nav class="side-stages" aria-label="Các chặng câu chuyện">${story.scenes.map((_, i) => (i <= stage() ? `<button data-stage="${i}" aria-pressed="${i === index}">${escape(storyStages[i])}</button>` : '')).join('')}</nav>
      <span class="eyebrow">${escape(readerForStory(story).name)} · ${index + 1}/3 CHẶNG</span><h3>${escape(entry.title)}</h3>
      <p class="side-scene">${escape(entry.scene)}</p><div>${entry.lines.map(quote).join('')}</div>
      <section class="side-questions" aria-label="Điều muốn hỏi thêm"><h4>Mình muốn nghe thêm về…</h4><div>${entry.questions.map((q, i) => `<button data-question="${i}" aria-pressed="${i === selected}" aria-controls="side-answer">${escape(q.label)}</button>`).join('')}</div>
      <div id="side-answer" role="status" aria-live="polite">${selected === undefined ? '<p>Chọn một điều để đọc lời kể tiếp. Bạn có thể hỏi cả hai.</p>' : quote([entry.questions[selected].speaker, entry.questions[selected].text])}</div></section>
      <p class="side-reflection"><b>Mình ghi lại</b>${escape(entry.reflection)}</p>
      ${getGame().completed.length === 3 && index === 2 ? `<section class="side-coda"><h4>Sau trang báo cuối</h4><p>${escape(story.ending)}</p></section>` : ''}
      <p class="reader-fiction">Đồ vật, cuộc gặp và lời thoại là sáng tác của trò chơi. Đây là chuyện phụ, không phải tư liệu chứng minh hay điều kiện in báo.</p>
      <div class="side-actions"><button data-return-room>Trở lại phòng</button><button class="secondary" data-related>Đến ${escape(lowerFirst(related.label))}</button><button class="secondary" data-journal>Những chuyện đã nghe</button></div>
    </article>`,
    );
    panel.dataset.kind = 'side-story';
    panel.dataset.story = id;
    panel
      .querySelectorAll('[data-stage]')
      .forEach((b) => b.addEventListener('click', () => open(id, Number(b.dataset.stage))));
    panel.querySelectorAll('[data-question]').forEach((b) =>
      b.addEventListener('click', () => {
        const choice = Number(b.dataset.question),
          q = entry.questions[choice];
        memory.choices[entryKey] = choice;
        persist();
        panel
          .querySelectorAll('[data-question]')
          .forEach((other) => other.setAttribute('aria-pressed', String(other === b)));
        panel.querySelector('#side-answer').innerHTML = quote([q.speaker, q.text]);
        parting = [`Nhớ lời ${lowerFirst(q.speaker)} · Hư cấu`, q.text];
      }),
    );
    panel.querySelector('[data-return-room]').addEventListener('click', () => {
      parting ||= ['SUY NGHĨ', entry.reflection];
      closePanel();
    });
    panel.querySelector('[data-related]').addEventListener('click', () => travel(related));
    panel.querySelector('[data-journal]').addEventListener('click', journal);
  }
  function entriesFor(reader) {
    return sideStories.filter((story) => story.reader === reader);
  }
  function characterMarkup(reader) {
    const entries = entriesFor(reader).flatMap((story) =>
      story.scenes.flatMap((entry, i) => {
        if (i > stage() || !seen(story.id, i)) return [];
        const choice = memory.choices[key(story.id, i)],
          q = entry.questions[choice];
        return `<li><b>${escape(entry.title)}</b><p>${escape(q ? q.text : entry.reflection)}</p><small>${escape(q ? q.speaker : 'Ghi chép của mình')} · Hư cấu</small></li>`;
      }),
    );
    return entries.length
      ? `<details class="reader-history side-memories"><summary>Những lời mình đã nghe (${entries.length})</summary><ol>${entries.join('')}</ol></details>`
      : '';
  }
  function journal() {
    parting = null;
    think('');
    openPanel(
      'Những chuyện còn tiếp',
      'ĐỜI SỐNG PHÍA SAU TRANG BÁO',
      `<p class="side-origin">Các chuyện thay đổi sau mỗi bản tin. Đồ vật nằm ở ba góc phòng, bạn có thể đọc thêm bất cứ lúc nào.</p><div class="side-journal">${sideStories
        .map((story) => {
          const known = story.scenes.some((_, i) => i <= stage() && seen(story.id, i));
          return `<button data-story="${story.id}"><span>${escape(readerForStory(story).name)} · ${escape({ desk: 'Bàn biên tập', shelf: 'Kệ tư liệu', press: 'Bàn in' }[story.station])}</span><b>${escape(story.label)}</b><small>${!known ? 'Chưa xem' : !seen(story.id) ? 'Có lời kể mới' : 'Đọc lại lời kể'}</small></button>`;
        })
        .join(
          '',
        )}</div>${Object.keys(readers).map(characterMarkup).join('')}<p class="reader-fiction">Nhân vật và lời kể hư cấu. Các chuyện phụ không đổi đáp án hoặc tiến độ tư liệu lịch sử.</p>`,
    );
    panel.dataset.kind = 'side-story';
    panel
      .querySelectorAll('[data-story]')
      .forEach((b) =>
        b.addEventListener('click', () =>
          travel(sideStories.find((s) => s.id === b.dataset.story)),
        ),
      );
  }
  sync();
  return {
    open,
    journal,
    characterMarkup,
    sync,
    has: (id) => sideStories.some((story) => story.id === id),
    hasUpdates: () =>
      sideStories.some(
        (story) => !seen(story.id) && story.scenes.some((_, i) => i < stage() && seen(story.id, i)),
      ),
    endingMarkup(reader) {
      return entriesFor(reader)
        .filter((story) => story.scenes.some((_, i) => i <= stage() && seen(story.id, i)))
        .map(
          (story) =>
            `<section class="side-coda"><h4>${escape(story.label)}</h4><p>${escape(story.ending)}</p></section>`,
        )
        .join('');
    },
    label: (id) =>
      seen(id)
        ? 'Đọc lại chuyện'
        : sideStories.find((s) => s.id === id)?.scenes.some((_, i) => i < stage() && seen(id, i))
          ? 'Có lời kể mới'
          : 'Mở lời kể',
    takeParting() {
      const line = parting;
      parting = null;
      return line;
    },
    reset() {
      memory = freshStoryState();
      parting = null;
      persist();
    },
  };
}

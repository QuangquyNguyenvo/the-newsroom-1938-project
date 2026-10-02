import { icons } from './icons.js';

// The briefing is laid out like the game's own paper panels: an editor's note on the
// left, the reader letter that opens chapter one on the right.
export function introMarkup() {
  return `<dialog id="intro" class="intro-sheet" aria-labelledby="intro-title">
    <div class="intro-page">
      <div class="intro-content">
        <span class="intro-eyebrow">TRƯỚC KHI VÀO TÒA SOẠN</span>
        <h2 id="intro-title">Một trang báo. Nhiều cuộc đời.</h2>
        <p class="intro-deck">Bạn là người biên tập của một tờ báo cách mạng ở Sài Gòn năm 1938. Qua ba bản tin, bạn tìm hiểu báo chí của Đảng trong phong trào dân chủ 1936–1939.</p>
        <ol class="intro-steps"><li><b>Tìm tư liệu.</b> Lật giấy, đọc sổ và ghi lại căn cứ trong phòng.</li><li><b>Viết thành lời.</b> Đặt mỗi ý vào đúng cột báo nó trả lời.</li><li><b>Giữ căn cứ.</b> Đối chiếu nguồn trước khi in báo.</li></ol>
        <div class="intro-actions"><button id="start-button" type="button"><span>Bước vào tòa soạn</span>${icons.arrowRight}</button><button type="button" id="intro-sound" class="secondary" aria-pressed="true">Âm thanh: bật</button></div>
        <details class="intro-notice"><summary>${icons.chevronRight}Về bản mô phỏng học tập</summary><p>Đây là trò chơi mô phỏng phục vụ học tập. Căn phòng, đồ vật, lời dẫn và câu đố được thiết kế lại. Đây không phải bản phục dựng nguyên trạng tòa soạn năm 1938. Tiêu đề trong game không phải tiêu đề báo gốc. Phố ngoài cửa sổ là minh họa gợi Sài Gòn cuối thập niên 1930, không phải ảnh tư liệu. Các sự kiện lịch sử có liên kết nguồn để đối chiếu.</p><p>Nhân vật, thư và cuộc đời người gửi do trò chơi sáng tác. Phần âm nền được sáng tác cho trò chơi, không phải bản ghi lịch sử.</p></details>
      </div>
      <aside class="intro-letter"></aside>
    </div>
  </dialog>`;
}

// The letter beside the briefing belongs to the reader of the current chapter.
export function setIntroReader(dialog, key, reader, answered) {
  const letter = dialog.querySelector('.intro-letter');
  letter.dataset.reader = key;
  letter.innerHTML = `<span class="intro-letter-tag">Bạn đọc gửi tòa soạn</span>${reader.excerpt.map((line) => `<p>${line}</p>`).join('')}<p class="intro-letter-question">${reader.question}</p><cite>${reader.signature}<span>Nhân vật và lời thư hư cấu</span></cite><div class="intro-letter-stamp" aria-hidden="true">${answered ? 'ĐÃ HỒI ÂM' : 'CHƯA HỒI ÂM'}</div>`;
}

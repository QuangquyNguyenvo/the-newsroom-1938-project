export function introMarkup() {
  return `<dialog id="intro" class="intro-cinema" aria-labelledby="intro-title">
    <div class="intro-light" aria-hidden="true"></div>
    <div class="intro-register" aria-hidden="true"><span></span><span></span><span></span></div>
    <div class="intro-content">
      <div class="intro-kicker-row"><span class="intro-location">SÀI GÒN · 1938 / 1939</span><span class="intro-issue">HỒ SƠ BIÊN TẬP · 01</span></div>
      <h2 id="intro-title">Một trang báo.<br><em>Nhiều cuộc đời.</em></h2>
      <p class="intro-deck">Làm người biên tập của một tờ báo cách mạng. Tìm căn cứ, chọn từng lời và trả lời những người đang chờ được nghe.</p>
      <div class="intro-rule" aria-hidden="true"><i></i><i></i><i></i></div>
      <p class="intro-subject">Khám phá báo chí của Đảng và phong trào dân chủ 1936–1939 qua ba bản tin học tập.</p>
      <ol class="intro-steps"><li><b>01</b><span>Tìm dấu vết<small>Lật giấy, đọc sổ và ghi lại tư liệu.</small></span></li><li><b>02</b><span>Viết thành lời<small>Đặt mỗi ý vào câu chuyện nó trả lời.</small></span></li><li><b>03</b><span>Giữ căn cứ<small>Đối chiếu nguồn trước khi in báo.</small></span></li></ol>
      <div class="intro-actions"><button id="start-button" type="button"><span>Bước vào tòa soạn</span><b aria-hidden="true">→</b></button><button type="button" id="intro-sound" aria-pressed="true">Âm thanh: bật</button></div>
      <details class="intro-notice"><summary>Về bản mô phỏng học tập</summary><p>Đây là trò chơi mô phỏng phục vụ học tập. Căn phòng, đồ vật, lời dẫn và câu đố được thiết kế lại. Đây không phải bản phục dựng nguyên trạng tòa soạn năm 1938. Tiêu đề trong game không phải tiêu đề báo gốc. Phố ngoài cửa sổ là minh họa gợi Sài Gòn cuối thập niên 1930, không phải ảnh tư liệu. Các sự kiện lịch sử có liên kết nguồn để đối chiếu.</p><p>Nhân vật, thư và cuộc đời người gửi do trò chơi sáng tác. Phần âm nền được sáng tác cho trò chơi, không phải bản ghi lịch sử.</p></details>
    </div>
    <aside class="intro-letter"><div class="intro-letter-corner" aria-hidden="true">01</div><span class="intro-letter-tag">BẠN ĐỌC GỬI TÒA SOẠN</span><p>Các anh làm báo,</p><p>Lương không đủ đong gạo, con nhỏ đau mà chưa mua được thuốc.</p><p class="intro-letter-question">Báo các anh có nói chuyện của người như tôi không?</p><cite>Út ghi hộ lời chị Tư<br><span>Nhân vật và lời thư hư cấu</span></cite><div class="intro-letter-stamp" aria-hidden="true">CHƯA HỒI ÂM</div><div class="intro-letter-fibres" aria-hidden="true"></div></aside>
    <span class="intro-bottom" aria-hidden="true">GIỮ TIẾNG NÓI · MỘT TRÒ CHƠI LỊCH SỬ ĐẢNG</span>
  </dialog>`;
}

// Authored educational headlines, never presented as original newspaper headlines.
export const sources = {
  museum: {
    title: 'Sưu tập Báo Dân Chúng (1938–1939), Bảo tàng Lịch sử quốc gia',
    url: 'https://baotanglichsuquocgia.vn/vi/Articles/1002/14270/suu-tap-bao-dan-chung-1938-1939-cua-bao-tang-lich-su-quoc-gia.html',
    checked: '2026-09-27',
  },
};

export const objects = [
  {
    id: 'letter', station: 'desk', label: 'Bản thảo có kẹp giấy', kind: 'paper',
    thought: 'Có nét bút ở mặt sau. Thử lật tờ giấy xem.',
    pages: [
      { title: 'Tiếng nói trên trang báo', text: 'Báo Dân Chúng đăng bài giải thích chủ trương của Đảng, vận động đấu tranh đòi cơm áo, hòa bình và các quyền tự do, dân chủ.', source: 'museum' },
      { title: 'Ghi chú ở mặt sau', text: 'Yêu cầu cần giữ trên bản in: cơm áo, hòa bình, tự do và dân chủ.', evidence: 'demands' },
    ],
  },
  {
    id: 'notebook', station: 'shelf', label: 'Sổ ghi chép màu đỏ', kind: 'book',
    thought: 'Hai mốc khác nhau trong cùng một cuốn sổ. Mình cần đọc trang còn lại.',
    pages: [
      { title: 'Đường dây biên tập', text: 'Dân Chúng được tổ chức và xuất bản dưới sự chỉ đạo trực tiếp của Nguyễn Văn Cừ và Hà Huy Tập.', source: 'museum' },
      { title: 'Mốc đã đối chiếu', text: 'Báo Dân Chúng số 1 ra ngày 22/7/1938 tại Sài Gòn. Báo được tổ chức và xuất bản dưới sự chỉ đạo trực tiếp của Nguyễn Văn Cừ và Hà Huy Tập.', evidence: 'first-issue', source: 'museum' },
    ],
  },
  {
    id: 'archive', station: 'shelf', label: 'Tập hồ sơ trên kệ', kind: 'folder',
    thought: 'Tờ báo này đại diện cho ai? Có lẽ hồ sơ giữ câu trả lời.',
    pages: [
      { title: 'Một tờ báo của Đảng', text: 'Dân Chúng là cơ quan ngôn luận của Trung ương Đảng Cộng sản Đông Dương, xuất bản công khai không xin phép ở Sài Gòn.', evidence: 'party', source: 'museum' },
      { title: 'Đọc thêm', text: 'Xuất bản công khai không xin phép ở Sài Gòn. Một trang báo có thể đưa chủ trương của Đảng đến với đông đảo bạn đọc.', source: 'museum' },
    ],
  },
  {
    id: 'photo', station: 'desk', label: 'Ảnh sưu tập báo, chú thích phía sau', kind: 'photo',
    thought: 'Mặt trước chưa nói hết. Phía sau tấm ảnh có gì nhỉ?',
    pages: [
      { title: 'Ảnh sưu tập báo', text: 'Các số Dân Chúng còn được lưu giữ. Phía sau ảnh có ghi ngày tòa soạn bị khám xét.' },
      { title: 'Ngày bàn biên tập im tiếng', text: 'Ngày 7/3/1939, chính quyền thuộc địa bắt giam những người làm ở tòa soạn và tịch thu tài sản của báo.', evidence: 'arrest', source: 'museum' },
    ],
  },
  {
    id: 'drawer', station: 'desk', label: 'Hồ sơ trong ngăn kéo', kind: 'folder',
    thought: '',
    pages: [
      { title: 'Sau bước ngoặt', text: 'Dân Chúng có 80 số. Số 80, số cuối cùng, ra ngày 30/8/1939. Vụ bắt giữ tháng 3 không phải mốc báo kết thúc ngay lập tức.', evidence: 'last-issue', source: 'museum' },
    ],
  },
  {
    id: 'proof', station: 'press', label: 'Bản kiểm tra bên bàn in', kind: 'paper',
    thought: 'Chữ đã đủ. Nhưng nguồn đã đúng chưa?',
    pages: [
      { title: 'Kiểm tra trước khi in', text: 'Đọc lại từng mốc ngày. Kiểm tra nguồn của thông tin. Chỉ đưa lên trang khi bản thảo và bằng chứng khớp nhau.' },
    ],
  },
];

export const evidenceLabels = {
  demands: 'Nội dung: cơm áo, hòa bình, dân chủ',
  draft: 'Bản nháp phục dựng: năm 1937',
  'first-issue': 'Số 1: ngày 22/7/1938',
  party: 'Cơ quan ngôn luận của Trung ương Đảng',
  arrest: 'Vụ bắt giữ: ngày 7/3/1939',
  'last-issue': 'Số 80: ngày 30/8/1939',
};

export const chapters = [
  {
    id: 'voices', number: '01', title: 'Những tiếng nói đời thường',
    intro: 'Trên bàn là một bản thảo dang dở. Tờ báo đang lên tiếng cho điều gì?',
    slots: [
      { label: 'Yêu cầu đời sống', choices: ['Cơm áo', 'Ngày xuất bản', 'Địa chỉ tòa soạn'], answer: 'Cơm áo' },
      { label: 'Nguyện vọng', choices: ['Hòa bình', 'Số lượng trang', 'Năm 1937'], answer: 'Hòa bình' },
      { label: 'Quyền được đòi hỏi', choices: ['Dân chủ', 'Khổ giấy', 'Bản nháp'], answer: 'Dân chủ' },
    ],
    requiredEvidence: ['demands'], proof: 'demands',
    hints: ['Bản thảo trên bàn có hai mặt.', 'Đọc mặt sau bản thảo rồi ghi thông tin vào sổ tay.'],
    summary: 'Báo chí truyền đạt chủ trương của Đảng và vận động đấu tranh vì dân sinh, dân chủ.',
    video: null, poster: null, source: 'museum',
  },
  {
    id: 'publication', number: '02', title: 'Một tờ báo lên tiếng',
    intro: 'Ai đứng sau tờ báo? Số đầu tiên xuất hiện khi nào?',
    slots: [
      { label: 'Tờ báo', choices: ['Dân Chúng', 'Sổ ghi chép', 'Bản kiểm tra'], answer: 'Dân Chúng' },
      { label: 'Số đầu tiên ra ngày', choices: ['22/7/1938', '22/7/1937', '30/8/1939'], answer: '22/7/1938' },
      { label: 'Vai trò', choices: ['Cơ quan ngôn luận của Trung ương Đảng', 'Một bản nháp chưa xuất bản', 'Một tờ báo chỉ nói về khổ giấy'], answer: 'Cơ quan ngôn luận của Trung ương Đảng' },
    ],
    requiredEvidence: ['first-issue', 'party'], proof: 'first-issue',
    hints: ['Trang sau sổ đỏ ghi ngày ra số đầu tiên.', 'Đối chiếu trang 2 của sổ đỏ với tập hồ sơ trên kệ.'],
    summary: 'Dân Chúng gắn trực tiếp với hoạt động lãnh đạo, tuyên truyền và vận động của Đảng.',
    video: null, poster: null, source: 'museum',
  },
  {
    id: 'pressure', number: '03', title: 'Khi tiếng nói bị ngăn chặn',
    intro: 'Một vụ bắt giữ. Một số báo cuối. Vì sao hai ngày không trùng nhau?',
    slots: [
      { label: 'Vụ bắt giữ', choices: ['7/3/1939', '30/8/1939', '22/7/1938'], answer: '7/3/1939' },
      { label: 'Số báo cuối', choices: ['Số 80', 'Số 1', 'Bản nháp'], answer: 'Số 80' },
      { label: 'Ngày ra số cuối', choices: ['30/8/1939', '7/3/1939', '22/7/1937'], answer: '30/8/1939' },
    ],
    requiredEvidence: ['arrest', 'last-issue'], proof: 'arrest',
    hints: ['Tấm ảnh có thông tin ở mặt sau. Ngăn kéo giữ một mốc khác.', 'Ngày 7/3 và 30/8 nói về hai sự kiện khác nhau.'],
    summary: 'Tư liệu còn lưu lại giúp ta hiểu những khó khăn của báo chí cách mạng và vai trò của tờ báo trong phong trào dân chủ.',
    video: null, poster: null, source: 'museum',
  },
];

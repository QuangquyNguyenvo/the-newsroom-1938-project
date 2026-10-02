import { readers } from './readers.js';
// Authored educational headlines, never presented as original newspaper headlines.
export const sources = {
  partyHistory: {
    title: 'Chủ trương xây dựng lực lượng cách mạng giai đoạn 1936–1939, Tạp chí Lịch sử Đảng',
    url: 'https://tapchilichsudang.vn/chu-truong-cua-dang-cong-san-dong-duong-trong-xay-dung-luc-luong-cach-mang-giai-doan-1936-1939.html',
    checked: '2026-09-30',
  },
  museum: {
    title: 'Sưu tập Báo Dân Chúng (1938–1939), Bảo tàng Lịch sử quốc gia',
    url: 'https://baotanglichsuquocgia.vn/vi/Articles/1002/14270/suu-tap-bao-dan-chung-1938-1939-cua-bao-tang-lich-su-quoc-gia.html',
    checked: '2026-09-27',
  },
  cityParty: {
    title:
      'Báo Dân Chúng, dấu son trong lịch sử báo chí cách mạng Việt Nam, Thành ủy TP. Hồ Chí Minh',
    url: 'https://www.hcmcpv.org.vn/tin-tuc/bao-dan-chung-dau-son-trong-lich-su-bao-chi-cach-mang-viet-nam-1491880968',
    checked: '2026-09-30',
  },
  nhandan: {
    title: 'Báo Dân Chúng, tờ báo của Đảng Cộng sản Đông Dương, Báo Nhân Dân',
    url: 'https://nhandan.vn/bao-dan-chung-to-bao-cua-dang-cong-san-dong-duong-post566611.html',
    checked: '2026-09-30',
  },
  cu: {
    title: 'Nguyễn Văn Cừ, Wikipedia tiếng Việt',
    url: 'https://vi.wikipedia.org/wiki/Nguy%E1%BB%85n_V%C4%83n_C%E1%BB%AB',
    checked: '2026-09-30',
  },
  movement: {
    title: 'Phong trào Dân chủ Đông Dương (1936–1939), Wikipedia tiếng Việt',
    url: 'https://vi.wikipedia.org/wiki/Phong_tr%C3%A0o_D%C3%A2n_ch%E1%BB%A7_%C4%90%C3%B4ng_D%C6%B0%C6%A1ng_(1936%E2%80%931939)',
    checked: '2026-09-30',
  },
};

// `note` is the editor's own margin note. `reader` ties the page to the fictional letter
// of one chapter and only shows once that letter has arrived. Neither adds a historical claim.
export const objects = [
  {
    id: 'letter',
    station: 'desk',
    label: 'Bản thảo có kẹp giấy',
    kind: 'paper',
    thought: 'Có nét bút ở trang cuối. Thử lật tờ giấy xem.',
    pages: [
      {
        title: 'Từ nghị quyết đến trang báo',
        note: 'Một nghị quyết nằm trong phòng họp thì người thợ không đọc được. Tờ báo là quãng đường còn lại.',
        reader: {
          chapter: 'voices',
          text: 'Chị Tư hỏi báo có nói chuyện của người như chị không. Câu trả lời bắt đầu từ đây: cơm áo đứng ngay trong mục tiêu trước mắt.',
        },
        text: 'Tháng 7/1936, Ban Chấp hành Trung ương Đảng họp và xác định mục tiêu trước mắt: chống phát xít, chống chiến tranh, đòi tự do, dân chủ, cơm áo, hòa bình. Muốn chủ trương ấy đến được với nhân dân, cần một tờ báo công khai.',
        source: 'movement',
      },
      {
        title: 'Tiếng nói trên trang báo',
        note: 'Giải thích chủ trương, rồi vận động đấu tranh. Hai việc đi cùng nhau trên một trang giấy.',
        reader: {
          chapter: 'voices',
          text: 'Chị dặn dùng lời dễ hiểu, vì chị còn kể lại cho mấy chị cùng làm. Mình viết cho cả người nghe đọc, không chỉ cho người tự đọc.',
        },
        text: 'Báo Dân Chúng đăng bài giải thích chủ trương của Đảng, vận động đấu tranh đòi cơm áo, hòa bình và các quyền tự do, dân chủ.',
        source: 'museum',
      },
      {
        title: 'Ghi chú ở mặt sau',
        note: 'Mấy cụm từ này phải còn nguyên trên bản in. Khoanh lại, kẻo lúc dàn trang bị cắt mất.',
        reader: {
          chapter: 'voices',
          text: 'Lương không đủ đong gạo: đó là cơm áo. Muốn con lớn lên không phải cúi đầu: đó là dân chủ. Chị Tư đã nói những điều này trước, bằng lời của chị.',
        },
        text: 'Yêu cầu cần giữ trên bản in: cơm áo, hòa bình, tự do và dân chủ.',
        evidence: 'demands',
      },
    ],
  },
  {
    id: 'notebook',
    station: 'shelf',
    label: 'Sổ ghi chép màu đỏ',
    kind: 'book',
    thought: 'Hai mốc khác nhau trong cùng một cuốn sổ. Mình cần đọc trang còn lại.',
    pages: [
      {
        title: 'Đường dây biên tập',
        note: 'Hai cái tên này cho biết tờ báo không đứng một mình.',
        reader: {
          chapter: 'publication',
          text: 'Anh Ba hỏi ai đứng sau tờ báo. Trang này mới cho biết người chỉ đạo. Còn là tiếng nói của tổ chức nào thì phải tìm ở tập hồ sơ trên kệ.',
        },
        text: 'Dân Chúng được tổ chức và xuất bản dưới sự chỉ đạo trực tiếp của Nguyễn Văn Cừ và Hà Huy Tập.',
        source: 'museum',
      },
      {
        title: 'Mốc đã đối chiếu',
        note: 'Ngày tháng là thứ dễ chép sai nhất. Ghi vào sổ tay ngay.',
        reader: {
          chapter: 'publication',
          text: 'Anh Ba sẽ kể lại cho cả dãy trọ. Mình sai một con số thì anh mang cái sai ấy đi theo.',
        },
        text: 'Báo Dân Chúng số 1 ra ngày 22/7/1938 tại Sài Gòn. Báo được tổ chức và xuất bản dưới sự chỉ đạo trực tiếp của Nguyễn Văn Cừ và Hà Huy Tập.',
        evidence: 'first-issue',
        source: 'museum',
      },
    ],
  },
  {
    id: 'archive',
    station: 'shelf',
    label: 'Tập hồ sơ trên kệ',
    kind: 'folder',
    thought: 'Tờ báo này đại diện cho ai? Có lẽ hồ sơ giữ câu trả lời.',
    pages: [
      {
        title: 'Một tờ báo của Đảng',
        note: 'Đây là câu trả lời thẳng nhất: tiếng nói của Trung ương Đảng, ra công khai, không xin phép.',
        reader: {
          chapter: 'publication',
          text: 'Chủ xe bảo báo này xúi người ta làm bậy. Mình không cãi thay anh Ba được. Mình chỉ có thể nói rõ đây là lời của ai, để anh tự cân nhắc.',
        },
        text: 'Dân Chúng là cơ quan ngôn luận của Trung ương Đảng Cộng sản Đông Dương, xuất bản công khai không xin phép ở Sài Gòn.',
        evidence: 'party',
        source: 'museum',
      },
      {
        title: 'Báo lớn lên cùng bạn đọc',
        note: 'Từ khoảng 2.000 lên 15.000 bản. Sau mỗi con số là người đọc, không phải giấy.',
        reader: {
          chapter: 'publication',
          text: 'Một tờ báo còn qua nhiều tay, như tờ anh Ba gấp tư mang về dãy trọ để đọc chung.',
        },
        text: 'Số in tăng từ khoảng 2.000 lên 15.000 bản vào số Xuân 1939. Nguyễn Ái Quốc nhận xét đây là tờ báo đầu tiên ra mà không xin phép trước, và có lẽ là tờ được đọc nhiều nhất ở Đông Dương.',
        source: 'cityParty',
      },
    ],
  },
  {
    id: 'photo',
    station: 'desk',
    label: 'Ảnh sưu tập báo, chú thích phía sau',
    kind: 'photo',
    thought: 'Mặt trước chưa nói hết. Phía sau tấm ảnh có gì nhỉ?',
    pages: [
      {
        title: 'Ảnh sưu tập báo',
        note: 'Những số báo còn giữ được. Lật mặt sau xem ai đã ghi gì.',
        text: 'Các số Dân Chúng còn được lưu giữ. Phía sau ảnh có ghi ngày tòa soạn bị khám xét.',
      },
      {
        title: 'Ngày bàn biên tập im tiếng',
        note: 'Người bị bắt, tài sản bị tịch thu. Nhưng dòng này chưa nói tờ báo dừng lại.',
        reader: {
          chapter: 'pressure',
          text: 'Năm lo tuần sau không còn gì để đọc. Mình chưa trả lời em được, chừng nào chưa biết số báo cuối ra ngày nào.',
        },
        text: 'Ngày 7/3/1939, chính quyền thuộc địa bắt giam những người làm ở tòa soạn và tịch thu tài sản của báo.',
        evidence: 'arrest',
        source: 'museum',
      },
    ],
  },
  {
    id: 'drawer',
    station: 'desk',
    label: 'Hồ sơ trong ngăn kéo',
    kind: 'folder',
    thought: '',
    pages: [
      {
        title: 'Sau bước ngoặt',
        note: 'Từ 7/3 đến 30/8/1939: hơn năm tháng báo vẫn ra sau vụ bắt giữ. Hai mốc này phải đứng cạnh nhau trên bản tin.',
        reader: {
          chapter: 'pressure',
          text: 'Vậy là có câu trả lời cho Năm: sau tháng 3, báo vẫn còn ra.',
        },
        text: 'Dân Chúng có 80 số. Số 80, số cuối cùng, ra ngày 30/8/1939. Vụ bắt giữ tháng 3 không phải mốc báo kết thúc ngay lập tức.',
        evidence: 'last-issue',
        source: 'museum',
      },
      {
        title: 'Bạn đọc không im lặng',
        note: 'Người giữ tờ báo sống là bạn đọc: họ mít tinh, họ góp tiền.',
        reader: {
          chapter: 'pressure',
          text: 'Năm gửi kèm thư mấy xu để dành mua tập. Em đang làm đúng việc trang này ghi lại, theo sức của một cậu học trò.',
        },
        text: 'Ba ngày sau vụ khám xét, ngày 10/3/1939, Trung ương Đảng ra lời kêu gọi. Trong khoảng một tháng có 28 cuộc mít tinh phản đối, bạn đọc quyên góp hơn 400 đồng trong một tuần để giữ tờ báo.',
        source: 'cityParty',
      },
    ],
  },
  {
    id: 'proof',
    station: 'press',
    label: 'Bản kiểm tra bên bàn in',
    kind: 'paper',
    thought: 'Chữ đã đủ. Nhưng nguồn đã đúng chưa?',
    pages: [
      {
        title: 'Kiểm tra trước khi in',
        note: 'Chữ đẹp mà sai nguồn thì vẫn là sai. Đối chiếu xong mới in.',
        text: 'Đọc lại từng mốc ngày. Kiểm tra nguồn của thông tin. Chỉ đưa lên trang khi bản thảo và bằng chứng khớp nhau.',
      },
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
    id: 'voices',
    number: '01',
    title: 'Đảng lên tiếng về điều gì?',
    intro:
      'Tờ báo của Đảng vận động những yêu cầu nào? Mở bản thảo trên bàn, lật đến ghi chú cuối rồi khoanh ba cụm từ.',
    letter: readers.tu,
    narration:
      'Sài Gòn, 1938. Mặt trận Dân chủ Đông Dương vừa thành lập, Đảng được lên tiếng công khai lần đầu sau nhiều năm bí mật. Bản thảo trên bàn phải nói đúng điều Đảng muốn dân nghe.',
    slots: [
      {
        label: 'Yêu cầu đời sống',
        choices: ['Cơm áo', 'Ngày xuất bản', 'Địa chỉ tòa soạn'],
        answer: 'Cơm áo',
      },
      {
        label: 'Nguyện vọng',
        choices: ['Hòa bình', 'Số lượng trang', 'Năm 1937'],
        answer: 'Hòa bình',
      },
      {
        label: 'Quyền được đòi hỏi',
        choices: ['Dân chủ', 'Khổ giấy', 'Bản nháp'],
        answer: 'Dân chủ',
      },
    ],
    requiredEvidence: ['demands'],
    proof: 'demands',
    guide: [
      'Chọn “Bàn biên tập” ở thanh dưới. Tìm tờ giấy có kẹp trên bàn.',
      'Lật đến trang cuối. Chạm “cơm áo”, “hòa bình”, “dân chủ”; khoanh đủ ba cụm là sổ tay tự ghi.',
    ],
    hints: [
      'Tìm ba yêu cầu được ghi ở trang cuối bản thảo.',
      'Ba cụm cần khoanh là “cơm áo”, “hòa bình”, “dân chủ”.',
    ],
    summary: 'Báo chí truyền đạt chủ trương của Đảng và vận động đấu tranh vì dân sinh, dân chủ.',
    impact:
      'Bản tin của bạn đưa ba yêu cầu mà Hội nghị Trung ương tháng 7/1936 đề ra thành lời lẽ giản dị: cơm áo, hòa bình, dân chủ. Người thợ, người dân đọc báo biết mình được đòi những gì, và biết đòi một cách công khai, hợp pháp.',
    impactSource: 'movement',
    video: null,
    poster: null,
    source: 'museum',
  },
  {
    id: 'publication',
    number: '02',
    title: 'Ai đứng sau báo Dân Chúng?',
    intro:
      'Dân Chúng là cơ quan ngôn luận của tổ chức nào, và số đầu ra ngày nào? Bắt đầu ở kệ tư liệu.',
    letter: readers.ba,
    narration:
      'Có người hỏi: ai đứng sau tờ báo này? Câu trả lời phải chính xác. Sổ đỏ và hồ sơ trên kệ giữ dấu vết của Trung ương Đảng.',
    slots: [
      {
        label: 'Tờ báo',
        choices: ['Dân Chúng', 'Sổ ghi chép', 'Bản kiểm tra'],
        answer: 'Dân Chúng',
      },
      {
        label: 'Số đầu tiên ra ngày',
        choices: ['22/7/1938', '22/7/1937', '30/8/1939'],
        answer: '22/7/1938',
      },
      {
        label: 'Vai trò',
        choices: [
          'Cơ quan ngôn luận của Trung ương Đảng',
          'Một bản nháp chưa xuất bản',
          'Một tờ báo chỉ nói về khổ giấy',
        ],
        answer: 'Cơ quan ngôn luận của Trung ương Đảng',
      },
    ],
    requiredEvidence: ['first-issue', 'party'],
    proof: 'first-issue',
    guide: [
      'Chọn “Kệ tư liệu” ở thanh dưới, rồi mở cuốn sổ đỏ.',
      'Lật đến trang 2 và ghi ngày. Mở tập hồ sơ cạnh đó, đọc trang đầu rồi ghi vai trò của tờ báo.',
    ],
    hints: [
      'Sổ đỏ trang 2 ghi ngày ra số đầu.',
      'Tập hồ sơ trên kệ xác nhận cơ quan chủ quản của báo.',
    ],
    summary: 'Dân Chúng gắn trực tiếp với hoạt động lãnh đạo, tuyên truyền và vận động của Đảng.',
    impact:
      'Bạn đọc biết tờ báo họ cầm là tiếng nói của Trung ương Đảng, do Hà Huy Tập và Nguyễn Văn Cừ chỉ đạo. Nhờ vậy báo lớn nhanh: từ khoảng 2.000 bản lên 15.000 bản vào số Xuân 1939.',
    impactSource: 'cityParty',
    video: null,
    poster: null,
    source: 'museum',
  },
  {
    id: 'pressure',
    number: '03',
    title: 'Vụ bắt giữ có làm báo im tiếng?',
    intro:
      'Tòa soạn bị bắt, nhưng báo còn ra sau đó bao lâu? Đối chiếu ngày trên ảnh với số cuối trong ngăn kéo.',
    letter: readers.nam,
    narration:
      'Tháng 3/1939, mật thám ập vào tòa soạn. Nhưng sổ lưu ghi Dân Chúng còn ra tới tháng 8. Điều gì đã giữ tờ báo sống thêm năm tháng?',
    slots: [
      { label: 'Vụ bắt giữ', choices: ['7/3/1939', '30/8/1939', '22/7/1938'], answer: '7/3/1939' },
      { label: 'Số báo cuối', choices: ['Số 80', 'Số 1', 'Bản nháp'], answer: 'Số 80' },
      {
        label: 'Ngày ra số cuối',
        choices: ['30/8/1939', '7/3/1939', '22/7/1937'],
        answer: '30/8/1939',
      },
    ],
    requiredEvidence: ['arrest', 'last-issue'],
    proof: 'arrest',
    guide: [
      'Chọn “Bàn biên tập”, mở ảnh các số báo rồi lật sang mặt sau để tìm ngày bắt giữ.',
      'Ghi ngày bắt giữ. Sau đó mở ngăn kéo bàn, ghi ngày số 80. Hai manh mối nói về hai sự kiện khác nhau.',
    ],
    hints: [
      'Ảnh lật mặt sau ghi ngày bắt giữ.',
      'Ngăn kéo ghi ngày số 80. Hai mốc không cùng một sự kiện.',
    ],
    summary:
      'Tư liệu còn lưu lại giúp ta hiểu những khó khăn của báo chí cách mạng và vai trò của tờ báo trong phong trào dân chủ.',
    impact:
      'Bản tin của bạn cho thấy bắt người không bắt được tiếng nói. Sau lời kêu gọi của Trung ương ngày 10/3/1939, bạn đọc mít tinh phản đối và góp tiền nuôi báo. Dân Chúng ra đến số 80. Khi chiến tranh thế giới nổ ra tháng 9/1939, báo bị đóng cửa và Đảng chuyển vào hoạt động bí mật, mang theo lực lượng đã rèn luyện qua những trang báo này.',
    impactSource: 'cityParty',
    video: null,
    poster: null,
    source: 'museum',
  },
];

// Fictional composite readers give the player someone to write for. Epilogue facts are sourced.
export const epilogue = {
  text: 'Tháng 9/1939, chiến tranh thế giới nổ ra, Dân Chúng bị đóng cửa. Tháng 11/1939, Hội nghị Trung ương dưới sự chỉ đạo của Tổng Bí thư Nguyễn Văn Cừ chuyển hướng, đặt nhiệm vụ giải phóng dân tộc lên hàng đầu. Nguyễn Văn Cừ bị bắt đầu năm 1940 và hy sinh ngày 28/8/1941. Những người từng viết, in và đọc báo trở thành lực lượng cho chặng đường tới Cách mạng Tháng Tám 1945.',
  source: 'cu',
};

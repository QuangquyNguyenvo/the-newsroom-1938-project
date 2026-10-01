// Optional reading dossiers. They deepen the history around the room without
// changing the three required chapters or presenting a reconstruction as an
// authenticated object.
const sources = {
  danChung: {
    title: 'Sưu tập Báo Dân Chúng (1938-1939), Bảo tàng Lịch sử Quốc gia',
    url: 'https://baotanglichsuquocgia.vn/vi/Articles/1002/14270/suu-tap-bao-dan-chung-1938-1939-cua-bao-tang-lich-su-quoc-gia.html',
  },
  press1936: {
    title: 'Một số báo chí cách mạng thời kỳ 1936-1939, Bảo tàng Lịch sử Quốc gia',
    url: 'https://baotanglichsuquocgia.vn/vi/Articles/1002/14549/ky-niem-88-nam-ngay-bao-chi-cach-mang-viet-nam-21-6-1925-21-6-2013-mot-so-bao-chi-cach-mang-thoi-ky-1936-1939-hien-bao-tang-lich-su-quoc-gia-luu-giu-djuoc-du-so.html',
  },
  pressOverview: {
    title: 'Vài nét về báo chí cách mạng Việt Nam (1925-1945), Bảo tàng Lịch sử Quốc gia',
    url: 'https://baotanglichsuquocgia.vn/vi/Articles/3097/18265/vai-net-ve-bao-chi-cach-mang-viet-nam-1925-1945.html',
  },
  pressGroup: {
    title: 'Nhóm báo chí cách mạng thời kỳ 1936-1939, Bảo tàng Lịch sử Quốc gia',
    url: 'https://baotanglichsuquocgia.vn/vi/Articles/4053/nhom-bao-chi-cach-mang-thoi-ky-1936-1939',
  },
  thanhNien: {
    title: 'Báo Thanh Niên, dấu mốc của sự ra đời Báo chí Cách mạng Việt Nam, Báo Nhân Dân',
    url: 'https://nhandan.vn/special/tobaocachmangdautien/index.html',
  },
  selfCriticism: {
    title: 'Yêu cầu của sứ mệnh lịch sử và địa vị lãnh đạo, Báo Nhân Dân',
    url: 'https://nhandan.vn/special/yeu-cau-cua-su-menh/index.html',
  },
  selfCriticismLessons: {
    title:
      'Bài học kinh nghiệm xây dựng Đảng từ hoạt động cách mạng của đồng chí Nguyễn Văn Cừ, Báo Nhân Dân',
    url: 'https://nhandan.vn/special/Bai-hoc-xay-dung-Dang-tu-dong-chi-Nguyen-Van-Cu/index.html',
  },
  laborPress: {
    title:
      'Báo chí cách mạng Bắc Kỳ với phong trào nghiệp đoàn, ái hữu (1936-1939), Tạp chí Lịch sử Đảng',
    url: 'https://tapchilichsudang.vn/bao-chi-cach-mang-bac-ky-voi-phong-trao-nghiep-doan-ai-huu-1936-1939.html',
  },
  cityParty: {
    title:
      'Báo Dân Chúng, dấu son trong lịch sử báo chí cách mạng Việt Nam, Thành ủy Thành phố Hồ Chí Minh',
    url: 'https://www.hcmcpv.org.vn/tin-tuc/bao-dan-chung-dau-son-trong-lich-su-bao-chi-cach-mang-viet-nam-1491880968',
  },
};

export const pressKnowledgeSources = sources;

export const pressKnowledge = [
  {
    id: 'press-origins',
    station: 'desk',
    label: 'Hồ sơ tái dựng về Báo Thanh Niên',
    title: 'Trước khi tiếng nói đến Sài Gòn',
    kicker: 'BỐI CẢNH TRƯỚC GIAI ĐOẠN 1936-1939',
    intro:
      'Trước Dân Chúng ở Sài Gòn đã có một tờ báo đi từ Quảng Châu về qua những đường dây bí mật. Hồ sơ này mở một lớp bối cảnh, không phải vật chứng của tòa soạn trong phòng.',
    pages: [
      {
        title: 'Một số báo ở Quảng Châu',
        body: 'Ngày 21/6/1925, Báo Thanh Niên do Nguyễn Ái Quốc sáng lập và trực tiếp chỉ đạo ra số đầu ở Quảng Châu. Đây là lớp bối cảnh trước Dân Chúng, cho thấy báo chí cách mạng đã gắn việc viết với việc tổ chức và truyền bá tư tưởng.',
        source: sources.thanhNien,
      },
      {
        title: 'Kỹ thuật vừa đủ để chuyền tay',
        body: 'Trong thời kỳ đầu, báo xuất bản hằng tuần, thường có 2 trang, một số có 4 hoặc 5 trang. Bài được viết bằng bút sắt trên giấy sáp rồi in roneo, khổ trung bình khoảng 18 x 24 cm. Những chi tiết nhỏ này gợi ra một ấn phẩm có thể giữ kín và chuyền qua nhiều tay.',
        source: sources.thanhNien,
      },
      {
        title: 'Người theo dõi phía bên kia',
        body: 'Một bài giới thiệu dựa trên báo cáo của mật thám Pháp cho biết cơ quan này theo dõi đường dây chuyển báo, lấy báo, dịch một số bài để nghiên cứu và đối phó. Việc theo dõi không chặn được hoàn toàn tờ báo đến với phong trào.',
        source: sources.thanhNien,
      },
      {
        title: 'Dẫn người đọc từng bước',
        body: 'Cũng theo nhận định được dẫn lại trong tài liệu, 60 số đầu chủ yếu nói về yêu nước, dân tộc và lòng căm thù chế độ thuộc địa, rồi từ số 61 lập luận được đẩy rõ hơn về con đường cách mạng. Đây là nhận xét của phía theo dõi, nên người đọc cần coi nó là một nguồn để đối chiếu, không phải lời tự giới thiệu của tờ báo.',
        source: sources.thanhNien,
      },
    ],
    challenge: {
      prompt:
        'Chi tiết nào cho thấy Báo Thanh Niên vừa truyền bá tư tưởng, vừa phải thích nghi với điều kiện bí mật?',
      choices: [
        'Bản in nhỏ trên giấy sáp, ra đều hằng tuần',
        'Chỉ đăng tin thế giới và không có người chỉ đạo',
        'In khổ lớn tại ba nhà in ở Sài Gòn',
      ],
      answer: 0,
      explanation:
        'Cách viết trên giấy sáp, in roneo, khổ nhỏ và nhịp ra hằng tuần cho thấy tờ báo phải cân bằng việc truyền bá với điều kiện hoạt động bí mật.',
      hint: 'Đọc trang nói về giấy sáp, khổ báo và nhịp xuất bản, rồi đối chiếu với trang về đường dây bị theo dõi.',
      source: sources.thanhNien,
    },
  },
  {
    id: 'legal-press',
    station: 'shelf',
    label: 'Hồ sơ tái dựng về những cách ra báo',
    title: 'Cửa công khai có nhiều then cài',
    kicker: 'BÁO CHÍ CÔNG KHAI VÀ NỬA HỢP PHÁP',
    intro:
      'Một tờ báo có thể đứng tên người khác, đi qua thủ tục kiểm duyệt, hoặc xuất hiện bằng một tên báo đã được cấp phép. Cùng thời kỳ ấy, Dân Chúng chọn cách ra tiếng Việt không xin phép.',
    pages: [
      {
        title: 'Từ tháng 6 năm 1936',
        body: 'Bảo tàng Lịch sử Quốc gia ghi nhận từ tháng 6/1936, báo chí cách mạng bước ra xuất bản công khai và nhận nhiệm vụ tuyên truyền, vận động cho Mặt trận Dân chủ Đông Dương, tự do dân chủ, cải thiện đời sống và hòa bình. Công khai ở đây là một khoảng đấu tranh, không phải sự an toàn lâu dài.',
        source: sources.pressOverview,
      },
      {
        title: 'Nhiều cách để đưa tiếng nói ra ngoài',
        body: 'Các hình thức được ghi nhận gồm xuất bản báo chữ Pháp qua chế độ kiểm duyệt và thủ tục đơn giản, chuyển một tờ đã được phép sang phục vụ cách mạng, thuê hoặc mua lại báo, đưa người có cảm tình đứng tên xin phép, biên tập ở một xứ rồi in ở xứ khác. Mỗi cách mở một lối đi riêng và kéo theo một rủi ro riêng.',
        source: sources.pressOverview,
      },
      {
        title: 'Nửa hợp pháp vẫn là chịu sức ép',
        body: 'Phần lớn báo chí cách mạng được in ở các nhà in của người Pháp hoặc người Việt, rồi phát hành qua bưu điện, hiệu sách và các tổ bán báo lưu động. Bảo tàng gọi đó là những hình thức hợp pháp và nửa hợp pháp, vì báo vẫn phải tìm cách tồn tại giữa kiểm duyệt, cấm đoán và truy lùng.',
        source: sources.press1936,
      },
      {
        title: 'Một mặt trận nối nhiều nơi',
        body: 'Bảo tàng hiện giới thiệu hơn 20 đầu báo cách mạng của thời kỳ 1936-1939. Le Travail xuất bản bằng tiếng Pháp ở Hà Nội, Tin Tức gắn với Mặt trận Dân chủ Đông Dương, còn Dân Chúng là một tờ tiếng Việt xuất bản công khai không xin phép ở Sài Gòn. Những tên báo khác nhau không tách rời khỏi cùng một cuộc vận động.',
        source: sources.pressGroup,
      },
    ],
    challenge: {
      prompt:
        'Vì sao giai đoạn 1936-1939 có thể gọi là một khoảng mở có điều kiện, thay vì tự do báo chí hoàn toàn?',
      choices: [
        'Báo chí vừa tận dụng thủ tục công khai, vừa phải đi qua kiểm duyệt, tên đứng hộ hoặc đường in khác nhau',
        'Mọi tờ báo đều được phát hành mà không bị theo dõi',
        'Chỉ có báo tiếng Pháp mới được phép tồn tại',
      ],
      answer: 0,
      explanation:
        'Các nguồn mô tả nhiều lối ra báo công khai, nửa hợp pháp và bí mật đan xen. Những lối đó mở rộng không gian hoạt động nhưng vẫn nằm trong sức ép kiểm duyệt và truy bức.',
      hint: 'Đối chiếu trang về các cách đứng tên, thuê báo và in khác xứ với trang nói về kiểm duyệt và phát hành.',
      source: sources.pressOverview,
    },
  },
  {
    id: 'first-issue',
    station: 'shelf',
    label: 'Bìa tái dựng số 1 Báo Dân Chúng',
    title: 'Ngày một tờ báo xuất hiện',
    kicker: 'SỐ 1, SÀI GÒN, 22/7/1938',
    intro:
      'Một ngày tháng 7 mở ra hơn một năm hoạt động của Dân Chúng. Khi đối chiếu một số báo, hãy tách ngày ra mắt, hình thức xuất bản và số lượng tư liệu còn lưu.',
    pages: [
      {
        title: 'Số đầu tiên',
        body: 'Dân Chúng ra số 1 tại Sài Gòn ngày 22/7/1938. Bảo tàng Lịch sử Quốc gia ghi đây là cơ quan ngôn luận của Trung ương Đảng Cộng sản Đông Dương, được tổ chức và xuất bản dưới sự chỉ đạo trực tiếp của Nguyễn Văn Cừ và Hà Huy Tập.',
        source: sources.danChung,
      },
      {
        title: 'Bảy mươi chín số trong tủ lưu trữ',
        body: 'Trong hơn một năm, báo ra 80 số, nhưng bộ sưu tập hiện được giới thiệu tại Bảo tàng Lịch sử Quốc gia có 79 số vì thiếu số 14. Đây là hai con số cùng đúng ở hai tầng khác nhau: lịch sử xuất bản và những gì hiện còn trong một bộ sưu tập.',
        source: sources.danChung,
      },
      {
        title: 'Khổ giấy không đứng yên',
        body: 'Từ số 1 đến số 9, báo được ghi nhận in trên khổ 30 x 44,5 cm. Từ số 10 đến số cuối, khổ giấy là 37 x 54 cm. Số trang cũng thay đổi, từ 2 hoặc 4 trang đến số Xuân 1939 có 28 trang.',
        source: sources.danChung,
      },
      {
        title: 'Những số đặc biệt',
        body: 'Trong bộ sưu tập có số 28 kỷ niệm 21 năm Cách mạng Tháng Mười Nga, số 41 kỷ niệm 9 năm ngày thành lập Đảng Cộng sản Đông Dương và số 74 kỷ niệm một năm ngày ra báo Dân Chúng. Một tờ báo có nhịp thường kỳ, nhưng vẫn dành chỗ cho những mốc mà ban biên tập muốn đánh dấu.',
        source: sources.danChung,
      },
    ],
    challenge: {
      prompt:
        'Khi lịch sử xuất bản ghi 80 số còn kho lưu trữ có 79 số, cách đọc nào thận trọng nhất?',
      choices: [
        'Sửa lịch sử xuất bản thành 79 số',
        'Tách số đã xuất bản khỏi số hiện còn và ghi rõ khoảng trống',
        'Coi số còn thiếu như chưa từng tồn tại',
      ],
      answer: 1,
      explanation:
        'Nguồn bảo tàng ghi Dân Chúng ra 80 số, còn bộ sưu tập hiện có 79 số vì thiếu số 14. Hai con số trả lời hai câu hỏi khác nhau.',
      hint: 'Xem trang phân biệt số đã ra với số hiện có, rồi đọc tiếp trang về các khổ giấy và số đặc biệt.',
      source: sources.danChung,
    },
  },
  {
    id: 'reading-public',
    station: 'shelf',
    label: 'Sổ tái dựng theo dõi bạn đọc',
    title: 'Một tờ báo có người cầm và người nghe',
    kicker: 'TỪ SỐ LƯỢNG PHÁT HÀNH ĐẾN ĐỜI SỐNG',
    intro:
      'Đằng sau một con số phát hành là những người tìm thấy trong báo một cách gọi tên điều họ đang chịu đựng. Các trang này đọc Dân Chúng từ phía bạn đọc và những vấn đề tờ báo đưa lên.',
    pages: [
      {
        title: 'Con số tăng theo từng nấc',
        body: 'Theo Bảo tàng Lịch sử Quốc gia, Dân Chúng tăng từ khoảng 2.000 bản mỗi số lên 4.000, 6.000 và 10.000 bản. Số Xuân 1939 đạt khoảng 15.000 bản, một con số được nguồn đánh giá là rất lớn trong hoàn cảnh lúc ấy.',
        source: sources.danChung,
      },
      {
        title: 'Không chỉ có chuyện trong nước',
        body: 'Các bài trên báo phản chiếu sinh hoạt chính trị ở Đông Dương và thế giới trước thềm Chiến tranh thế giới thứ hai. Nguồn bảo tàng nhắc đến nguy cơ phát xít, nguy cơ chiến tranh và cuộc đấu tranh của những người yêu chuộng hòa bình, cùng các yêu cầu tự do và dân chủ.',
        source: sources.danChung,
      },
      {
        title: 'Những yêu cầu có tên gọi cụ thể',
        body: 'Báo đăng các bài đòi tự do lập hội ái hữu và nghiệp đoàn, tự do hội họp và biểu tình, thả tù chính trị, cải cách chế độ tuyển cử, có Hội đồng dân biểu và cải thiện đời sống. Các cụm từ này biến một mong muốn chung thành những điều có thể đem ra bàn luận và đòi hỏi.',
        source: sources.danChung,
      },
      {
        title: 'Đọc báo là một hành động xã hội',
        body: 'Một con số phát hành không kể hết ai đã đọc, ai nghe nhờ người khác và ai chuyền tờ báo đi tiếp. Từ những gì nguồn ghi về số lượng và nội dung, người chơi có thể đặt câu hỏi: một bài báo trở thành tiếng nói chung bằng cách nào, và ai vẫn có thể bị bỏ sót?',
        source: sources.danChung,
      },
    ],
    challenge: {
      prompt:
        'Từ số phát hành tăng theo nhiều nấc và nội dung xoay quanh dân sinh, kết luận nào có thể nói chắc nhất?',
      choices: [
        'Mỗi bản chắc chắn được một người lao động đọc trọn',
        'Số lượng phát hành chứng minh mọi yêu cầu trong báo đều được giải quyết',
        'Báo đã có sức hút đáng kể, nhưng con số chưa cho biết mọi nhóm bạn đọc tiếp cận như nhau',
      ],
      answer: 2,
      explanation:
        'Nguồn ghi số phát hành tăng đến khoảng 15.000 bản ở số Xuân 1939 và liệt kê nhiều vấn đề dân sinh. Những dữ kiện đó cho thấy sức hút và phạm vi quan tâm, nhưng không cho biết từng bản được đọc thế nào.',
      hint: 'Dùng trang về các nấc phát hành làm bằng chứng, rồi giữ giới hạn mà trang cuối đặt ra cho việc suy luận về người đọc.',
      source: sources.danChung,
    },
  },
  {
    id: 'newsroom-work',
    station: 'desk',
    label: 'Sổ tay tái dựng của tòa soạn',
    title: 'Tòa soạn không chỉ có người viết',
    kicker: 'ĐỊA CHỈ, NHÀ IN VÀ NHỮNG VIỆC KHÔNG CÓ TÊN TRÊN MẶT BÁO',
    intro:
      'Một tờ báo tồn tại nhờ nhiều việc âm thầm: sửa bản in, tiếp bạn đọc, nộp lưu chiểu, đổi nhà in và giữ cho số mới ra đúng hẹn. Những trang này mở hậu trường mà tiêu đề thường che khuất.',
    pages: [
      {
        title: 'Hai địa chỉ của một tòa soạn',
        body: 'Các bài giới thiệu của Bảo tàng Lịch sử Quốc gia đều ghi hai địa chỉ gắn với Dân Chúng: 43 đường Hamelin, nay là đường Lê Thị Hồng Gấm, và 51E đường Colonel Grimaud, nay là đường Phạm Ngũ Lão. Bài sưu tập ghi thời gian đầu ở Hamelin rồi chuyển sang Colonel Grimaud, còn mục nhóm báo gắn số 1 đến 33 với Colonel Grimaud và từ số 34 với Hamelin. Game giữ cả hai địa chỉ và không biến thứ tự chưa thống nhất thành đáp án.',
        source: sources.danChung,
        relatedSources: [sources.pressGroup],
      },
      {
        title: 'Một người có thể làm nhiều việc',
        body: 'Nguồn bảo tàng kể những người thường xuyên làm việc tại tòa báo vừa quản lý tài sản, biên tập bài vở, tiếp bạn đọc, sửa bản in và đi nộp lưu chiểu, vừa thay nhau đi chợ, nấu ăn. Một tòa soạn nhỏ hiện ra như một tập thể lao động, không phải một chiếc bàn chỉ có người cầm bút.',
        source: sources.danChung,
      },
      {
        title: 'Ba nhà in cho một nhịp phát hành',
        body: 'Dân Chúng được ghi nhận in ở ba nơi: Nhà in S.A.T.I, Nhà in Bảo Tồn và Nhà in Xưa Nay. Bài của Thành ủy Thành phố Hồ Chí Minh liên hệ việc thay đổi nhà in với yêu cầu giữ an toàn và phát hành đúng kỳ hạn. Căn phòng và máy in trong trò chơi vẫn là thiết kế minh họa, không phải phục dựng một nhà in cụ thể.',
        source: sources.cityParty,
      },
      {
        title: 'Nhịp báo thay đổi theo thời cuộc',
        body: 'Thông thường báo ra hai số mỗi tuần vào thứ tư và thứ bảy. Riêng từ số 58 đến số 64, báo ra hằng ngày rồi trở lại nhịp hai số mỗi tuần. Một lịch phát hành dày hơn làm tăng cơ hội đến với bạn đọc, đồng thời đặt thêm áp lực lên cả biên tập và in ấn.',
        source: sources.danChung,
      },
    ],
    challenge: {
      prompt:
        'Khi hai nguồn bảo tàng ghi cùng hai địa chỉ nhưng xếp thứ tự khác nhau, cách ghi nào giữ được độ tin cậy?',
      choices: [
        'Chọn địa chỉ mình thích rồi bỏ nguồn còn lại',
        'Giữ cả hai địa chỉ, ghi rõ sự khác nhau giữa các nguồn và không biến thứ tự thành đáp án',
        'Suy ra tòa soạn chuyển địa chỉ mỗi tuần',
      ],
      answer: 1,
      explanation:
        'Bài sưu tập ghi thời gian đầu ở 43 Hamelin rồi chuyển sang 51E Colonel Grimaud, còn mục nhóm báo gắn số 1 đến 33 với 51E và từ số 34 với 43. Khi thứ tự chưa thống nhất, nên giữ dữ kiện và ghi rõ giới hạn nguồn.',
      hint: 'Đọc trang đầu của hồ sơ tòa soạn và để ý chú thích về hai địa chỉ, sau đó đối chiếu cách chia số báo trong nguồn nhóm báo chí.',
      source: sources.danChung,
      relatedSources: [sources.pressGroup],
    },
  },
  {
    id: 'democratic-front',
    station: 'desk',
    label: 'Bản đồ tái dựng Mặt trận Dân chủ',
    title: 'Từ khẩu hiệu đến tổ chức',
    kicker: 'DÂN SINH, DÂN CHỦ, HÒA BÌNH',
    intro:
      'Các cụm từ trên trang báo không tự biến thành hành động. Phần đọc thêm này nối nội dung báo chí với những hình thức tổ chức và những người lao động mà báo muốn hướng tới.',
    pages: [
      {
        title: 'Một nhiệm vụ trung tâm',
        body: 'Một bài viết của Thành ủy Thành phố Hồ Chí Minh dẫn lại Hội nghị Trung ương ngày 29 và 30/3/1938, trong đó việc thực hiện Mặt trận dân chủ thống nhất được xác định là nhiệm vụ trung tâm của Đảng trong giai đoạn ấy. Báo công khai được đặt vào trong nhiệm vụ vận động rộng rãi đó.',
        source: sources.cityParty,
      },
      {
        title: 'Báo chí nói đến ai',
        body: 'Nguồn của Thành ủy mô tả báo công khai có nhiệm vụ nêu tình cảnh của công nhân, nông dân và người lao động, bênh vực quyền lợi của nhiều tầng lớp, phổ biến đường lối của Đảng, rồi hướng dẫn và cổ vũ quần chúng đấu tranh vì tự do, dân chủ, hòa bình và cơm áo.',
        source: sources.cityParty,
      },
      {
        title: 'Ái hữu và nghiệp đoàn',
        body: 'Tạp chí Lịch sử Đảng ghi nhận từ năm 1936, khi chính sách ở Đông Dương có dấu hiệu nới lỏng, tiếng nói của người lao động xuất hiện công khai hơn trên diễn đàn báo chí. Phong trào đòi thành lập các tổ chức ái hữu và nghiệp đoàn giúp người đọc thấy những chữ dân sinh gắn với việc tập hợp người thật.',
        source: sources.laborPress,
      },
      {
        title: 'Một trang báo có thể làm nhiều việc',
        body: 'Theo nguồn bảo tàng, báo chí thời kỳ này vừa tuyên truyền, vừa phổ biến chủ trương, vừa thúc đẩy các cuộc đấu tranh hưởng ứng lẫn nhau giữa nhiều địa phương. Vì thế một bài báo không chỉ truyền tin, nó còn cố làm cho những yêu cầu rời rạc nhận ra nhau.',
        source: sources.press1936,
      },
    ],
    challenge: {
      prompt: 'Vì sao khẩu hiệu dân sinh trong tờ báo gắn với tổ chức, không chỉ với câu chữ?',
      choices: [
        'Vì mọi bài báo tự động trở thành nghị quyết',
        'Vì báo chỉ dành cho người đã là đảng viên',
        'Vì nguồn mô tả báo vừa nêu tình cảnh, vừa hướng dẫn quần chúng và kết nối hội ái hữu, nghiệp đoàn, mít tinh',
      ],
      answer: 2,
      explanation:
        'Các nguồn mô tả báo chí vừa nêu quyền lợi và đời sống, vừa hướng dẫn quần chúng tổ chức đấu tranh trong những hình thức như hội ái hữu, nghiệp đoàn và mít tinh.',
      hint: 'Đọc trang về nhiệm vụ của báo công khai, rồi đối chiếu với trang nói về ái hữu và nghiệp đoàn.',
      source: sources.cityParty,
    },
  },
  {
    id: 'self-criticism',
    station: 'shelf',
    label: 'Bản tái dựng sách Tự chỉ trích',
    title: 'Khi một phong trào phải tự hỏi mình',
    kicker: 'NGUYỄN VĂN CỪ VÀ TỰ CHỈ TRÍCH NĂM 1939',
    intro:
      'Một tờ báo không chỉ hướng mắt ra ngoài. Cuốn sách này mở một câu hỏi khó hơn: khi đường lối và cách làm có điểm cần sửa, phê bình thế nào để phong trào mạnh lên?',
    pages: [
      {
        title: 'Một cuốn sách trong năm 1939',
        body: 'Báo Nhân Dân giới thiệu Tự chỉ trích là tác phẩm của Nguyễn Văn Cừ, viết dưới bút danh Trí Cường và do Nhà sách Dân chúng ấn hành tại Sài Gòn năm 1939. Tác phẩm xuất hiện trong một giai đoạn phong trào có nhiều khuynh hướng khác nhau và nguy cơ chia rẽ.',
        source: sources.selfCriticism,
      },
      {
        title: 'Phê bình để sửa, không để làm nhục',
        body: 'Theo phần giới thiệu của Báo Nhân Dân, cuốn sách nhấn mạnh việc công khai và thành thực nhận ra sai lầm, tìm cách sửa đổi, qua đó huấn luyện quần chúng và giúp đảng viên tự rèn luyện. Mục tiêu được đặt ở sự thống nhất và năng lực hành động, không phải ở việc đặt danh dự cá nhân lên trên công việc chung.',
        source: sources.selfCriticism,
      },
      {
        title: 'Bài học từ một cuộc tranh luận',
        body: 'Một bài viết khác của Báo Nhân Dân cho biết Tự chỉ trích bàn thêm về bài học của cuộc tuyển cử Hội đồng quản hạt Nam Kỳ và tranh luận quanh cách nhìn đối với Đảng Lập hiến. Chi tiết này cho thấy đây là một văn bản can dự vào vấn đề cụ thể, chứ không chỉ là lời khuyên đạo đức chung.',
        source: sources.selfCriticismLessons,
      },
      {
        title: 'Đặt cuốn sách cạnh bản in',
        body: 'Trong trò chơi, sách Tự chỉ trích là một hồ sơ kiến thức được tái dựng, không phải hiện vật gốc trong tòa soạn. Nó cho phép người chơi đọc chậm một lớp tranh luận phía sau các trang báo, rồi tự hỏi mỗi bài viết đang sửa điều gì và đang bảo vệ điều gì.',
        source: sources.selfCriticism,
      },
    ],
    challenge: {
      prompt:
        'Theo tinh thần Tự chỉ trích, ranh giới giữa phê bình xây dựng và công kích phá hoại nằm ở đâu?',
      choices: [
        'Che khuyết điểm để giữ vẻ thống nhất',
        'Nói rõ sai lầm và tìm cách sửa để củng cố khả năng hành động chung',
        'Đặt ý kiến cá nhân cao hơn tổ chức rồi dùng sai lầm để hạ uy tín',
      ],
      answer: 1,
      explanation:
        'Nguồn Báo Nhân Dân trình bày tự phê bình và phê bình như việc thành thực nhận ra sai lầm, tìm cách sửa đổi, huấn luyện người trong phong trào và củng cố sự thống nhất.',
      hint: 'Đọc trang về mục tiêu của phê bình, rồi xem trang về cuộc tranh luận cụ thể mà cuốn sách tham gia.',
      source: sources.selfCriticism,
    },
  },
  {
    id: 'censorship',
    station: 'press',
    label: 'Hồ sơ tái dựng vụ khám xét',
    title: 'Đừng gộp tháng 3 với tháng 9',
    kicker: 'BẮT GIỮ, PHẢN ĐỐI VÀ SỐ BÁO CUỐI',
    intro:
      'Các mốc gần nhau dễ bị kể thành một câu chuyện quá gọn. Hồ sơ này giữ chúng tách ra để người đọc thấy một tờ báo chịu sức ép, nhận phản ứng của bạn đọc và chỉ đi đến đoạn đóng cửa sau những biến chuyển tiếp theo.',
    pages: [
      {
        title: 'Ngày 7 tháng 3 năm 1939',
        body: 'Bảo tàng Lịch sử Quốc gia ghi ngày 7/3/1939 chính quyền thuộc địa bắt giam những người làm ở tòa soạn và tịch thu tài sản của báo. Một bài của Thành ủy Thành phố Hồ Chí Minh gọi đây là cuộc khủng bố báo Dân Chúng, sau đó Trung ương ra thông báo khẩn ngày 10/3.',
        source: sources.cityParty,
      },
      {
        title: 'Bạn đọc phản ứng',
        body: 'Theo báo cáo được bài của Thành ủy dẫn lại, trong tháng sau vụ khủng bố đã có 28 cuộc mít tinh phản đối, một vài cuộc có tới 1.000 người tham gia. Một cuộc lạc quyên giúp tờ báo thu được hơn 400 đồng trong một tuần. Những con số này không biến nguy hiểm thành chiến thắng dễ dàng, nhưng cho thấy người đọc đã hành động.',
        source: sources.cityParty,
      },
      {
        title: 'Số 80 chưa phải ngày 7 tháng 3',
        body: 'Dân Chúng vẫn được ghi nhận ra số 80, số cuối cùng, ngày 30/8/1939. Vì vậy vụ bắt giữ tháng 3 và số báo cuối tháng 8 là hai mốc khác nhau. Khi đối chiếu tư liệu, đừng biến một cuộc khám xét thành lời giải thích cho mọi chuyện xảy ra sau đó.',
        source: sources.danChung,
      },
      {
        title: 'Ngày đóng cửa trong tháng 9',
        body: 'Bài viết của Thành ủy ghi ngày 7/9/1939 nhà cầm quyền Pháp tại Sài Gòn ra lệnh đóng cửa Dân Chúng, tịch thu tài sản và truy lùng ban biên tập cùng cộng tác viên. Đây là mốc sau số 80 và nằm trong bối cảnh chiến tranh thế giới bùng nổ, khi báo chí cách mạng chuyển vào hoạt động bí mật.',
        source: sources.cityParty,
      },
    ],
    challenge: {
      prompt: 'Vì sao không được dùng ngày 7/3 để kết luận Dân Chúng chấm dứt ngay?',
      choices: [
        'Vì vụ bắt giữ chỉ là tin đồn',
        'Vì báo không chịu sức ép nào sau tháng 3',
        'Vì số 80 còn ra ngày 30/8, còn lệnh đóng cửa được ghi ngày 7/9',
      ],
      answer: 2,
      explanation:
        'Nguồn Thành ủy ghi vụ khủng bố ngày 7/3/1939, Bảo tàng ghi số 80 ra ngày 30/8/1939, còn lệnh đóng cửa được ghi ngày 7/9/1939. Các mốc phải được đọc nối tiếp, không gộp lại.',
      hint: 'Đặt trang về vụ bắt giữ cạnh trang về số 80 và trang về tháng 9, rồi kiểm tra thứ tự ngày.',
      source: sources.cityParty,
    },
  },
];

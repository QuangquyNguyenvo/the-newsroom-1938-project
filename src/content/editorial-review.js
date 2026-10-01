// Optional source-comparison prompts for the reading room. These exercises
// deepen the historical context without adding a required puzzle gate.
// `source` names an entry in chapters.js so the UI can link the evidence.
export const editorialReview = {
  voices: [
    {
      id: 'demands-or-format',
      prompt:
        'Chi tiết nào là điều phong trào muốn nói với người dân, còn chi tiết nào chỉ mô tả cách làm báo?',
      choices: [
        'Cơm áo, hòa bình và dân chủ là các yêu cầu được vận động. Khổ giấy chỉ là thông tin kỹ thuật của ấn phẩm.',
        'Khổ giấy là một yêu cầu đời sống, còn hòa bình chỉ là thông số của tờ báo.',
        'Ba yêu cầu chỉ là tên các mục in, không liên quan đến đời sống người đọc.',
      ],
      answer: 0,
      explanation:
        'Nguồn về chủ trương giai đoạn 1936–1939 đặt cơm áo, hòa bình và dân chủ trong nhóm yêu cầu trước mắt. Khổ giấy giúp mô tả ấn phẩm, không thay thế nội dung vận động.',
      hint: 'Tách điều người dân được kêu gọi cùng đòi hỏi khỏi thông số của một tờ báo.',
      source: 'partyHistory',
    },
    {
      id: 'public-is-not-safe',
      prompt:
        'Xuất bản công khai không xin phép ở Sài Gòn cho ta hiểu điều gì về rủi ro của tòa soạn?',
      choices: [
        'Công khai đồng nghĩa tòa soạn đã được bảo hộ và không thể bị can thiệp.',
        'Không xin phép chỉ có nghĩa tờ báo không có người chịu trách nhiệm về nội dung.',
        'Công khai giúp tiếng nói đến với bạn đọc, nhưng không có nghĩa người làm báo được an toàn trước sức ép của chính quyền thuộc địa.',
      ],
      answer: 2,
      explanation:
        'Một tờ báo có thể đưa chủ trương đến công chúng mà vẫn đối mặt với khám xét, bắt giữ và tịch thu tài sản. Công khai là cách hoạt động, không phải lời bảo đảm an toàn.',
      hint: 'Đừng biến chữ “công khai” thành kết luận rằng tòa soạn không còn nguy hiểm.',
      source: 'museum',
    },
  ],

  publication: [
    {
      id: 'first-date-or-final',
      prompt: 'Cặp mốc nào phân biệt số báo đầu tiên với số cuối của Dân Chúng?',
      choices: [
        'Số 1 ra ngày 30/8/1939. Số 80 ra ngày 22/7/1938.',
        'Số 1 ra ngày 22/7/1938. Số 80, số cuối, ra ngày 30/8/1939.',
        'Cả hai mốc đều chỉ cùng một ngày ra mắt của tờ báo.',
      ],
      answer: 1,
      explanation:
        'Ngày 22/7/1938 mở đầu chuỗi xuất bản được hồ sơ ghi nhận. Ngày 30/8/1939 là mốc của số 80, vì vậy hai ngày trả lời hai câu hỏi khác nhau.',
      hint: 'Một mốc nói về lúc bắt đầu, mốc kia nói về số cuối.',
      source: 'museum',
    },
    {
      id: 'organ-or-front',
      prompt:
        'Cách diễn đạt nào phân biệt vai trò của Dân Chúng với bối cảnh Mặt trận Dân chủ Đông Dương?',
      choices: [
        'Mặt trận Dân chủ Đông Dương là tên cơ quan trực tiếp xuất bản Dân Chúng, còn Trung ương Đảng chỉ cung cấp giấy in.',
        'Dân Chúng chỉ là một bản tin nội bộ nên không liên quan đến hoạt động công khai của Đảng.',
        'Dân Chúng là cơ quan ngôn luận của Trung ương Đảng. Mặt trận là bối cảnh vận động rộng hơn, không phải tên cơ quan xuất bản của tờ báo.',
      ],
      answer: 2,
      explanation:
        'Hồ sơ báo chí xác định vai trò của Dân Chúng trong hệ thống ngôn luận của Trung ương Đảng. Mặt trận giúp đặt hoạt động ấy vào không khí vận động dân chủ rộng hơn.',
      hint: 'Hãy phân biệt một cơ quan ngôn luận với không gian chính trị mà nó hoạt động trong đó.',
      source: 'partyHistory',
    },
  ],

  pressure: [
    {
      id: 'arrest-is-not-the-end',
      prompt: 'Trình tự nào cho thấy vụ bắt giữ ngày 7/3/1939 chưa phải ngày Dân Chúng dừng hẳn?',
      choices: [
        'Ngày 7/3/1939 gắn với vụ bắt giữ. Số 80 vẫn ra ngày 30/8/1939, rồi tờ báo mới bị đóng cửa trong tháng 9/1939 khi chiến tranh thế giới nổ ra.',
        'Ngày 7/3/1939 là ngày số 80 ra, nên mọi hoạt động của báo kết thúc ngay hôm đó.',
        'Ngày 30/8/1939 là ngày bắt giữ, còn tháng 9/1939 chỉ là ngày số đầu được phát hành lại.',
      ],
      answer: 0,
      explanation:
        'Đặt ba mốc cạnh nhau giúp tránh rút ngắn câu chuyện: bắt giữ vào tháng 3, số cuối vào cuối tháng 8, và việc đóng cửa vào tháng 9. Một biến cố đàn áp không tự động đồng nghĩa kết thúc ngay lập tức.',
      hint: 'Đọc các mốc theo thứ tự thời gian, rồi hỏi mỗi mốc đang nói về biến cố nào.',
      source: 'museum',
    },
    {
      id: 'photo-needs-a-record',
      prompt: 'Một ảnh chụp tờ báo tự nó có thể xác nhận vụ bắt giữ người làm báo không?',
      choices: [
        'Có. Chỉ cần nhìn ảnh là xác định được ngày và sự kiện bắt giữ.',
        'Không. Ảnh giúp nhận diện tư liệu, còn vụ bắt giữ phải dựa vào chú thích hoặc hồ sơ nguồn ghi rõ sự kiện.',
        'Có. Mọi chi tiết về tòa soạn đều được chứng minh bởi bất kỳ ảnh tờ báo nào.',
      ],
      answer: 1,
      explanation:
        'Hình ảnh và sự kiện lịch sử không phải cùng một loại chứng cứ. Muốn ghi ngày bắt giữ, người biên tập cần đối chiếu phần chú thích hoặc một hồ sơ đã xác nhận mốc ấy.',
      hint: 'Phân biệt điều mắt thấy trong một bức ảnh với điều một hồ sơ lịch sử xác nhận.',
      source: 'museum',
    },
  ],
};

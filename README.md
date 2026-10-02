# The Newsroom 1938 Project

**Giữ tiếng nói**

Trò chơi giải đố 3D trên trình duyệt về báo chí cách mạng của Đảng trong phong trào dân chủ 1936–1939, lấy báo **Dân Chúng** (Sài Gòn, 1938–1939) làm trục lịch sử.

**Chơi ngay:** https://quangquynguyenvo.github.io/the-newsroom-1938-project/

Sản phẩm dự án môn Lịch sử Đảng Cộng sản Việt Nam của Nhóm 10.

## Chủ đề lịch sử

Sau Hội nghị Trung ương tháng 7/1936, Đảng chuyển sang đấu tranh công khai và nửa công khai, đòi tự do, dân chủ, cơm áo, hòa bình. Báo chí là công cụ để đưa chủ trương ấy đến với quần chúng. Trò chơi đi qua ba câu hỏi:

| Bản tin | Câu hỏi                         | Mốc lịch sử                                                         |
| ------- | ------------------------------- | ------------------------------------------------------------------- |
| 01      | Đảng lên tiếng về điều gì?      | Mục tiêu trước mắt: cơm áo, hòa bình, dân chủ                       |
| 02      | Ai đứng sau báo Dân Chúng?      | Cơ quan ngôn luận của Trung ương Đảng; số 1 ra ngày 22/7/1938       |
| 03      | Vụ bắt giữ có làm báo im tiếng? | Tòa soạn bị khám xét ngày 7/3/1939; báo ra đến số 80 ngày 30/8/1939 |

## Cách chơi

Người chơi vào vai người biên tập của tòa soạn. Mỗi bản tin bắt đầu bằng một lá thư bạn đọc gửi tới và kết thúc bằng một lời hồi âm.

1. **Tìm tư liệu.** Đi giữa bàn biên tập, kệ tư liệu và bàn in; mở bản thảo, sổ ghi chép, hồ sơ, ảnh và ghi căn cứ vào sổ tay.
2. **Viết thành lời.** Ghép chữ vào ba cột của bản tin sao cho đúng với tư liệu đã tìm.
3. **Giữ căn cứ.** Chọn đúng tư liệu chứng minh trước khi in.

In xong bản tin của ai thì chuyện đời của người ấy và các hồ sơ đọc thêm liên quan mới mở ra. Có sáu chuyện nhân vật và tám hồ sơ lịch sử với 32 trang, mỗi trang dẫn nguồn để đối chiếu.

Điều khiển: nút vị trí hoặc phím `1`, `2`, `3` để đổi chỗ đứng; rê chuột để nhìn quanh; bấm đồ vật để xem gần; `Esc` để đóng hoặc trở ra. Tiến độ được lưu trên trình duyệt; màn hình mở đầu cho chọn chơi tiếp hoặc chơi mới.

## Chạy trên máy

Cần Node.js 22.12 trở lên.

```sh
npm ci
npm run dev
```

Mở địa chỉ Vite in ra. Trình duyệt cần WebGL và tăng tốc phần cứng để dựng cảnh 3D.

```sh
npm run check     # định dạng mã, kiểm thử, kiểm tra nội dung và tài nguyên, build
npm run preview   # xem bản build trong dist/
```

## Công nghệ

- **Cảnh 3D:** Three.js, React Three Fiber, Drei.
- **Giao diện và câu đố:** HTML, CSS, JavaScript thuần; chuyển động bằng GSAP.
- **Đóng gói:** Vite. Font, mô hình, hình ảnh và âm thanh đều phục vụ từ chính trang, không cần tài khoản hay máy chủ dữ liệu.

Có bốn mức đồ họa và các tùy chỉnh riêng cho máy yếu; âm thanh tắt được; chuyển động tuân theo cài đặt giảm chuyển động của thiết bị.

## Cấu trúc

| Thư mục              | Nội dung                                       |
| -------------------- | ---------------------------------------------- |
| `src/content/`       | Tư liệu, nguồn, câu đố, thư và chuyện nhân vật |
| `src/game/`          | Quy tắc chơi, lưu tiến độ, biên tập bản tin    |
| `src/scene/`         | Camera, căn phòng, vật liệu và hiệu ứng 3D     |
| `src/ui/`            | Mở đầu, trang đọc, âm thanh và cài đặt         |
| `src/styles/`        | Font và kiểu dáng giao diện                    |
| `public/assets/`     | Mô hình, hình ảnh, âm thanh, giấy phép         |
| `scripts/`, `tests/` | Kiểm tra nội dung, tài nguyên và quy tắc chơi  |
| `docs/`              | Ghi chú kiến trúc                              |

Chi tiết mô-đun: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Nguồn tư liệu lịch sử

- [Sưu tập Báo Dân Chúng (1938–1939)](https://baotanglichsuquocgia.vn/vi/Articles/1002/14270/suu-tap-bao-dan-chung-1938-1939-cua-bao-tang-lich-su-quoc-gia.html), Bảo tàng Lịch sử quốc gia
- [Báo Dân Chúng, dấu son trong lịch sử báo chí cách mạng Việt Nam](https://www.hcmcpv.org.vn/tin-tuc/bao-dan-chung-dau-son-trong-lich-su-bao-chi-cach-mang-viet-nam-1491880968), Thành ủy Thành phố Hồ Chí Minh
- [Báo Dân Chúng, tờ báo của Đảng Cộng sản Đông Dương](https://nhandan.vn/bao-dan-chung-to-bao-cua-dang-cong-san-dong-duong-post566611.html), Báo Nhân Dân
- [Chủ trương xây dựng lực lượng cách mạng giai đoạn 1936–1939](https://tapchilichsudang.vn/chu-truong-cua-dang-cong-san-dong-duong-trong-xay-dung-luc-luong-cach-mang-giai-doan-1936-1939.html), Tạp chí Lịch sử Đảng
- Các bài của Bảo tàng Lịch sử quốc gia, Báo Nhân Dân và Tạp chí Lịch sử Đảng về báo chí cách mạng 1925–1945, dẫn trong từng trang hồ sơ của trò chơi (`src/content/press-knowledge.js`).

Mỗi trang tư liệu trong game có liên kết tới nguồn của nó.

## Phần mô phỏng

Căn phòng, đồ vật, tiêu đề và câu chữ trong bản tin được thiết kế cho mục đích học tập; trò chơi không phục dựng nguyên trạng tòa soạn năm 1938. Chị Tư, anh Ba, cậu Năm, các lá thư và chuyện đời của họ là hư cấu và được ghi nhãn ngay trong game. Cảnh phố ngoài cửa sổ, màu tường và nền gạch chỉ gợi không khí Sài Gòn cuối thập niên 1930.

## Tài nguyên và giấy phép

Xuất xứ và giấy phép của từng mô hình, hình ảnh, âm thanh và font nằm trong [public/assets/manifest.json](public/assets/manifest.json). Giấy phép font nằm trong `public/assets/fonts/`.

## Nhóm thực hiện

Nhóm 10

| MSSV     | Họ và tên             |
| -------- | --------------------- |
| 25110055 | Nguyễn Võ Quang Quý   |
| 25110042 | Đào Nghiệm Minh       |
| 23116037 | Lê Minh Triết         |
| 23116034 | Nguyễn Thị Hồng Thắm  |
| 23116003 | Trần Nguyễn Trọng Bảo |

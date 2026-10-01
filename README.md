# Giữ tiếng nói

Trò chơi giải đố 3D bằng tiếng Việt về báo chí cách mạng của Đảng và phong trào dân chủ 1936–1939, lấy báo Dân Chúng làm điểm tựa lịch sử.

## Chạy trên máy

Yêu cầu Node.js 22.12 trở lên thuộc phiên bản Vite hỗ trợ.

```sh
npm ci
npm run dev
```

Mở địa chỉ Vite hiển thị. Máy chủ phát triển chỉ lắng nghe tại `127.0.0.1`.

```sh
npm run check
npm run preview
```

`check` kiểm tra định dạng mã, quy tắc chơi, nội dung, tài nguyên và tạo bản build. Bản build nằm trong `dist/`. Các lệnh riêng: `npm test`, `npm run check:content`, `npm run check:assets`, `npm run build`. Dùng `npm run format` để chuẩn hóa cách trình bày mã.

## Cách chơi

Vào tòa soạn, tìm tư liệu, ghi căn cứ vào sổ tay, biên tập ba bản tin rồi đối chiếu trước khi in. Chọn chữ bằng nút hoặc kéo thả; tư liệu chứng minh phải khớp với nội dung bản tin.

Nút vị trí hoặc phím `1`, `2`, `3` chuyển giữa bàn biên tập, kệ tư liệu và bàn in. Di chuyển chuột để nghiêng góc nhìn nhẹ. Bấm đồ vật để tương tác hoặc xem gần; `Esc` đóng trang đọc. Danh sách đồ vật hỗ trợ chọn bằng bàn phím. Trình duyệt cần WebGL và tăng tốc phần cứng để mở cảnh 3D.

Có thêm sáu chuyện nhân vật và tám hồ sơ lịch sử với 32 trang có nguồn đối chiếu. Các câu hỏi phụ không chặn ba bản tin chính. Tiến độ và cài đặt được lưu trên trình duyệt khi bộ nhớ cục bộ khả dụng. Nút chơi lại ở trang cuối đặt lại tiến độ.

## Hình ảnh và âm thanh

Bốn mức đồ họa cùng tùy chỉnh độ nét, bóng đổ, bóng tiếp xúc, quầng sáng, lấy nét và độ sáng. Âm thanh có thể tắt từ màn mở đầu hoặc thanh công cụ trong phòng. Chuyển động tuân theo cài đặt giảm chuyển động của thiết bị.

React Three Fiber, Drei và Three.js dựng cảnh 3D; HTML hiển thị câu đố; GSAP điều khiển chuyển động. Phần 3D tải riêng sau giao diện mở đầu. Font, mô hình, texture và âm thanh phục vụ cục bộ. Không cần tài khoản hay máy chủ dữ liệu.

## Cấu trúc

| Thư mục | Nội dung |
| --- | --- |
| `src/content/` | Tư liệu, nguồn, câu đố và lời thoại |
| `src/game/` | Quy tắc chơi, lưu dữ liệu, biên tập bản tin |
| `src/scene/` | Camera, căn phòng, vật liệu và hiệu ứng 3D |
| `src/ui/` | Mở đầu, trang đọc, âm thanh và cài đặt |
| `src/styles/` | Font và các nhóm kiểu dáng |
| `public/assets/` | Tài nguyên, giấy phép và manifest |
| `scripts/`, `tests/` | Kiểm tra nội dung, tài nguyên và quy tắc |
| `docs/`, `plans/` | Hợp đồng kỹ thuật và tiến độ |

## Tư liệu và bản mô phỏng

Căn phòng, đồ vật, lời thoại và tiêu đề bản tin được thiết kế cho học tập. Nhân vật và thư bạn đọc là hư cấu. Cảnh phố là minh họa; game không phục dựng nguyên trạng tòa soạn năm 1938. Nội dung lịch sử có liên kết nguồn để đối chiếu.

Nguồn, giấy phép và xuất xứ tài nguyên nằm trong [manifest](public/assets/manifest.json). Giữ giấy phép font trong `public/assets/fonts/` khi phân phối. Ba video chưa được cung cấp; game hiển thị nội dung kể chuyện bằng chữ khi không có video. Khi có video được phép sử dụng, đặt trong `public/assets/videos/`, đăng ký nguồn và cập nhật đường dẫn chương.

Chi tiết mô-đun: [docs/START-HERE.md](docs/START-HERE.md). Tiến độ và giới hạn kiểm tra: [CHECKLIST](plans/mvp/CHECKLIST.md).

`node_modules/`, `dist/`, ảnh kiểm tra, file tải tạm và `.env` được loại khỏi Git. Kiểm tra toàn bộ lượt chơi, thiết bị cảm ứng thật và hiệu năng GPU trước khi phát hành.

# Kiến trúc và phát triển

Giữ tiếng nói là trò chơi giải đố trong một phòng biên tập, với ba vị trí, ba bản tin chính, sáu chuyện nhân vật và tám hồ sơ lịch sử tự chọn. Nội dung tập trung vào báo chí cách mạng của Đảng và phong trào dân chủ 1936–1939.

## Các mô-đun

| Công việc | Nơi sửa |
| --- | --- |
| Khởi động, điều phối giao diện, hội thoại | `src/main.js`, `src/ui/` |
| Tư liệu, nguồn lịch sử, câu đố | `src/content/`, `docs/CONTENT-CONTRACT.md` |
| Quy tắc, lưu tiến độ | `src/game/state.js` |
| Ghép chữ và đối chiếu bản tin | `src/game/newspaper.js`, `src/content/editorial*.js` |
| Chuyện nhân vật và hồ sơ tự chọn | `src/game/story-state.js`, `src/game/knowledge-state.js` |
| Camera, chọn đồ vật, lịch dựng hình | `src/scene/engine.js` |
| Góc nhìn và tên ba vị trí | `src/scene/stations.js` |
| Căn phòng và đồ vật | `src/scene/room.jsx`, `src/scene/*props.jsx`, `src/scene/shelf-dressing.jsx` |
| Vật liệu và chữ trên đồ vật | `src/scene/materials.js` |
| Cài đặt, ánh sáng và hậu kỳ | `src/scene/graphics.js`, `src/scene/cinematic.js` |
| Tiến độ tải tài nguyên | `src/scene/loading.js`, `src/ui/boot.js` |
| Kiểu dáng, cửa sổ đọc và font | `src/styles/` |
| Xuất xứ, giấy phép tài nguyên | `public/assets/manifest.json` |

## Hợp đồng chính

React Three Fiber sở hữu Canvas, camera, cây cảnh, đổi kích thước, lịch dựng hình và sự kiện đồ vật. Drei tải mô hình/ảnh và quản lý LOD sổ tay. Giao diện câu đố dùng HTML. GSAP quản lý chuyển động ngắn và dọn chuyển động khi đóng giao diện.

`createEngine` trả về điều khiển chuyển vị trí, xem gần, tương tác, cài đặt, tạm dừng và hủy cảnh. Phần 3D tải qua import động. Cảnh dựng theo nhu cầu, lưu bóng đổ khi hình học không đổi, dừng khi mở hộp thoại hoặc ẩn tab. Hiệu ứng không khí cập nhật khoảng 25 lần/giây khi bật. Thuộc tính `data-*` của `#viewport` cho phép kiểm tra chế độ dựng, số khung hình, lượt vẽ và độ phân giải.

Tọa độ cảnh tính bằng mét; hình học căn phòng nằm trong nhóm có tỷ lệ 0,75. Camera dùng tọa độ thế giới. Mô hình tải qua bộ nhớ đệm của Drei; hình học gốc dùng chung, vật liệu và texture tùy chỉnh được giải phóng theo từng đối tượng.

ID chương, tư liệu và khóa lưu là dữ liệu bền vững. Đổi ID cần xử lý dữ liệu đã lưu. Hồ sơ tự chọn và chuyện nhân vật có dữ liệu lưu riêng, không khóa ba bản tin chính.

## Kiểu dáng

Nạp CSS theo thứ tự: `fonts.css`, `game.css`, `panels.css`, `interface.css`. Thứ tự này giữ các quy tắc responsive và giao diện hiện tại. Font và tài nguyên được phục vụ cục bộ. Chữ cần đọc dùng HTML hoặc canvas. Texture WebP được nén lossless từ bản PNG gốc.

## Kiểm tra

`npm run check` chạy định dạng mã, kiểm thử quy tắc/lưu dữ liệu, kiểm tra nội dung, xuất xứ tài nguyên và build. Thay đổi giao diện hoặc cảnh còn cần mở trình duyệt để kiểm tra. Build thành công chưa chứng minh tốc độ GPU hay khả năng chơi trên thiết bị cảm ứng.

Tiến độ và việc còn lại: [CHECKLIST](../plans/mvp/CHECKLIST.md). Video thật chưa được cung cấp. Phòng, lời thoại và vật thể là mô phỏng học tập; các nguồn lịch sử và quyền tài nguyên được giữ trong dữ liệu nội dung và manifest.

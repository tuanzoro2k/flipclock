# Flip Clock Web

Đồng hồ lật số chạy trong trình duyệt. Double-click `index.html` là chạy, không
cần server, không cần mạng.

## Tính năng

Giây (bật/tắt) · ngày tháng (bật/tắt) · giờ 24h · theme Classic và Hacker ·
cỡ chữ và độ sáng · đếm ngược · pomodoro · hẹn giờ báo · nhạc nền.

Rê chuột để hiện panel cài đặt. Phím tắt: `F` fullscreen, `Esc` hoặc `Space`
tắt chuông đang kêu.

Đồng hồ tính giờ chuông dựa trên mốc thời gian tuyệt đối nên không bị trôi,
nhưng nếu để tab chạy nền quá lâu (trình duyệt đóng băng tab), chuông có thể
reo trễ — đây là giới hạn chung của mọi bộ đếm giờ chạy trên trình duyệt.

## Thêm nhạc nền

1. Chép file mp3 vào thư mục `music/`.
2. Mở `music/tracks.js`, thêm tên file vào mảng `window.TRACKS`.
3. F5.

Chỉ dùng nhạc bạn có quyền sử dụng. Repo không kèm sẵn file nhạc nào.

Lần đầu phải bấm ▶ một cái — trình duyệt chặn tự động phát nhạc, không lách được.

## Chạy test

    node selftest.js

## Ghi chú

Dự án này **không** dùng lại bất kỳ tài sản nào của Fliqlo (fliqlo.com). Font
dùng system stack, cơ chế lật số viết lại từ đầu.

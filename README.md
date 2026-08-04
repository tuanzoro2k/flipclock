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

## Nhạc nền

Bấm **🎵 Chọn nhạc** trong panel rồi chọn file từ máy. Chọn được nhiều file một
lúc. File không đi đâu cả — trình duyệt phát thẳng từ máy bạn, không upload lên
server nào, kể cả khi bạn đang mở bản chạy trên web.

Lần đầu phải bấm ▶ một cái: trình duyệt chặn tự động phát nhạc, không lách được.

Trình duyệt không cho web nhớ đường dẫn file, nên **mở lại trang thì phải chọn
lại nhạc**. Đây là giới hạn bảo mật, không phải thiếu sót.

Nếu bạn tự chạy bản của mình và muốn có sẵn nhạc không cần chọn: chép file vào
`music/` rồi thêm tên file vào mảng `window.TRACKS` trong `music/tracks.js`.
Chỉ làm vậy với nhạc bạn có quyền sử dụng — và nhớ rằng nếu deploy công khai thì
đó là phát tán công khai. Repo này không kèm sẵn file nhạc nào.

Lần đầu phải bấm ▶ một cái — trình duyệt chặn tự động phát nhạc, không lách được.

## Chạy test

    node selftest.js

## Ghi chú

Dự án này **không** dùng lại bất kỳ tài sản nào của Fliqlo (fliqlo.com). Font
dùng system stack, cơ chế lật số viết lại từ đầu.

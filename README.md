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

Hai nguồn, dùng cái nào cũng được — phát cái này thì cái kia tự dừng.

### YouTube

Dán link video hoặc playlist vào ô trong panel rồi bấm **Phát**. Nhận được cả
`youtube.com/watch?v=`, `youtu.be/`, `/playlist?list=`, `/shorts/`, link
`music.youtube.com`, và ID trần.

Một ô video nhỏ hiện ở góc trái dưới khi đang phát. Nút **–** thu nó lại còn
112×63, bấm lại để phóng ra; nút **✕** dừng hẳn và đóng.

**Không có nút giấu hẳn.** Điều khoản YouTube cấm tách riêng phần tiếng, và
IFrame API đòi khung player không bị che — giấu player mà vẫn phát nhạc chính là
cái đó. Thu nhỏ là mức gần nhất còn hợp lệ.

Script YouTube chỉ được tải khi bạn thực sự dán link. Không đụng tới thì trang
không gọi ra ngoài lần nào và vẫn chạy khi mất mạng.

Khi đang phát playlist, hai nút **⏮ ⏭** trong panel chuyển bài. Với một video lẻ
thì chúng không hiện, vì không có gì để chuyển tới.

Thanh **🔊** trong panel chỉnh âm lượng cho cả nhạc từ máy lẫn YouTube.

**Link Mix/Radio không dùng được.** Link có `list=RD…` (hoặc `UL…`, `LL`, `WL`)
là danh sách YouTube tự sinh riêng cho tài khoản bạn — trình nhúng không tải
được, để nguyên thì player báo lỗi 153. App tự bỏ phần đó ra và phát mỗi video,
kèm dòng nhắc. Muốn nghe liên tục thì tạo playlist thường trong YouTube
(Lưu vào → Playlist mới), link của nó bắt đầu bằng `PL`.

Video hoặc playlist mà chủ sở hữu chặn nhúng thì sẽ không phát được — panel báo
lý do, nhưng không có cách nào lách.

### File trong máy

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

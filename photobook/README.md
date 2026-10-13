# Photobook — cuốn sổ kỷ niệm lật trang 💌

## Cấu trúc dự án

```
photobook/
├── index.html        ← nội dung 5 trang
├── css/style.css       ← toàn bộ style, texture giấy, hiệu ứng lật
├── js/script.js        ← logic lật trang (nút bấm, phím mũi tên, vuốt)
└── images/
    └── photo1.jpg → photo18.jpg   ← 18 ô ảnh trong 5 trang
```

## Nội dung 5 trang hiện có

1. **Bìa** — "a love letter / Chúng mình / những trang yêu thích nhất, là chúng ta"
2. **Bài hát của chúng mình** — đĩa than + cuộn phim 3 ảnh + 1 ảnh rời | "may mắn làm sao" + 2 ảnh + ghi chú
3. **Giữa hôm qua và hôm nay** — 1 ảnh + vé "ADMIT ONE" | "những điều nhỏ bé" + 1 ảnh lớn + cuộn phim 3 ảnh
4. **Những nơi ta thành "chúng mình"** — 2 ảnh + ghi chú | "những điều đáng giữ" + 1 ảnh lớn + 2 thẻ trích dẫn
5. **Vẫn đang góp nhặt từng khoảnh khắc** — 1 ảnh + ghi chú | phong bì hé lộ 3 ảnh + ngày tháng

Đây là **nội dung mẫu** mô phỏng phong cách ảnh bạn gửi — bạn đổi chữ, đổi ảnh thoải mái, không cần đúng y nguyên chữ trong ảnh gốc.

## Cách thay ảnh

Cách dễ nhất: chỉ cần đổi tên ảnh thật của bạn trùng tên file cũ (`photo1.jpg` → `photo18.jpg`) rồi thả vào thư mục `images/`, không cần sửa code.

Muốn biết ảnh nào nằm ở trang nào: mở `index.html`, tìm (Ctrl+F) đúng tên file, ví dụ `photo9.jpg` — sẽ thấy nó nằm trong cuộn phim ở trang 3.

Muốn đổi chữ (tiêu đề, ghi chú, trích dẫn): cũng mở `index.html`, tìm đoạn chữ tiếng Việt tương ứng và sửa trực tiếp.

## Cách thêm / bớt trang

Mỗi trang là một khối `<div class="page" id="pN">...</div>` trong `index.html`, có `style="z-index:..."` giảm dần theo thứ tự (trang 1 = z-index cao nhất). Muốn thêm trang thứ 6:
1. Copy nguyên khối `<div class="page" id="p5">...</div>` cuối cùng, đổi `id="p6"`, đặt `z-index` nhỏ hơn trang trước đó 1 đơn vị, đổi nội dung/ảnh bên trong.
2. Không cần sửa gì trong `js/script.js` — script tự đọc số lượng `.page` hiện có trên trang.

## Vẽ tay / doodle

Các hình trang trí (lấp lánh, hoa oải hương, hoa nhỏ, trái tim, mèo, hoa hồng, đường xoắn...) được vẽ hoàn toàn bằng code SVG (không phải ảnh), có thêm bộ lọc "rung nét" (`#sketchy`) để trông như nét vẽ tay chứ không phải hình vẽ máy tính hoàn hảo. Muốn thêm doodle mới cùng phong cách: thêm một khối `<g id="doodle-ten">...</g>` vào phần `<defs>` ở đầu `index.html`, rồi gọi nó ở bất kỳ đâu bằng:
```html
<div class="doodle" style="width:30px;height:30px;left:5%;top:5%;color:#..;">
  <svg viewBox="0 0 24 24"><use href="#doodle-ten"/></svg>
</div>
```
Thêm class `sparkle` (nhấp nháy), `sway` (đung đưa) hoặc `float` (bồng bềnh) vào `class="doodle ..."` để có chuyển động.

## Cách xem / chia sẻ

- Mở trực tiếp `index.html` bằng trình duyệt.
- Điều hướng: bấm mũi tên hai bên cuốn sách, dùng phím ← → trên bàn phím, hoặc vuốt trái/phải trên điện thoại.
- Gửi cho người khác: nén cả thư mục `photobook` rồi gửi — giữ nguyên vị trí `css/`, `js/`, `images/` so với `index.html`.
- Muốn có link chia sẻ online: tải cả thư mục lên Netlify, Vercel hoặc GitHub Pages (kéo-thả là chạy được).

# Website kỷ niệm 2 năm yêu nhau 💞

## Cấu trúc dự án

```
anniversary-project/
├── index.html        ← nội dung & bố cục trang
├── css/
│   └── style.css      ← toàn bộ style, màu sắc, animation
├── js/
│   └── script.js       ← toàn bộ tương tác (vỡ tim, ảnh rơi, lọ điều ước...)
└── images/
    ├── photo1.jpg       ← 2 ảnh polaroid ở đầu trang
    ├── photo2.jpg
    ├── photo3.jpg       ← ảnh trong "cuốn sổ" ở mục Prolog
    ├── heart-puzzle.jpg ← ảnh dùng cho trái tim ghép hình
    ├── photo4.jpg       ← 4 ảnh rơi ra từ hộp quà
    ├── photo5.jpg
    ├── photo6.jpg
    └── photo7.jpg
```

Tách ra 3 file (HTML / CSS / JS) + 1 thư mục ảnh riêng thay vì gộp chung 1 file,
để sau này bạn chỉnh sửa dễ hơn nhiều:
- Đổi màu sắc, font, animation → sửa trong `css/style.css`
- Đổi logic, hành vi khi bấm/kéo thả → sửa trong `js/script.js`
- Đổi chữ, thêm/bớt mục → sửa trong `index.html`
- Đổi ảnh → chỉ cần thay file trong `images/`, không cần đụng vào code

## Cách thay ảnh của bạn vào

**Cách dễ nhất — giữ nguyên tên file:**
Chỉ cần lấy ảnh thật của bạn, đổi tên đúng như tên file cũ (`photo1.jpg`, `photo2.jpg`...)
rồi thả đè vào thư mục `images/`. Không cần sửa gì trong HTML/JS cả.

| File cần thay          | Ảnh sẽ xuất hiện ở đâu                              | Kích thước gợi ý |
|-------------------------|------------------------------------------------------|-------------------|
| `images/photo1.jpg`     | Ảnh polaroid trái, ở đầu trang                       | vuông, ví dụ 700×700 |
| `images/photo2.jpg`     | Ảnh polaroid phải, ở đầu trang                       | vuông, ví dụ 700×700 |
| `images/photo3.jpg`     | Ảnh trong trang "Prolog" (mục cuốn sổ)               | vuông, ví dụ 700×700 |
| `images/heart-puzzle.jpg` | Ảnh trái tim ghép hình (mục "Chạm vào trái tim")   | ngang, ví dụ 900×600 |
| `images/photo4.jpg` → `photo7.jpg` | 4 ảnh rơi ra khi bấm vào hộp quà (dây phơi ảnh) | dọc, ví dụ 500×600 |

**Nếu muốn dùng tên file khác** (ví dụ `chuyendi-dalat.jpg`):
- Với `photo1/2/3` và `heart-puzzle`: mở `index.html`, tìm dòng có `src="images/photo1.jpg"` (Ctrl+F) và đổi
  thành `src="images/ten-file-cua-ban.jpg"`.
- Với 4 ảnh rơi từ hộp: mở `js/script.js`, tìm dòng:
  ```js
  const boxPhotos=['images/photo4.jpg','images/photo5.jpg','images/photo6.jpg','images/photo7.jpg'];
  ```
  rồi đổi tên file trong đó.

**Lưu ý:** ảnh đang có trong `images/` chỉ là ảnh minh hoạ (placeholder) để bạn xem trước
giao diện chạy như thế nào — hãy thay bằng ảnh thật của hai bạn nhé.

## 2 tính năng vừa được chỉnh theo yêu cầu

1. **Trái tim ghép hình (mục "Chạm vào trái tim")**
   Ban đầu hiện nguyên trái tim còn nguyên vẹn. Khi bấm vào, trái tim sẽ "vỡ ra" —
   6 mảnh ghép bay ra từ tâm với góc xoay và hướng ngẫu nhiên, xếp thành hình ghép xáo trộn
   với hiệu ứng chuyển động mượt (so le từng mảnh). Sau đó bạn kéo-thả các mảnh về đúng vị trí
   để ghép lại hình trái tim ban đầu.
   *(Bạn không gửi kèm ảnh mẫu 1 nên mình đã tự thiết kế hiệu ứng "vỡ ra" theo hướng phổ biến nhất —
   nếu bạn có ảnh/gif mẫu cụ thể muốn bắt chước đúng kiểu chuyển động, gửi lại mình chỉnh cho khớp.)*

2. **Ảnh rơi khỏi hộp quà (mục "Dán ảnh kỷ niệm")**
   Khi bấm vào hộp, 4 ảnh sẽ rơi ra theo kiểu lộn xộn: mỗi ảnh rơi từ trên xuống với độ trễ khác nhau,
   lệch trái/phải ngẫu nhiên, xoay nghiêng ngẫu nhiên và có một chút nảy nhẹ khi "chạm đất" —
   trông tự nhiên như ảnh thật đổ ra chứ không xếp ngay hàng thẳng lối. Sau đó bạn kéo từng ảnh
   lên dây phơi để ghim vào đúng chỗ.

## Cách mở & chia sẻ trang

- Mở trực tiếp: nhấp đúp vào `index.html` để xem trên trình duyệt.
- Muốn gửi cho người khác xem: nén (zip) cả thư mục `anniversary-project` rồi gửi, người nhận
  giải nén và mở `index.html` là chạy được — **miễn là 3 file/thư mục `css/`, `js/`, `images/`
  vẫn nằm cùng vị trí tương đối so với `index.html` như ban đầu**, đừng tách chúng ra riêng lẻ.
- Muốn có link web để chia sẻ trực tuyến, bạn có thể tải lên các dịch vụ hosting tĩnh miễn phí
  như Netlify, Vercel hoặc GitHub Pages (kéo thả cả thư mục vào là xong).

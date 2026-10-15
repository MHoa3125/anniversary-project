# Website anniversary 2nd

## Cấu trúc dự án

```
anniversary-project/
├── index.html        ← nội dung & bố cục trang
├── css/
│   └── style.css      ← toàn bộ style, màu sắc, animation
├── js/
│   └── script.js       ← toàn bộ tương tác trò chơi
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


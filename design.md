# Design System — Piano Backing Track App

> Tông chủ đạo: **Steinway Midnight Obsidian & Royal Brass** — Cảm hứng từ cây đại dương cầm Steinway & Sons đặt trên sân khấu hòa nhạc lung linh. Sắc đen tuyền sâu thẫm kết hợp ánh vàng đồng thau hoàng gia và phím ngà ngọc trai mang lại diện mạo siêu sang trọng, sắc nét chuẩn Commercial SaaS (Linear / Native Instruments level).

---

## 1. Color Palette — "Steinway Midnight Obsidian"

| Token | Hex | Nguồn cảm hứng | Dùng cho |
|---|---|---|---|
| `--bg-dark` | `#0B0C10` | Đen bóng sơn mài mờ (Obsidian Black) | Nền chính (dark base) |
| `--surface-dark` | `#16181E` | Xám than mờ (Charcoal Slate) | Surface/Card điều khiển, sidebar |
| `--surface-hover` | `#21242E` | Xám than sáng nhẹ | State hover của card & button |
| `--brass-gold` | `#D4AF37` | **Vàng Đồng Hoàng Gia (Royal Brass)** | Accent chính, CTA, Play active, Key glow |
| `--brass-light` | `#F3E197` | Vàng đồng nhạt rực rỡ | Hover state của CTA, pulse animation |
| `--pearl-ivory` | `#F5F2EB` | **Trắng Ngà Ngọc Trai (Pearl Ivory)** | Phím trắng piano, Text chính |
| `--ebony-black` | `#121316` | **Phím đen mun (Ebony Black)** | Phím đen piano, text phụ |
| `--metal-border` | `#2B2E38` | Kim loại chải mờ (Brushed Steel) | Border, divider, track line |

---

## 2. Typography

| Vai trò | Font | Lý do |
|---|---|---|
| Display | **Bricolage Grotesque** | Đường nét nét đúp tinh tế, mang dấu ấn cao cấp. |
| Body | **General Sans / Inter** | Trực quan, sắc nét, dễ đọc ở kích thước nhỏ. |
| Utility (BPM, nhịp, thời lượng) | **Space Mono** | Font monospace chuyên nghiệp cho bảng điều khiển âm thanh. |

---

## 3. Layout Concept & Key Components

### 3.1 Header & Control Bar
- **Logo Mark**: Biểu tượng Steinway-style tối giản kết hợp tên `Pian1st`.
- **Top Controls**: Select Key (đổi Tone), BPM Slider (40 - 200), Selector Nhịp (4/4, 3/4, 6/8).

### 3.2 Hero Workbench — Interactive Virtual Piano Strip
- **Mô tả**: Thay vì 3D heavy model, trung tâm màn hình là **Dải phím đàn 2D tương tác (2-3 Octaves)** được vẽ bằng SVG/Canvas sắc nét.
- **Interactions**:
  - Khi đệm nhạc: Phím tương ứng với nốt vang lên rực sáng viền màu `--brass-gold` với hiệu ứng tỏa ánh sáng aura nhẹ.
  - Cho phép người dùng rê chuột / click trực tiếp lên phím đàn để thử nốt và kiểm tra hợp âm.

### 3.3 Section Arranger (Linear-style Track Line)
- **Danh sách Section**: Verse 1, Hook, Chorus...
- **Mỗi Section gồm**:
  - Chuỗi hợp âm (vd: `C` -> `G` -> `Am` -> `F`).
  - Ô chọn số phách (Beats) cho mỗi hợp âm (`2 beats`, `4 beats`).
  - Thẻ chọn Kiểu đệm (Pattern Card): "Đệm nhẹ nhàng", "Đệm rải", "Đệm valse", "Slow Rock Ballad".
- **Realtime Beat Pulse**: Khi đang Play, thanh indicator màu `--brass-gold` quét qua từng hợp âm theo đúng nhịp đập BPM để người hát nhìn theo chuẩn phách.

---

## 4. Component Patterns

- **Nút CTA (Play / Loop)**: Nền `--brass-gold`, chữ `--bg-dark` bo pill, khi active phát sáng hiệu ứng pulse nhẹ.
- **Chip Hợp Âm**: Hình phím đàn bo góc nhẹ (`#F5F2EB`), chữ đen ebony, viền mỏng `--metal-border`. Active state đổi nền sang `--brass-gold` chữ ngọc trai.
- **Pattern Cards**: Nền `--surface-dark`, hiệu ứng hover viền nhôm sáng `--brass-gold`, có biểu tượng sóng âm SVG micro-animated.

---

## 5. Motion & Accessibility

- **Micro-animations**: Pulse nhịp đập, hiệu ứng sóng âm gợn sóng khi audio phát.
- **WCAG AA Compliance**: Độ tương phản tuyệt đối giữa `--pearl-ivory` / `--brass-gold` trên nền đen `--bg-dark`.
- **Reduced Motion**: Tôn trọng cài đặt `prefers-reduced-motion` của hệ thống.

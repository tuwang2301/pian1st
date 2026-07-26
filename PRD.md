# PRD: Piano Backing Track App

> Đổi từ guitar sang piano (quyết định mới) — lý do: độ khó kỹ thuật thấp hơn hẳn (sample piano chất lượng cao có sẵn, không cần chord voicing theo dây/phím như guitar), trong khi gap thị trường (chưa ai làm đúng "chọn hợp âm + kiểu đệm + section → loop, UI cực đơn giản") vẫn giữ nguyên giá trị.

## 1. Problem
Không có nhạc cụ vật lý bên cạnh, nhưng cần backing track (piano) theo đúng tone/hợp âm/kiểu đệm để tập hát. Các site hiện có chỉ hiển thị hợp âm text hoặc cho chơi thử nhạc cụ ảo — không phát backing track tự động theo tempo.

## 2. Goals (v1)
- Tạo được backing track piano nghe theo đúng: tone, vòng hợp âm, kiểu đệm (block chord/rải/arpeggio), theo từng section riêng (verse/hook).
- Loop được để tập theo.
- **Dễ dùng cho người không biết chơi nhạc cụ** — không expose lý thuyết nhạc (interval, voicing kỹ thuật) ra UI chính (xem mục 2b).

## 2b. Competitive Analysis (piano)
Đã khảo sát các web piano ảo hiện có:
- **Recursive Arts Virtual Piano** — đối thủ gần nhất: tự nhận "piano ảo thật nhất online", đã có sẵn auto-accompaniment, auto player, LED dẫn giai điệu. Nhưng build trên **Unity WebGL** — mức đầu tư kỹ thuật cao (như bản guitar của họ), không phù hợp hướng đi 1 người làm solo.
- **royaltyfreemusichub Piano App** — dùng thuần Web Audio API, map chuỗi hợp âm vào phím bấm để trigger cả hợp âm cùng lúc, có kỹ thuật đáng học: gain ramp chống click khi nhả note + Web Audio scheduler chính xác (không dùng JS timer thô) + RMS-scaling chống clip khi hợp âm dày. Không có pattern đệm tự động theo tempo, không có section.
- **Apronus flashpiano** — sample thật, ghi âm/phát lại, xuất file, tự nhận diện tên hợp âm. Không có auto-play theo tempo, không section.
- **piano.org** — sample grand piano thật, tự đặt tên interval/hợp âm. Chỉ là công cụ học lý thuyết, không có accompaniment.

→ **Kết luận**: kể cả ở phía piano, chưa ai làm đúng combo "chọn hợp âm + chọn kiểu đệm + section + loop, UI cực đơn giản" ở mức đầu tư kỹ thuật vừa phải (không cần Unity). Gap thị trường vẫn còn nguyên giá trị sau khi đổi nhạc cụ.

**Nguyên tắc UX giữ nguyên**: ẩn lý thuyết nhạc/kỹ thuật khỏi luồng chính. User chỉ thấy: chọn hợp âm (tên) → chọn kiểu đệm (tên dễ hiểu) → Play.

## 3. Non-goals (v1 — deferred to v2)
- Thu âm giọng hát + xuất file mix.
- Tài khoản người dùng, lưu bài hát trên server, chia sẻ.
- **Import hợp âm từ link bài hát bên ngoài** — xem mục 10 (Optional, có điều kiện).

## 4. Users
- v1: chỉ 1 người dùng (bản thân), không cần auth.
- v2 (tương lai): sản phẩm chia sẻ — cần tài khoản, lưu trữ bài hát/hợp âm của user.

## 5. Core Features (v1)

### 5.1 Song setup
- Chọn tone / key (vd Am, C, G...).
- Chọn tempo (BPM).
- Nhập/chọn vòng hợp âm cho từng section.

### 5.2 Section-based arrangement
- Bài hát chia thành các section có tên (Verse 1, Hook, Chorus...).
- Mỗi section có:
  - Danh sách hợp âm riêng (progression), mỗi hợp âm có độ dài riêng (vd `{ chord: "C", beats: 2 }` — để phân biệt `| C G | Am F |` với `| C | G | Am | F |`).
  - Kiểu đệm riêng (xem 5.3).
- Sections có thể sắp xếp theo thứ tự tùy ý và lặp lại.

### 5.3 Pattern engine (piano)
- Thư viện kiểu đệm hiển thị bằng tên thân thiện, không dùng thuật ngữ kỹ thuật:
  - "Đệm nhẹ nhàng" (block chord — bấm cả hợp âm cùng lúc)
  - "Đệm rải" (broken chord/arpeggio — lần lượt từng nốt)
  - "Đệm valse" (waltz bass — bass + chord theo nhịp 3/4 kiểu Alberti/oom-pah-pah)
- Tên kỹ thuật vẫn tồn tại ở tầng data (`patternId`), không hiển thị cho user.
- Mỗi pattern áp lên hợp âm hiện tại của section đó theo tempo đã chọn.

### 5.4 Playback
- Play/pause/stop toàn bài theo đúng thứ tự section.
- Loop 1 section riêng lẻ (để tập kỹ 1 đoạn).
- Hiển thị hợp âm/section đang chạy theo thời gian thực (để nhìn theo mà hát).

## 6. Deferred Features (v2)
- **Thu âm + xuất file**: ghi mic (giọng hát) đồng thời với phát backing track, mix, xuất file audio.
- **Tài khoản & lưu trữ**: đăng nhập, lưu bài hát/hợp âm cá nhân, chia sẻ với người khác.

## 7. Technical Approach

- **Frontend**: Next.js (đã quen từ dự án Spendy).
- **Audio engine**: piano đơn giản hơn guitar đáng kể — 2 lựa chọn:
  - **Tone.js + Salamander Grand Piano samples** (bộ sample thu chuyên nghiệp, chất lượng cao, dùng phổ biến, license mở) — realism cao nhất.
  - **WebAudioFont** (preset `acoustic_grand_piano`) — piano là nhạc cụ demo mặc định của hầu hết soundfont lib, chất lượng đã được kiểm chứng tốt hơn hẳn so với preset guitar.
  - Khuyến nghị: thử Salamander trước (chất lượng cao hơn), fallback WebAudioFont nếu cần đơn giản hóa.
- **Chống "nghe giả"**: áp dụng 2 kỹ thuật học được từ royaltyfreemusichub piano app:
  - Gain ramp (exponential) khi nhả note — tránh tiếng click khi note tắt.
  - Web Audio API scheduler với lookahead buffer (không dùng `setTimeout`) — đảm bảo timing chính xác từng sample, quan trọng cho pattern đệm nghe đều nhịp.
  - RMS-based scaling — hợp âm dày (nhiều note cùng lúc) không bị vỡ tiếng/clip.
- **Chord data — ĐƠN GIẢN HÓA LỚN so với bản guitar**: piano không cần chord voicing dictionary theo dây/phím. Hợp âm piano tính được thẳng bằng công thức lý thuyết nhạc (root + interval, vd major = root+0,4,7 semitone) — áp dụng được cho MỌI hợp âm ở MỌI key ngay lập tức, không có vấn đề "thiếu hợp âm trong dictionary" như guitar từng gặp phải.
- **Transpose**: đổi key = cộng/trừ semitone vào toàn bộ progression trước khi tính note — không cần khái niệm "capo" (đặc thù guitar), chỉ là dropdown chọn key hiển thị.
- **Data model** (nháp):
  ```
  Song
   ├─ key, tempo
   ├─ instrument (grand piano | upright | electric piano...)
   └─ Section[]
       ├─ name (Verse 1, Hook...)
       ├─ patternId (block | arpeggio | waltz...)
       └─ chordProgression[]: { chord: "C", beats: 2 }  // note tính bằng công thức, không cần dictionary
  ```
- Không cần backend/DB cho v1 (state client-side, không lưu).

## 8. Resolved Decisions
- Kiểu đệm: định nghĩa sẵn trong code theo công thức nhạc lý (không cần dataset ngoài như guitar).
- Hợp âm: tính bằng công thức, không cần dictionary/fallback thêm mới — vấn đề "thiếu hợp âm" của guitar không còn áp dụng cho piano.
- Transpose thay cho capo: dropdown chọn key, không cần mô hình semitone-offset riêng biệt phức tạp.
- Nhạc cụ: piano là chính cho v1; có thể thêm biến thể âm sắc (grand/upright/electric piano) sau nếu rẻ — không phải ưu tiên như câu hỏi "nhiều loại guitar" trước đây (vì lợi ích không lớn bằng, chưa quyết).
- Input hợp âm: chọn qua UI (dropdown/picker), không gõ text tự do.
- Visualize (phím đàn sáng theo hợp âm): nice-to-have, không block v1.

## 9. Risks
- **Giảm nhẹ so với bản guitar**: chất lượng sample piano (Salamander/soundfont) đã được kiểm chứng tốt trong cộng đồng — rủi ro "nghe giả" thấp hơn hẳn guitar. Vẫn nên làm spike nhỏ đầu tiên (1 hợp âm, thử pattern block/rải) để xác nhận trước khi build pattern engine đầy đủ, nhưng độ ưu tiên rủi ro này đã giảm.
- Scope v1 vẫn bao gồm section-based patterns — cần ước lượng thời gian dev trước khi cam kết deadline.

## 10. Optional — Import hợp âm từ link bài hát (có điều kiện, KHÔNG cam kết v1)
- Phạm vi: chỉ áp dụng cho **link tới trang hợp âm có sẵn** (dạng text, vd hopamchuan.com) — parse cú pháp hợp âm đã có trong trang, KHÔNG phải nhận diện hợp âm từ audio/video (bài toán đó thuộc dạng Chordify — cần AI/MIR chuyên sâu, độ chính xác 70-95% dù đã là startup 12+ năm, không tự build).
- Điều kiện triển khai: chỉ làm nếu app đủ đơn giản/ổn định và nhắm vào 1 nguồn cụ thể (niche) — vd chỉ hỗ trợ đúng cấu trúc HTML của 1 trang quen thuộc, chấp nhận vỡ nếu trang đổi cấu trúc.
- Không đưa vào scope v1 — nhắc lại trong roadmap v2+ nếu vẫn còn giá trị sau khi v1 ổn định.

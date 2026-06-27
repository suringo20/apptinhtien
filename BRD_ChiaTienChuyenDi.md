# Business Requirements Document (BRD)
## Chia Tiền Chuyến Đi (Trip Expense Splitter)

**Phiên bản:** 1.0
**Ngày:** 06/06/2026
**Trạng thái:** Draft

---

## 1. Bối cảnh & Vấn đề

### 1.1 Bối cảnh
Nhóm của chị Nga ở công ty thỉnh thoảng đi chơi để thư giãn (không cố định ngày). Mỗi chuyến đi, chị Nga là người đứng ra chi trả toàn bộ chi phí cho cả nhóm. Một chuyến đi gồm nhiều hoạt động khác nhau (ăn uống, thuê xe, vé tham quan...), và không phải hoạt động nào cũng có đủ tất cả mọi người tham gia.

### 1.2 Vấn đề hiện tại
- Cuối chuyến đi, chị Nga phải tự chia tiền cho từng người nhưng việc này rất rắc rối vì mỗi hoạt động có nhóm người tham gia khác nhau.
- Chị Nga không giỏi Excel và cũng không tự tin với việc tính tay.
- Người tham gia không có cách nào để xem lại mình đã tham gia hoạt động nào và phải trả bao nhiêu.

### 1.3 Tác động
Nếu không có sản phẩm này: chị Nga mất nhiều thời gian tính toán, dễ tính sai, có thể gây hiểu lầm hoặc cảm giác không công bằng trong nhóm, và phải giải thích thủ công cho từng người.

---

## 2. Mục tiêu

| # | Mục tiêu | Chỉ số đo lường |
|---|-----------|-----------------|
| 1 | Giúp chị Nga chia tiền nhanh và chính xác | Hoàn tất tổng kết một chuyến đi trong dưới 10 phút, không cần tính tay |
| 2 | Tự động tính đúng số tiền mỗi người cần đóng | 0 lỗi tính toán; tổng tiền các hoạt động = tổng tiền thu của mọi người |
| 3 | Người tham gia tự xem được chi phí của mình | Mỗi người xem được hoạt động đã tham gia + số tiền phải trả mà không cần hỏi chị Nga |

---

## 3. Phạm vi

### 3.1 Trong phạm vi
- Quản lý một chuyến đi tại một thời điểm.
- Chị Nga nhập từng hoạt động kèm chi phí.
- Chọn người tham gia cho từng hoạt động.
- Tự động chia đều chi phí mỗi hoạt động cho những người tham gia.
- Tổng kết số tiền mỗi người cần đóng cho cả chuyến.
- Người tham gia đăng nhập đơn giản để xem chi phí và các hoạt động của riêng mình.
- Giao diện tối ưu cho điện thoại (mobile web).

### 3.2 Ngoài phạm vi
- Chia tiền theo tỷ lệ/số tiền tùy chỉnh (phiên bản này chỉ **chia đều**).
- Quản lý nhiều chuyến đi cùng lúc / lịch sử nhiều chuyến.
- Thanh toán trực tuyến hoặc liên kết ví điện tử/ngân hàng.
- Nhắn tin, bình luận giữa các thành viên.
- Xử lý nhiều người cùng chi trả (chỉ một người trả là chị Nga).

---

## 4. Đối tượng người dùng (Personas)

### Persona 1 — Chị Nga (Người tổ chức / Quản lý chi phí)

> *"Mình chỉ muốn nhập tiền vào rồi nó tự tính ra mỗi người đóng bao nhiêu, đừng bắt mình làm Excel."*

| Thông tin | Chi tiết |
|-----------|----------|
| Vai trò | Người đứng ra chi trả và tổng kết chuyến đi |
| Đặc điểm | Nhân viên công ty, không giỏi Excel / tính toán thủ công |
| Mục tiêu | Chia tiền nhanh, chính xác, công bằng |
| Nỗi lo | Tính sai, mất thời gian, gây hiểu lầm trong nhóm |
| Thiết bị | Điện thoại (mobile web) |

**Hành trình điển hình:**
Chuyến đi kết thúc → mở web trên điện thoại → tạo chuyến đi & thêm danh sách thành viên → nhập từng hoạt động kèm số tiền → chọn ai tham gia hoạt động đó → hệ thống tự chia đều → xem bảng tổng kết mỗi người đóng bao nhiêu → chia sẻ cho cả nhóm.

### Persona 2 — Thành viên trong nhóm (Người tham gia)

> *"Cho mình xem mình đã đi những hoạt động nào và phải trả bao nhiêu là được."*

| Thông tin | Chi tiết |
|-----------|----------|
| Vai trò | Người tham gia chuyến đi, cần đóng tiền lại cho chị Nga |
| Đặc điểm | Đồng nghiệp trong nhóm, chỉ quan tâm phần của mình |
| Mục tiêu | Biết chính xác số tiền mình phải đóng và vì sao |
| Nỗi lo | Bị tính nhầm vào hoạt động mình không tham gia |
| Thiết bị | Điện thoại (mobile web) |

**Hành trình điển hình:**
Nhận thông báo/đường dẫn → đăng nhập đơn giản → xem danh sách hoạt động mình đã tham gia → xem số tiền từng hoạt động và tổng cần đóng.

---

## 5. Yêu cầu chức năng

### 5.1 Quản lý chuyến đi & thành viên

| ID | Yêu cầu | Độ ưu tiên |
|----|---------|------------|
| F-01 | Chị Nga tạo được một chuyến đi (tên, ngày) | Must Have |
| F-02 | Chị Nga thêm/sửa/xóa danh sách thành viên tham gia chuyến đi | Must Have |
| F-03 | Hệ thống chỉ quản lý một chuyến đi tại một thời điểm | Must Have |

### 5.2 Quản lý hoạt động & chi phí

| ID | Yêu cầu | Độ ưu tiên |
|----|---------|------------|
| F-04 | Chị Nga thêm một hoạt động gồm tên và tổng số tiền | Must Have |
| F-05 | Với mỗi hoạt động, chị Nga chọn những thành viên đã tham gia | Must Have |
| F-06 | Hệ thống tự động chia đều số tiền hoạt động cho số người tham gia | Must Have |
| F-07 | Chị Nga sửa/xóa được hoạt động đã nhập | Should Have |

### 5.3 Tổng kết & chia sẻ

| ID | Yêu cầu | Độ ưu tiên |
|----|---------|------------|
| F-08 | Hệ thống tổng hợp số tiền mỗi thành viên cần đóng cho cả chuyến | Must Have |
| F-09 | Hiển thị bảng tổng kết: tên thành viên + tổng tiền + chi tiết từng hoạt động | Must Have |
| F-10 | Cho phép chia sẻ kết quả tổng kết với nhóm (ví dụ đường dẫn hoặc xuất ảnh) | Should Have |

### 5.4 Đăng nhập & xem của thành viên

| ID | Yêu cầu | Độ ưu tiên |
|----|---------|------------|
| F-11 | Thành viên đăng nhập đơn giản (tên + số điện thoại hoặc email) | Must Have |
| F-12 | Thành viên chỉ xem được chi phí và hoạt động của riêng mình | Must Have |
| F-13 | Thành viên xem được tổng số tiền mình cần đóng | Must Have |

---

## 6. Yêu cầu phi chức năng

| Hạng mục | Yêu cầu |
|----------|---------|
| Nền tảng | Mobile web — tối ưu cho màn hình điện thoại, mở bằng trình duyệt, không cần cài app |
| Hiệu năng | Tính toán và hiển thị tổng kết tức thì khi thêm/sửa hoạt động |
| Bảo mật | Thành viên chỉ xem được dữ liệu của mình; chỉ chị Nga được thêm/sửa hoạt động |
| UX | Giao diện đơn giản, ít chữ, thao tác ít bước; phù hợp người không giỏi công cụ tính toán |

---

*Tài liệu này là nền tảng để thiết kế UI/UX và bắt đầu phát triển sản phẩm.*

# Thiết kế Smart Contract

## 1. Mục tiêu thiết kế

Smart contract được thiết kế để minh bạch hóa quy trình nhận quyên góp và giải ngân tiền từ thiện theo từng cột mốc đã công bố trước. Hợp đồng không cố gắng xác minh sự thật ngoài đời bằng code, mà tập trung vào ba mục tiêu:

- cố định kế hoạch sử dụng tiền trước khi nhận đóng góp;
- ghi vết công khai các bằng chứng, phản đối và quyết định giải ngân;
- giảm rủi ro tổ chức tự ý giải ngân mà không qua giai đoạn giám sát.

## 2. Các bên tham gia

| Bên | Vai trò |
|---|---|
| Donor | Góp tiền vào quỹ và theo dõi lịch sử giải ngân |
| Charity | Tổ chức từ thiện nhận trách nhiệm triển khai hoạt động và gửi bằng chứng hoàn thành milestone |
| Verifier | Bên xác minh độc lập có quyền phản đối hoặc bỏ phiếu xử lý tranh chấp |
| Smart Contract | Giữ tiền, lưu trạng thái milestone và thực thi điều kiện giải ngân |

## 3. Dữ liệu cố định khi triển khai

Khi deploy contract, các dữ liệu sau được khai báo và không thể chỉnh sửa:

- địa chỉ ví tổ chức từ thiện;
- danh sách 3 verifier;
- danh sách milestone;
- số tiền của từng milestone;
- mục đích chi tiêu của từng milestone;
- thời gian challenge period.

`fundingGoal` được tính bằng tổng số tiền của toàn bộ milestone. Cách này giúp tránh trường hợp mục tiêu gọi vốn và tổng giải ngân không khớp nhau.

## 4. State machine của milestone

| Trạng thái | Ý nghĩa |
|---|---|
| `Planned` | Milestone đã được khai báo nhưng chưa gửi bằng chứng |
| `Submitted` | Charity đã gửi IPFS CID/chứng từ và bắt đầu challenge period |
| `Disputed` | Có ít nhất 1 verifier phản đối |
| `Approved` | Tranh chấp được xử lý, đạt 2/3 phiếu verifier |
| `Released` | Tiền đã được giải ngân cho charity |

## 5. Quy trình giải ngân

1. Donor gửi tiền vào contract bằng `donate()`.
2. Khi tổng tiền đạt `fundingGoal`, charity gọi `submitMilestone(milestoneId, evidenceCID)`.
3. Contract lưu CID bằng chứng và thời điểm submit.
4. Trong challenge period, verifier có thể gọi `reject(milestoneId, reason)`.
5. Nếu không có phản đối, sau challenge period bất kỳ ai cũng có thể gọi `release(milestoneId)`.
6. Nếu có phản đối, milestone chuyển sang `Disputed`.
7. Khi có ít nhất 2/3 verifier gọi `voteResolve(milestoneId)`, milestone chuyển sang `Approved`.
8. Sau đó bất kỳ ai cũng có thể gọi `release(milestoneId)`.

## 6. Các hàm chính

| Hàm | Quyền gọi | Mục đích |
|---|---|---|
| `donate()` | Bất kỳ donor nào | Gửi ETH vào quỹ |
| `submitMilestone()` | Charity | Gửi bằng chứng hoàn thành milestone |
| `reject()` | Verifier | Phản đối milestone trong challenge period |
| `voteResolve()` | Verifier | Bỏ phiếu xử lý tranh chấp |
| `release()` | Bất kỳ ai | Giải ngân khi đủ điều kiện |
| `getMilestone()` | Bất kỳ ai | Xem thông tin milestone |

## 7. Bảo mật và ràng buộc kỹ thuật

- `release()` áp dụng nguyên tắc Checks-Effects-Interactions: kiểm tra điều kiện, cập nhật trạng thái, sau đó mới chuyển ETH.
- Có cơ chế `nonReentrant` đơn giản để giảm rủi ro reentrancy.
- Mỗi milestone chỉ có thể release một lần vì sau khi giải ngân trạng thái chuyển sang `Released`.
- Chỉ verifier đã khai báo từ đầu mới được phản đối hoặc vote resolve.
- Chỉ charity mới được submit bằng chứng milestone.
- Không cho nhận vượt `fundingGoal` để tránh bài toán xử lý tiền dư trong bản demo.

## 8. Giới hạn của thiết kế

- Contract không xác minh nội dung hóa đơn, ảnh hoặc chứng từ là thật.
- IPFS CID chỉ chứng minh rằng một nội dung cụ thể đã được tham chiếu, không chứng minh nội dung đó đúng với thực tế.
- Nếu 2/3 verifier thông đồng, hệ thống vẫn có thể bị thao túng.
- Nếu charity không submit milestone, tiền có thể bị kẹt trong bản demo này. Phiên bản thực tế cần thêm deadline, refund hoặc cơ chế thay charity.
- Dữ liệu cá nhân trong chứng từ không nên công khai trực tiếp; nên mã hóa hoặc che thông tin nhạy cảm trước khi đưa lên IPFS.

## 9. Hướng mở rộng

- Thêm deadline gọi vốn và cơ chế refund nếu không đạt mục tiêu.
- Thêm cơ chế stake & slashing cho verifier.
- Thay verifier cố định bằng DAO hoặc hội đồng có thể thay đổi theo nhiệm kỳ.
- Tích hợp frontend đọc event on-chain để donor theo dõi dòng tiền.
- Tích hợp kiểm toán hậu kiểm ngoài chuỗi và lưu kết quả kiểm toán bằng hash trên chain.

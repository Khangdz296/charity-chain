# Hướng dẫn bảo vệ đồ án

## 1. Đồ án giải quyết vấn đề gì?

Đồ án tập trung giải quyết vấn đề thiếu minh bạch trong quản lý dòng tiền từ thiện. Thay vì để tổ chức từ thiện tự công bố thông tin sau khi chi tiêu, hệ thống yêu cầu kế hoạch sử dụng tiền được cố định trước, tiền được giữ trong smart contract, và mỗi lần giải ngân phải gắn với bằng chứng cùng cơ chế giám sát của verifier.

## 2. Blockchain có bảo đảm chứng từ là thật không?

Không. Đây là điểm cần thừa nhận rõ. Blockchain chỉ bảo đảm dữ liệu đã ghi không bị sửa và mọi người có thể kiểm tra lịch sử. Nó không tự biết hóa đơn, ảnh hay báo cáo ngoài đời là thật hay giả. Vì vậy đồ án dùng blockchain để tăng tính minh bạch và truy vết, kết hợp verifier và hậu kiểm để giảm rủi ro dữ liệu sai.

## 3. Nếu tổ chức từ thiện và verifier thông đồng thì sao?

Không có hệ thống nào loại bỏ hoàn toàn rủi ro thông đồng khi có yếu tố con người. Giải pháp của đồ án không nhằm tạo ra sự an toàn tuyệt đối, mà làm cho gian lận khó hơn, tốn kém hơn và dễ bị phát hiện hơn. Mọi hành động submit, reject, vote và release đều để lại dấu vết on-chain, từ đó tạo rủi ro danh tiếng và hỗ trợ kiểm toán sau này.

## 4. Vì sao chỉ cần 1/3 verifier reject?

Ngưỡng phản đối thấp giúp hệ thống ưu tiên an toàn trong giai đoạn trước giải ngân. Chỉ cần một verifier phát hiện bất thường là tiền bị tạm dừng, tránh việc giải ngân quá nhanh khi có dấu hiệu nghi vấn. Sau đó hệ thống yêu cầu 2/3 verifier xử lý tranh chấp để cân bằng giữa kiểm soát rủi ro và khả năng tiếp tục vận hành.

## 5. Vì sao `release()` ai cũng gọi được?

Đây là tư duy optimistic automation. Khi điều kiện đã đủ, việc giải ngân không nên phụ thuộc vào thiện chí của một tài khoản cụ thể. Bất kỳ ai cũng có thể gọi `release()`, nhưng contract chỉ chuyển tiền nếu trạng thái milestone hợp lệ.

## 6. Vì sao không lưu toàn bộ hóa đơn lên blockchain?

Lưu dữ liệu lớn trực tiếp lên blockchain rất tốn phí và có thể làm lộ dữ liệu cá nhân. Thiết kế phù hợp hơn là lưu chứng từ ở IPFS hoặc hệ thống lưu trữ ngoài chuỗi, còn blockchain chỉ lưu CID/hash để kiểm tra tính toàn vẹn.

## 7. Điểm mới của đồ án là gì?

Điểm mới không nằm ở việc tạo ra một blockchain riêng, mà ở mô hình quản lý giải ngân theo nhiều lớp tin cậy:

- kế hoạch chi tiêu cố định từ đầu;
- giải ngân theo milestone;
- verifier độc lập có quyền phản đối;
- xử lý tranh chấp có ghi vết;
- đề xuất stake/slashing và hậu kiểm để mở rộng.

## 8. Hạn chế lớn nhất là gì?

Hạn chế lớn nhất là oracle problem: dữ liệu ngoài đời khi đưa vào hệ thống có thể sai. Ngoài ra, bản demo còn đơn giản hóa một số vấn đề như deadline gọi vốn, refund, thay verifier và bảo vệ dữ liệu cá nhân. Các điểm này có thể trình bày trong hướng phát triển.

## 9. Nên demo như thế nào?

Nên demo 2 kịch bản:

1. **Kịch bản bình thường**: donor góp đủ tiền, charity submit milestone, không verifier nào reject, hết challenge period thì release.
2. **Kịch bản có tranh chấp**: charity submit milestone, một verifier reject, trạng thái chuyển sang `Disputed`, hai verifier vote resolve, sau đó release.

Khi demo, cần nhấn mạnh event log vì đó là bằng chứng minh bạch của toàn bộ quy trình.

# Báo cáo đồ án

## Tên đề tài

**Nghiên cứu ứng dụng công nghệ Blockchain nhằm nâng cao tính minh bạch trong quản lý dòng tiền từ thiện**

## Tóm tắt

Hoạt động từ thiện có ý nghĩa xã hội lớn nhưng thường gặp vấn đề về minh bạch dòng tiền, đặc biệt trong các khâu tiếp nhận đóng góp, phân bổ ngân sách, giải ngân và công bố chứng từ. Các phương pháp quản lý truyền thống phụ thuộc nhiều vào báo cáo nội bộ hoặc bên trung gian, khiến donor khó kiểm chứng tiền đã được sử dụng đúng mục đích hay chưa.

Đồ án đề xuất mô hình sử dụng smart contract để quản lý quỹ từ thiện theo từng cột mốc giải ngân. Khi chiến dịch được tạo, mục tiêu quỹ, danh sách milestone, số tiền, mục đích chi tiêu và danh sách verifier được công bố cố định. Tổ chức từ thiện chỉ có thể nhận tiền theo từng milestone sau khi gửi bằng chứng và trải qua giai đoạn giám sát. Nếu không có phản đối trong thời gian quy định, tiền được giải ngân theo cơ chế optimistic release. Nếu có phản đối, milestone chuyển sang trạng thái tranh chấp và cần phiếu xử lý từ verifier.

Giải pháp không khẳng định blockchain có thể loại bỏ hoàn toàn gian lận. Thay vào đó, blockchain được sử dụng để tăng tính minh bạch, tạo dấu vết bất biến, giảm khả năng thay đổi kế hoạch chi tiêu và hỗ trợ kiểm toán sau này.

## 1. Mở đầu

### 1.1. Lý do chọn đề tài

Trong các chiến dịch từ thiện, lòng tin của cộng đồng là yếu tố quyết định. Tuy nhiên, lòng tin thường bị suy giảm khi thông tin về dòng tiền không rõ ràng, chứng từ khó kiểm tra, hoặc quá trình giải ngân phụ thuộc hoàn toàn vào tuyên bố của tổ chức đứng ra kêu gọi.

Blockchain có các đặc tính phù hợp với bài toán này: dữ liệu đã ghi khó bị sửa đổi, giao dịch có thể kiểm tra công khai, và smart contract có thể tự động thực thi điều kiện giải ngân. Vì vậy, việc nghiên cứu ứng dụng blockchain trong quản lý dòng tiền từ thiện là hướng tiếp cận có ý nghĩa cả về kỹ thuật lẫn thực tiễn.

### 1.2. Mục tiêu đề tài

Đề tài hướng đến các mục tiêu:

- xây dựng mô hình quản lý quỹ từ thiện minh bạch hơn bằng smart contract;
- thiết kế quy trình giải ngân theo milestone;
- giảm rủi ro tổ chức tự ý thay đổi mục đích sử dụng tiền;
- tạo cơ chế để verifier độc lập phản đối khi phát hiện bất thường;
- xây dựng smart contract demo cho quy trình nhận đóng góp và giải ngân.

### 1.3. Phạm vi đề tài

Đồ án tập trung vào mô hình kỹ thuật và smart contract demo. Các vấn đề pháp lý, định danh eKYC, kiểm toán thực địa và tích hợp ngân hàng được trình bày ở mức định hướng hoặc hướng phát triển.

## 2. Cơ sở lý thuyết

### 2.1. Blockchain

Blockchain là hệ thống sổ cái phân tán, trong đó dữ liệu được ghi thành các khối liên kết với nhau bằng hàm băm mật mã. Đặc điểm quan trọng của blockchain là tính bất biến tương đối: khi dữ liệu đã được ghi và xác nhận, việc thay đổi lịch sử là rất khó hoặc không khả thi trong điều kiện vận hành bình thường.

Trong bài toán từ thiện, blockchain giúp donor kiểm tra lịch sử giao dịch, số tiền đã nhận, số tiền đã giải ngân và thời điểm giải ngân.

### 2.2. Smart contract

Smart contract là chương trình chạy trên blockchain, có khả năng giữ tài sản số và thực thi logic theo điều kiện đã lập trình. Trong đồ án này, smart contract đóng vai trò giữ tiền quyên góp và chỉ giải ngân khi milestone thỏa điều kiện.

### 2.3. IPFS và lưu trữ ngoài chuỗi

Blockchain không phù hợp để lưu trực tiếp dữ liệu lớn như ảnh, hóa đơn hoặc tài liệu scan vì chi phí cao và khó bảo vệ dữ liệu cá nhân. Do đó, chứng từ nên được lưu ngoài chuỗi, ví dụ IPFS, còn smart contract chỉ lưu CID/hash để tham chiếu và kiểm tra tính toàn vẹn.

### 2.4. Oracle problem

Oracle problem là vấn đề cốt lõi khi blockchain cần sử dụng dữ liệu ngoài đời thực. Blockchain có thể bảo đảm dữ liệu đã ghi không bị sửa, nhưng không tự bảo đảm dữ liệu đầu vào là đúng sự thật. Ví dụ, một hóa đơn được đưa lên IPFS có thể tồn tại vĩnh viễn, nhưng blockchain không tự biết hóa đơn đó có thật hay không.

Vì vậy, giải pháp của đồ án không dựa vào blockchain như một công cụ xác minh sự thật tuyệt đối. Thay vào đó, hệ thống kết hợp smart contract, verifier, challenge period và hậu kiểm để tăng chi phí gian lận và tăng khả năng phát hiện sai phạm.

## 3. Phân tích bài toán

### 3.1. Vấn đề của mô hình truyền thống

Một số hạn chế thường gặp trong quản lý quỹ từ thiện truyền thống:

- kế hoạch sử dụng tiền có thể không được công bố rõ từ đầu;
- donor khó biết tiền đang nằm ở đâu và đã chi vào việc gì;
- chứng từ thường được công bố muộn hoặc không đầy đủ;
- phụ thuộc vào uy tín cá nhân/tổ chức;
- quá trình kiểm toán độc lập không phải lúc nào cũng có.

### 3.2. Yêu cầu hệ thống

Hệ thống đề xuất cần đáp ứng:

- công khai mục tiêu gọi vốn;
- công khai danh sách milestone;
- khóa kế hoạch giải ngân sau khi deploy contract;
- cho phép donor đóng góp;
- chỉ cho charity submit bằng chứng;
- cho phép verifier phản đối trong thời gian quy định;
- tự động giải ngân nếu đủ điều kiện;
- lưu vết toàn bộ hành động quan trọng bằng event.

## 4. Mô hình đề xuất: Layered Trust Model

### 4.1. Tầng 1 - Khung minh bạch cố định

Khi contract được triển khai, các thông tin quan trọng được khai báo trước và không thể chỉnh sửa tùy ý:

- mục tiêu gọi vốn;
- số lượng milestone;
- số tiền của từng milestone;
- mục đích của từng milestone;
- danh sách 3 verifier.

Điều này giúp donor biết kế hoạch sử dụng tiền trước khi đóng góp, giảm rủi ro thay đổi mục đích chi tiêu mà không bị phát hiện.

### 4.2. Tầng 2 - Multi-verifier và optimistic release

Mỗi milestone trải qua quy trình:

1. Charity gửi bằng chứng hoàn thành milestone.
2. Hệ thống bắt đầu challenge period.
3. Verifier có quyền phản đối nếu phát hiện bất thường.
4. Nếu không có phản đối, tiền được giải ngân sau challenge period.
5. Nếu có phản đối, milestone chuyển sang tranh chấp.
6. Cần 2/3 verifier vote resolve để milestone được tiếp tục giải ngân.

Cơ chế này cân bằng giữa hai nhu cầu: không làm quy trình từ thiện bị chậm quá mức, nhưng vẫn tạo cửa chặn khi có dấu hiệu sai phạm.

### 4.3. Tầng 3 - Stake & Slashing

Trong phiên bản mở rộng, verifier có thể phải đặt cọc. Nếu sau hậu kiểm chứng minh verifier cố tình thông qua yêu cầu gian lận, một phần tiền cọc có thể bị cắt. Cơ chế này biến hành vi bỏ qua sai phạm từ một hành động miễn phí thành hành động có rủi ro tài chính.

Tuy nhiên, cơ chế slashing cần một quy trình xác định sai phạm đáng tin cậy. Vì vậy trong đồ án, phần này được xem là hướng phát triển thay vì trọng tâm code.

### 4.4. Tầng 4 - Hậu kiểm ngẫu nhiên

Một bên kiểm toán độc lập có thể chọn ngẫu nhiên các milestone đã giải ngân để xác minh thực địa. Kết quả kiểm toán có thể được công bố ngoài chuỗi và lưu hash lên blockchain.

### 4.5. Tầng 5 - Danh tiếng on-chain

Mọi quyết định của verifier đều gắn với địa chỉ ví và được ghi lại. Nếu các địa chỉ này liên kết với định danh thật hoặc tổ chức thật, lịch sử hành vi sẽ tạo áp lực danh tiếng lâu dài.

## 5. Thiết kế smart contract

### 5.1. Các thực thể chính

Contract gồm các thành phần:

- `charity`: địa chỉ nhận tiền giải ngân;
- `verifiers`: danh sách 3 địa chỉ giám sát;
- `fundingGoal`: tổng số tiền cần gọi vốn;
- `Milestone`: cấu trúc lưu số tiền, mục đích, CID bằng chứng và trạng thái;
- `donations`: mapping lưu đóng góp của từng donor.

### 5.2. Trạng thái milestone

Milestone có các trạng thái:

- `Planned`: đã lên kế hoạch;
- `Submitted`: charity đã gửi bằng chứng;
- `Disputed`: có verifier phản đối;
- `Approved`: tranh chấp đã được xử lý;
- `Released`: đã giải ngân.

### 5.3. Các hàm chính

- `donate()`: donor gửi ETH vào contract.
- `submitMilestone()`: charity gửi CID bằng chứng.
- `reject()`: verifier phản đối milestone.
- `voteResolve()`: verifier vote xử lý tranh chấp.
- `release()`: giải ngân khi đủ điều kiện.
- `getMilestone()`: đọc thông tin milestone.

### 5.4. Kiểm soát bảo mật

Hàm `release()` cập nhật trạng thái trước khi chuyển ETH để giảm rủi ro reentrancy. Contract cũng dùng khóa `nonReentrant` đơn giản. Các quyền quan trọng được kiểm soát bằng `onlyCharity` và `onlyVerifier`.

## 6. Kịch bản demo

### 6.1. Kịch bản giải ngân bình thường

1. Deploy contract với 2 milestone và 3 verifier.
2. Donor đóng góp đến đủ `fundingGoal`.
3. Charity submit milestone 0 kèm CID.
4. Không verifier nào reject.
5. Hết challenge period, gọi `release(0)`.
6. Contract chuyển tiền milestone 0 cho charity.

### 6.2. Kịch bản có tranh chấp

1. Charity submit milestone 1.
2. Một verifier gọi `reject(1, reason)`.
3. Milestone chuyển sang `Disputed`.
4. Hai verifier gọi `voteResolve(1)`.
5. Milestone chuyển sang `Approved`.
6. Gọi `release(1)` để giải ngân.

## 7. Đánh giá giải pháp

### 7.1. Ưu điểm

- Donor có thể kiểm tra dòng tiền công khai.
- Kế hoạch chi tiêu được cố định trước.
- Việc giải ngân phụ thuộc vào trạng thái contract thay vì lời hứa thủ công.
- Mọi hành động quan trọng đều để lại event.
- Cơ chế phản đối giúp giảm rủi ro giải ngân khi có bất thường.

### 7.2. Hạn chế

- Không giải quyết triệt để oracle problem.
- Không tự xác minh chứng từ ngoài đời.
- Nếu verifier thông đồng, hệ thống vẫn có thể bị thao túng.
- Bản demo chưa có deadline, refund, thay verifier và quản lý dữ liệu cá nhân đầy đủ.
- Việc áp dụng thực tế cần kết hợp pháp lý, kiểm toán và định danh.

### 7.3. Đánh đổi thiết kế

Thiết kế dùng optimistic release để tránh làm quá trình giải ngân bị chậm. Đổi lại, hệ thống cần verifier theo dõi trong challenge period. Ngưỡng reject 1/3 giúp chặn nhanh rủi ro, nhưng có thể bị lạm dụng bởi verifier không trung thực. Vì vậy, bản mở rộng nên có cơ chế danh tiếng, stake/slashing hoặc thay thế verifier.

## 8. Kết luận và hướng phát triển

Đồ án đã đề xuất mô hình ứng dụng blockchain trong quản lý dòng tiền từ thiện theo hướng minh bạch hóa quy trình giải ngân. Smart contract giúp cố định kế hoạch chi tiêu, giữ tiền đóng góp, ghi nhận bằng chứng và chỉ giải ngân khi đạt điều kiện.

Giải pháp không thay thế hoàn toàn niềm tin con người hoặc kiểm toán truyền thống, nhưng tạo ra nền tảng dữ liệu công khai, khó chỉnh sửa và dễ truy vết hơn. Đây là giá trị cốt lõi của blockchain trong bài toán từ thiện.

Hướng phát triển:

- bổ sung deadline gọi vốn và refund;
- xây dựng giao diện web cho donor;
- tích hợp IPFS upload;
- thêm verifier rotation;
- nghiên cứu stake & slashing;
- lưu hash kết quả hậu kiểm lên blockchain;
- kết hợp định danh số/eKYC cho tổ chức từ thiện và verifier.

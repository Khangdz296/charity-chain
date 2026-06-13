# PLAN: Mô hình Giải ngân - "Layered Trust Model"
## Đồ án: Ứng dụng Blockchain nâng cao minh bạch quản lý dòng tiền từ thiện

---

## 1. Bối cảnh & Vấn đề cốt lõi

- Mục tiêu: thiết kế cơ chế giải ngân (disbursement) cho Smart Contract quản lý quỹ từ thiện.
- Vấn đề nền tảng: **Oracle Problem** - Blockchain chỉ đảm bảo dữ liệu KHÔNG BỊ SỬA SAU KHI GHI (immutability) và AI CŨNG XEM ĐƯỢC (transparency), nhưng KHÔNG đảm bảo dữ liệu đưa vào ban đầu là đúng sự thật (garbage in - garbage out).
- Hệ quả: không có mô hình giải ngân nào loại bỏ hoàn toàn rủi ro gian lận/thông đồng bằng code thuần túy. Mục tiêu thực tế là: chuyển từ "phòng ngừa tuyệt đối" sang "tăng chi phí + xác suất bị phát hiện khi gian lận, và để lại bằng chứng vĩnh viễn không thể xóa".
- Câu chủ đề dùng khi viết lý luận/bảo vệ đồ án:
  > "Hệ thống không cố gắng tạo ra một cơ chế bất khả xâm phạm tuyệt đối, mà xây dựng nhiều lớp phòng thủ độc lập (defense in depth) sao cho việc phá vỡ toàn bộ hệ thống đòi hỏi sự thông đồng đồng thời của nhiều bên có lợi ích và quyền lực khác biệt, kết hợp với rủi ro tài chính (mất cọc) và rủi ro danh tiếng vĩnh viễn cho từng cá nhân tham gia."

---

## 2. Mô hình đề xuất - 5 Tầng (Layered Trust Model)

### Tầng 1 - Khung minh bạch cố định (BẮT BUỘC, dễ code)
- Khi tạo chiến dịch (deploy contract), khai báo CỨNG và KHÔNG THỂ SỬA:
  - Tổng mục tiêu (fundingGoal)
  - Số lượng milestone, số tiền + mục đích của TỪNG milestone
  - Danh sách địa chỉ ví của 3 verifier
- Giá trị: donor biết 100% kế hoạch chi tiêu trước khi góp tiền → loại bỏ rủi ro đổi mục đích sử dụng giữa đường.

### Tầng 2 - Multi-Verifier + Optimistic Release (CỐT LÕI, trọng tâm code)
Quy trình từng milestone:
1. Tổ chức từ thiện gọi `submitMilestone(milestoneId, ipfsHash)` - đính kèm chứng từ (hóa đơn, ảnh...) đã upload IPFS.
2. Bắt đầu **challenge period 72 giờ**.
3. Trong 72h, **3 verifier độc lập** (1 cơ quan nhà nước, 1 kiểm toán độc lập, 1 đại diện donor luân phiên) có quyền gọi `reject(milestoneId, reason)`.
   - Ngưỡng veto THẤP: chỉ cần **1/3** reject là tạm dừng (dễ chặn, khó thông đồng vì kẻ gian phải khống chế cả 3).
4. Hết 72h không ai reject → ai cũng có thể gọi `release(milestoneId)` để tự động chuyển tiền (optimistic default).
5. Nếu bị reject → trạng thái "dispute", cần **2/3 verifier vote resolve** mới được release lại.

Lưu ý kỹ thuật:
- `release()` phải theo nguyên tắc Checks-Effects-Interactions: kiểm tra điều kiện → cập nhật trạng thái (`released = true`) → mới chuyển tiền (chống Reentrancy).
- Mỗi milestone chỉ release đúng 1 lần.

### Tầng 3 - Stake & Slashing (NÊN CÓ, độ khó trung bình)
- Mỗi verifier đặt cọc token (~5-10% giá trị 1 milestone) khi nhận vai trò.
- Nếu sau này (qua audit/khiếu nại có bằng chứng) phát hiện verifier đã release cho request gian lận → `slash()`: mất cọc, chia cho người tố cáo + bù quỹ.
- Giá trị: biến "im lặng cho qua" từ hành động miễn phí thành hành động có rủi ro tài chính.

### Tầng 4 - Hậu kiểm ngẫu nhiên (KHÔNG CẦN CODE, mô tả quy trình off-chain)
- Định kỳ (quý), một bên kiểm toán thứ 4 độc lập (không tham gia quy trình hàng ngày) chọn NGẪU NHIÊN một số milestone đã release để xác minh thực địa.
- Chỉ cần trình bày trong văn bản như quy trình vận hành, thể hiện tư duy "toàn vòng đời".

### Tầng 5 - Danh tiếng vĩnh viễn on-chain (MIỄN PHÍ, chỉ cần lập luận)
- Mọi approve/reject của verifier gắn với địa chỉ định danh (eKYC) và ghi vĩnh viễn on-chain.
- Lịch sử hành vi không thể xóa → ảnh hưởng danh tiếng lâu dài, có thể liên kết sang hệ thống khác dùng chung định danh số.

---

## 3. Bảng ưu tiên triển khai

| Tầng | Độ khó code | Mức độ trong đồ án |
|---|---|---|
| 1. Khung cố định | Rất dễ | Bắt buộc - code chính |
| 2. Multi-verifier optimistic | Trung bình | Bắt buộc - code chính, trọng tâm |
| 3. Stake & Slashing | Trung bình | Nên có; nếu thiếu thời gian → để ở "hướng phát triển gần" |
| 4. Hậu kiểm ngẫu nhiên | Không cần code | Chỉ mô tả quy trình off-chain |
| 5. Danh tiếng on-chain | Không cần code | Chỉ lập luận, tận dụng tính chất sẵn có của blockchain |

---

## 4. Các hàm Smart Contract chính (để code/demo)

- `submitMilestone(milestoneId, ipfsHash)` - chỉ tổ chức từ thiện gọi, ghi timestamp submit.
- `reject(milestoneId, reason)` - chỉ verifier gọi, trong challenge period, lý do ghi on-chain.
- `voteResolve(milestoneId)` - verifier vote khi đang dispute, cần 2/3.
- `release(milestoneId)` - ai cũng gọi được, điều kiện: hết challenge period AND chưa bị reject (hoặc đã resolve) AND chưa release trước đó.
- (Tầng 3, optional) `stake()`, `slash(verifierAddr, milestoneId)`.

---

## 5. Cách trả lời câu hỏi "Nếu tổ chức và verifier thông đồng thì sao?"

Mẫu trả lời khi bảo vệ đồ án:
> "Em xin thừa nhận đây là hạn chế cố hữu của mọi hệ thống có sự tham gia của con người, kể cả kiểm toán truyền thống. Giải pháp của em không nhằm loại bỏ hoàn toàn rủi ro này, mà nhằm tăng chi phí và rủi ro bị phát hiện cho hành vi gian lận thông qua: (1) yêu cầu đồng thuận của nhiều bên độc lập có lợi ích khác nhau, (2) tính bất biến/công khai của dữ liệu, và (3) cơ chế kinh tế stake & slashing như hướng phát triển để giảm thiểu thêm."

---

## 6. Việc cần làm tiếp (để các prompt sau bám theo plan này)

- [ ] Viết mục 2.8 "Giới hạn của giải pháp đề xuất và đánh đổi thiết kế" dựa trên Mục 1 & 5 ở trên.
- [ ] Cập nhật mục 2.5 (Thiết kế Smart Contract) theo Tầng 1 + Tầng 2 (trọng tâm).
- [ ] Viết code Solidity demo cho Tầng 1 + Tầng 2 (đưa vào phụ lục).
- [ ] (Optional, nếu còn thời gian) Thêm Tầng 3 Stake & Slashing vào code.
- [ ] Thêm Tầng 4, 5 vào phần lập luận/hướng phát triển (mục 4 phần kết luận).
- [ ] Vẽ sơ đồ flowchart/sequence diagram cho quy trình Tầng 2 (submit → challenge → release/dispute).

---

## 7. Kế hoạch triển khai: Factory-driven deactivation enforcement (2026-06-13)

### Mục tiêu nghiệp vụ đã chốt
- Áp dụng **cách 1**: mỗi `CharityMilestoneFund` biết `factory` và `campaignId`, rồi tự hỏi factory xem campaign có đang bị deactivate không.
- Khi campaign bị deactivate, phải **chặn đồng bộ nghiệp vụ** trong campaign.
- Khi campaign được reactivate, campaign phải **nhận donate trở lại** và các hành vi bị chặn trước đó hoạt động lại theo rule bình thường.
- Khi campaign đang deactivate, donor được **refund khẩn**.
- Admin **không được deactivate** campaign nếu đã có bất kỳ milestone nào được claim, để tránh trạng thái refund không đủ tiền.

### Phạm vi chặn khi campaign bị deactivate
Sẽ thêm modifier kiểu `onlyActiveCampaign` vào các hàm sau trong `CharityMilestoneFund.sol`:
- `donate()` / `receive()`
- `submitMilestone()`
- `resubmitMilestone()`
- `reject()`
- `voteResolve()`
- `release()`
- `claimMilestone()`

`refund()` sẽ là ngoại lệ:
- nếu campaign đang deactivate, donor được refund ngay cả trước deadline;
- nếu campaign không deactivate, giữ nguyên logic refund hiện tại.

### Thay đổi contract
1. **Factory interface trong campaign**
   - Thêm interface tối thiểu trong `CharityMilestoneFund.sol` để gọi `isDeactivated(uint256)` từ factory.
   - Thêm immutable fields: `factory` và `campaignId`.

2. **Khởi tạo campaign từ factory**
   - Sửa constructor `CharityMilestoneFund` để nhận thêm địa chỉ factory và campaign id.
   - Trong `CharityCampaignFactory.createCampaign()`, xác định `campaignId = campaigns.length` trước khi deploy rồi truyền vào constructor.

3. **Enforce trạng thái deactivate trong campaign**
   - Thêm helper/modifier như `_isDeactivated()` / `onlyActiveCampaign` để kiểm tra trạng thái từ factory.
   - Áp dụng modifier cho toàn bộ hàm nghiệp vụ cần chặn.
   - Dùng message lỗi rõ ràng, nhất quán, ví dụ `Campaign is deactivated`.

4. **Emergency refund**
   - Nới logic `refund()` để cho phép hoàn tiền khi `factory.isDeactivated(campaignId) == true`.
   - Vẫn chỉ cho refund số donor đã đóng góp, giữ `nonReentrant`, zero-out balance trước khi transfer.

5. **Ngăn deactivate sau khi đã claim**
   - Thêm view helper trong `CharityMilestoneFund.sol` để factory kiểm tra có milestone nào đã claim chưa, ví dụ `hasAnyClaimedMilestone()`.
   - Trong `CharityCampaignFactory.deactivateCampaign()`, gọi sang campaign hiện tại và `require` chưa có claim nào.

### Thay đổi frontend
- Không cần đổi luồng chính của nút `Deactivate` / `Reactivate`; frontend đã gọi đúng factory.
- Có thể cần cập nhật/giữ nguyên phần hiển thị lỗi để người dùng thấy các lỗi on-chain mới như:
  - `Campaign is deactivated`
  - `Cannot deactivate after funds have been claimed`
- Sau khi reactivate, frontend hiện tại đã reload campaigns; donate sẽ hoạt động lại vì contract cho phép trở lại.

### Cập nhật script kiểm thử
Sẽ mở rộng `scripts/test-deactivate.js` để kiểm tra:
- donate bị revert khi deactivated;
- donate hoạt động lại sau reactivate;
- submit/reject/voteResolve/release/claim bị revert khi deactivated;
- refund khẩn hoạt động khi deactivated;
- deactivate bị chặn nếu campaign đã có milestone được claim.

Sẽ rà thêm `scripts/test-deadline.js` và `scripts/test-challenge-period.js` để chỉnh constructor/luồng tạo campaign nếu cần, nhưng cố gắng giữ nguyên intent test cũ.

### Cách xác minh sau khi code
- `hardhat compile`
- chạy lần lượt:
  - `node scripts/test-deactivate.js` hoặc `hardhat run scripts/test-deactivate.js`
  - `hardhat run scripts/test-deadline.js`
  - `hardhat run scripts/test-challenge-period.js`
- nếu cần, kiểm tra nhanh frontend bằng cách load factory, deactivate một campaign, xác nhận donate bị revert; sau đó reactivate và donate thành công lại.

### Rủi ro / điểm cần chú ý khi code
- Tránh circular dependency bằng cách dùng interface tối thiểu trong campaign thay vì import full factory.
- Vì `receive()` gọi `donate()`, chỉ cần chặn đúng tại `donate()` là ETH gửi trực tiếp cũng bị chặn.
- Refund khẩn chỉ an toàn vì đã chốt rule **cấm deactivate sau khi có claim**.
- Reactivate không cần migrate state; chỉ cần factory bỏ cờ `isDeactivated`, các hàm trong campaign sẽ tự hoạt động lại.
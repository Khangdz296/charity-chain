# Hướng Dẫn Chạy và Kiểm Thử Charity Chain

**Ngày:** 12 tháng 6, 2026  
**Phiên bản:** 2.0 (Security Hardened)  
**Mục đích:** Hướng dẫn chi tiết để chạy và kiểm thử các tính năng mới của hệ thống

---

## Mục Lục

1. [Chuẩn Bị Môi Trường](#1-chuẩn-bị-môi-trường)
2. [Khởi Động Hệ Thống](#2-khởi-động-hệ-thống)
3. [Kịch Bản Kiểm Thử](#3-kịch-bản-kiểm-thử)
4. [Xử Lý Lỗi Thường Gặp](#4-xử-lý-lỗi-thường-gặp)
5. [Checklist Kiểm Thử](#5-checklist-kiểm-thử)

---

## 1. Chuẩn Bị Môi Trường

### 1.1. Yêu Cầu Hệ Thống

- **Node.js:** v16+ (khuyến nghị v18+)
- **NPM:** v7+
- **MetaMask:** Phiên bản mới nhất
- **Trình duyệt:** Chrome, Firefox, hoặc Brave

### 1.2. Cài Đặt Dependencies

```bash
# Clone project (nếu chưa có)
cd charity-chain

# Cài đặt các package cần thiết
npm install

# Kiểm tra cài đặt
npx hardhat --version
```

### 1.3. Cấu Hình MetaMask

1. Mở MetaMask extension
2. Thêm network Hardhat Local:
   - **Network Name:** Hardhat Local
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH

---

## 2. Khởi Động Hệ Thống

### 2.1. Terminal 1 - Khởi động Hardhat Node

```bash
npm run node
```

**Kết quả mong đợi:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
...
```

**⚠️ LƯU Ý:** Giữ terminal này chạy suốt quá trình test!

### 2.2. Import Tài Khoản vào MetaMask

Từ danh sách accounts ở trên, import các private key sau vào MetaMask:

**Tài khoản test (theo thứ tự trong deploy script):**

| Vai trò | Account Index | Địa chỉ mẫu | Mục đích |
|---------|--------------|-------------|----------|
| Deployer | #0 | 0xf39...2266 | Deploy contract |
| Charity | #1 | 0x7099...79C8 | Submit, resubmit, claim milestone |
| Verifier 1 | #2 | 0x3C44...07e9 | Reject và vote resolve |
| Verifier 2 | #3 | 0x9096...46C3 | Reject và vote resolve |
| Verifier 3 | #4 | 0x15d3...4E56 | Reject và vote resolve |
| Donor | #5 | 0x9965...8d2D | Donate và refund |

**Cách import:**
1. Click vào icon MetaMask
2. Chọn menu → Import Account
3. Paste private key của account muốn test
4. Đặt tên cho account (vd: "Charity Test", "Donor Test")

### 2.3. Terminal 2 - Deploy Smart Contract

```bash
npm run deploy:local
```

**Kết quả mong đợi:**
```
CharityMilestoneFund deployed
Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Funding goal: 0.02 ETH
Challenge period: 60 seconds
Funding deadline: 2026-06-19T03:30:00.000Z

Demo accounts
Deployer : 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Charity  : 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Verifier1: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Verifier2: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Verifier3: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
Donor    : 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc

Paste Contract into frontend: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**⚠️ QUAN TRỌNG:** Copy địa chỉ contract (dòng cuối) để dùng ở bước sau!

### 2.4. Terminal 3 - Khởi động Frontend

```bash
npm run frontend
```

**Kết quả mong đợi:**
```
Frontend running at http://127.0.0.1:5500
```

### 2.5. Mở Frontend trong Trình Duyệt

1. Mở trình duyệt và truy cập: **http://localhost:5500**
2. Đảm bảo MetaMask đã kết nối với network **Hardhat Local**
3. Click nút **"Connect Wallet"**
4. Chấp nhận kết nối trong popup MetaMask

**Kiểm tra:**
- Top-right badge hiển thị: "Chain 31337"
- Wallet balance hiển thị số ETH của account đang chọn

---

## 3. Kịch Bản Kiểm Thử

### Kịch Bản 1: Quy Trình Thành Công Hoàn Chỉnh

**Mục tiêu:** Test flow chuẩn từ donation → milestone submission → release → claim

#### Bước 1: Load Contract

1. Paste địa chỉ contract từ deploy output vào ô "Contract Address"
2. Click **"Load Contract"**
3. Kiểm tra thông tin hiển thị:
   - Funding Goal: **0.02 ETH**
   - Total Donated: **0 ETH**
   - Milestones: **2**
   - Funding Deadline: (7 ngày kể từ deploy time)

#### Bước 2: Donation (Account #5 - Donor)

1. Trong MetaMask, chuyển sang **Account #5 (Donor)**
2. Reload trang để cập nhật account
3. Click tab **"Donor"**
4. Nhập số tiền: **0.01** ETH
5. Click **"Donate"**
6. Confirm transaction trong MetaMask
7. Đợi transaction confirm (xem Activity Log)

**Lặp lại để đạt funding goal:**
8. Donate thêm **0.01** ETH nữa
9. Kiểm tra "Total Donated" = **0.02 ETH**

**✅ Kết quả mong đợi:**
- Total Donated hiển thị 0.02 ETH
- Activity Log hiển thị 2 donation confirmed
- Wallet balance giảm ~0.02 ETH (+ gas fees)

#### Bước 3: Submit Milestone #0 (Account #1 - Charity)

1. Chuyển MetaMask sang **Account #1 (Charity)**
2. Reload trang
3. Click tab **"Charity"**
4. Trong form "Submit Milestone":
   - Milestone ID: **0**
   - Evidence IPFS CID: **ipfs://QmTest123FirstMilestone**
5. Click **"Submit Milestone"**
6. Confirm trong MetaMask

**✅ Kết quả mong đợi:**
- Activity Log: "Submit milestone: 0x..."
- Transaction confirmed

#### Bước 4: Đợi Challenge Period Kết Thúc

**Challenge period = 60 giây**

**Cách 1 (Khuyến nghị cho test):** Đợi 60 giây thật

**Cách 2 (Advanced - Manipulate time):**
```bash
# Trong terminal mới
npx hardhat console --network localhost

# Tăng thời gian 61 giây
await ethers.provider.send("evm_increaseTime", [61]);
await ethers.provider.send("evm_mine");
```

#### Bước 5: Release Milestone #0 (Bất kỳ ai)

1. Click tab **"Milestones"**
2. Click **"Load Milestones"** để refresh
3. Kiểm tra Milestone #0:
   - State: **Submitted**
   - Resolve: **0/3**
4. Trong form "Release ID":
   - Nhập: **0**
5. Click **"Release"**
6. Confirm trong MetaMask

**✅ Kết quả mong đợi:**
- Milestone #0 chuyển sang state: **Released**
- Status: **🔓 Claimable**

#### Bước 6: Claim Funds (Account #1 - Charity)

1. Đảm bảo đang dùng **Account #1 (Charity)**
2. Trong tab "Charity", form "Claim Released Milestone ID":
   - Nhập: **0**
3. Click **"Claim Funds"**
4. Confirm trong MetaMask

**✅ Kết quả mong đợi:**
- Charity wallet balance tăng 0.01 ETH
- Milestone #0 status: **✅ Claimed**
- Activity Log: "Claim milestone: 0x..."

#### Bước 7: Lặp Lại Cho Milestone #1

1. Submit milestone #1 với CID: **ipfs://QmTest456SecondMilestone**
2. Đợi 60 giây
3. Release milestone #1
4. Claim funds

**✅ Kết quả cuối cùng:**
- Charity nhận tổng 0.02 ETH
- Cả 2 milestones đều ở state "Released" và "Claimed"

---

### Kịch Bản 2: Refund Khi Campaign Thất Bại

**Mục tiêu:** Test refund mechanism khi không đạt funding goal

#### Setup

1. Deploy contract mới (hoặc reset Hardhat node: Ctrl+C và `npm run node` lại)
2. Deploy lại contract: `npm run deploy:local`
3. Load contract mới vào frontend

#### Bước 1: Donation Một Phần (Account #5)

1. Chuyển sang **Account #5 (Donor)**
2. Donate **0.01 ETH** (chỉ 50% funding goal)

#### Bước 2: Đợi Funding Deadline Hết Hạn

**Funding deadline = 7 ngày sau deploy**

Vì đợi 7 ngày không thực tế trong test, dùng Hardhat time manipulation:

```bash
# Terminal mới
npx hardhat console --network localhost

# Tăng thời gian 7 ngày + 1 giờ
await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 3600]);
await ethers.provider.send("evm_mine");
```

#### Bước 3: Request Refund

1. Vẫn ở **Account #5 (Donor)**
2. Click tab **"Donor"**
3. Trong form "Request Refund":
4. Click **"Refund My Donation"**
5. Confirm trong MetaMask

**✅ Kết quả mong đợi:**
- Donor nhận lại 0.01 ETH (trừ gas fees từ lúc donate)
- Activity Log: "Refund: 0x..."
- Total Donated giảm xuống 0 ETH

---

### Kịch Bản 3: Dispute và Resolution

**Mục tiêu:** Test reject → resubmit → unanimous approval flow

#### Bước 1-2: Setup và Donation

- Thực hiện như Kịch bản 1 (donate đủ 0.02 ETH)

#### Bước 3: Submit Milestone #0 với Bằng Chứng Không Hợp Lệ

1. **Account #1 (Charity)** submit milestone #0
2. Evidence CID: **ipfs://QmBadEvidence** (giả sử không valid)

#### Bước 4: Verifier 1 Reject (Account #2)

1. Chuyển sang **Account #2 (Verifier 1)**
2. Reload trang
3. Kiểm tra "Verifier Role" hiển thị: **"Verifier account"**
4. Click tab **"Verifier"**
5. Trong form "Reject":
   - Milestone ID: **0**
   - Rejection Reason: **"Evidence link is broken"**
6. Click **"Reject"**
7. Confirm trong MetaMask

**✅ Kết quả:**
- Milestone #0 chuyển sang state: **Disputed**
- Reject count: **1**

#### Bước 5: Charity Resubmit với Bằng Chứng Mới

1. Chuyển về **Account #1 (Charity)**
2. Tab "Charity", form "Resubmit Disputed Milestone":
   - Milestone ID: **0**
   - New Evidence CID: **ipfs://QmGoodEvidence123**
3. Click **"Resubmit Milestone"**
4. Confirm trong MetaMask

**✅ Kết quả:**
- Milestone #0 quay về state: **Submitted**
- Reject count reset về: **0**
- Resolve count reset về: **0/3**
- Challenge period restart từ lúc resubmit

#### Bước 6: Đợi Challenge Period Kết Thúc Mà Không Có Reject

- Đợi 60 giây (hoặc manipulate time)

#### Bước 7: Release và Claim

- Thực hiện release và claim như Kịch bản 1

---

### Kịch Bản 4: Unanimous Dispute Resolution

**Mục tiêu:** Test 3/3 verifier approval cho disputed milestone

#### Setup

- Thực hiện donation đầy đủ
- Submit milestone #0

#### Bước 1: Verifier 1 Reject

1. **Account #2 (Verifier 1)** reject với reason: **"Invoice unclear"**

#### Bước 2: Verifier 2 Reject

1. **Account #3 (Verifier 2)** reject với reason: **"Need more documentation"**

**Kết quả:**
- State: **Disputed**
- Reject count: **2**

#### Bước 3: Charity Không Resubmit, Verifiers Vote Resolve

Giả sử sau khi thảo luận, verifiers quyết định approve.

**Verifier 1 Vote:**
1. **Account #2 (Verifier 1)**
2. Tab "Verifier", form "Vote Resolve":
   - Milestone ID: **0**
3. Click **"Vote Resolve"**
4. Confirm

**Verifier 2 Vote:**
1. **Account #3 (Verifier 2)**
2. Vote resolve milestone #0

**Verifier 3 Vote:**
1. **Account #4 (Verifier 3)**
2. Vote resolve milestone #0

**✅ Kết quả sau 3 votes:**
- Milestone #0 state: **Approved**
- Resolve count: **3/3**
- Activity Log: "DisputeResolved"

#### Bước 4: Release và Claim

- Thực hiện release và claim như bình thường

---

### Kịch Bản 5: Sequential Milestone Enforcement

**Mục tiêu:** Test không thể submit milestone #1 trước khi milestone #0 released

#### Setup

- Donation đầy đủ 0.02 ETH

#### Bước 1: Thử Submit Milestone #1 Trước

1. **Account #1 (Charity)**
2. Submit milestone ID: **1**
3. Evidence CID: **ipfs://QmTest789**
4. Click submit

**❌ Kết quả mong đợi:**
- Transaction revert
- Error message: **"Previous milestone not released"**

#### Bước 2: Submit và Complete Milestone #0

1. Submit milestone #0
2. Đợi challenge period
3. Release
4. Claim

#### Bước 3: Thử Submit Milestone #1 Lại

1. Submit milestone #1 với cùng evidence CID

**✅ Kết quả:**
- Transaction thành công
- Milestone #1 ở state: **Submitted**

---

### Kịch Bản 6: Donation Over Funding Goal

**Mục tiêu:** Test auto-refund excess donation

#### Setup

- Contract mới với funding goal 0.02 ETH

#### Bước 1: Donor 1 Donate 0.015 ETH

1. **Account #5** donate 0.015 ETH

#### Bước 2: Donor 2 Donate 0.01 ETH (Vượt Goal)

1. **Account #6** donate 0.01 ETH
2. Confirm transaction

**✅ Kết quả mong đợi:**
- Contract chỉ nhận 0.005 ETH (để đủ goal 0.02)
- Donor 2 tự động nhận refund 0.005 ETH trong cùng transaction
- Total Donated: **0.02 ETH** (đúng bằng goal)
- Activity Log hiển thị donation 0.005 ETH (không phải 0.01)

---

## 4. Xử Lý Lỗi Thường Gặp

### Lỗi 1: "Transaction Reverted"

**Nguyên nhân:** Vi phạm business logic

**Giải pháp:**
- Kiểm tra state của milestone trước khi submit/reject/resolve
- Đảm bảo funding goal đã đạt trước khi submit milestone
- Đảm bảo challenge period đã hết trước khi release

### Lỗi 2: "MetaMask Not Detected"

**Giải pháp:**
- Cài đặt MetaMask extension
- Reload trang sau khi cài đặt
- Kiểm tra MetaMask không bị block bởi adblocker

### Lỗi 3: "Wrong Network"

**Giải pháp:**
- Chuyển MetaMask sang network "Hardhat Local"
- Chain ID phải là 31337
- RPC URL: http://127.0.0.1:8545

### Lỗi 4: "Nonce Too High"

**Nguyên nhân:** Reset Hardhat node nhưng MetaMask còn cache

**Giải pháp:**
1. MetaMask → Settings → Advanced
2. Click "Clear activity tab data"
3. Hoặc: Settings → Advanced → Reset Account

### Lỗi 5: "Insufficient Funds"

**Giải pháp:**
- Kiểm tra account balance
- Nếu hết ETH, restart Hardhat node để reset về 10000 ETH
- Import lại account vào MetaMask

---

## 5. Checklist Kiểm Thử

### Basic Functions

- [ ] Connect wallet thành công
- [ ] Load contract hiển thị đúng thông tin
- [ ] Funding deadline hiển thị đúng
- [ ] Donation thành công
- [ ] Donation vượt goal tự động refund excess
- [ ] Submit milestone thành công
- [ ] Load milestones hiển thị đầy đủ thông tin

### New Features (v2.0)

- [ ] Refund hoạt động sau funding deadline khi goal không đạt
- [ ] Không thể donate sau funding deadline
- [ ] Milestone resubmission reset dispute state
- [ ] Sequential milestone enforcement hoạt động
- [ ] Pull payment (release → claim) hoạt động đúng
- [ ] Unanimous voting (3/3) required cho dispute resolution

### Edge Cases

- [ ] Không thể submit milestone #1 trước khi #0 released
- [ ] Không thể reject sau challenge period
- [ ] Không thể claim milestone chưa released
- [ ] Không thể claim milestone đã claimed
- [ ] Không thể refund khi goal đã đạt
- [ ] Không thể refund trước funding deadline

### UI/UX

- [ ] Activity log hiển thị tất cả events
- [ ] Milestone cards hiển thị claim status
- [ ] Resolve vote counter hiển thị "X/3"
- [ ] Error messages rõ ràng và hữu ích
- [ ] Loading states khi transaction pending

---

## 6. Tips & Best Practices

### Tip 1: Sử Dụng Activity Log

Activity Log ở cuối trang giúp track tất cả transactions. Nếu không thấy transaction confirm sau 5 giây, check:
- MetaMask có pending transaction không?
- Gas price có đủ không?

### Tip 2: Test Với Multiple Accounts

Luôn test với nhiều accounts khác nhau để đảm bảo access control hoạt động:
- Charity không thể vote resolve
- Donor không thể submit milestone
- Verifier không thể claim funds

### Tip 3: Reset Khi Cần

Nếu contract state bị mess up trong quá trình test:
1. Ctrl+C terminal chạy Hardhat node
2. `npm run node` để start lại
3. `npm run deploy:local` để deploy contract mới
4. MetaMask → Clear activity tab data

### Tip 4: Document Test Results

Sau mỗi test scenario, ghi lại:
- Transaction hash
- Gas used
- Actual vs expected behavior
- Screenshots nếu có UI issues

---

## 7. Advanced Testing (Optional)

### Test Performance

```javascript
// Trong Hardhat console
const tx = await contract.donate({ value: ethers.parseEther("0.01") });
const receipt = await tx.wait();
console.log("Gas used:", receipt.gasUsed.toString());
```

### Test Event Emission

```javascript
// Listen to events
contract.on("MilestoneReleased", (milestoneId, charity, amount, event) => {
  console.log("Milestone released:", milestoneId.toString());
  console.log("Amount:", ethers.formatEther(amount));
});
```

### Automated Testing Script

Tạo file `test/integration.test.js` cho automated testing:

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CharityMilestoneFund Integration", function() {
  // Test cases here
});
```

Run: `npx hardhat test`

---

## 8. Kết Luận

Tài liệu này cung cấp hướng dẫn đầy đủ để test tất cả tính năng của Charity Chain version 2.0. 

**Các kịch bản quan trọng cần test:**
1. ✅ Happy path (donate → submit → release → claim)
2. ✅ Refund mechanism
3. ✅ Dispute resolution với 3/3 voting
4. ✅ Milestone resubmission
5. ✅ Sequential enforcement
6. ✅ Pull payment pattern

**Thời gian test ước tính:** 1-2 giờ cho tất cả kịch bản

**Liên hệ:** Nếu gặp vấn đề không có trong tài liệu này, check:
- `SECURITY_FIXES.md` - Chi tiết về các thay đổi
- `README.md` - Thông tin tổng quan
- GitHub Issues - Report bugs

---

**Happy Testing! 🚀**


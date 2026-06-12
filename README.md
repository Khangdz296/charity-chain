# Charity Chain

Đồ án: **Nghiên cứu ứng dụng công nghệ Blockchain nhằm nâng cao tính minh bạch trong quản lý dòng tiền từ thiện**.

Project triển khai mô hình quản lý quỹ từ thiện bằng smart contract. Donor gửi tiền vào contract, charity chỉ được nhận tiền theo từng milestone đã khai báo trước, verifier có quyền phản đối khi chứng từ có vấn đề, và toàn bộ trạng thái được ghi vết on-chain.

## Tính Năng Chính

- Smart contract Solidity quản lý quỹ theo milestone.
- Cố định funding goal, milestone amount, milestone purpose và verifier khi deploy.
- Charity submit bằng chứng qua IPFS CID.
- Challenge period cho verifier phản đối.
- Cơ chế dispute: chỉ cần 1 verifier reject, cần 2/3 verifier vote resolve để tiếp tục release.
- Frontend dark dashboard bằng HTML/CSS/JavaScript, kết nối MetaMask qua `ethers.js`.
- Demo local bằng Hardhat, không cần testnet, faucet hoặc tiền thật.

## Công Nghệ

- Solidity `0.8.24`
- Hardhat `2.x`
- ethers.js `6.x`
- MetaMask
- HTML/CSS/JavaScript
- IPFS/Pinata cho chứng từ off-chain

## Cấu Trúc Thư Mục

```text
.
├── contracts/
│   └── CharityMilestoneFund.sol
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   ├── server.mjs
│   └── vendor/
├── scripts/
│   └── deploy-local.js
├── docs/
│   ├── bao_cao_hoan_chinh.md
│   ├── demo_hardhat_local.md
│   ├── thiet_ke_smart_contract.md
│   └── kich_ban_demo.md
├── diagrams/
├── appendix/
├── hardhat.config.js
├── package.json
└── PLAN.md
```

## Cài Đặt

Cài dependency:

```powershell
npm.cmd install
```

Compile contract bằng Hardhat:

```powershell
npm.cmd run hardhat:compile
```

Compile ABI/BIN bằng `solcjs` nếu cần:

```powershell
npm.cmd run compile
```

## Demo Local Bằng Hardhat

### 1. Chạy blockchain local

Mở terminal 1:

```powershell
npm.cmd run node
```

Giữ terminal này mở trong suốt lúc demo. Hardhat sẽ in ra danh sách account test và private key. Đây là ví local, chỉ dùng để demo.

### 2. Thêm network vào MetaMask

Trong MetaMask, thêm network thủ công:

```text
Network name: Hardhat Local
RPC URL: http://localhost:8545
Chain ID: 31337
Currency symbol: ETH
```

Import các private key Hardhat vào MetaMask để dùng làm donor, charity và verifier.

### 3. Deploy contract

Mở terminal 2:

```powershell
npm.cmd run deploy:local
```

Lệnh này sẽ in ra địa chỉ contract:

```text
Contract: 0x...
```

Copy địa chỉ này để dán vào frontend.

### 4. Chạy frontend

Mở terminal 3:

```powershell
npm.cmd run frontend
```

Mở trình duyệt:

```text
http://127.0.0.1:5500
```

Trên giao diện:

1. Bấm `Connect Wallet`.
2. Dán địa chỉ contract vào `Contract Address`.
3. Bấm `Load Contract`.
4. Dùng các tab `Donor`, `Charity`, `Verifier`, `Milestones` để demo.

## Tài Khoản Demo

Script deploy dùng các account Hardhat theo vai trò:

```text
Account #0: Deployer
Account #1: Charity
Account #2: Verifier 1
Account #3: Verifier 2
Account #4: Verifier 3
Account #5: Donor
```

Donor không bị giới hạn trong contract, nên có thể dùng bất kỳ account Hardhat nào có ETH để donate.

## Kịch Bản Demo

### Kịch bản 1: Giải ngân bình thường

1. Chọn ví donor trong MetaMask.
2. Tab `Donor`: donate `0.02 ETH`.
3. Chọn ví charity.
4. Tab `Charity`: submit milestone `0` với CID, ví dụ `ipfs://demo-milestone-0`.
5. Chờ hết challenge period.
6. Tab `Milestones`: release milestone `0`.

Ý nghĩa: nếu không verifier nào phản đối, tiền được giải ngân sau thời gian chờ.

### Kịch bản 2: Có tranh chấp

1. Chọn ví charity.
2. Tab `Charity`: submit milestone `1`.
3. Chọn ví verifier 1.
4. Tab `Verifier`: reject milestone `1` với lý do, ví dụ `Invoice cannot be verified`.
5. Milestone chuyển sang `Disputed`.
6. Verifier 1 vote resolve.
7. Verifier 2 vote resolve.
8. Tab `Milestones`: release milestone `1`.

Ý nghĩa: khi có phản đối, charity không thể nhận tiền ngay; milestone cần 2/3 verifier xử lý tranh chấp.

## IPFS Và Chứng Từ

Trong demo nhanh có thể dùng CID giả lập:

```text
ipfs://demo-milestone-1
```

Khi làm thật:

1. Upload ảnh/hóa đơn/báo cáo lên Pinata hoặc IPFS.
2. Copy CID.
3. Submit trên frontend theo dạng:

```text
ipfs://<CID>
```

Verifier mở file qua gateway:

```text
https://gateway.pinata.cloud/ipfs/<CID>
```

Blockchain không tự xác minh hóa đơn thật hay giả. Verifier kiểm tra chứng từ off-chain, còn blockchain ghi lại CID, reject, vote và release để đảm bảo minh bạch.

## Tài Liệu

- [Báo cáo hoàn chỉnh](docs/bao_cao_hoan_chinh.md)
- [Thiết kế smart contract](docs/thiet_ke_smart_contract.md)
- [Hướng dẫn demo Hardhat local](docs/demo_hardhat_local.md)
- [Kịch bản demo chi tiết](docs/kich_ban_demo.md)
- [Câu hỏi bảo vệ](appendix/huong_dan_bao_ve.md)
- [Flowchart](diagrams/flowchart.md)
- [Sequence diagram](diagrams/sequence.md)

## Các Lệnh Hữu Ích

```powershell
npm.cmd run hardhat:compile
npm.cmd run node
npm.cmd run deploy:local
npm.cmd run frontend
```

## Lỗi Thường Gặp

### MetaMask báo không đủ ETH

Kiểm tra đang ở network `Hardhat Local` và import đúng account Hardhat. Nếu vừa tắt/chạy lại Hardhat node, cần deploy lại contract.

### Frontend báo không tìm thấy contract

Nguyên nhân thường là dán sai địa chỉ hoặc MetaMask đang ở sai network. Chạy lại:

```powershell
npm.cmd run deploy:local
```

Sau đó copy dòng `Contract: 0x...` mới nhất.

### Contract mất dữ liệu sau khi tắt terminal

Hardhat local là blockchain tạm thời. Khi tắt terminal `npm.cmd run node`, state sẽ mất. Chạy node lại thì cần deploy contract lại.

## Ghi Chú Bảo Vệ

Blockchain trong đồ án không được trình bày như công cụ bảo đảm sự thật tuyệt đối. Hạn chế lớn nhất là **Oracle Problem**: blockchain không tự biết chứng từ ngoài đời là thật hay giả.

Giá trị chính của hệ thống là:

- công khai kế hoạch sử dụng tiền trước khi nhận đóng góp;
- giữ tiền trong smart contract thay vì để charity tự rút;
- ghi lại bằng chứng, phản đối, vote và release;
- tăng khả năng truy vết và trách nhiệm giải trình;
- giảm rủi ro thay đổi mục đích sử dụng tiền mà không bị phát hiện.

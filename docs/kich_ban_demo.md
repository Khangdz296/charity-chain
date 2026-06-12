# Kịch bản demo đồ án

## 1. Chuẩn bị tài khoản

Trong Remix VM, chọn ít nhất 5 tài khoản:

- Account 0: deployer hoặc donor;
- Account 1: charity;
- Account 2: verifier 1;
- Account 3: verifier 2;
- Account 4: verifier 3.

## 2. Deploy contract

Deploy `CharityMilestoneFund` với dữ liệu mẫu:

```text
_charity:
Account 1

_verifiers:
[Account 2, Account 3, Account 4]

_amounts:
[1000000000000000000, 1000000000000000000]

_purposes:
["Mua nhu yeu pham dot 1", "Ho tro y te dot 2"]

_challengePeriod:
300
```

Tổng `fundingGoal` sẽ là `2 ETH`.

## 3. Kịch bản A - Giải ngân bình thường

### Bước 1: Donor góp tiền

Chọn Account 0, nhập value `2 ETH`, gọi:

```text
donate()
```

Kiểm tra:

```text
totalDonated()
fundingGoal()
```

Hai giá trị phải bằng nhau.

### Bước 2: Charity submit milestone

Chọn Account 1, gọi:

```text
submitMilestone(0, "ipfs://QmDemoMilestone0")
```

Kiểm tra:

```text
getMilestone(0)
```

Trạng thái trả về là `1`, tương ứng `Submitted`.

### Bước 3: Chờ hết challenge period

Trong Remix VM, có thể đặt `_challengePeriod` nhỏ hơn, ví dụ `30`, để demo nhanh. Nếu dùng `300`, cần chờ đủ thời gian hoặc dùng môi trường test có hỗ trợ tăng thời gian block.

### Bước 4: Release

Sau khi hết challenge period, bất kỳ account nào cũng gọi:

```text
release(0)
```

Kiểm tra:

```text
getMilestone(0)
```

Trạng thái trả về là `4`, tương ứng `Released`.

## 4. Kịch bản B - Có tranh chấp

### Bước 1: Charity submit milestone thứ hai

Chọn Account 1, gọi:

```text
submitMilestone(1, "ipfs://QmDemoMilestone1")
```

### Bước 2: Verifier phản đối

Chọn Account 2, gọi:

```text
reject(1, "Hoa don chua du thong tin xac minh")
```

Kiểm tra:

```text
getMilestone(1)
```

Trạng thái trả về là `2`, tương ứng `Disputed`.

### Bước 3: Hai verifier vote resolve

Chọn Account 2, gọi:

```text
voteResolve(1)
```

Chọn Account 3, gọi:

```text
voteResolve(1)
```

Kiểm tra:

```text
getMilestone(1)
```

Trạng thái trả về là `3`, tương ứng `Approved`.

### Bước 4: Release sau khi resolve

Gọi:

```text
release(1)
```

Trạng thái milestone chuyển thành `Released`.

## 5. Điểm cần nói khi demo

- Contract không cho charity tự rút tiền tùy ý.
- Mỗi milestone phải có bằng chứng IPFS CID.
- Verifier có cửa chặn trước khi tiền được giải ngân.
- Nếu không có phản đối, hệ thống tự động cho phép giải ngân sau challenge period.
- Mọi hành động đều sinh event, phục vụ truy vết và kiểm toán.

## 6. Lỗi thường gặp khi demo

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| `Funding not complete` | Chưa góp đủ `fundingGoal` | Gọi `donate()` đủ tổng milestone |
| `Only charity` | Dùng sai account khi submit | Chọn đúng account charity |
| `Only verifier` | Dùng account không nằm trong danh sách verifier | Chọn Account 2/3/4 |
| `Challenge period ended` | Reject quá muộn | Reject ngay sau khi submit |
| `Not releasable` | Chưa hết challenge period hoặc chưa resolve dispute | Chờ đủ thời gian hoặc vote resolve |
| `Already voted` | Một verifier vote resolve hai lần | Đổi sang verifier khác |

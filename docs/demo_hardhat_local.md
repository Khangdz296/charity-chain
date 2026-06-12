# Demo bang Hardhat local

Day la cach demo de nhat vi khong can Sepolia, khong can faucet va khong mat tien that.

## 1. Chay blockchain local

Mo terminal 1 tai thu muc project:

```powershell
npm.cmd run node
```

Terminal nay se hien danh sach account test va private key. Khong tat terminal nay trong luc demo.

## 2. Them mang localhost vao MetaMask

Trong MetaMask, them network moi:

```text
Network name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency symbol: ETH
```

Chon network `Hardhat Local`.

## 3. Import account test vao MetaMask

Trong terminal Hardhat node, copy private key cua cac account test.

Trong MetaMask:

```text
Account menu -> Import account -> Private key
```

Nen import it nhat 5 account:

- Account 1: Charity
- Account 2: Verifier 1
- Account 3: Verifier 2
- Account 4: Verifier 3
- Account 5: Donor

Day la vi local chi dung de demo. Khong dung cac private key nay tren mainnet.

## 4. Deploy contract len Hardhat local

Mo terminal 2 tai thu muc project:

```powershell
npm.cmd run deploy:local
```

Sau khi deploy, terminal se in:

```text
Contract: 0x...
```

Copy dia chi contract nay.

## 5. Chay frontend

Mo terminal 3:

```powershell
npm.cmd run frontend
```

Mo trinh duyet:

```text
http://127.0.0.1:5500
```

Tren frontend:

1. Bam `Ket noi vi`.
2. Dan dia chi contract vao `Dia chi contract`.
3. Bam `Tai contract`.

## 6. Demo kich ban binh thuong

Chon vi Donor trong MetaMask.

Tab `Donor`:

```text
So ETH dong gop: 0.02
```

Bam `Donate`.

Chon vi Charity.

Tab `Charity`:

```text
Milestone ID: 0
IPFS CID: ipfs://demo-milestone-0
```

Bam `Submit milestone`.

Cho 60 giay.

Tab `Milestones`:

```text
Release ID: 0
```

Bam `Release`.

## 7. Demo kich ban co tranh chap

Chon vi Charity.

Tab `Charity`:

```text
Milestone ID: 1
IPFS CID: ipfs://demo-milestone-1
```

Bam `Submit milestone`.

Chon vi Verifier 1.

Tab `Verifier`:

```text
Milestone ID: 1
Ly do reject: Hoa don chua ro rang
```

Bam `Reject`.

Sau do vote resolve bang 2 verifier:

```text
Verifier 1 -> Vote resolve milestone 1
Verifier 2 -> Vote resolve milestone 1
```

Tab `Milestones`:

```text
Release ID: 1
```

Bam `Release`.

## 8. Loi thuong gap

| Loi | Cach xu ly |
|---|---|
| MetaMask khong thay tien | Kiem tra dang o network Hardhat Local |
| Khong tai duoc contract | Kiem tra dung dia chi contract va node Hardhat con chay |
| `Only charity` | Doi MetaMask sang dung vi Charity |
| `Only verifier` | Doi MetaMask sang dung vi Verifier |
| `Funding not complete` | Donor chua donate du 0.02 ETH |
| `Not releasable` | Chua het 60 giay hoac milestone dang dispute chua du 2 vote |

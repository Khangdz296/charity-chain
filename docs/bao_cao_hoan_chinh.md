# Bao cao do an

## De tai

**Nghien cuu ung dung cong nghe Blockchain nham nang cao tinh minh bach trong quan ly dong tien tu thien**

## Tom tat

Hoat dong tu thien phu thuoc rat lon vao niem tin cua cong dong. Tuy nhien, trong nhieu chien dich, nha hao tam kho kiem tra duoc tien da duoc tiep nhan, phan bo va giai ngan nhu the nao. Cac bao cao truyen thong thuong duoc cong bo sau khi chi tieu da dien ra, chung tu co the bi thieu, bi sua doi hoac kho doi chieu voi ke hoach ban dau.

Do an de xuat mot mo hinh quan ly quy tu thien bang smart contract, trong do tien quyen gop duoc giu trong hop dong thong minh va chi duoc giai ngan theo tung milestone da cong bo truoc. Moi milestone gan voi so tien, muc dich su dung va bang chung thuc hien duoc luu ngoai chuoi bang IPFS. Ba verifier doc lap co quyen phan doi trong challenge period. Neu khong co phan doi, tien duoc giai ngan theo co che optimistic release. Neu co phan doi, milestone chuyen sang trang thai tranh chap va can 2/3 verifier vote resolve truoc khi release.

Giai phap khong khang dinh blockchain co the xac minh su that ngoai doi mot cach tuyet doi. Gia tri chinh cua he thong la minh bach hoa quy trinh, khoa ke hoach chi tieu, tao dau vet bat bien va tang chi phi gian lan/thong dong.

## 1. Mo dau

### 1.1. Ly do chon de tai

Trong cac chien dich tu thien, dong tien thuong di qua nhieu buoc: keu goi, tiep nhan, phan bo, mua sam, trao tang va bao cao. Neu cac buoc nay khong duoc cong khai ro rang, nha hao tam chi co the tin vao loi cong bo cua to chuc thuc hien. Dieu nay tao ra rui ro ve:

- thay doi muc dich su dung tien sau khi da nhan quyen gop;
- cong bo chung tu khong day du;
- giai ngan khong dung tien do;
- kho truy vet trach nhiem khi co tranh chap.

Blockchain co dac tinh phu hop de giam cac rui ro tren: giao dich co the kiem tra cong khai, du lieu da ghi kho bi sua, va smart contract co the giu tien cung nhu tu dong thuc thi dieu kien giai ngan. Vi vay, ung dung blockchain vao quan ly dong tien tu thien la mot huong nghien cuu co gia tri thuc te.

### 1.2. Muc tieu

Do an huong den cac muc tieu:

- thiet ke mo hinh smart contract quan ly quy tu thien theo milestone;
- cong khai ke hoach su dung tien truoc khi donor dong gop;
- ngan charity tu y rut tien neu chua dat dieu kien;
- cho phep verifier doc lap phan doi khi co dau hieu bat thuong;
- luu lai cac hanh dong quan trong tren blockchain;
- xay dung frontend demo ket noi MetaMask va Hardhat Local.

### 1.3. Pham vi

Do an tap trung vao:

- smart contract Solidity;
- frontend web thao tac voi contract;
- demo local bang Hardhat va MetaMask;
- mo ta quy trinh xac minh chung tu bang IPFS.

Cac noi dung nhu eKYC, kiem toan thuc dia, tich hop ngan hang, danh gia phap ly va stake/slashing day du duoc trinh bay o muc huong phat trien.

## 2. Co so ly thuyet

### 2.1. Blockchain

Blockchain la he thong so cai phan tan, trong do giao dich duoc ghi vao cac block va lien ket voi nhau bang ky thuat ma hoa. Dac diem quan trong cua blockchain trong bai toan tu thien la:

- du lieu giao dich co the kiem tra cong khai;
- lich su giao dich kho bi sua doi;
- tai san so co the duoc quan ly bang smart contract;
- moi hanh dong co the gan voi dia chi vi cu the.

### 2.2. Smart contract

Smart contract la chuong trinh chay tren blockchain. Trong do an nay, smart contract dong vai tro nhu mot "ket sat tu dong":

- nhan tien dong gop tu donor;
- luu thong tin milestone;
- nhan IPFS CID bang chung tu charity;
- cho phep verifier reject/vote;
- chi release tien khi dieu kien hop le.

### 2.3. IPFS

IPFS la co che luu tru phan tan dua tren noi dung. Khi upload mot file len IPFS, file do duoc gan mot CID. Neu noi dung file thay doi, CID cung thay doi. Do do, CID co the dung de tham chieu va kiem tra tinh toan ven cua chung tu.

Trong he thong de xuat:

- file lon nhu anh, hoa don, bien ban duoc luu tren IPFS hoac dich vu pinning nhu Pinata;
- smart contract chi luu CID, vi luu file truc tiep on-chain rat ton phi;
- verifier mo CID de xem chung tu va quyet dinh reject hoac khong.

### 2.4. Oracle problem

Oracle problem la han che co huu cua blockchain khi can du lieu ngoai doi. Blockchain co the dam bao rang CID da ghi khong bi sua, nhung khong tu biet hoa don trong CID la that hay gia.

Vi vay, giai phap cua do an khong coi blockchain la cong cu xac minh su that tuyet doi. Blockchain duoc dung de ep quy trinh minh bach, con viec xac minh chung tu van can verifier, kiem toan va doi chieu thuc te.

## 3. Phan tich bai toan

### 3.1. Cac ben tham gia

| Ben tham gia | Vai tro |
|---|---|
| Donor | Dong gop tien va theo doi dong tien |
| Charity | To chuc tu thien thuc hien chien dich va submit bang chung |
| Verifier | Ben kiem tra doc lap, co quyen reject va vote resolve |
| Smart contract | Giu tien, quan ly trang thai milestone va thuc thi dieu kien release |

### 3.2. Yeu cau chuc nang

He thong can co cac chuc nang:

- donor donate ETH vao contract;
- charity submit milestone kem IPFS CID;
- verifier reject trong challenge period;
- verifier vote resolve khi milestone bi dispute;
- bat ky ai co the release khi dieu kien da du;
- frontend hien thi funding goal, tong tien da donate, milestone va trang thai.

### 3.3. Yeu cau phi chuc nang

- Contract can ngan release trung mot milestone.
- Chuyen tien phai theo Checks-Effects-Interactions.
- Vai tro charity/verifier phai duoc kiem soat.
- Bang chung khong nen luu truc tiep on-chain.
- Luong demo phai don gian de trinh bay truoc hoi dong.

## 4. Mo hinh de xuat: Layered Trust Model

### 4.1. Tang 1 - Khung minh bach co dinh

Khi deploy contract, cac thong tin sau duoc khai bao:

- dia chi charity;
- ba verifier;
- danh sach milestone;
- so tien tung milestone;
- muc dich tung milestone;
- challenge period.

Sau khi deploy, donor co the biet truoc tien se duoc dung cho cac muc dich nao.

### 4.2. Tang 2 - Multi-verifier va optimistic release

Quy trinh mot milestone:

1. Charity submit CID bang chung.
2. Challenge period bat dau.
3. Neu verifier thay bat thuong, verifier goi `reject`.
4. Neu het challenge period ma khong co reject, milestone co the release.
5. Neu bi reject, milestone chuyen sang `Disputed`.
6. Can 2/3 verifier vote resolve de chuyen sang `Approved`.
7. Sau khi approved, milestone co the release.

### 4.3. Tang 3 - Stake & Slashing

Trong phien ban mo rong, verifier co the phai dat coc. Neu hau kiem chung minh verifier co tinh bo qua sai pham, tien coc co the bi cat. Co che nay tao dong luc kinh te de verifier lam viec trung thuc hon.

Trong demo, stake/slashing chua duoc code vi can them mot quy trinh xac dinh sai pham ngoai chuoi.

### 4.4. Tang 4 - Hau kiem ngau nhien

Sau khi milestone da release, mot ben kiem toan doc lap co the chon ngau nhien mot so milestone de xac minh thuc dia. Ket qua hau kiem co the duoc cong bo ngoai chuoi va luu hash len blockchain.

### 4.5. Tang 5 - Danh tieng on-chain

Moi hanh dong submit, reject, vote va release gan voi dia chi vi va duoc ghi lai. Neu cac dia chi nay duoc lien ket voi danh tinh that/eKYC, lich su hanh vi se tao ap luc danh tieng dai han.

## 5. Thiet ke smart contract

### 5.1. Cau truc du lieu

Contract `CharityMilestoneFund` su dung enum `MilestoneState`:

| Trang thai | Y nghia |
|---|---|
| `Planned` | Milestone da duoc lap ke hoach |
| `Submitted` | Charity da submit bang chung |
| `Disputed` | Co verifier reject |
| `Approved` | Tranh chap da duoc 2/3 verifier resolve |
| `Released` | Tien da duoc giai ngan |

Moi milestone gom:

- `amount`: so tien milestone;
- `purpose`: muc dich chi tieu;
- `evidenceCID`: IPFS CID bang chung;
- `submittedAt`: thoi diem submit;
- `rejectCount`: so luot reject;
- `resolveVoteCount`: so phieu resolve;
- `state`: trang thai hien tai.

### 5.2. Cac ham chinh

| Ham | Quyen goi | Chuc nang |
|---|---|---|
| `donate()` | Moi dia chi | Dong gop ETH vao quy |
| `submitMilestone()` | Charity | Submit CID bang chung |
| `reject()` | Verifier | Phan doi milestone trong challenge period |
| `voteResolve()` | Verifier | Bo phieu xu ly dispute |
| `release()` | Moi dia chi | Release tien neu du dieu kien |
| `getMilestone()` | Moi dia chi | Doc thong tin milestone |

### 5.3. Dieu kien release

Mot milestone chi duoc release khi:

- chua tung release;
- contract co du so du;
- milestone dang `Submitted` va da het challenge period, hoac milestone dang `Approved`;
- trang thai duoc cap nhat thanh `Released` truoc khi chuyen ETH.

## 6. Thiet ke frontend

Frontend web duoc xay dung bang HTML, CSS va JavaScript, su dung `ethers.js` de ket noi MetaMask.

Giao dien gom cac khu vuc:

- tong quan contract: funding goal, total donated, milestone count;
- thong tin vi: account, balance, charity, verifier role;
- tab Donor: donate ETH;
- tab Charity: submit milestone voi IPFS CID;
- tab Verifier: reject va vote resolve;
- tab Milestones: tai danh sach milestone va release;
- nhat ky thao tac: hien thi ket qua giao dich va loi.

Frontend duoc chay local bang:

```powershell
npm.cmd run frontend
```

Sau do truy cap:

```text
http://127.0.0.1:5500
```

## 7. Demo bang Hardhat Local

### 7.1. Chay blockchain local

Terminal 1:

```powershell
npm.cmd run node
```

Hardhat cung cap cac account test co san ETH gia de demo.

### 7.2. Deploy contract

Terminal 2:

```powershell
npm.cmd run deploy:local
```

Ket qua in ra dia chi contract, vi du:

```text
Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 7.3. Chay frontend

Terminal 3:

```powershell
npm.cmd run frontend
```

Mo frontend va dan dia chi contract vao o `Dia chi contract`.

### 7.4. Kich ban 1 - Giai ngan binh thuong

1. Donor donate `0.02 ETH`.
2. Charity submit milestone `0` voi CID that hoac CID demo.
3. Cho het challenge period.
4. Goi `release(0)`.
5. Milestone chuyen sang `Released`.

### 7.5. Kich ban 2 - Co tranh chap

1. Charity submit milestone `1`.
2. Verifier 1 reject voi ly do `Hoa don chua ro rang`.
3. Milestone chuyen sang `Disputed`.
4. Verifier 1 vote resolve.
5. Verifier 2 vote resolve.
6. Milestone chuyen sang `Approved`.
7. Goi `release(1)`.

## 8. Quy trinh xac minh bang chung IPFS

Trong demo don gian, co the dung CID gia lap nhu:

```text
ipfs://demo-milestone-1
```

Trong demo that, charity upload file len Pinata/IPFS:

1. Tao file chung tu, vi du `milestone_1_report.pdf`.
2. Upload len Pinata voi che do Public.
3. Copy CID.
4. Submit tren frontend:

```text
ipfs://<CID>
```

Verifier mo file bang gateway:

```text
https://gateway.pinata.cloud/ipfs/<CID>
```

Verifier kiem tra:

- hoa don co hop le khong;
- so tien co khop milestone khong;
- anh/bien ban co khop noi dung hoat dong khong;
- danh sach nguoi nhan co bat thuong khong;
- co xac nhan cua dia phuong hoac ben lien quan khong.

Neu thay bat thuong, verifier reject va ly do reject duoc ghi on-chain.

## 9. Danh gia

### 9.1. Uu diem

- Donor co the kiem tra dong tien cong khai.
- Charity khong the tu y rut tien.
- Ke hoach chi tieu duoc co dinh tu luc deploy.
- Moi hanh dong quan trong duoc ghi lai bang event.
- Co co che tranh chap truoc khi giai ngan.
- Frontend giup demo truc quan hon Remix thuan.

### 9.2. Han che

- Blockchain khong tu xac minh duoc chung tu ngoai doi.
- Neu verifier thong dong, he thong van co rui ro.
- Ban demo chua co refund neu khong dat funding goal.
- Ban demo chua co co che thay verifier.
- Du lieu nhay cam tren IPFS can duoc che hoac ma hoa.

### 9.3. Danh doi thiet ke

Thiet ke chon optimistic release de khong lam quy trinh giai ngan bi cham qua muc. Nguong reject 1/3 giup chan nhanh rui ro, nhung cung co the bi verifier lam dung. Vi vay phien ban thuc te can them co che danh tieng, stake/slashing hoac hoi dong xu ly tranh chap ro rang hon.

## 10. Ket luan

Do an da xay dung duoc mot mo hinh ung dung blockchain vao quan ly dong tien tu thien theo milestone. Smart contract giup giu tien, khoa ke hoach su dung, ghi vet bang chung va chi giai ngan khi dieu kien hop le. Frontend web giup cac vai donor, charity va verifier thao tac truc quan voi contract.

Gia tri cot loi cua he thong khong phai la loai bo hoan toan gian lan, ma la chuyen qua trinh tu thien tu "tin vao loi hua" sang "kiem tra duoc quy trinh". Moi submit, reject, vote va release deu de lai dau vet cong khai, qua do tang tinh minh bach va trach nhiem giai trinh.

## 11. Huong phat trien

- Them refund neu chien dich khong dat funding goal.
- Them deadline cho tung milestone.
- Them verifier rotation.
- Them stake & slashing.
- Tich hop upload IPFS truc tiep tren frontend.
- Them trang lich su event on-chain.
- Them ma hoa/phan quyen file IPFS co du lieu ca nhan.
- Ket hop eKYC cho charity va verifier.
- Trien khai len testnet nhu Sepolia khi can demo cong khai.

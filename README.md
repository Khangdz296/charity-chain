# Do an Blockchain: Minh bach dong tien tu thien

De tai: **Nghien cuu ung dung cong nghe Blockchain nham nang cao tinh minh bach trong quan ly dong tien tu thien**.

## Noi dung trong thu muc

- [PLAN.md](PLAN.md): ke hoach ban dau va mo hinh Layered Trust Model.
- [docs/bao_cao_do_an.md](docs/bao_cao_do_an.md): ban thao bao cao do an day du.
- [docs/thiet_ke_smart_contract.md](docs/thiet_ke_smart_contract.md): dac ta thiet ke smart contract.
- [docs/kich_ban_demo.md](docs/kich_ban_demo.md): kich ban thao tac demo tren Remix.
- [docs/demo_hardhat_local.md](docs/demo_hardhat_local.md): huong dan demo bang Hardhat local, MetaMask va frontend.
- [contracts/CharityMilestoneFund.sol](contracts/CharityMilestoneFund.sol): smart contract demo cho mo hinh giai ngan theo milestone.
- [frontend/index.html](frontend/index.html): frontend web ket noi MetaMask de thao tac voi contract.
- [diagrams/flowchart.md](diagrams/flowchart.md): so do luong xu ly milestone bang Mermaid.
- [diagrams/sequence.md](diagrams/sequence.md): sequence diagram cho quy trinh submit, reject, resolve, release.
- [appendix/huong_dan_bao_ve.md](appendix/huong_dan_bao_ve.md): cau hoi bao ve thuong gap va goi y tra loi.

## Pham vi trien khai

Do an tap trung code hai tang chinh:

1. **Khung minh bach co dinh**: muc tieu quy, danh sach milestone, so tien, muc dich va verifier duoc khai bao khi trien khai contract.
2. **Multi-verifier + optimistic release**: to chuc tu thien submit bang chung, verifier co thoi gian phan doi, neu khong co phan doi thi tien duoc giai ngan tu dong; neu co phan doi thi can 2/3 verifier bo phieu xu ly tranh chap.

Tang Stake & Slashing, hau kiem ngau nhien va danh tieng on-chain duoc trinh bay nhu huong mo rong/ho tro ly luan.

## Cach demo nhanh bang Remix

1. Mo <https://remix.ethereum.org>.
2. Tao file `CharityMilestoneFund.sol`.
3. Dan noi dung tu [contracts/CharityMilestoneFund.sol](contracts/CharityMilestoneFund.sol).
4. Compile bang Solidity `0.8.24` hoac moi hon.
5. Deploy voi tham so vi du:
   - `_charity`: dia chi vi to chuc tu thien.
   - `_verifiers`: 3 dia chi vi verifier khac nhau.
   - `_amounts`: `[1000000000000000000, 2000000000000000000]`.
   - `_purposes`: `["Mua nhu yeu pham dot 1", "Ho tro y te dot 2"]`.
   - `_challengePeriod`: `300` de demo nhanh, thay vi 72 gio.
6. Goi `donate()` tu donor cho den khi dat `fundingGoal`.
7. To chuc tu thien goi `submitMilestone(0, "ipfs://...")`.
8. Neu khong co verifier phan doi, cho het challenge period roi goi `release(0)`.
9. Neu verifier goi `reject(0, "...")`, milestone chuyen sang `Disputed`; can 2 verifier goi `voteResolve(0)` roi moi `release(0)`.

## Cach chay frontend

Neu demo local bang Hardhat, xem chi tiet tai [docs/demo_hardhat_local.md](docs/demo_hardhat_local.md).

Chay frontend:

```text
http://127.0.0.1:5500
```

```powershell
npm.cmd run frontend
```

Tren giao dien:

1. Bam `Ket noi vi`.
2. Dan dia chi contract vao o `Dia chi contract`.
3. Bam `Tai contract`.
4. Dung cac tab `Donor`, `Charity`, `Verifier`, `Milestones` de thao tac.

Frontend dung MetaMask va file `frontend/vendor/ethers.umd.min.js` da duoc luu local, nen khong can tai CDN khi mo trang.

## Compile test tren may local

May can co Node.js. Co the compile contract bang:

```powershell
npm.cmd run compile
```

Khi compile thanh cong, thu muc `build/` se co:

- `contracts_CharityMilestoneFund_sol_CharityMilestoneFund.abi`
- `contracts_CharityMilestoneFund_sol_CharityMilestoneFund.bin`

## Test da thuc hien

- `node --check frontend\app.js`: JavaScript hop le ve cu phap.
- `npm.cmd run compile`: Solidity compile thanh cong.

## Ghi chu bao ve

Blockchain trong do an khong duoc trinh bay nhu cong cu bao dam su that tuyet doi. Vai tro chinh cua he thong la:

- cong khai ke hoach su dung tien truoc khi nhan dong gop;
- tao dau vet bat bien cho tung quyet dinh;
- giam kha nang tu y thay doi muc dich su dung;
- tang chi phi va rui ro danh tieng khi co hanh vi thong dong;
- ho tro kiem toan/hau kiem bang du lieu co the truy vet.

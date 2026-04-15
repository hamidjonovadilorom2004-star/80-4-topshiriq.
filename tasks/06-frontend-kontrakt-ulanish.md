# 6-Topshiriq: Frontendni kontrakt bilan bog'lash (ethers.js)

## Ulanish texnikasi

- `ethers.BrowserProvider(window.ethereum)` orqali wallet provider.
- `new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)` orqali kontrakt instance.

## Bajarilgan funksional ulanishlar

1. `connectWallet()`:
- MetaMask account so'raydi.
- Tarmoqni Sepolia ekanini tekshiradi.

2. `refreshDashboard()`:
- `mintFee`, `tokenCounter`, `proposalCounter` qiymatlarini o'qiydi.

3. Write tranzaksiyalar:
- `mintNFT`
- `updateTokenURI`
- `burnNFT`
- `createProposal`
- `updateProposal`
- `deleteProposal`
- `vote`
- `executeProposal`

4. Read:
- `getProposal` orqali proposal listni ekranga chiqaradi.

## Qo'shimcha UX
- Toast xabarlar (success/error).
- Account yoki chain almashsa page auto refresh.

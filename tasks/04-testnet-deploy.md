# 4-Topshiriq: Kontraktni testnetga deploy qilish

## Tayyorlangan fayllar
- `hardhat.config.js`
- `.env.example`
- `scripts/deploy.js`

## Deploy komandasi

```bash
npm run deploy:sepolia
```

## Kerakli .env qiymatlari

```env
SEPOLIA_RPC_URL=<RPC_URL>
PRIVATE_KEY=<WALLET_PRIVATE_KEY>
ETHERSCAN_API_KEY=<API_KEY>
```

## Natijani saqlash formati

Deploy bo'lgach quyidagilarni shu faylga qo'shing:

- `Network`: Sepolia
- `Contract Address`: ...
- `Tx Hash`: ...
- `Explorer URL`: https://sepolia.etherscan.io/address/...

## Eslatma
Deploydan keyin `frontend/config.js` ichidagi `CONTRACT_ADDRESS` yangilanadi.

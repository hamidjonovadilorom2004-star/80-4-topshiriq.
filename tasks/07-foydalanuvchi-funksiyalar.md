# 7-Topshiriq: Foydalanuvchi uchun asosiy funksiyalar (CRUD va vote)

## NFT CRUD

1. Create: `mintNFT(to, uri)`
2. Update: `updateTokenURI(tokenId, newURI)`
3. Delete: `burnNFT(tokenId)`

## Proposal CRUD

1. Create: `createProposal(title, description, durationMinutes)`
2. Update: `updateProposal(proposalId, newTitle, newDescription)`
3. Delete: `deleteProposal(proposalId)`
4. Read: `getProposal(proposalId)` + frontend list render

## Vote funksiyasi

- `vote(proposalId, support)`:
  - Faqat NFT egasi vote qila oladi.
  - Har wallet har proposalga 1 marta vote beradi.
  - Ovoz og'irligi = foydalanuvchining NFT balansi.

- `executeProposal(proposalId)`:
  - Deadline tugagach natijani yakunlaydi.

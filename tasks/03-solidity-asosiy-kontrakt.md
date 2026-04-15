# 3-Topshiriq: Solidity'da asosiy kontrakt

## Bajarilgan ish
Asosiy kontrakt `contracts/NFTVoteHub.sol` faylida yozildi.

## Kontrakt ichidagi funksiyalar

1. NFT:
- `mintNFT`
- `updateTokenURI`
- `burnNFT`

2. Proposal CRUD:
- `createProposal`
- `updateProposal`
- `deleteProposal`

3. Vote:
- `vote`
- `executeProposal`
- `getProposal`

4. Admin:
- `setMintFee`
- `withdraw`

## Eventlar

- `NFTMinted`
- `NFTURIUpdated`
- `NFTBurned`
- `ProposalCreated`
- `ProposalUpdated`
- `ProposalDeleted`
- `VoteCast`
- `ProposalExecuted`

## Izoh
Kontrakt frontend uchun to'liq tayyor holatda yozilgan.

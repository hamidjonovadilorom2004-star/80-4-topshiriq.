# 2-Topshiriq: Smart-kontrakt arxitekturasi

## Kontrakt nomi
`NFTVoteHub`

## Asosiy modullar

1. NFT moduli (ERC721URIStorage):
- `mintNFT(to, uri)` — NFT yaratish.
- `updateTokenURI(tokenId, newURI)` — metadata yangilash.
- `burnNFT(tokenId)` — NFT yo'q qilish.

2. Voting moduli:
- `createProposal(title, description, durationMinutes)` — proposal yaratish.
- `updateProposal(proposalId, newTitle, newDescription)` — proposal tahrirlash.
- `deleteProposal(proposalId)` — proposalni inactive qilish.
- `vote(proposalId, support)` — NFT balansiga qarab ovoz berish.
- `executeProposal(proposalId)` — deadline tugagach natijani yakunlash.

3. Admin moduli:
- `setMintFee(newMintFee)` — mint to'lovini boshqarish.
- `withdraw(to)` — to'plangan ETH ni chiqarish.

## Ma'lumotlar strukturalari

- `tokenCounter` — NFT ID hisoblagich.
- `proposalCounter` — proposal ID hisoblagich.
- `mapping(uint256 => Proposal)` — proposal saqlash.
- `mapping(uint256 => mapping(address => bool)) hasVoted` — bir address bir proposalga bitta ovoz.

## Xavfsizlik qoidalari

- NFT update/burn faqat owner yoki approved address uchun.
- Vote qilish uchun userda kamida 1 ta NFT bo'lishi kerak.
- Proposal update/delete faqat creator uchun.
- Proposal execute faqat deadline tugagandan keyin.

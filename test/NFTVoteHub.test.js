const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTVoteHub", function () {
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("NFTVoteHub");
    const contract = await Contract.deploy();
    await contract.waitForDeployment();
    return { contract, owner, alice, bob };
  }

  it("NFT mint qiladi", async function () {
    const { contract, alice } = await deployFixture();
    const fee = await contract.mintFee();

    await expect(
      contract.connect(alice).mintNFT(alice.address, "ipfs://nft-1", { value: fee })
    ).to.emit(contract, "NFTMinted");

    expect(await contract.ownerOf(1)).to.equal(alice.address);
    expect(await contract.tokenURI(1)).to.equal("ipfs://nft-1");
  });

  it("faqat owner/approved tokenURI ni yangilay oladi", async function () {
    const { contract, alice, bob } = await deployFixture();
    const fee = await contract.mintFee();
    await contract.connect(alice).mintNFT(alice.address, "ipfs://old", { value: fee });

    await expect(contract.connect(bob).updateTokenURI(1, "ipfs://new")).to.be.revertedWith(
      "Not owner nor approved"
    );

    await contract.connect(alice).updateTokenURI(1, "ipfs://new");
    expect(await contract.tokenURI(1)).to.equal("ipfs://new");
  });

  it("proposal CRUD va vote ishlaydi", async function () {
    const { contract, alice, bob } = await deployFixture();
    const fee = await contract.mintFee();

    await contract.connect(alice).mintNFT(alice.address, "ipfs://alice", { value: fee });
    await contract.connect(bob).mintNFT(bob.address, "ipfs://bob", { value: fee });

    await contract.connect(alice).createProposal("Logo update", "Yangi logoni qabul qilish", 30);
    await contract
      .connect(alice)
      .updateProposal(1, "Logo update v2", "Yangi logoni variant B bilan qabul qilish");

    const proposal = await contract.getProposal(1);
    expect(proposal[0]).to.equal("Logo update v2");

    await contract.connect(alice).vote(1, true);
    await contract.connect(bob).vote(1, false);

    await expect(contract.connect(alice).deleteProposal(1)).to.be.revertedWith("Already voted");
  });

  it("NFT bo'lmasa vote qila olmaydi", async function () {
    const { contract, alice, bob } = await deployFixture();
    const fee = await contract.mintFee();

    await contract.connect(alice).mintNFT(alice.address, "ipfs://alice", { value: fee });
    await contract.connect(alice).createProposal("Proposal", "Test", 10);

    await expect(contract.connect(bob).vote(1, true)).to.be.revertedWith("Need NFT to vote");
  });
});

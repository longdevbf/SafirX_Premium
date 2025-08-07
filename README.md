<p align="center">
  <img src="https://github.com/user-attachments/assets/bfcfdc1a-6a64-4fb1-802a-bae7dbff26b4" alt="SafirX Logo" width="150"/>
</p>


# SafirX - Private NFT Marketplace on Oasis Sapphire

---
🔧 Features
✅ Mint single NFT

✅ Mint NFT collection

✅ Private auction for single NFTs

✅ Private auction for NFT collections

✅ Public NFT marketplace where:

Users can buy/sell NFTs.

Sellers can update prices or cancel listings.

✅ Private Auction Mode:

Real-time updates.

All bids are encrypted using Oasis Sapphire — other users can't see them.

When the auction ends, anyone can finalize the result.

The winner receives the NFT.

Others get refunded automatically.

If all bids are lower than the reverse price, no one wins.

If the seller chose to make bid history public after the auction, users can view auction details post-completion.

----

## 🚀 Getting Started
Link Project: https://safir-x.vercel.app/<br>
Link Contract: https://github.com/longdevbf/SafirX-Contract<br>
To clone and run the project locally:

```bash
git clone https://github.com/longdevbf/SafirX
cd SafirX
npm install
npm run dev
.
```
----

And you need to create an env file as follows
.env
```bash
NEXT_PUBLIC_JWT=`Your_JWT`
GATEWAY=`Your_Pinata_GateWay`
DATABASE_URL=`Your_Database_Url`
PROJECT_ID='Your_Project_ID`  
GOOGLE_DRIVE_CLIENT_EMAIL=`Your_Drivee_Client_Email`
GOOGLE_DRIVE_PRIVATE_KEY=`Your_Drive_Pivate_Key`
GOOGLE_DRIVE_FOLDER_ID=`Your_Drive_Folder_Id`
```



// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./SafeMath.sol";

contract AssetContract {
    using SafeMath for uint256;

    address payable public admin;

    struct Asset {
        address payable owner;
        address rentedTo;
        string jsonHash;
        string photoHash;
        bool forRent;
        bool forSale;
        uint256 salePrice;
        uint256 rentPrice;
    }

    modifier isAdmin() {
        require(admin == msg.sender, "Admin only");
        _;
    }

    modifier isOwner(uint256 _assetId) {
        require(assets[_assetId].owner == msg.sender, "Only for asset owner");
        _;
    }

    Asset[] public assets;
    mapping(address => uint256) public ownerAssetCount;
    mapping(address => uint256) public balanceOf;
    mapping(address => uint256) public tenantAssetCount;
    mapping(uint256 => uint256) public tenancyExpiry;

    uint256 public sellableCount;
    uint256 public rentableCount;

    constructor() payable {
        admin = payable(msg.sender);
    }

    function assetsCount() public view returns (uint256) {
        return assets.length;
    }

    function createAsset(string memory _jsonHash, string memory _photoHash)
        public
        isAdmin
        returns (uint256)
    {
        Asset memory newAsset = Asset(
            payable(msg.sender),
            msg.sender,
            _jsonHash,
            _photoHash,
            false,
            false,
            0,
            0
        );
        assets.push(newAsset);
        uint256 assetId = assets.length - 1;
        ownerAssetCount[msg.sender]++;
        tenantAssetCount[msg.sender]++;

        return assetId;
    }

    function simulateExpiry(uint256 _assetId) public isOwner(_assetId) {
        tenancyExpiry[_assetId] = 0;
    }

    function updateAsset(
        uint256 _assetId,
        string memory _jsonHash,
        string memory _photoHash
    ) public isOwner(_assetId) {
        assets[_assetId].jsonHash = _jsonHash;
        assets[_assetId].photoHash = _photoHash;
    }

    function putOnSale(uint256 _assetId, uint256 _price)
        public
        isOwner(_assetId)
    {
        assets[_assetId].salePrice = _price;
        assets[_assetId].forSale = true;
        sellableCount++;
    }

    function putOnRent(uint256 _assetId, uint256 _price)
        public
        isOwner(_assetId)
    {
        require(
            msg.sender == assets[_assetId].rentedTo,
            "You have rented out this asset."
        );
        assets[_assetId].rentPrice = _price;
        assets[_assetId].forRent = true;
        rentableCount++;
    }

    function putOffSale(uint256 _assetId) public isOwner(_assetId) {
        require(assets[_assetId].forSale, "This asset is not for sale");
        assets[_assetId].salePrice = 0;
        assets[_assetId].forSale = false;
        sellableCount--;
    }

    function putOffRent(uint256 _assetId) public isOwner(_assetId) {
        assets[_assetId].rentPrice = 0;
        assets[_assetId].forRent = false;
        rentableCount--;
    }

    function removeTenant(uint256 _assetId) public isOwner(_assetId) {
        require(
            tenancyExpiry[_assetId] <= block.timestamp,
            "Tenancy agreement terms (30 secs tenancy) not met."
        );
        _removeTenant(_assetId);
    }

    function buyAsset(uint256 _assetId) external payable {
        require(assets[_assetId].forSale, "This asset is not for sale");
        require(
            msg.value >= assets[_assetId].salePrice,
            "Amount paid is not up to sale price"
        );
        require(
            msg.sender != assets[_assetId].owner,
            "You cannot buy your own asset.Put it off sale instead."
        );

        assets[_assetId].forSale = false;
        assets[_assetId].salePrice = 0;
        ownerAssetCount[assets[_assetId].owner]--;
        balanceOf[assets[_assetId].owner] += msg.value;
        if (assets[_assetId].rentedTo == msg.sender) {
            _removeTenant(_assetId);
            assets[_assetId].rentedTo = msg.sender;
        }
        if (assets[_assetId].owner == assets[_assetId].rentedTo) {
            assets[_assetId].rentedTo = msg.sender;
        }
        assets[_assetId].owner = payable(msg.sender);
        ownerAssetCount[assets[_assetId].owner]++;
        sellableCount--;
    }

    function rentAsset(uint256 _assetId) external payable {
        require(assets[_assetId].forRent, "This asset is not for rent.");
        require(
            msg.value >= assets[_assetId].rentPrice,
            "Amount paid is not up to rent price."
        );

        require(
            msg.sender != assets[_assetId].owner,
            "You cannot rent your own asset. Put it off rent instead."
        );
        assets[_assetId].forRent = false;
        assets[_assetId].rentPrice = 0;
        assets[_assetId].rentedTo = msg.sender;
        balanceOf[assets[_assetId].owner] += msg.value;
        tenantAssetCount[msg.sender]++;
        tenancyExpiry[_assetId] = block.timestamp + 30;
        rentableCount--;
    }

    function getRentableAssets() public view returns (uint256[] memory) {
        uint256[] memory assetIds = new uint256[](rentableCount);
        uint256 counter = 0;
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i].forRent) {
                assetIds[counter] = i;
                counter++;
            }
        }
        return assetIds;
    }

    function getSellableAssets() public view returns (uint256[] memory) {
        uint256[] memory assetIds = new uint256[](sellableCount);
        uint256 counter = 0;
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i].forSale) {
                assetIds[counter] = i;
                counter++;
            }
        }
        return assetIds;
    }

    function getAssetsByOwner(address _address)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory assetIds = new uint256[](ownerAssetCount[_address]);
        uint256 counter = 0;
        for (uint256 i = 0; i < assets.length; i++) {
            if (assets[i].owner == _address) {
                assetIds[counter] = i;
                counter++;
            }
        }
        return assetIds;
    }

    function getRentedAssetsByTenant(address _address)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory assetIds = new uint256[](tenantAssetCount[_address]);
        uint256 counter = 0;
        for (uint256 i = 0; i < assets.length; i++) {
            if (
                assets[i].rentedTo == _address &&
                assets[i].rentedTo != assets[i].owner
            ) {
                assetIds[counter] = i;
                counter++;
            }
        }
        return assetIds;
    }

    function expired(uint256 _assetId) public view returns (bool) {
        return tenancyExpiry[_assetId] <= block.timestamp;
    }

    function withdraw() public {
        payable(msg.sender).transfer(balanceOf[msg.sender]);
        balanceOf[msg.sender] = 0;
    }

    function _removeTenant(uint256 _assetId) private {
        tenancyExpiry[_assetId] = 0;
        tenantAssetCount[assets[_assetId].rentedTo]--;
        assets[_assetId].rentedTo = assets[_assetId].owner;
    }
}

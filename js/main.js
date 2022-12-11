async function addAsset(e) {
    e.preventDefault();
    asset_name = $("#asset_name").val().trim();
    asset_description = $("#asset_description").val().trim();
    $("#add_asset_btn").attr('disabled', true);
    var asset_image;
    var asset_json;

    if (asset_name == "") {
        toastr.error("Name is required.");
        return false;
    }

    if (asset_description == "") {
        toastr.error("Description is required.");
        return false;
    }

    if ($("#asset_file")[0].files.length > 0) {
        file = $("#asset_file")[0].files[0];
        reader = new window.FileReader()
        reader.onloadend = async () => {
            asset_image = reader.result;

            jsonArray = JSON.stringify({
                name: asset_name,
                description: asset_description
            });
            jsonFile = new File([jsonArray], 'file.json')
            reader1 = new window.FileReader()
            reader1.readAsArrayBuffer(jsonFile);
            reader1.onloadend = async () => {
                asset_json = reader1.result;

                asset_ob = await ipfs.add(asset_image);
                json_ob = await ipfs.add(asset_json);

                instance.createAsset(json_ob.path, asset_ob.path, { from: account }).then(() => {
                    toastr.success("This asset has been added successfully");
                    $("#asset_name").val("")
                    $("#asset_description").val("")
                    $("#asset_file").val("")
                    $("#add_asset_btn").attr('disabled', false);
                }).catch(err => {
                    $("#add_asset_btn").attr('disabled', false);
                    toastr.error(err.message);
                });
            }

        }
        reader.readAsArrayBuffer(file);
    } else {
        toastr.error("No image file detected");
        return false;
    }
}

async function myAssets() {
    $("#tab-1").addClass('bg-blue-50');
    $("#tab-2").removeClass('bg-blue-50');
    $("#assets").html('<div class="text-center col-span-full">Loading...</div>');
    await instance.getAssetsByOwner(account).then(async (res) => {
        if (res.length < 1) {
            $("#assets").html('<div class="text-center col-span-full">You don\'t own any asset.</div>');
            return false;
        }
        $("#assets").html('');
        count = 0;
        for (asset_id of res) {
            await instance.assets(asset_id).then((res) => {
                json = fetch(`https://cloudflare-ipfs.com/ipfs/${res.jsonHash}`)
                    .then((response) => response.json())
                    .then(async (json) => {
                        let name = json.name;
                        let desc = json.description;
                        await instance.expired(asset_id).then((expired) => {
                            console.log(res);
                            sim = "";
                            if (!expired && !res.forRent) {
                                sim = `<div class="mb-3">
                                <button onclick="simulateExpired(${asset_id})">Simulate Tenancy Expiry</button>
                            </div>`;
                                btn = `<button type="submit" class="w-1/2 block text-white bg-blue-700 opacity-70 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" disabled="true">Occupied</button>`;
                            } else if (expired && !res.forRent && res.owner != res.rentedTo) {
                                btn = `<button type="submit" class="w-1/2 block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" onclick="removeTenant(${asset_id})">Remove Tenant</button>`;
                            } else if (res.forRent) {
                                btn = `<button type="submit" class="w-1/2 block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" onclick="putOffRent(${asset_id})">Cancel Rent</button>`;
                            } else if (!res.forRent) {
                                btn = `<button type="submit" class="w-1/2 block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" onclick="putForRent(${asset_id})">Rent Out</button>`;
                            }
                            $("#assets").append(`
                                <div class="max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md">
                                    <div class="h-[200px] max-h-[200px] block overflow-hidden p-2">
                                        <div class="h-full w-full border overflow-hidden rounded-2xl ">
                                            <img class="w-full" src="https://cloudflare-ipfs.com/ipfs/${res.photoHash}" alt="" />
                                        </div>
                                    </div>
                                    <div class="p-3">
                                        <p>
                                            <h5 class="mb-2 text-lg font-bold tracking-tight text-gray-900">${name}</h5>
                                        </p>
                                        <p class="mb-3 font-normal text-gray-700 text-sm">${desc}</p>
                                    </div>
                                    <div class="px-3">
                                    ${sim}
                                    <div class="mb-3">
                                        <input type="text" placeholder="Price in ETH" id="price-${asset_id}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                                    </div>
                                    <div class="flex mb-3 gap-2">
                                            ${btn}
                                            ${res.forSale ? `<button type="submit" class="w-1/2 block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" onclick="putOffSale(${asset_id})">Cancel Sale</button>`
                                    : `<button type="submit" class="w-1/2 block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" onclick="putForSale(${asset_id})">Sell</button>`}
                                    </div>
                                    </div>
                                </div>
                                `);
                            count++
                        });

                    });
            })
        }
    }).catch(error => {
        console.log(error);
    });
}

async function adminAssets() {
    if (account.toUpperCase() !== admin.toUpperCase()) {
        $("#assets").html('<div class="text-center font-bold text-xl col-span-full">This page is for admin only</div>');
        return false;
    }
    $("#tab-1").addClass('bg-blue-50');
    $("#tab-2").removeClass('bg-blue-50');
    $("#assets").html('<div class="text-center col-span-full">Loading...</div>');
    await instance.getAssetsByOwner(account).then(async (res) => {
        if (res.length < 1) {
            $("#assets").html('<div class="text-center pt-3 col-span-full">No asset to manage.</div>');
            return false;
        }
        $("#assets").html('');
        for (let asset_id of res) {
            await instance.assets(asset_id).then((res) => {
                json = fetch(`https://cloudflare-ipfs.com/ipfs/${res.jsonHash}`)
                    .then((response) => response.json())
                    .then(async (json) => {
                        let name = json.name;
                        let desc = json.description;

                        $("#assets").append(`
                            <div class="max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md">
                                <div class="h-[200px] max-h-[200px] block overflow-hidden p-2">
                                    <div class="h-full w-full border overflow-hidden rounded-2xl ">
                                        <img class="w-full" src="https://cloudflare-ipfs.com/ipfs/${res.photoHash}" alt="" />
                                    </div>
                                </div>
                                <div class="p-3">
                                    <p>
                                        <h5 class="mb-2 text-lg font-bold tracking-tight text-gray-900">${name}</h5>
                                    </p>
                                    <p class="mb-3 font-normal text-gray-700 text-sm">${desc}</p>
                                </div>
                                <div class="px-3">
                                    <div class="mb-3">
                                        <input type="text" placeholder="Price in ETH" id="price-${asset_id}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required>
                                    </div>
                                    <div class="flex mb-3 gap-2">
                                        ${res.forRent ? `<button type="submit" class="w-1/2 block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" onclick="putOffRent(${asset_id})">Cancel Rent</button>`
                                : `<button type="submit" class="w-1/2 block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" onclick="putForRent(${asset_id})">Rent Out</button>`}
                                        ${res.forSale ? `<button type="submit" class="w-1/2 block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" onclick="putOffSale(${asset_id})">Cancel Sale</button>`
                                : `<button type="submit" class="w-1/2 block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" onclick="putForSale(${asset_id})">Sell</button>`}
                                    </div>
                                </div>
                            </div>
                            `);
                    });
            })
        }
    }).catch(error => {
        console.log(error);
    });
}

async function myRentedAssets() {
    $("#tab-2").addClass('bg-blue-50');
    $("#tab-1").removeClass('bg-blue-50');
    $("#assets").html('<div class="text-center col-span-full">Loading...</div>');
    await instance.getRentedAssetsByTenant(account).then(async (res) => {
        if (res.length < 1) {
            $("#assets").html('<div class="text-center col-span-full">You have not rented any asset.</div>');
            return false;
        }
        count = 0;
        for (let asset_id of res) {
            $("#assets").html('<div class="text-center col-span-full">You have not rented any asset.</div>');
            await instance.assets(asset_id).then((res) => {
                if (res.rentedTo.toUpperCase() == account.toUpperCase()) {
                    if (count == 0) {
                        $("#assets").html("");
                    }
                    json = fetch(`https://cloudflare-ipfs.com/ipfs/${res.jsonHash}`)
                        .then((response) => response.json())
                        .then(async (json) => {
                            let name = json.name;
                            let desc = json.description;

                            $("#assets").append(`
                            <div class="max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md">
                                <div class="h-[300px] max-h-[200px] block overflow-hidden p-2">
                                    <div class="h-full w-full border overflow-hidden rounded-2xl ">
                                        <img class="w-full" src="https://cloudflare-ipfs.com/ipfs/${res.photoHash}" alt="" />
                                    </div>
                                </div>
                                <div class="p-3">
                                    <p>
                                        <h5 class="mb-2 text-lg font-bold tracking-tight text-gray-900">${name}</h5>
                                    </p>
                                    <p class="mb-3 font-normal text-gray-700 text-sm">${desc}</p>
                                </div>
                            </div>
                            `);

                        });
                    count++
                }
            });
        }
    }).catch(error => {
        console.log(error);
    });
}

async function getAllSellables() {
    $("#tab-1").addClass('bg-blue-50');
    $("#tab-2").removeClass('bg-blue-50');
    $("#assets").html('<div class="text-center col-span-full">Loading...</div>');
    await instance.getSellableAssets().then(async (res) => {
        if (res.length < 1) {
            $("#assets").html('<div class="text-center col-span-full">No asset available for sale.</div>');
            return false;
        }
        $("#assets").html('');
        for (asset_id of res) {
            await instance.assets(asset_id).then((res) => {
                if (res.owner != account) {
                    json = fetch(`https://cloudflare-ipfs.com/ipfs/${res.jsonHash}`)
                        .then((response) => response.json())
                        .then(async (json) => {
                            let name = json.name;
                            let desc = json.description;
                            $("#assets").append(`
                            <div class="max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md">
                                <span class="h-[200px] max-h-[200px] block overflow-hidden p-3">
                                    <div class="h-full w-full border overflow-hidden rounded-2xl ">
                                        <img class="w-full" src="https://cloudflare-ipfs.com/ipfs/${res.photoHash}" alt="" />
                                    </div>
                                </span>
                                <div class="p-3">
                                    <span>
                                        <h5 class="mb-2 text-lg font-bold tracking-tight text-gray-900">${name}</h5>
                                    </span>
                                    <p class="mb-2 font-normal text-gray-700 text-sm"><span class="font-bold">Price: </span>${web3.utils.fromWei(res.salePrice.toString(), "ether")} ETH</p>
                                    <p class="mb-3 font-normal text-gray-700 text-sm">${desc}</p>
                                    <p><span class="></span></p>
                                    <div class="">
                                        <button onclick="buyAsset(${asset_id}, ${res.salePrice})" class="font-bold items-center px-6 py-2 text-sm text-center text-white bg-blue-700 rounded-xl hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
                                        <i class="uil uil-wallet"></i> Buy
                                        </button>
                                    </div>
                                </div>
                            </div>
                            `);
                        });
                }
            })
        }
    }).catch(error => {
        console.log(error);
    });
}

async function getAllRentables() {
    $("#tab-2").addClass('bg-blue-50');
    $("#tab-1").removeClass('bg-blue-50');
    $("#assets").html('<div class="text-center col-span-full">Loading...</div>');
    await instance.getRentableAssets().then(async (res) => {
        if (res.length < 1) {
            $("#assets").html('<div class="text-center col-span-full">No asset available for rent.</div>');
            return false;
        }
        $("#assets").html('');
        for (asset_id of res) {
            if (res.owner != account) {
                await instance.assets(asset_id).then((res) => {
                    json = fetch(`https://cloudflare-ipfs.com/ipfs/${res.jsonHash}`)
                        .then((response) => response.json())
                        .then(async (json) => {
                            let name = json.name;
                            let desc = json.description;
                            $("#assets").append(`
                            <div class="max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md">
                                <span class="h-[200px] max-h-[200px] block overflow-hidden p-2">
                                    <div class="h-full w-full border overflow-hidden rounded-2xl ">
                                        <img class="w-full" src="https://cloudflare-ipfs.com/ipfs/${res.photoHash}" alt="" />
                                    </div>
                                </span>
                                <div class="p-3">
                                    <span>
                                        <h5 class="mb-2 text-lg font-bold tracking-tight text-gray-900">${name}</h5>
                                    </span>
                                    <p class="mb-2 font-normal text-gray-700 text-sm"><span class="font-bold">Price: </span>${web3.utils.fromWei(res.rentPrice.toString(), "ether")} ETH</p>
                                    <p class="mb-3 font-normal text-gray-700 text-sm">${desc}</p>
                                    <div class="">
                                    <button onclick="rentAsset(${asset_id}, ${res.rentPrice})" class="font-bold items-center px-6 py-2 text-sm text-center text-white bg-blue-700 rounded-xl hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
                                    <i class="uil uil-wallet"></i> Rent
                                    </button>
                                    </div>
                                </div>
                            </div>
                            `);
                        });
                });
            }
        }
    }).catch(error => {
        console.log(error);
    });
}

async function buyAsset(asset, price) {
    instance.buyAsset(asset, { from: account, value: price }).then(() => {
        toastr.success("You have bought this asset.")
        setTimeout(() => window.location.reload(), 500);
    }).catch(err => {
        if (err.message.includes('This asset is not for sale')) {
            toastr.error("This asset is not for sale.");
        }
        else if (err.message.includes('Amount paid is not up to sale price')) {
            toastr.error("Not enough funds to buy this asset.");
        }
        else if (err.message.includes('You cannot buy your own asset.Put it off sale instead.')) {
            toastr.error("You cannot buy your own asset. Put it off sale instead.");
        } else {
            toastr.error("Couldn't complete the sale..");
        }
    })
}

async function rentAsset(asset, price) {
    instance.rentAsset(asset, { from: account, value: price }).then(() => {
        toastr.success("You have rented this asset.")
        setTimeout(() => window.location.reload(), 500);
    }).catch(err => {
        if (err.message.includes('This asset is not for rent.')) {
            toastr.error("This asset is not for rent.");
        }
        else if (err.message.includes('Amount paid is not up to rent price.')) {
            toastr.error("Not enough funds to rent this asset.");
        }
        else if (err.message.includes('You cannot rent your own asset. Put it off rent instead.')) {
            toastr.error("You cannot rent your own asset. Put it off rent instead.");
        } else {
            toastr.error("Couldn't complete the rent..");
        }
    })
}

async function putForRent(asset) {
    price = $("#price-" + asset).val().trim();
    console.log($("#price-" + asset));
    if (price == "") {
        toastr.error("Price is required");
        return;
    }

    instance.putOnRent(asset, web3.utils.toWei(price, "ether"), { from: account }).then(() => {
        toastr.success("Successfully placed on rent");
        price = $("#price-" + asset).val('');

        setTimeout(() => window.location.reload(), 500);
    }).catch(() => toastr.error("An error occurred"))
}


async function putForSale(asset) {
    price = $("#price-" + asset).val().trim();
    console.log($("#price-" + asset));
    if (price == "") {
        toastr.error("Price is required");
        return;
    }


    instance.putOnSale(asset, web3.utils.toWei(price, "ether"), { from: account }).then(() => {
        toastr.success("Successfully placed on sale");
        price = $("#price").val('');

        setTimeout(() => window.location.reload(), 500);
    }).catch(() => toastr.error("An error occurred"))
}


async function putOffRent(asset) {
    instance.putOffRent(asset, { from: account }).then(() => {
        toastr.success("Successfully cancelled renting out.");

        setTimeout(() => window.location.reload(), 500);
    }).catch(() => toastr.error("An error occurred"))
}

async function removeTenant(asset) {
    instance.removeTenant(asset, { from: account }).then(() => {
        toastr.success("Successfully cancelled renting out.");

        setTimeout(() => window.location.reload(), 500);
    }).catch(() => toastr.error("An error occurred"))
}

async function putOffSale(asset) {
    instance.putOffSale(asset, { from: account }).then(() => {
        toastr.success("Successfully cancelled selling out.");

        setTimeout(() => window.location.reload(), 500);
    }).catch(() => toastr.error("An error occurred"));
}


async function withdraw(bal) {
    if (!bal > 0) {
        toastr.error("Can't withdraw zero balance");
        return;
    }
    await instance.withdraw({ from: account }).then(() => {
        toastr.success("Withdraw successful.");

        setTimeout(() => window.location.reload(), 500);
    }).catch(() => toastr.error("An error occurred"));
}

async function simulateExpired(asset) {
    await instance.simulateExpiry(asset, { from: account }).then(() => {
        toastr.success("Simulation complete.");

        setTimeout(() => window.location.reload(), 500);
    }).catch(() => toastr.error("An error occurred"));
}

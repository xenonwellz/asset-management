var instance, Contract, account, provider, http_host = 'http://127.0.0.1:7545', ipfs, admin;

eventt = new Event("web3-loaded");
window.addEventListener('load', connect());

async function loadWeb3() {

    fetch('/resources/artifacts/AssetContract.json')
        .then((response) => response.json())
        .then(async (json) => {

            Contract = TruffleContract(json);
            Contract.setProvider(provider);
            web3 = new Web3(provider);
            await Contract.deployed().then(async (i) => {
                instance = i;


                $("#connect").html(`<div class="bg-green-500 font-bold cursor-pointer inline-block px-4 py-2 mx-2 my-2 text-white rounded-full text-sm">
                    Connected as: ${account}
                    </div> 
                `);

                instance.balanceOf(account).then(res => {
                    html = `<button class="bg-blue-200 rounded-full my-2 px-4 inline-flex items-center" onclick="withdraw(${web3.utils.fromWei(res.toString(), 'ether')})">
                    <span class="font-bold pr-2 text-blue-800">Withdraw: </span>
                    <svg height="16px" viewBox="0 0 256 417" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid">
                        <g>
                            <polygon fill="#343434" points="127.9611 0 125.1661 9.5 125.1661 285.168 127.9611 287.958 255.9231 212.32" />
                            <polygon fill="#8C8C8C" points="127.962 0 0 212.32 127.962 287.959 127.962 154.158" />
                            <polygon fill="#3C3C3B" points="127.9611 312.1866 126.3861 314.1066 126.3861 412.3056 127.9611 416.9066 255.9991 236.5866" />
                            <polygon fill="#8C8C8C" points="127.962 416.9052 127.962 312.1852 0 236.5852" />
                            <polygon fill="#141414" points="127.9611 287.9577 255.9211 212.3207 127.9611 154.1587" />
                            <polygon fill="#393939" points="0.0009 212.3208 127.9609 287.9578 127.9609 154.1588" />
                        </g>
                    </svg>
                    <span class="pl-0.5">${web3.utils.fromWei(res.toString(), 'ether')}</span>
                </button>`;

                    $("#connect").prepend(html);
                });
                await instance.admin().then((res) => {
                    admin = res;
                    window.dispatchEvent(eventt);
                });
            }).catch(() => {
                toastr.error("Error: Check if smart contract was deployed on the selected network. Or if network server is available.");
                $("#connect").html(`<button onclick="connect()" class="bg-red-600 inline-block px-4 py-2 mx-5 my-2 text-white rounded-full font-semibold text-sm">
                    Not Connected. Click to connect
                </button>`);
            });

        }).catch(() => {
            toastr.error("An error occured while trying to connect.");
            $("#connect").html(`<button onclick="connect()" class="bg-red-600 inline-block px-4 py-2 mx-5 my-2 text-white rounded-full font-semibold text-sm">
                Not Connected. Click to connect
            </button>`);
        });


}

async function connect() {
    loadIPFS();

    if (typeof window.ethereum !== 'undefined') {
        provider = window.ethereum;
    } else {
        toastr.error("Metamask not installed.");
        return;
    }

    await provider.request({ method: 'eth_requestAccounts' }).then((accounts) => {

        toastr.options.preventDuplicates = true;
        toastr.options.showEasing = 'swing';
        toastr.options.hideEasing = 'swing';
        toastr.options.positionClass = 'toast-bottom-right';

        if (accounts.length > 0) {
            account = accounts[0];
            $("#connect").html(`
            <div class="bg-yellow-500 font-bold cursor-pointer inline-block px-4 py-2 mx-5 my-2 text-white rounded-full text-sm">
                Connecting as: ${account}
            </div> `);
        }
        loadWeb3();
    }).catch(err => {
        if (err.code === -32002) {
            toastr.error("Please check your metamask extension notification.");
        } else {
            toastr.error("An error occured while trying to connect.");
        }
    });
}

if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', function (accounts) {
        connect();
        toastr.info("Account change detected");
    });

    window.ethereum.on('chainChanged', function (accounts) {
        connect();
        toastr.info("Network change detected");
    });
}

function loadIPFS() {
    const ipfs_cl = IpfsHttpClient({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
        headers: {
            authorization: ipfsAuthFile,
        },
    });

    ipfs = ipfs_cl;
}
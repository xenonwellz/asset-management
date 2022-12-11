<nav class="bg-white border-gray-200 px-4 border shadow fixed w-full top-0 left-0">
    <div class="container flex flex-wrap items-center justify-between mx-auto">
        <div class="">
            <ul class="flex p-2 bg-white" id="nav">
                <li>
                    <a href="/" class="block py-2 px-4 text-gray-700 rounded hover:bg-gray-100 hover:text-blue-700">Marketplace</a>
                </li>
                <li>
                    <a href="/add-asset" class="block py-2 px-4 text-gray-700 rounded hover:bg-gray-100 hover:text-blue-700">Add Asset</a>
                </li>
                <li>
                    <a href="/my-assets" class="block py-2 px-4 text-gray-700 rounded hover:bg-gray-100 hover:text-blue-700">Manage My Assets</a>
                </li>
            </ul>
        </div>
        <div id="connect" class="flex pr-4">
            <button onclick="connect()" class="bg-red-600 inline-block px-4 py-2 text-white rounded-full font-semibold text-sm">
                Not Connected. Click to connect
            </button>
        </div>
    </div>
</nav>
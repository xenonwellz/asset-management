<?php include __DIR__ . "/components/header.php"; ?>

<div class="flex pt-8 pb-3 border-b justify-center">
    <div class="flex shadow-md overflow-hidden border rounded-2xl">
        <button class="px-6 py-3 font-bold bg-white hover:bg-blue-100" id="tab-1" onclick="getAllSellables()">For Sale</button>
        <button class="px-6 py-3 font-bold bg-white hover:bg-blue-100" id="tab-2" onclick="getAllRentables()">For Rent</button>
    </div>
</div>

<div class="grid grid-cols-4 gap-6 px-6 pt-4 " id="assets">
</div>

<script>
    window.addEventListener('web3-loaded', () => {
        getAllSellables();
    })
</script>

<?php include __DIR__ . "/components/footer.php"; ?>
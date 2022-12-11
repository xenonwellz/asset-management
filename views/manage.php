<?php include __DIR__ . "/components/header.php"; ?>

<div class="grid grid-cols-4 gap-6 px-6 pt-4 " id="assets">

</div>

<script>
    window.addEventListener('web3-loaded', () => {
        adminAssets();
    })
</script>

<?php include __DIR__ . "/components/footer.php"; ?>
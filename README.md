## **DECENTRALIZED ACCESS CONTROL WITH IOTA**

**INSTALLATION GUIDE**

Requirements

- Node.js and NPM
- An Apache server (XAMPP for windows)
- Ganache
- Metamask browser extension
- Truffle (globally installed from npm)
  Tip: install it by running the command `npm i -g truffle`

Move your application to a directory that can be used with your Apache server

For windows move your application to C:\xampp\htdocs for windows. And update the `$base` variable in `/views/components/header.php` to `/your_folder_name` and `/routes.php` to `/your_folder_name/` notice the forward slashes in both.,

For linux move to `/var/www` . A config file should be created on in `/etc/apache2/sites-available` to serve the application folder. Dont forget to enable the config.

Start Ganache and create a new workspace.

While creating a workspace, you can add a project by clicking the "add projects" button and navigate to your application folder, and select the `truffle.config.js` file. This step is not important but can help you keep logs on Ganache.

Click "save workspace".

You will be taken to a page with a list of 10 eth accounts. Copy your network id and rpc server details located at the top of the ganache application. Update your truffle.config.js file with the details you copied (the host is the number before the colon (:) usually `127.0.0.1` and the port is the number after the colon. And set http_host to your rpc server in /js/web3.js line 5.

Install the metamask extension for your browser and follow the following tutorial [https://dapp-world.com/blogs/01/how-to-connect-ganache-with-metamask-and-deploy-smart-contracts-on-remix-without-1619847868947](https://dapp-world.com/blogs/01/how-to-connect-ganache-with-metamask-and-deploy-smart-contracts-on-remix-without-1619847868947), to add ganache to metamask.

Now run the command `npm install` to install dependencies, `npm run build` to compile and generate the required css, and `truffle migrate –-reset` to compile and deploy smart contract. And navigate to the url of your project. You can run `npm run watch

` to use tailwindcss.

**FUNCTIONALITY**

1. **Manage My Devices:**

The "Manage My Devices" / home page lists all the devices that are owned by the connected account. You can click on any of the devices to manage the device (toggle between functions and edit device name or function count).

![](https://github.com/xenonwellz/IoT-RBAC/raw/master/images/4.png)

Clicking any of the device takes you to a manage device page which will be discussed later.

1. **Register Devices:**

The register device page allows you to register new device. It takes the following parameters:

- Device Name - Name of the device. This can be anything, use a name that you can easily remember.
- Min Function Count - The minimum number when the device is on e.g 1 for fan, 16 for air conditioner. Must be greater than 0 since 0 indicates off.
- Max function Count - Should be greater than or equal to Min function count. It is the maximum number a device can be set to. Some fans have a max of 3, so the max will be 3.

Once a device is created the function is set to 0. That is the device is set to off after registration.

![](https://github.com/xenonwellz/IoT-RBAC/raw/master/images/2.png)

1. **Manage Device:**

This page allows you to edit device name, minimum function and maximum function count. It

also allows you to toggle between functions and transfer ownership of the device.`

![](https://github.com/xenonwellz/IoT-RBAC/raw/master/images/4.png)

1. **Simulate device:**

This page shows the simulation of created devices. By default the system maps the first 4

created devices to a simulation of Fan, Bulb, Ac and Smart Door Respectively. It is

recommended to follow this pattern when registering your devices. Every device coming

after this will be considered an unconfigured device.

![](https://github.com/xenonwellz/IoT-RBAC/raw/master/images/3.png)

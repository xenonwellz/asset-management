const projectId = '2IhdeKMUCHPY1pPNQMe5PGnykKQ';
const projectSecret = '353254cd2dd8b5f71f4734cc0b07558c';
const ipfsAuth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

window.ipfsAuthFile = ipfsAuth;

export default ipfsAuth;
const crypto = require('crypto');

//
// const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
//     modulusLength: 2048,
//     publicKeyEncoding: {
//       type: 'spki',
//       format: 'pem'
//     },
//     privateKeyEncoding: {
//       type: 'pkcs8',
//       format: 'pem'
//     }
//   });

const decrypt=(encryptedData)=>{
    try{
        const privateKey=process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
        const buffer = Buffer.from(encryptedData, 'base64');
        const decrypted = crypto.privateDecrypt({
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_PADDING
          }, buffer);
        return decrypted.toString();
    }catch(error){
        throw new Error("Decryption failed");
    }
}

module.exports={
    decrypt
};
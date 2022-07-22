
const requestToContract = async (web3, sender, receiver, privateKey, abi, gasLimit, total = 0) => {
    const nonce = await web3.eth.getTransactionCount(sender);
    const signedTx = await web3.eth.accounts.signTransaction({
        from: sender,
        to: receiver,
        data: abi,
        value: total,
        gas: gasLimit,
        nonce: nonce,
    }, privateKey)

    try {
        return web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    } catch (err) {
        console.error(`requestToContract is failed`);
        throw err
    }
}

module.exports = {
    requestToContract
}

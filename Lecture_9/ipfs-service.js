const axios = require('axios');

class IPFSService {

    /**
     * Uploads an array of files to IPFS.
     *
     * @param files - array of objects with the following structure
     *
     * files = [
     *    { path: <path>, content: <data> },
     *    ...
     * ]
     *
     * <path> - name of the file, containing file extension (example: file1.txt)
     * <data> - a Buffer, Readable Stream or Pull Stream with the contents of the file
     *
     * @returns hash - hash of folder pinned successfully to IPFS cluster
     */
    static async uploadFiles(files) {
        // get IPFS node
        let ipfsNode = ipfsAPI('/ip4/127.0.0.1/tcp/5001');

        let options = {
            wrapWithDirectory: true // adds a wrapping folder around the file/s to be uploaded
        };

        // uploads file/s to IPFS node
        let result = await ipfsNode.add(files, options);

        /*
         * result will be an array of:
         *
         * {
         *  path: '/tmp/myfile.txt',
         *  hash: 'QmHash', // base58 encoded multihash
         *  size: 123
         * }
         *
         * Note: array contains an element for each uploaded file + an element containing the hash
         * of the wrapping folder, where all the files are uploaded. An element containing the folder
         * hash is always the last array element.
         */
        let hash = result[files.length].hash;

        // pins folder hash to IPFS cluster
        await this.pinIPFSHashToCluster(hash);

        return hash;
    }

    /**
     * Pins hash to IPFS cluster.
     *
     * @param hash - hash of the folder, containing the file/s related to already uploaded IP claim
     * @returns {Promise<void>}
     */
    static async pinIPFSHashToCluster(hash) {
        try {
            const axiosInstance = await axios.create({
                baseURL: config.Blockchain.IPFS_CLUSTER,
                timeout: 20000
            });

            await axiosInstance.post('/pins/' + hash);
        } catch(e) {
            throw new Error('Error pinning hash: ' + hash);
        }
    }

    /**
     * Unpins hash from IPFS cluster.
     *
     * @param hash - hash of folder, already pinned on the cluster
     * @returns {Promise<void>}
     */
    static async unpinIPFSHashFromCluster(hash) {
        try {
            const axiosInstance = await axios.create({
                baseURL: config.Blockchain.IPFS_CLUSTER,
                timeout: 20000
            });

            await axiosInstance.delete('/pins/' + hash);
        } catch(e) {
            throw new Error('Error unpinning hash: ' + hash);
        }
    }

}

module.exports = IPFSService;
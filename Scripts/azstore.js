let azStoreFactory = {
    create: function () {
        return azStore = {
            sas: '?sv=2019-12-12&ss=bfqt&srt=sco&sp=rwacpx&se=2030-09-03T14:20:02Z&st=2020-09-03T06:20:02Z&spr=https,http&sig=5pmSAoRBmoezj2e2zAvMxu6h%2B%2FaWjsIitSAIk16vVCE%3D',
            container: 'image',
            blobUrl: 'https://i3c3b.blob.core.windows.net',
            uploadBase64: function (rawdata,name, callback) {
                let self = this;
                var blobService = AzureStorage.Blob.createBlobServiceWithSas(self.blobUrl, self.sas);
                var matches = rawdata.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                var buffer = getArrayBuffer(decode64(matches[2]));
                var sum = blobService.createBlockBlobFromText(azStore.container, name, buffer, function (error, result, response) {
                    if (error) {
                    } else {
                        var fileName = result.name;
                        if (callback) {
                            callback(fileName);
                        }
                    }
                });
            },
            uploadFile: function (file) {
                let self = this;
                var blobService = AzureStorage.Blob.createBlobServiceWithSas(self.blobUrl, self.sas);
                var customBlockSize = file.size > 1024 * 1024 * 32 ? 1024 * 1024 * 4 : 1024 * 512;
                blobService.singleBlobPutThresholdInBytes = customBlockSize;

                var finishedOrError = false;
                let successCallback = self.successCallback;
                let failCallback = self.failCallback;
                let progressCallback = self.progressCallback;
                self.successCallback = null;
                self.failCallback = null;
                self.progressCallback = null;
                let name = new Date().toISOString() + getRandString(16) + file.name.substr(file.name.lastIndexOf("."), file.name.length);
                var properties = {};
                properties.cacheControl = 'max-age=2592000';

                var speedSummary = blobService.createBlockBlobFromBrowserFile(self.container, name, file, {
                    blockSize: customBlockSize
                }, function (error, result, response) {
                    finishedOrError = true;
                    if (error) {
                        if (failCallback) {
                            failCallback(error, file.name);
                        }
                    } else {
                        if (successCallback) {
                            blobService.setBlobProperties(self.container, name, properties, function (error, result, response) {});
                            successCallback(result, file.name, name);
                            $("#fileToUploadBlob").val('');
                        }
                    }
                });
                speedSummary.on('progress', function () {
                    let percent = speedSummary.getCompletePercent();
                    if (progressCallback) {
                        progressCallback(percent);
                    }
                });
                return speedSummary;
            },
            successCallback: null,
            failCallback: null
        };
    }
};
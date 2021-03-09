var blobUri = 'https://' + 'portalfilebox' + '.blob.core.windows.net';
var sasToken = '?sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2020-05-24T15:55:15Z&st=2020-04-24T07:55:15Z&spr=https,http&sig=PSew8ZkgQcyv320xFUuXLHmdLeXLfp2IumEiZpUvqlA%3D';
var container = "image";
var blobService = AzureStorage.Blob.createBlobServiceWithSas(blobUri, sasToken);

var file = document.getElementById('fileinput').files[0];

var customBlockSize = file.size > 1024 * 1024 * 32 ? 1024 * 1024 * 4 : 1024 * 512;
blobService.singleBlobPutThresholdInBytes = customBlockSize;

var finishedOrError = false;
var speedSummary = blobService.createBlockBlobFromBrowserFile(container, file.name, file, { blockSize: customBlockSize }, function (error, result, response) {
    finishedOrError = true;
    if (error) {
        // Upload blob failed
    } else {
        // Upload successfully
    }
});
refreshProgress();

speedSummary.on('progress', function () {
    var process = speedSummary.getCompletePercent();
    displayProcess(process);
});
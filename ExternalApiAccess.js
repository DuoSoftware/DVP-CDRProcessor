var httpReq = require('request');
var config = require('config');
var util = require('util');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var validator = require('validator');
var fs = require('fs');

var RemoteGetFileMetadata = function(reqId, filename, companyId, tenantId, callback)
{
    try
    {
        var securityToken = config.Token;

        securityToken = 'bearer ' + securityToken;

        logger.debug('[DVP-CDRProcessor.RemoteGetFileMetadata] - [%s] -  Trying to get file meta data from api - Params - filename : %s', reqId, filename);

        var fileServiceHost = config.Services.fileServiceHost;
        var fileServicePort = config.Services.fileServicePort;
        var fileServiceVersion = config.Services.fileServiceVersion;
        var compInfo = tenantId + ':' + companyId;

        if(fileServiceHost && fileServicePort && fileServiceVersion)
        {
            var httpUrl = util.format('http://%s/DVP/API/%s/FileService/File/%s/MetaData', fileServiceHost, fileServiceVersion, filename);

            if(validator.isIP(fileServiceHost))
            {
                httpUrl = util.format('http://%s:%s/DVP/API/%s/FileService/File/%s/MetaData', fileServiceHost, fileServicePort, fileServiceVersion, filename);
            }

            var options = {
                url: httpUrl,
                headers: {
                    'authorization': securityToken,
                    'companyinfo': compInfo
                }
            };

            logger.debug('[DVP-CDRProcessor.RemoteGetFileMetadata] - [%s] - Creating Api Url : %s', reqId, httpUrl);


            httpReq(options, function (error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    var apiResp = JSON.parse(body);

                    logger.debug('[DVP-CDRProcessor.RemoteGetFileMetadata] - [%s] - file service returned : %s', reqId, body);

                    callback(apiResp.Exception, apiResp.Result);
                }
                else
                {
                    logger.error('[DVP-CDRProcessor.RemoteGetFileMetadata] - [%s] - file service call failed', reqId, error);
                    callback(error, undefined);
                }
            })
        }
        else
        {
            logger.error('[DVP-CDRProcessor.RemoteGetFileMetadata] - [%s] - File host, port or version not found', reqId);
            callback(new Error('File host, port or version not found'), undefined)
        }
    }
    catch(ex)
    {
        logger.error('[DVP-CDRProcessor.RemoteGetFileMetadata] - [%s] - Exception occurred', reqId, ex);
        callback(ex, undefined);
    }
};

var FileUploadReserve = function(reqId, filename, companyId, tenantId, callback)
{
    try
    {
        var securityToken = config.Token;

        securityToken = 'bearer ' + securityToken;

        logger.debug('[DVP-CDRProcessor.FileUploadReserve] - [%s] -  Trying to get file meta data from api - Params - filename : %s', reqId, filename);

        var fileServiceHost = config.Services.fileServiceHost;
        var fileServicePort = config.Services.fileServicePort;
        var fileServiceVersion = config.Services.fileServiceVersion;
        var compInfo = tenantId + ':' + companyId;

        if(fileServiceHost && fileServicePort && fileServiceVersion)
        {
            var httpUrl = util.format('http://%s/DVP/API/%s/FileService/File/Reserve', fileServiceHost, fileServiceVersion);

            if(validator.isIP(fileServiceHost))
            {
                httpUrl = util.format('http://%s:%s/DVP/API/%s/FileService/File/Reserve', fileServiceHost, fileServicePort, fileServiceVersion);
            }

            var reqBody = {class: 'CDR', fileCategory:'REPORTS', display: filename, filename: filename};

            var bodyJson = JSON.stringify(reqBody);

            httpReq({url:httpUrl, method: 'POST', headers: {'authorization': securityToken, 'companyinfo': compInfo, 'content-type': 'application/json'}, body: bodyJson}, function(error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    var apiResp = JSON.parse(body);

                    logger.debug('[DVP-CDRProcessor.FileUploadReserve] - [%s] - file service returned : %s', reqId, body);

                    callback(apiResp.Exception, apiResp.Result);
                }
                else
                {
                    logger.error('[DVP-CDRProcessor.FileUploadReserve] - [%s] - file service call failed', reqId, error);
                    callback(error, undefined);
                }
            });
        }
        else
        {
            logger.error('[DVP-CDRProcessor.FileUploadReserve] - [%s] - File host, port or version not found', reqId);
            callback(new Error('File host, port or version not found'), undefined)
        }
    }
    catch(ex)
    {
        logger.error('[DVP-CDRProcessor.FileUploadReserve] - [%s] - Exception occurred', reqId, ex);
        callback(ex, undefined);
    }
};

var UploadFile = function(reqId, uniqueId, filename, companyId, tenantId, callback)
{
    try
    {
        var securityToken = config.Token;

        securityToken = 'bearer ' + securityToken;

        logger.debug('[DVP-CDRProcessor.UploadFile] - [%s] -  Trying to get file meta data from api - Params - filename : %s', reqId, filename);

        var fileServiceHost = config.Services.fileServiceHost;
        var fileServicePort = config.Services.fileServicePort;
        var fileServiceVersion = config.Services.fileServiceVersion;
        var compInfo = tenantId + ':' + companyId;

        if(fileServiceHost && fileServicePort && fileServiceVersion)
        {
            var httpUrl = util.format('http://%s/DVP/API/%s/FileService/File/Upload', fileServiceHost, fileServiceVersion);

            if(validator.isIP(fileServiceHost))
            {
                httpUrl = util.format('http://%s:%s/DVP/API/%s/FileService/File/Upload', fileServiceHost, fileServicePort, fileServiceVersion);
            }


            var formData = {
                class: 'CDR',
                fileCategory:'REPORTS',
                display: filename,
                filename: filename,
                attachments: [
                    fs.createReadStream(filename)
                ]

            };

            if(uniqueId)
            {
                formData.reservedId = uniqueId
            }

            httpReq.post({url:httpUrl, headers: {'authorization': securityToken, 'companyinfo': compInfo}, formData: formData}, function(error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    var apiResp = JSON.parse(body);

                    logger.debug('[DVP-CDRProcessor.UploadFile] - [%s] - file service returned : %s', reqId, body);

                    callback(apiResp.Exception, apiResp.Result);
                }
                else
                {
                    logger.error('[DVP-CDRProcessor.UploadFile] - [%s] - file service call failed', reqId, error);
                    callback(error, undefined);
                }
            });
        }
        else
        {
            logger.error('[DVP-CDRProcessor.UploadFile] - [%s] - File host, port or version not found', reqId);
            callback(new Error('File host, port or version not found'), undefined)
        }
    }
    catch(ex)
    {
        logger.error('[DVP-CDRProcessor.UploadFile] - [%s] - Exception occurred', reqId, ex);
        callback(ex, undefined);
    }
};

var DeleteFile = function(reqId, uniqueId, companyId, tenantId, callback)
{
    try
    {
        var securityToken = config.Token;

        securityToken = 'bearer ' + securityToken;

        logger.debug('[DVP-CDRProcessor.DeleteFile] - [%s] -  Trying to get file meta data from api', reqId);

        var fileServiceHost = config.Services.fileServiceHost;
        var fileServicePort = config.Services.fileServicePort;
        var fileServiceVersion = config.Services.fileServiceVersion;
        var compInfo = tenantId + ':' + companyId;

        if(fileServiceHost && fileServicePort && fileServiceVersion)
        {
            var httpUrl = util.format('http://%s/DVP/API/%s/FileService/File/%s', fileServiceHost, fileServiceVersion, uniqueId);

            if(validator.isIP(fileServiceHost))
            {
                httpUrl = util.format('http://%s:%s/DVP/API/%s/FileService/File/%s', fileServiceHost, fileServicePort, fileServiceVersion, uniqueId);
            }


            httpReq.del({url:httpUrl, headers: {'authorization': securityToken, 'companyinfo': compInfo}}, function(error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    var apiResp = JSON.parse(body);

                    logger.debug('[DVP-CDRProcessor.DeleteFile] - [%s] - file service returned : %s', reqId, body);

                    callback(apiResp.Exception, apiResp.Result);
                }
                else
                {
                    logger.error('[DVP-CDRProcessor.DeleteFile] - [%s] - file service call failed', reqId, error);
                    callback(error, undefined);
                }
            });
        }
        else
        {
            logger.error('[DVP-CDRProcessor.DeleteFile] - [%s] - File host, port or version not found', reqId);
            callback(new Error('File host, port or version not found'), undefined)
        }
    }
    catch(ex)
    {
        logger.error('[DVP-CDRProcessor.DeleteFile] - [%s] - Exception occurred', reqId, ex);
        callback(ex, undefined);
    }
};

module.exports.RemoteGetFileMetadata = RemoteGetFileMetadata;
module.exports.UploadFile = UploadFile;
module.exports.FileUploadReserve = FileUploadReserve;
module.exports.DeleteFile = DeleteFile;
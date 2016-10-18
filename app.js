    var restify = require('restify');
    var backendHandler = require('./DBBackendHandler.js');
    var stringify = require('stringify');
    var dbModel = require('dvp-dbmodels');
    var underscore = require('underscore');
    var deepcopy = require('deepcopy');
    var json2csv = require('json2csv');
    var moment = require('moment');
    var async = require('async');
    var config = require('config');
    var nodeUuid = require('node-uuid');
    var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
    var jwt = require('restify-jwt');
    var fs = require('fs');
    var secret = require('dvp-common/Authentication/Secret.js');
    var authorization = require('dvp-common/Authentication/Authorization.js');
    var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
    var externalApi = require('./ExternalApiAccess.js');
    var redisHandler = require('./RedisHandler.js');

    var hostIp = config.Host.Ip;
    var hostPort = config.Host.Port;
    var hostVersion = config.Host.Version;

    var fileServiceHost = config.Services.fileServiceHost;
    var fileServicePort = config.Services.fileServicePort;
    var fileServiceVersion = config.Services.fileServiceVersion;


    var server = restify.createServer({
        name: 'DVP-CDRProcessor'
    });


    server.use(restify.CORS());
    server.use(restify.fullResponse());
    server.pre(restify.pre.userAgentConnection());


    restify.CORS.ALLOW_HEADERS.push('authorization');

    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.queryParser());
    server.use(restify.bodyParser());


    var ProcessBatchCDR = function(cdrList)
    {
        var emptyArr = [];

        try
        {

            for(i=0; i<cdrList.length; i++)
            {
                var OriginatedLegs = cdrList[i].OriginatedLegs;

                if(OriginatedLegs)
                {
                    //Do HTTP DECODE
                    var decodedLegsStr = decodeURIComponent(OriginatedLegs);

                    var formattedStr = decodedLegsStr.replace("ARRAY::", "");

                    var legsUnformattedList = formattedStr.split('|:');

                    cdrList[i].RelatedLegs = {};

                    for(j=0; j<legsUnformattedList.length; j++)
                    {
                        var legProperties = legsUnformattedList[j].split(';');

                        var legUuid = legProperties[0];

                        if(cdrList[i].Uuid != legUuid && !cdrList[i].RelatedLegs[legUuid])
                        {
                            cdrList[i].RelatedLegs[legUuid] = legUuid;
                        }

                    }
                }
            }

            //var arr = underscore.filter(cdrList, function(cdrLeg)
            //{
            //    return cdrLeg.OriginatedLegs
            //});

            //var arr = underscore.groupBy(cdrList, 'CallUuid');

            return cdrList;
        }
        catch(ex)
        {
            return undefined;
        }
    };

    var ProcessCDRLegs = function(processedCdr, cdrList, callback)
    {
        var len = processedCdr.length;
        var current = 0;

        if(len)
        {
            for(i=0; i<processedCdr.length; i++)
            {
                cdrList[processedCdr[i].Uuid] = [];
                cdrList[processedCdr[i].Uuid].push(processedCdr[i]);

                var relatedLegsLength = 0;

                if(processedCdr[i].RelatedLegs)
                {
                    relatedLegsLength = Object.keys(processedCdr[i].RelatedLegs).length;
                }

                if(processedCdr[i].RelatedLegs && relatedLegsLength)
                {
                    CollectOtherLegsCDR(cdrList[processedCdr[i].Uuid], processedCdr[i].RelatedLegs, function(err, resp)
                    {
                        current++;

                        if(current === len)
                        {
                            callback(null, cdrList);
                        }

                    })
                }
                else
                {
                    if(processedCdr[i].ObjType === 'HTTAPI' || processedCdr[i].ObjType === 'SOCKET')
                    {
                        CollectBLeg(cdrList[processedCdr[i].Uuid], processedCdr[i].Uuid, processedCdr[i].CallUuid, function(err, resp)
                        {

                            current++;

                            if(current === len)
                            {
                                callback(null, cdrList);
                            }
                        })

                    }
                    else
                    {
                        current++;

                        if(current === len)
                        {
                            callback(null, cdrList);
                        }
                    }


                }
            }
        }
        else
        {
            callback(null, null);
        }

    };

    var CollectBLeg = function(cdrListArr, uuid, callUuid, callback)
    {
        backendHandler.GetBLegForIVRCalls(uuid, callUuid, function(err, legInfo)
        {

            if(legInfo && legInfo.length > 0)
            {
                var len = legInfo.length;
                var current = 0;

                for(i=0; i<legInfo.length; i++)
                {
                    var legType = legInfo[i].ObjType;

                    if(legType && (legType === 'ATT_XFER_USER' || legType === 'ATT_XFER_GATEWAY'))
                    {
                        //check for Originated Legs

                        if(legInfo[i].OriginatedLegs)
                        {
                            var decodedLegsStr = decodeURIComponent(legInfo[i].OriginatedLegs);

                            var formattedStr = decodedLegsStr.replace("ARRAY::", "");

                            var legsUnformattedList = formattedStr.split('|:');

                            if(legsUnformattedList && legsUnformattedList.length > 0)
                            {
                                var legProperties = legsUnformattedList[0].split(';');

                                var legUuid = legProperties[0];

                                GetSpecificLegsForTransfer(legUuid, cdrListArr, legInfo[i], function(err, transInfLegRes)
                                {
                                    current++;

                                    if(current === len)
                                    {
                                        callback(null, cdrListArr);
                                    }
                                });
                            }
                            else
                            {
                                current++;

                                cdrListArr.push(legInfo[i]);

                                if(current === len)
                                {
                                    callback(null, cdrListArr);
                                }
                            }
                        }
                        else
                        {
                            current++;

                            cdrListArr.push(legInfo[i]);

                            if(current === len)
                            {
                                callback(null, cdrListArr);
                            }
                        }


                    }
                    else
                    {
                        current++;

                        cdrListArr.push(legInfo[i]);

                        if(current === len)
                        {
                            callback(null, cdrListArr);
                        }
                    }
                }

            }
            else
            {
                callback(err, cdrListArr);
            }


        })
    };

    var GetSpecificLegsForTransfer = function(legUuid, cdrListArr, legInfo, callback)
    {
        backendHandler.GetSpecificLegByUuid(legUuid, function (err, transferLeg)
        {
            cdrListArr.push(legInfo);

            if(transferLeg)
            {
                var tempTransLeg = transferLeg.toJSON();
                tempTransLeg.IsTransferredParty = true;
                cdrListArr.push(tempTransLeg);
            }

            callback(err, true);
        })
    };

    var CollectOtherLegsCDR = function(cdrListArr, relatedLegs, callback)
    {
        var len = Object.keys(relatedLegs).length;

        var count = 0;

        if(len > 0)
        {
            for(legUuid in relatedLegs)
            {
                backendHandler.GetSpecificLegByUuid(legUuid, function(err, legInfo)
                {
                    if(legInfo)
                    {
                        var legType = legInfo.ObjType;

                        if(legType && (legType === 'ATT_XFER_USER' || legType === 'ATT_XFER_GATEWAY'))
                        {
                            if(legInfo.OriginatedLegs)
                            {
                                var decodedLegsStr = decodeURIComponent(legInfo.OriginatedLegs);

                                var formattedStr = decodedLegsStr.replace("ARRAY::", "");

                                var legsUnformattedList = formattedStr.split('|:');

                                if (legsUnformattedList && legsUnformattedList.length > 0)
                                {
                                    var legProperties = legsUnformattedList[0].split(';');

                                    var legUuid = legProperties[0];

                                    backendHandler.GetSpecificLegByUuid(legUuid, function (err, transferLeg)
                                    {
                                        cdrListArr.push(legInfo);

                                        if(transferLeg)
                                        {
                                            var tempTransLeg = transferLeg.toJSON();
                                            tempTransLeg.IsTransferredParty = true;
                                            cdrListArr.push(tempTransLeg);
                                        }

                                        count++;

                                        if(count === len)
                                        {
                                            callback(null, true);
                                        }
                                    })
                                }
                                else
                                {
                                    cdrListArr.push(legInfo);
                                    count++;

                                    if(count === len)
                                    {
                                        callback(null, true);
                                    }
                                }
                            }
                            else
                            {
                                cdrListArr.push(legInfo);
                                count++;

                                if(count === len)
                                {
                                    callback(null, true);
                                }
                            }
                        }
                        else
                        {
                            cdrListArr.push(legInfo);
                            count++;

                            if(count === len)
                            {
                                callback(null, true);
                            }
                        }


                    }
                    else
                    {
                        count++;

                        if(count === len)
                        {
                            callback(null, true);
                        }
                    }


                })

            }
        }
        else
        {
            callback(null, true);
        }


    };

    var convertToMMSS = function(sec)
    {
        var minutes = Math.floor(sec / 60);

        if(minutes < 10)
        {
            minutes = '0' + minutes;
        }

        var seconds = sec - minutes * 60;

        if(seconds < 10)
        {
            seconds = '0' + seconds;
        }

        return minutes + ':' + seconds;
    };

    server.get('/DVP/API/:version/CallCDR/GetAbandonCallDetailsByRange', jwt({secret: secret.Secret}), authorization({resource:"cdr", action:"read"}), function(req, res, next)
    {
        var emptyArr = [];
        var reqId = nodeUuid.v1();
        try
        {
            var startTime = req.query.startTime;
            var endTime = req.query.endTime;
            var offset = req.query.offset;
            var limit = req.query.limit;
            var agent = req.query.agent;
            var skill = req.query.skill;
            var custNum = req.query.custnumber;

            offset = parseInt(offset);
            limit = parseInt(limit);

            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            if (!companyId || !tenantId)
            {
                throw new Error("Invalid company or tenant");
            }

            logger.debug('[DVP-CDRProcessor.GetAbandonCallDetailsByRange] - [%s] - HTTP Request Received - Params - StartTime : %s, EndTime : %s, Offset: %s, Limit : %s', reqId, startTime, endTime, offset, limit);

            backendHandler.GetAbandonCallRelatedLegsInDateRange(startTime, endTime, companyId, tenantId, offset, limit, agent, skill, custNum, function(err, legs)
            {
                if(err)
                {
                    logger.error('[DVP-CDRProcessor.GetAbandonCallDetailsByRange] - [%s] - Exception occurred on method GetCallRelatedLegsInDateRange', reqId, err);
                }
                else
                {
                    logger.debug('[DVP-CDRProcessor.GetAbandonCallDetailsByRange] - [%s] - Get call cdr details by date success', reqId);
                }

                var processedCdr = ProcessBatchCDR(legs);

                var cdrList = {};

                ProcessCDRLegs(processedCdr, cdrList, function(err, resp)
                {
                    logger.debug('[DVP-CDRProcessor.GetAbandonCallDetailsByRange] - [%s] - CDR Processing Done', reqId);

                    var jsonString = "";

                    if(err)
                    {
                        jsonString = messageFormatter.FormatMessage(err, "ERROR OCCURRED", false, cdrList);

                    }
                    else
                    {
                        jsonString = messageFormatter.FormatMessage(null, "SUCCESS", true, cdrList);
                    }
                    res.end(jsonString);
                })



            })

        }
        catch(ex)
        {
            logger.error('[DVP-CDRProcessor.GetAbandonCallDetailsByRange] - [%s] - Exception occurred', reqId, ex);
            var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, emptyArr);
            logger.debug('[DVP-CDRProcessor.GetAbandonCallDetailsByRange] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }

        return next();
    });



    server.get('/DVP/API/:version/CallCDR/PrepareDownload', jwt({secret: secret.Secret}), authorization({resource:"cdr", action:"read"}), function(req, res, next)
    {
        var emptyArr = [];
        var reqId = nodeUuid.v1();
        try
        {
            var startTime = req.query.startTime;
            var endTime = req.query.endTime;
            var offset = req.query.offset;
            var limit = req.query.limit;
            var agent = req.query.agent;
            var skill = req.query.skill;
            var direction = req.query.direction;
            var recording = req.query.recording;
            var custNum = req.query.custnumber;
            var fileType = req.query.fileType;
            var tz = req.query.tz;

            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            offset = parseInt(offset);
            limit = parseInt(limit);

            if (!companyId || !tenantId)
            {
                throw new Error("Invalid company or tenant");
            }

            logger.debug('[DVP-CDRProcessor.DownloadCDR] - [%s] - HTTP Request Received - Params - StartTime : %s, EndTime : %s, Offset: %s, Limit : %s', reqId, startTime, endTime, offset, limit);

            var stInReadableFormat = moment(startTime).unix();
            var etInReadableFormat = moment(endTime).unix();

            //Create FILE NAME Key
            var fileName = 'CDR_' + tenantId + '_' + companyId + '_' + stInReadableFormat + '_' + etInReadableFormat;

            if(agent)
            {
                fileName = fileName + '_' + agent;
            }

            if(custNum)
            {
                fileName = fileName + '_' + custNum;
            }

            if(skill)
            {
                fileName = fileName + '_' + skill;
            }

            if(direction)
            {
                fileName = fileName + '_' + direction;
            }

            fileName = fileName.replace(/:/g, "-") + '.' + fileType;


            //check file exists

            externalApi.RemoteGetFileMetadata(reqId, fileName, companyId, tenantId, function(err, fileData)
            {
                if(fileData)
                {
                    redisHandler.SetObject('FILEDOWNLOADSTATUS:' + fileName, 'READY', function(err, redisResp)
                    {
                        if (err)
                        {
                            var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, null);
                            logger.debug('[DVP-CDRProcessor.DownloadCDR] - [%s] - API RESPONSE : %s', reqId, jsonString);
                            res.end(jsonString);
                        }
                        else
                        {
                            var jsonString = messageFormatter.FormatMessage(null, "SUCCESS", true, responseData);
                            logger.debug('[DVP-CDRProcessor.DownloadCDR] - [%s] - API RESPONSE : %s', reqId, jsonString);
                            res.end(jsonString);

                        }
                    });


                }
                else
                {
                    redisHandler.SetObject('FILEDOWNLOADSTATUS:' + fileName, 'WORKING', function(err, redisResp)
                    {
                        if (err)
                        {
                            var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, null);
                            logger.debug('[DVP-CDRProcessor.DownloadCDR] - [%s] - API RESPONSE : %s', reqId, jsonString);
                            res.end(jsonString);
                        }
                        else
                        {

                            //should respose end
                            var jsonString = messageFormatter.FormatMessage(null, "SUCCESS", true, fileName);
                            logger.debug('[DVP-CDRProcessor.DownloadCDR] - [%s] - API RESPONSE : %s', reqId, jsonString);
                            res.end(jsonString);

                            backendHandler.GetProcessedCDRInDateRange(startTime, endTime, companyId, tenantId, agent, skill, direction, recording, custNum, function(err, cdrList)
                            {
                                logger.debug('[DVP-CDRProcessor.DownloadCDR] - [%s] - CDR Processing Done', reqId);

                                var jsonString = "";
                                if(err)
                                {
                                    redisHandler.DeleteObject('FILEDOWNLOADSTATUS:' + fileName, function(err, redisResp){});
                                }
                                else
                                {
                                    //Convert CDR LIST TO FILE AND UPLOAD

                                    if(cdrList && cdrList.length > 0)
                                    {
                                        cdrList.forEach(function(cdrProcessed)
                                        {
                                            cdrProcessed.BillSec = convertToMMSS(cdrProcessed.BillSec);
                                            cdrProcessed.Duration = convertToMMSS(cdrProcessed.Duration);
                                            cdrProcessed.AnswerSec = convertToMMSS(cdrProcessed.AnswerSec);
                                            cdrProcessed.QueueSec = convertToMMSS(cdrProcessed.QueueSec);
                                            cdrProcessed.HoldSec = convertToMMSS(cdrProcessed.HoldSec);

                                            var localTime = moment(cdrProcessed.CreatedTime).utcOffset(tz).format("YYYY-MM-DD HH:mm:ss");

                                            cdrProcessed.CreatedLocalTime = localTime;

                                        });

                                        //Convert to CSV

                                        var fieldNames = ['Call Direction', 'From', 'To', 'ReceivedBy', 'AgentSkill', 'Answered', 'Call Time', 'Total Duration', 'Bill Duration', 'Answer Duration', 'Queue Duration', 'Hold Duration', 'Call Type', 'Call Category', 'Hangup Party', 'Transferred Parties'];

                                        var fields = ['DVPCallDirection', 'SipFromUser', 'SipToUser', 'RecievedBy', 'AgentSkill', 'AgentAnswered', 'CreatedLocalTime', 'Duration', 'BillSec', 'AnswerSec', 'QueueSec', 'HoldSec', 'ObjType', 'ObjCategory', 'HangupParty', 'TransferredParties'];

                                        var csvFileData = json2csv({ data: cdrList, fields: fields, fieldNames : fieldNames });

                                        fs.writeFile(fileName, csvFileData, function(err)
                                        {
                                            if (err)
                                            {
                                                redisHandler.DeleteObject('FILEDOWNLOADSTATUS:' + fileName, function(err, redisResp){});
                                            }
                                            else
                                            {
                                                externalApi.UploadFile(reqId, fileName, companyId, tenantId, function(err, uploadResp)
                                                {
                                                    if(!err && uploadResp)
                                                    {
                                                        redisHandler.SetObject('FILEDOWNLOADSTATUS:' + fileName, 'READY', function(err, redisResp){});
                                                    }
                                                    else
                                                    {
                                                        redisHandler.DeleteObject('FILEDOWNLOADSTATUS:' + fileName, function(err, redisResp){});
                                                    }

                                                });

                                            }
                                        });


                                    }
                                    else
                                    {
                                        redisHandler.DeleteObject('FILEDOWNLOADSTATUS:' + fileName, function(err, redisResp){});
                                        //nothing to show - delete redis object
                                    }


                                }

                            });


                        }
                    });

                }

            });

        }
        catch(ex)
        {
            logger.error('[DVP-CDRProcessor.DownloadCDR] - [%s] - Exception occurred', reqId, ex);
            var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, emptyArr);
            logger.debug('[DVP-CDRProcessor.DownloadCDR] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }

        return next();
    });

    server.get('/DVP/API/:version/CallCDR/GetProcessedCallDetailsByRange', jwt({secret: secret.Secret}), authorization({resource:"cdr", action:"read"}), function(req, res, next)
    {
        var emptyArr = [];
        var reqId = nodeUuid.v1();
        try
        {
            var startTime = req.query.startTime;
            var endTime = req.query.endTime;
            //var offset = req.query.offset;
            //var limit = req.query.limit;
            var agent = req.query.agent;
            var skill = req.query.skill;
            var direction = req.query.direction;
            var recording = req.query.recording;
            var custNum = req.query.custnumber;

            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            //offset = parseInt(offset);
            //limit = parseInt(limit);

            if (!companyId || !tenantId)
            {
                throw new Error("Invalid company or tenant");
            }

            logger.debug('[DVP-CDRProcessor.GetProcessedCallDetailsByRange] - [%s] - HTTP Request Received - Params - StartTime : %s, EndTime : %s', reqId, startTime, endTime);

            backendHandler.GetProcessedCDRInDateRange(startTime, endTime, companyId, tenantId, agent, skill, direction, recording, custNum, function(err, cdrList)
            {
                logger.debug('[DVP-CDRProcessor.GetProcessedCallDetailsByRange] - [%s] - CDR Processing Done', reqId);

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, emptyArr);
                    logger.debug('[DVP-CDRProcessor.GetProcessedCallDetailsByRange] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);

                }
                else
                {

                    var jsonString = messageFormatter.FormatMessage(null, "SUCCESS", true, cdrList);
                    logger.debug('[DVP-CDRProcessor.GetProcessedCallDetailsByRange] - [%s] - API RESPONSE : SUCCESS', reqId);
                    res.end(jsonString);


                }

            });

        }
        catch(ex)
        {
            logger.error('[DVP-CDRProcessor.GetProcessedCallDetailsByRange] - [%s] - Exception occurred', reqId, ex);
            var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, emptyArr);
            logger.debug('[DVP-CDRProcessor.GetProcessedCallDetailsByRange] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }

        return next();
    });

    //query_string : ?startTime=2016-05-09&endTime=2016-05-12
    server.get('/DVP/API/:version/CallCDR/GetCallDetailsByRange', jwt({secret: secret.Secret}), authorization({resource:"cdr", action:"read"}), function(req, res, next)
    {
        var emptyArr = [];
        var reqId = nodeUuid.v1();
        try
        {
            var startTime = req.query.startTime;
            var endTime = req.query.endTime;
            var offset = req.query.offset;
            var limit = req.query.limit;
            var agent = req.query.agent;
            var skill = req.query.skill;
            var direction = req.query.direction;
            var recording = req.query.recording;
            var custNum = req.query.custnumber;

            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            offset = parseInt(offset);
            limit = parseInt(limit);

            if (!companyId || !tenantId)
            {
                throw new Error("Invalid company or tenant");
            }

            logger.debug('[DVP-CDRProcessor.GetCallDetailsByRange] - [%s] - HTTP Request Received - Params - StartTime : %s, EndTime : %s, Offset: %s, Limit : %s', reqId, startTime, endTime, offset, limit);


            backendHandler.GetCallRelatedLegsInDateRange(startTime, endTime, companyId, tenantId, offset, limit, agent, skill, direction, recording, custNum, function(err, legs)
            {
                if(err)
                {
                    logger.error('[DVP-CDRProcessor.GetCallDetailsByRange] - [%s] - Exception occurred on method GetCallRelatedLegsInDateRange', reqId, err);
                }
                else
                {
                    logger.debug('[DVP-CDRProcessor.GetCallDetailsByRange] - [%s] - Get call cdr details by date success', reqId);
                }

                var processedCdr = ProcessBatchCDR(legs);

                var cdrList = {};

                ProcessCDRLegs(processedCdr, cdrList, function(err, resp)
                {
                    logger.debug('[DVP-CDRProcessor.GetCallDetailsByRange] - [%s] - CDR Processing Done', reqId);

                    var jsonString = "";

                    if(err)
                    {
                        jsonString = messageFormatter.FormatMessage(err, "ERROR OCCURRED", false, cdrList);

                    }
                    else
                    {
                        jsonString = messageFormatter.FormatMessage(null, "SUCCESS", true, cdrList);
                    }
                    res.end(jsonString);
                })



            })

        }
        catch(ex)
        {
            logger.error('[DVP-CDRProcessor.GetCallDetailsByRange] - [%s] - Exception occurred', reqId, ex);
            var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, emptyArr);
            logger.debug('[DVP-CDRProcessor.GetCallDetailsByRange] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }

        return next();
    });


    var processSummaryData = function(caption, startDate, endDate, companyId, tenantId, skill, callback)
    {
        if(skill)
        {
            backendHandler.GetCallSummaryDetailsDateRangeWithSkill(caption, startDate, endDate, companyId, tenantId, skill, function(err, summaryData)
            {
                callback(err, summaryData);
            });
        }
        else
        {
            backendHandler.GetCallSummaryDetailsDateRange(caption, startDate, endDate, companyId, tenantId, function(err, summaryData)
            {
                callback(err, summaryData);
            });
        }

    };


    //query_string : ?startTime=2016-05-09&endTime=2016-05-12
    server.get('/DVP/API/:version/CallCDR/CallCDRSummary/Hourly', jwt({secret: secret.Secret}), authorization({resource:"cdr", action:"read"}), function(req, res, next)
    {
        var emptyArr = [];
        var reqId = nodeUuid.v1();
        try
        {
            var summaryDate = req.query.date;
            var tz = req.query.tz;

            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            if (!companyId || !tenantId)
            {
                throw new Error("Invalid company or tenant");
            }

            logger.debug('[DVP-CDRProcessor.GetCallCDRSummaryHourly] - [%s] - HTTP Request Received - Params - summaryDate : %s', reqId, summaryDate);

            //Generate 24 hrs moment time array

            var hrFuncArr = [];

            for(i=0; i<24; i++)
            {
                var sd = moment(summaryDate + " 00:00:00 " + tz, "YYYY-MM-DD hh:mm:ss Z").add(i, 'hours');
                var ed = moment(summaryDate + " 00:00:00 " + tz, "YYYY-MM-DD hh:mm:ss Z").add(i+1, 'hours');

                hrFuncArr.push(processSummaryData.bind(this, i+1, sd, ed, companyId, tenantId, null));
            }


            async.parallel(hrFuncArr, function(err, results)
            {
                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, emptyArr);
                    logger.debug('[DVP-CDRProcessor.GetCallCDRSummaryHourly] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(null, "SUCCESS", true, results);
                    logger.debug('[DVP-CDRProcessor.GetCallCDRSummaryHourly] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            });


        }
        catch(ex)
        {
            var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, emptyArr);
            logger.debug('[DVP-CDRProcessor.GetCallCDRSummaryHourly] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }

        return next();
    });

    server.get('/DVP/API/:version/CallCDR/CallCDRSummaryByQueue/Hourly', jwt({secret: secret.Secret}), authorization({resource:"cdr", action:"read"}), function(req, res, next)
    {
        var emptyArr = [];
        var reqId = nodeUuid.v1();
        try
        {
            var summaryDate = req.query.date;
            var tz = req.query.tz;

            var skill = req.query.skill;

            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            if (!companyId || !tenantId)
            {
                throw new Error("Invalid company or tenant");
            }

            logger.debug('[DVP-CDRProcessor.CallCDRSummaryByQueue] - [%s] - HTTP Request Received - Params - summaryDate : %s', reqId, summaryDate);

            //Generate 24 hrs moment time array

            var hrFuncArr = [];

            for(i=0; i<24; i++)
            {
                var sd = moment(summaryDate + " 00:00:00 " + tz, "YYYY-MM-DD hh:mm:ss Z").add(i, 'hours');
                var ed = moment(summaryDate + " 00:00:00 " + tz, "YYYY-MM-DD hh:mm:ss Z").add(i+1, 'hours');

                hrFuncArr.push(processSummaryData.bind(this, i+1, sd, ed, companyId, tenantId, skill));
            }


            async.parallel(hrFuncArr, function(err, results)
            {
                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, emptyArr);
                    logger.debug('[DVP-CDRProcessor.CallCDRSummaryByQueue] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(null, "SUCCESS", true, results);
                    logger.debug('[DVP-CDRProcessor.CallCDRSummaryByQueue] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            });


        }
        catch(ex)
        {
            var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, emptyArr);
            logger.debug('[DVP-CDRProcessor.CallCDRSummaryByQueue] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }

        return next();
    });

    server.get('/DVP/API/:version/CallCDR/CallCDRSummary/Daily', jwt({secret: secret.Secret}), authorization({resource:"cdr", action:"read"}), function(req, res, next)
    {
        var emptyArr = [];
        var reqId = nodeUuid.v1();
        try
        {
            var startDate = req.query.startDate;
            var endDate = req.query.endDate;

            var tz = req.query.tz;

            var momentSD = moment(startDate + " 00:00:00 " + tz, "YYYY-MM-DD hh:mm:ss Z");
            var momentED = moment(endDate + " 00:00:00 " + tz, "YYYY-MM-DD hh:mm:ss Z");

            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            if (!companyId || !tenantId)
            {
                throw new Error("Invalid company or tenant");
            }

            logger.debug('[DVP-CDRProcessor.GetCallCDRSummaryHourly] - [%s] - HTTP Request Received - Params - startDate : %s, endDate : %s', reqId, startDate, endDate);

            //Generate 24 hrs moment time array

            var dayFuncArr = [];
            var cnt = 0;

            while(momentSD <= momentED)
            {
                var sd = moment(startDate + " 00:00:00 " + tz, "YYYY-MM-DD hh:mm:ss Z").add(cnt, 'days');
                var ed = moment(startDate + " 00:00:00 " + tz, "YYYY-MM-DD hh:mm:ss Z").add(cnt+1, 'days');

                //fixed momentSD

                momentSD = moment(startDate + " 00:00:00 " + tz, "YYYY-MM-DD hh:mm:ss Z").add(cnt+1, 'days');

                dayFuncArr.push(processSummaryData.bind(this, sd.utcOffset(tz).format('YYYY-MM-DD'), sd, ed, companyId, tenantId, null));

                cnt++;
            }

            /*var hrFuncArr = [];

            for(i=0; i<daysOfMonth; i++)
            {
                var sd = moment(summaryDate + "-01 00:00:00 " + tz, "YYYY-MM-DD hh:mm:ss Z").add(i, 'days');
                var ed = moment(summaryDate + "-01 00:00:00 " + tz, "YYYY-MM-DD hh:mm:ss Z").add(i+1, 'days');

                hrFuncArr.push(processSummaryData.bind(this, i+1, sd, ed, companyId, tenantId));
            }*/


            async.parallel(dayFuncArr, function(err, results)
            {
                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, emptyArr);
                    logger.debug('[DVP-CDRProcessor.GetCallCDRSummaryHourly] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(null, "SUCCESS", true, results);
                    logger.debug('[DVP-CDRProcessor.GetCallCDRSummaryHourly] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            });


        }
        catch(ex)
        {
            var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, emptyArr);
            logger.debug('[DVP-CDRProcessor.GetCallCDRSummaryHourly] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }

        return next();
    });

    server.post('/DVP/API/:version/CallCDR/AgentStatus', jwt({secret: secret.Secret}), authorization({resource:"cdr", action:"read"}), function(req, res, next)
    {
        var emptyArr = [];
        var reqId = nodeUuid.v1();
        try
        {
            var startDate = req.query.startDate;
            var endDate = req.query.endDate;
            var status = req.query.status;

            var agentList = null;
            var statusList = null;

            if(req.body)
            {
                agentList = req.body.agentList;
                statusList = req.body.statusList;
            }


            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            if (!companyId || !tenantId)
            {
                throw new Error("Invalid company or tenant");
            }

            logger.debug('[DVP-CDRProcessor.AgentStatus] - [%s] - HTTP Request Received - Params - startDate : %s, endDate : %s', reqId, startDate, endDate);

            //Get all agent status data

            //var sessionList = [];

            backendHandler.GetResourceStatusList(startDate, endDate, statusList, agentList, companyId, tenantId, function(err, resList)
            {
                //var currentSession = {};
                //
                //currentSession.SessionList = [];

                var groupedList = underscore.groupBy(resList, function(event)
                {
                   return event.ResourceId;
                });

                /*for(i=0; i<resList.length; i++)
                {
                    var curRes = resList[i];

                    if(curRes.Status === 'Available' && curRes.Reason === 'Register')
                    {
                        if(currentSession.SessionList.length === 0)
                        {
                            currentSession.SessionStart = curRes.createdAt;
                            currentSession.SessionList.push(curRes);
                        }

                    }
                    else if(curRes.Status === 'NotAvailable' && curRes.Reason === 'UnRegister')
                    {
                        if(currentSession.SessionList.length > 0)
                        {
                            currentSession.SessionEnd = curRes.createdAt;
                            currentSession.SessionList.push(curRes);

                            var copy = JSON.parse(JSON.stringify(currentSession));

                            sessionList.push(copy);

                            currentSession = {};
                            currentSession.SessionList = [];

                        }
                    }
                    else
                    {
                        if(currentSession.SessionList.length > 0)
                        {
                            currentSession.SessionList.push(curRes);
                        }
                    }

                }*/

                var jsonString = messageFormatter.FormatMessage(null, "SUCCESS", true, groupedList);
                logger.debug('[DVP-CDRProcessor.AgentStatus] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);

            });

        }
        catch(ex)
        {
            var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, emptyArr);
            logger.debug('[DVP-CDRProcessor.AgentStatus] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }

        return next();
    });


    //query_string : ?startTime=2016-05-09&endTime=2016-05-12
    server.get('/DVP/API/:version/CallCDR/GetConferenceDetailsByRange', jwt({secret: secret.Secret}), authorization({resource:"cdr", action:"read"}), function(req, res, next)
    {
        var emptyArr = [];
        var reqId = nodeUuid.v1();
        try
        {
            var startTime = req.query.startTime;
            var endTime = req.query.endTime;
            var offset = req.query.offset;
            var limit = req.query.limit;

            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            if (!companyId || !tenantId)
            {
                throw new Error("Invalid company or tenant");
            }

            logger.debug('[DVP-CDRProcessor.GetConferenceDetailsByRange] - [%s] - HTTP Request Received - Params - StartTime : %s, EndTime : %s, Offset: %s, Limit : %s', reqId, startTime, endTime, offset, limit);

            backendHandler.GetConferenceRelatedLegsInDateRange(startTime, endTime, companyId, tenantId, offset, limit, function(err, legs)
            {
                logger.debug('[DVP-CDRProcessor.GetConferenceDetailsByRange] - [%s] - CDR Processing Done', reqId);

                var jsonString = "";

                if(err)
                {
                    jsonString = messageFormatter.FormatMessage(err, "ERROR", false, emptyArr);

                }
                else
                {
                    var groupedConf = underscore.groupBy(legs, 'CallUuid');
                    jsonString = messageFormatter.FormatMessage(null, "SUCCESS", true, groupedConf);
                }
                res.end(jsonString);



            })

        }
        catch(ex)
        {
            logger.error('[DVP-CDRProcessor.GetConferenceDetailsByRange] - [%s] - Exception occurred', reqId, ex);
            var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, emptyArr);
            logger.debug('[DVP-CDRProcessor.GetConferenceDetailsByRange] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }

        return next();
    });

    //query_string : ?appId=4&startTime=2016-05-09&endTime=2016-05-12
    server.get('/DVP/API/:version/CallCDR/GetCallDetailsByApp', jwt({secret: secret.Secret}), authorization({resource:"cdr", action:"read"}), function(req, res, next)
    {
        var emptyArr = [];
        var reqId = nodeUuid.v1();

        try
        {
            var appId = req.query.appId;
            var companyId = req.user.company;
            var tenantId = req.user.tenant;
            var startTime = req.query.startTime;
            var endTime = req.query.endTime;
            var offset = req.query.offset;
            var limit = req.query.limit;

            if (!companyId || !tenantId)
            {
                throw new Error("Invalid company or tenant");
            }

            logger.debug('[DVP-CDRProcessor.GetCallDetailsByAppId] - [%s] - HTTP Request Received - Params - AppId : %s', reqId, appId);

            backendHandler.GetCallRelatedLegsForAppId(appId, companyId, tenantId, startTime, endTime, offset, limit, function(err, legs)
            {
                if(err)
                {
                    logger.error('[DVP-CDRProcessor.GetCallDetailsByAppId] - [%s] - Exception occurred on method GetCallRelatedLegsForAppId', reqId, err);
                }
                else
                {
                    logger.debug('[DVP-CDRProcessor.GetCallDetailsByAppId] - [%s] - Get call related legs for app id success', reqId);
                }

                //var processedCdr = ProcessBatchCDR(legs);
                var jsonString = messageFormatter.FormatMessage(err, "", undefined, legs);
                logger.debug('[DVP-CDRProcessor.GetCallDetailsByAppId] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            })

        }
        catch(ex)
        {
            logger.error('[DVP-CDRProcessor.GetCallDetailsByRange] - [%s] - Exception occurred', reqId, ex);
            var jsonString = messageFormatter.FormatMessage(ex, "", undefined, emptyArr);
            logger.debug('[DVP-CDRProcessor.GetCallDetailsByAppId] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }

        return next();
    });

    //query_string : ?sessionId=fs43dg-dse43f-fd44g-fsdh53-sdffd
    server.get('/DVP/API/:version/CallCDR/GetCallDetailsBySession', jwt({secret: secret.Secret}), authorization({resource:"cdr", action:"read"}), function(req, res, next)
    {
        var emptyArr = [];
        var reqId = nodeUuid.v1();

        try
        {
            var sessionId = req.query.sessionId;

            logger.debug('[DVP-CDRProcessor.GetCallDetails] - [%s] - HTTP Request Received - Params - SessionId : %s', reqId, sessionId);

            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            if (!companyId || !tenantId)
            {
                throw new Error("Invalid company or tenant");
            }

            backendHandler.GetCallRelatedLegs(sessionId, function(err, legs)
            {
                if(err)
                {
                    logger.error('[DVP-CDRProcessor.GetCallDetails] - [%s] - Exception occurred on method GetCallRelatedLegs', reqId, err);
                }
                else
                {
                    logger.debug('[DVP-CDRProcessor.GetCallDetails] - [%s] - Get call details success', reqId);
                }

                var jsonString = messageFormatter.FormatMessage(err, "", undefined, legs);
                logger.debug('[DVP-CDRProcessor.GetCallDetails] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            })

        }
        catch(ex)
        {
            logger.error('[DVP-CDRProcessor.GetCallDetails] - [%s] - Exception occurred', reqId, ex);
            var jsonString = messageFormatter.FormatMessage(ex, "", undefined, emptyArr);
            logger.debug('[DVP-CDRProcessor.GetCallDetails] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }

        return next();
    });

    //server.post('/DVP/API/' + hostVersion + '/CallCDR/ProcessCDR', function(req,res,next)
    server.post('/DVP/API/:version/CallCDR/ProcessCDR', function(req,res,next)
    {
        var reqId = nodeUuid.v1();

        try
        {
            logger.info('[DVP-CDRProcessor.ProcessCDR] - [%s] - FS CDR Request Received', reqId);
            var cdrObj = req.body;

            var rawCDR = JSON.stringify(cdrObj);

            logger.debug('[DVP-CDRProcessor.ProcessCDR] - [%s] - CDR Request Params : %s', reqId, rawCDR);

            var varSec = cdrObj['variables'];
            var callFlowSec = cdrObj['callflow'];

            if(callFlowSec && callFlowSec.length > 0)
            {

                var timesSec = callFlowSec[0]['times'];
                var callerProfileSec = callFlowSec[0]['caller_profile'];

                var uuid = varSec['uuid'];
                var callUuid = varSec['call_uuid'];
                var bridgeUuid = varSec['bridge_uuid'];
                var sipFromUser = callerProfileSec['caller_id_number'];
                var sipToUser = callerProfileSec['destination_number'];

                if(!sipFromUser)
                {
                    sipFromUser = varSec['sip_from_user'];
                }

                if(!sipToUser)
                {
                    sipToUser = varSec['sip_to_user'];
                }

                var hangupCause = varSec['hangup_cause'];
                var direction = varSec['direction'];
                var switchName = cdrObj['switchname'];
                var callerContext = callerProfileSec['context'];
                var appId = varSec['dvp_app_id'];
                var companyId = varSec['companyid'];
                var tenantId = varSec['tenantid'];
                var currentApp = varSec['current_application'];
                var opCat = varSec['DVP_OPERATION_CAT'];
                var actionCat = varSec['DVP_ACTION_CAT'];
                var advOpAction = varSec['DVP_ADVANCED_OP_ACTION'];
                var confName = varSec['DVP_CONFERENCE_NAME'];
                var dvpCallDirection = varSec['DVP_CALL_DIRECTION'];
                var sipHangupDisposition = varSec['sip_hangup_disposition'];
                var memberuuid = varSec['memberuuid'];
                var conferenceUuid = varSec['conference_uuid'];
                var originatedLegs = varSec['originated_legs'];
                var answerDate = undefined;
                var createdDate = undefined;
                var bridgeDate = undefined;
                var hangupDate = undefined;

                if(!sipFromUser)
                {
                    sipFromUser = varSec['origination_caller_id_number'];
                }

                if(!sipToUser)
                {
                    sipToUser = varSec['dialed_user'];
                }

                if(memberuuid)
                {
                    callUuid = memberuuid;
                }

                if(conferenceUuid)
                {
                    callUuid = conferenceUuid;
                }


                var answeredTimeStamp = timesSec['answered_time'];
                if(answeredTimeStamp)
                {
                    var ansTStamp = parseInt(answeredTimeStamp)/1000;
                    answerDate = new Date(ansTStamp);
                }

                var createdTimeStamp = timesSec['created_time'];
                if(createdTimeStamp)
                {
                    var createdTStamp = parseInt(createdTimeStamp)/1000;
                    createdDate = new Date(createdTStamp);
                }

                var bridgedTimeStamp = timesSec['bridged_time'];
                if(bridgedTimeStamp)
                {
                    var bridgedTStamp = parseInt(bridgedTimeStamp)/1000;
                    bridgeDate = new Date(bridgedTStamp);
                }

                var hangupTimeStamp = timesSec['hangup_time'];
                if(hangupTimeStamp)
                {
                    var hangupTStamp = parseInt(hangupTimeStamp)/1000;
                    hangupDate = new Date(hangupTStamp);
                }

                var isAgentAnswered = false;

                var ardsAddedTimeStamp = varSec['ards_added'];
                var queueLeftTimeStamp = varSec['ards_queue_left'];
                var ardsRoutedTimeStamp = varSec['ards_routed'];
                var ardsResourceName = varSec['ards_resource_name'];
                var ardsSipName = varSec['ARDS-SIP-Name'];

                var isQueued = false;

                if(ardsAddedTimeStamp)
                {
                    isQueued = true;
                }

                var queueTime = 0;

                if(ardsAddedTimeStamp && queueLeftTimeStamp)
                {
                    var ardsAddedTimeSec = parseInt(ardsAddedTimeStamp);
                    var queueLeftTimeSec = parseInt(queueLeftTimeStamp);

                    queueTime = queueLeftTimeSec - ardsAddedTimeSec;
                }

                if(ardsRoutedTimeStamp)
                {
                    isAgentAnswered = true;
                }

                if(!appId)
                {
                    appId = '-1';
                }

                if(!companyId)
                {
                    companyId = '-1';
                }

                if(!tenantId)
                {
                    tenantId = '-1';
                }

                var agentSkill = varSec['ards_skill_display'];

                var duration = varSec['duration'];
                var billSec = varSec['billsec'];
                var holdSec = varSec['hold_accum_seconds'];
                var progressSec = varSec['progresssec'];
                var answerSec = varSec['answersec'];
                var waitSec = varSec['waitsec'];
                var progressMediaSec = varSec['progress_mediasec'];
                var flowBillSec = varSec['flow_billsec'];

                var isAnswered = false;

                if(answerDate > new Date('1970-01-01'))
                {
                    isAnswered = true;
                }

                /*if(dvpCallDirection === 'inbound' && direction === 'outbound')
                {
                    if(ardsResourceName)
                    {
                        sipToUser = ardsResourceName;
                    }
                }

                if(dvpCallDirection === 'outbound')
                {
                    if(ardsResourceName)
                    {
                        sipFromUser = ardsResourceName;
                    }
                }*/

                var cdr = dbModel.CallCDR.build({
                    Uuid: uuid,
                    CallUuid: callUuid,
                    BridgeUuid: bridgeUuid,
                    SipFromUser: sipFromUser,
                    SipToUser: sipToUser,
                    HangupCause: hangupCause,
                    Direction: direction,
                    SwitchName: switchName,
                    CallerContext: callerContext,
                    IsAnswered: isAnswered,
                    CreatedTime: createdDate,
                    AnsweredTime: answerDate,
                    BridgedTime: bridgeDate,
                    HangupTime: hangupDate,
                    Duration: duration,
                    BillSec: billSec,
                    HoldSec: holdSec,
                    ProgressSec: progressSec,
                    QueueSec: queueTime,
                    AnswerSec: answerSec,
                    WaitSec: waitSec,
                    ProgressMediaSec: progressMediaSec,
                    FlowBillSec: flowBillSec,
                    ObjClass: 'CDR',
                    ObjType: opCat,
                    ObjCategory: 'DEFAULT',
                    CompanyId: companyId,
                    TenantId: tenantId,
                    AppId: appId,
                    AgentSkill: agentSkill,
                    OriginatedLegs: originatedLegs,
                    DVPCallDirection: dvpCallDirection,
                    HangupDisposition:sipHangupDisposition,
                    AgentAnswered: isAgentAnswered,
                    IsQueued: isQueued
                });


                if(ardsSipName && dvpCallDirection === 'inbound')
                {
                    cdr.SipResource = ardsSipName;
                }

                if(actionCat === 'CONFERENCE')
                {
                    cdr.ExtraData = confName;
                }

                if(actionCat)
                {
                    cdr.ObjCategory = actionCat;
                }

                if(currentApp === 'voicemail')
                {
                    cdr.ObjCategory = 'VOICEMAIL';
                }
                else if(advOpAction === 'pickup')
                {
                    cdr.ObjCategory = 'PICKUP';
                }

                if(advOpAction === 'INTERCEPT')
                {
                    cdr.ObjCategory = 'INTERCEPT';
                }

                backendHandler.AddCDRRecord(cdr, function(err, result)
                {
                    if(err)
                    {
                        logger.error('[DVP-CDRProcessor.ProcessCDR] - [%s] - Exception occurred on method AddCDRRecord', reqId, err);
                        res.end('{}');
                    }
                    else
                    {
                        logger.debug('[DVP-CDRProcessor.ProcessCDR] - [%s] - CDR Record saved successfully - Result : %s', reqId, result);
                        res.end('{}');
                    }
                });
            }
            else
            {
                logger.error('[DVP-CDRProcessor.ProcessCDR] - [%s] - CDR Record Error - Call Flow Section Not Found - Result : %s', reqId);
                res.end('{}');
            }



            //Read App details and push it to the common app event processor

        }
        catch(ex)
        {
            logger.error('[DVP-CDRProcessor.ProcessCDR] - [%s] - Exception occurred', reqId, ex);
            res.end("{}");
        }

        return next();
    });

    function Crossdomain(req,res,next){


        var xml='<?xml version=""1.0""?><!DOCTYPE cross-domain-policy SYSTEM ""http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd""> <cross-domain-policy>    <allow-access-from domain=""*"" />        </cross-domain-policy>';

        var xml='<?xml version="1.0"?>\n';

        xml+= '<!DOCTYPE cross-domain-policy SYSTEM "/xml/dtds/cross-domain-policy.dtd">\n';
        xml+='';
        xml+=' \n';
        xml+='\n';
        xml+='';
        req.setEncoding('utf8');
        res.end(xml);

    }

    function Clientaccesspolicy(req,res,next){


        var xml='<?xml version="1.0" encoding="utf-8" ?>       <access-policy>        <cross-domain-access>        <policy>        <allow-from http-request-headers="*">        <domain uri="*"/>        </allow-from>        <grant-to>        <resource include-subpaths="true" path="/"/>        </grant-to>        </policy>        </cross-domain-access>        </access-policy>';
        req.setEncoding('utf8');
        res.end(xml);

    }

    server.get("/crossdomain.xml",Crossdomain);
    server.get("/clientaccesspolicy.xml",Clientaccesspolicy);

    server.listen(hostPort, hostIp, function () {
        console.log('%s listening at %s', server.name, server.url);
    });



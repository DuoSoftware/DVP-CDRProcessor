    var restify = require('restify');
    var backendHandler = require('./DBBackendHandler.js');
    var stringify = require('stringify');
    var dbModel = require('dvp-dbmodels');
    var underscore = require('underscore');
    var config = require('config');
    var nodeUuid = require('node-uuid');
    var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;

    var hostIp = config.Host.Ip;
    var hostPort = config.Host.Port;
    var hostVersion = config.Host.Version;


    var server = restify.createServer({
        name: 'DVP-CDRProcessor'
    });

    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.queryParser());
    server.use(restify.bodyParser());

    var ProcessBatchCDR = function(cdrList)
    {
        var emptyArr = [];

        try
        {
            var arr = underscore.groupBy(cdrList, 'CallUuid');

            return arr;
        }
        catch(ex)
        {
            return undefined;
        }
    };

    //server.get('/DVP/API/' + hostVersion + '/CallCDR/GetCallDetailsByRange/:startTime/:endTime/:companyId/:tenantId', function(req, res, next)
    server.get('/DVP/API/:version/CallCDR/GetCallDetailsByRange/:startTime/:endTime/:companyId/:tenantId', function(req, res, next)
    {
        var emptyArr = [];
        var reqId = nodeUuid.v1();
        try
        {
            var startTime = req.params.startTime;
            var endTime = req.params.endTime;
            var companyId = req.params.companyId;
            var tenantId = req.params.tenantId;

            logger.debug('[DVP-CDRProcessor.GetCallDetailsByRange] - [%s] - HTTP Request Received - Params - StartTime : %s, EndTime : %s', reqId, startTime, endTime);

            backendHandler.GetCallRelatedLegsInDateRange(startTime, endTime, companyId, tenantId, function(err, legs)
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
                var jsonString = messageFormatter.FormatMessage(err, "", undefined, processedCdr);
                logger.debug('[DVP-CDRProcessor.GetCallDetailsByRange] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            })

        }
        catch(ex)
        {
            logger.error('[DVP-CDRProcessor.GetCallDetailsByRange] - [%s] - Exception occurred', reqId, ex);
            var jsonString = messageFormatter.FormatMessage(ex, "", undefined, emptyArr);
            logger.debug('[DVP-CDRProcessor.GetCallDetailsByRange] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }

        return next();
    });

    //server.get('/DVP/API/' + hostVersion + '/CallCDR/GetCallDetailsByAppId/:appId/:companyId/:tenantId', function(req, res, next)
    server.get('/DVP/API/:version/CallCDR/GetCallDetailsByAppId/:appId/:companyId/:tenantId', function(req, res, next)
    {
        var emptyArr = [];
        var reqId = nodeUuid.v1();

        try
        {
            var appId = req.params.appId;
            var companyId = req.params.companyId;
            var tenantId = req.params.tenantId;

            logger.debug('[DVP-CDRProcessor.GetCallDetailsByAppId] - [%s] - HTTP Request Received - Params - AppId : %s', reqId, appId);

            backendHandler.GetCallRelatedLegsForAppId(appId, companyId, tenantId, function(err, legs)
            {
                if(err)
                {
                    logger.error('[DVP-CDRProcessor.GetCallDetailsByAppId] - [%s] - Exception occurred on method GetCallRelatedLegsForAppId', reqId, err);
                }
                else
                {
                    logger.debug('[DVP-CDRProcessor.GetCallDetailsByAppId] - [%s] - Get call related legs for app id success', reqId);
                }

                var processedCdr = ProcessBatchCDR(legs);
                var jsonString = messageFormatter.FormatMessage(err, "", undefined, processedCdr);
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

    //server.get('/DVP/API/' + hostVersion + '/CallCDR/GetCallDetails/:sessionId', function(req, res, next)
    server.get('/DVP/API/:version/CallCDR/GetCallDetails/:sessionId', function(req, res, next)
    {
        var emptyArr = [];
        var reqId = nodeUuid.v1();

        try
        {
            var sessionId = req.params.sessionId;

            logger.debug('[DVP-CDRProcessor.GetCallDetails] - [%s] - HTTP Request Received - Params - SessionId : %s', reqId, sessionId);

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
                //var sipFromUser = callerProfileSec['caller_id_number'];
                var sipFromUser = varSec['sip_from_user'];
                //var sipToUser = callerProfileSec['destination_number'];
                var sipToUser = varSec['sip_to_user'];
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
                var answerDate = undefined;
                var createdDate = undefined;
                var bridgeDate = undefined;
                var hangupDate = undefined;


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

                var isAnswered = bridgeUuid != undefined;
                var duration = varSec['duration'];
                var billSec = varSec['billsec'];
                var holdSec = varSec['hold_accum_seconds'];
                var progressSec = varSec['progresssec'];
                var answerSec = varSec['answersec'];
                var waitSec = varSec['waitsec'];
                var progressMediaSec = varSec['progress_mediasec'];
                var flowBillSec = varSec['flow_billsec'];

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
                    AnswerSec: answerSec,
                    WaitSec: waitSec,
                    ProgressMediaSec: progressMediaSec,
                    FlowBillSec: flowBillSec,
                    ObjClass: 'CDR',
                    ObjType: opCat,
                    ObjCategory: 'DEFAULT',
                    CompanyId: companyId,
                    TenantId: tenantId,
                    AppId: appId
                });

                if(actionCat)
                {
                    cdr.ObjCategory = actionCat;
                }

                if(currentApp === 'voicemail')
                {
                    cdr.ObjCategory = 'VOICEMAIL';
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

    server.listen(hostPort, hostIp, function () {
        console.log('%s listening at %s', server.name, server.url);
    });



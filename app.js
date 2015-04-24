var restify = require('restify');
var backendHandler = require('./DBBackendHandler.js');
var stringify = require('stringify');
var dbModel = require('./DVP-DBModels');
var underscore = require('underscore');
var config = require('config');

var hostIp = config.Host.Ip;
var hostPort = config.Host.Port;


var server = restify.createServer({
    name: hostIp,
    version: '1.0.0'
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

server.get('/DVP/API/:version/CallCDR/GetCallDetailsByRange/:startTime/:endTime/:companyId/:tenantId', function(req, res, next)
{
    try
    {
        var startTime = req.params.startTime;
        var endTime = req.params.endTime;
        var companyId = req.params.companyId;
        var tenantId = req.params.tenantId;

        backendHandler.GetCallRelatedLegsInDateRange(startTime, endTime, companyId, tenantId, function(err, legs)
        {
            var processedCdr = ProcessBatchCDR(legs);
            var jsonString = JSON.stringify(processedCdr);

            res.end(jsonString);
        })

    }
    catch(ex)
    {
        res.end('{[}}');
    }

    return next();
});

server.get('/DVP/API/:version/CallCDR/GetCallDetails/:sessionId', function(req, res, next)
{
    try
    {
        var sessionId = req.params.sessionId;

        backendHandler.GetCallRelatedLegs(sessionId, function(err, legs)
        {
            var jsonString = JSON.stringify(legs);

            res.end(jsonString);
        })

    }
    catch(ex)
    {
        res.end('{[}}');
    }

    return next();
});


server.post('/FSJsonCDR', function(req,res,next)
{
    try
    {
        var cdrObj = req.body;

        var rawCDR = JSON.stringify(cdrObj);

        console.log(rawCDR);
        console.log('\n\n\n\n');

        var varSec = cdrObj['variables'];
        var callFlowSec = cdrObj['callflow'];
        var timesSec = callFlowSec['times'];
        var callerProfileSec = callFlowSec['caller_profile'];

        var uuid = varSec['uuid'];
        var callUuid = varSec['call_uuid'];
        var bridgeUuid = varSec['bridge_uuid'];
        var sipFromUser = callerProfileSec['caller_id_number'];
        var sipToUser = callerProfileSec['destination_number'];
        var hangupCause = varSec['hangup_cause'];
        var direction = varSec['direction'];
        var switchName = cdrObj['switchname'];
        var callerContext = callerProfileSec['context'];
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



        var isAnswered = timesSec['answered_time'] != undefined;
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
            ObjType: 'CALL',
            ObjCategory: undefined,
            CompanyId: 1,
            TenantId: 3
        });

        backendHandler.AddCDRRecord(cdr, function(err, result)
        {
            if(err)
            {
                res.end('{}');
            }
            else
            {
                res.end('{}');
            }
        });

        //Read App details and push it to the common app event processor

    }
    catch(ex)
    {
        res.end("{}");
    }

    return next();
});

server.listen(hostPort, hostIp, function () {
    console.log('%s listening at %s', server.name, server.url);
});
var amqp = require('amqp');
var config = require('config');
var dbHandler = require('./DBBackendHandler.js');
var amqpPublisher = require('./MailSender.js').PublishToQueue;
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var redisHandler = require('./RedisHandler.js');

var GetSpecificLegsForTransfer = function(legUuid, cdrListArr, legInfo, callback)
{
    dbHandler.getSpecificLegByUuid(legUuid, function (err, transferLeg)
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

var collectBLegs = function(cdrListArr, uuid, callUuid, callback)
{
    dbHandler.CDRGEN_GetBLegsForIVRCalls(uuid, callUuid, function(allLegsFound, legInfo, missingLeg)
    {
        var tempTransLegNotFound = [];
        if(allLegsFound)
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

                            dbHandler.CDRGEN_GetSpecificLegByUuid(legUuid, function (err, transferLeg)
                            {
                                cdrListArr.push(legInfo[i]);

                                if(transferLeg)
                                {
                                    var tempTransLeg = transferLeg.toJSON();
                                    tempTransLeg.IsTransferredParty = true;
                                    cdrListArr.push(tempTransLeg);
                                }
                                else
                                {
                                    tempTransLegNotFound.push(legUuid);
                                }

                                current++;

                                if(current === len)
                                {
                                    if(tempTransLegNotFound.length > 0)
                                    {
                                        if(tryCount === 10)
                                        {
                                            //ADD TO REDIS
                                            redisHandler.SetObjectWithExpire('UUID_' + legUuid, uuid, 86400);
                                            redisHandler.AddSetWithExpire('UUID_MAP_' + uuid, 'UUID_' + legUuid, 86400);
                                        }
                                    }
                                    callback(null, tempTransLegNotFound.length === 0);
                                }
                            });


                        }
                        else
                        {
                            current++;

                            cdrListArr.push(legInfo[i]);

                            if(current === len)
                            {
                                callback(null, true);
                            }
                        }
                    }
                    else
                    {
                        current++;

                        cdrListArr.push(legInfo[i]);

                        if(current === len)
                        {
                            callback(null, true);
                        }
                    }


                }
                else
                {
                    current++;

                    cdrListArr.push(legInfo[i]);

                    if(current === len)
                    {
                        callback(null, true);
                    }
                }
            }

        }
        else
        {
            //ADD TO QUEUE
            if(tryCount === 10)
            {
                //ADD TO REDIS
                redisHandler.SetObjectWithExpire('CALL_UUID_' + missingLeg, uuid, 86400);
                redisHandler.AddSetWithExpire('UUID_MAP_' + uuid, 'CALL_UUID_' + missingLeg, 86400);
            }
            callback(null, false);
        }


    })
};

var collectOtherLegsCDR = function(cdrListArr, relatedLegs, tryCount, mainLegId, callback)
{
    dbHandler.CDRGEN_GetSpecificLegsByUuids(relatedLegs, function(allLegsFound, objList)
    {
        if(allLegsFound)
        {
            //LOOP THROUGH LEGS LIST
            var len = Object.keys(relatedLegs).length;

            var count = 0;

            var tempTransLegNotFound = [];

            objList.forEach(function(legInfo)
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

                            dbHandler.CDRGEN_GetSpecificLegByUuid(legUuid, function (err, transferLeg)
                            {
                                cdrListArr.push(legInfo);

                                if(transferLeg)
                                {
                                    var tempTransLeg = transferLeg.toJSON();
                                    tempTransLeg.IsTransferredParty = true;
                                    cdrListArr.push(tempTransLeg);
                                }
                                else
                                {
                                    tempTransLegNotFound.push(legUuid);
                                }

                                count++;

                                if(count === len)
                                {
                                    callback(null, tempTransLegNotFound.length === 0);
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

            });

        }
        else
        {
            //PUT BACK TO QUEUE

            if(tryCount === 10)
            {
                //ADD TO REDIS
                var waitForUuid = objList[0];
                redisHandler.SetObjectWithExpire('UUID_' + waitForUuid, mainLegId, 86400);
                redisHandler.AddSetWithExpire('UUID_MAP_' + mainLegId, 'UUID_' + waitForUuid, 86400);
            }
            callback(null, false);
        }

    });




    /*var len = Object.keys(relatedLegs).length;

    var count = 0;

    for(legUuid in relatedLegs)
    {
        dbHandler.getSpecificLegByUuid(legUuid, function(err, legInfo)
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

                            dbHandler.getSpecificLegByUuid(legUuid, function (err, transferLeg)
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

    }*/
};

var processCDRLegs = function(processedCdr, cdrList, callback)
{
    cdrList[processedCdr.Uuid] = [];
    cdrList[processedCdr.Uuid].push(processedCdr);

    var relatedLegsLength = 0;

    if(processedCdr.RelatedLegs)
    {
        relatedLegsLength = Object.keys(processedCdr.RelatedLegs).length;
    }

    if(processedCdr.RelatedLegs && relatedLegsLength)
    {
        collectOtherLegsCDR(cdrList[processedCdr.Uuid], processedCdr.RelatedLegs, processedCdr.TryCount, processedCdr.Uuid, function(err, resp)
        {
            //Response will return false if leg need to be added back to queue
            callback(null, cdrList, resp);

        })
    }
    else
    {
        if(processedCdr.ObjType === 'HTTAPI' || processedCdr.ObjType === 'SOCKET' || processedCdr.ObjCategory === 'DIALER')
        {
            collectBLegs(cdrList[processedCdr.Uuid], processedCdr.Uuid, processedCdr.CallUuid, function(err, resp)
            {

                callback(null, cdrList, resp);
            })

        }
        else
        {
            callback(null, cdrList, true);
        }


    }

};

var decodeOriginatedLegs = function(cdr)
{

    try
    {
        var OriginatedLegs = cdr.OriginatedLegs;

        if(OriginatedLegs){

            //Do HTTP DECODE
            var decodedLegsStr = decodeURIComponent(OriginatedLegs);

            var formattedStr = decodedLegsStr.replace("ARRAY::", "");

            var legsUnformattedList = formattedStr.split('|:');

            cdr.RelatedLegs = {};

            for(j=0; j<legsUnformattedList.length; j++){

                var legProperties = legsUnformattedList[j].split(';');

                var legUuid = legProperties[0];

                if(cdr.Uuid != legUuid && !cdr.RelatedLegs[legUuid]){

                    cdr.RelatedLegs[legUuid] = legUuid;
                }

            }
        }

        return cdr;
    }
    catch(ex)
    {
        return null;
    }
};

var processCampaignCDR = function(primaryLeg, curCdr)
{
    var cdrAppendObj = {};
    var callHangupDirectionA = '';
    var callHangupDirectionB = '';
    var isOutboundTransferCall = false;
    var holdSecTemp = 0;

    var callCategory = '';


    //Need to filter out inbound and outbound legs before processing

    var firstLeg = primaryLeg;

    if(firstLeg)
    {
        //Process First Leg
        callHangupDirectionA = firstLeg.HangupDisposition;

        if(firstLeg.ObjType === 'ATT_XFER_USER' || firstLeg.ObjType === 'ATT_XFER_GATEWAY')
        {
            isOutboundTransferCall = true;
        }

        cdrAppendObj.Uuid = firstLeg.Uuid;
        cdrAppendObj.RecordingUuid = firstLeg.Uuid;
        cdrAppendObj.CallUuid = firstLeg.CallUuid;
        cdrAppendObj.BridgeUuid = firstLeg.BridgeUuid;
        cdrAppendObj.SwitchName = firstLeg.SwitchName;
        cdrAppendObj.SipFromUser = firstLeg.SipFromUser;
        cdrAppendObj.SipToUser = firstLeg.SipToUser;
        cdrAppendObj.RecievedBy = firstLeg.SipToUser;
        cdrAppendObj.CallerContext = firstLeg.CallerContext;
        cdrAppendObj.HangupCause = firstLeg.HangupCause;
        cdrAppendObj.CreatedTime = firstLeg.CreatedTime;
        cdrAppendObj.Duration = firstLeg.Duration;
        cdrAppendObj.BridgedTime = firstLeg.BridgedTime;
        cdrAppendObj.HangupTime = firstLeg.HangupTime;
        cdrAppendObj.AppId = firstLeg.AppId;
        cdrAppendObj.CompanyId = firstLeg.CompanyId;
        cdrAppendObj.TenantId = firstLeg.TenantId;
        cdrAppendObj.ExtraData = firstLeg.ExtraData;
        cdrAppendObj.IsQueued = firstLeg.IsQueued;
        cdrAppendObj.IsAnswered = false;
        cdrAppendObj.CampaignName = firstLeg.CampaignName;
        cdrAppendObj.CampaignId = firstLeg.CampaignId;
        cdrAppendObj.BillSec = 0;
        cdrAppendObj.HoldSec = 0;
        cdrAppendObj.ProgressSec = 0;
        cdrAppendObj.FlowBillSec = 0;
        cdrAppendObj.ProgressMediaSec = 0;
        cdrAppendObj.WaitSec = 0;
        cdrAppendObj.AnswerSec = 0;

        holdSecTemp = holdSecTemp + firstLeg.HoldSec;

        if(firstLeg.ObjType === 'BLAST' || firstLeg.ObjType === 'DIRECT' || firstLeg.ObjType === 'IVRCALLBACK')
        {
            cdrAppendObj.BillSec = firstLeg.BillSec;
            cdrAppendObj.AnswerSec = firstLeg.AnswerSec;
            callHangupDirectionB = firstLeg.HangupDisposition;
            cdrAppendObj.IsAnswered = firstLeg.IsAnswered;
        }
        if(firstLeg.ObjType === 'AGENT')
        {
            cdrAppendObj.AgentAnswered = firstLeg.IsAnswered;
        }

        cdrAppendObj.DVPCallDirection = 'outbound';


        holdSecTemp = holdSecTemp + firstLeg.HoldSec;


        if(firstLeg.ProgressSec)
        {
            cdrAppendObj.ProgressSec = firstLeg.ProgressSec;
        }

        if(firstLeg.FlowBillSec)
        {
            cdrAppendObj.FlowBillSec = firstLeg.FlowBillSec;
        }

        if(firstLeg.ProgressMediaSec)
        {
            cdrAppendObj.ProgressMediaSec = firstLeg.ProgressMediaSec;
        }

        if(firstLeg.WaitSec)
        {
            cdrAppendObj.WaitSec = firstLeg.WaitSec;
        }

        cdrAppendObj.QueueSec = firstLeg.QueueSec;
        cdrAppendObj.AgentSkill = firstLeg.AgentSkill;

        cdrAppendObj.AnswerSec = firstLeg.AnswerSec;
        cdrAppendObj.AnsweredTime = firstLeg.AnsweredTime;

        cdrAppendObj.ObjType = firstLeg.ObjType;
        cdrAppendObj.ObjCategory = firstLeg.ObjCategory;
    }

    //process other legs

    var otherLegs = curCdr.filter(function (item) {
        if (item.ObjCategory !== 'DIALER') {
            return true;
        }
        else {
            return false;
        }

    });

    if(otherLegs && otherLegs.length > 0)
    {
        var customerLeg = otherLegs.find(function (item) {
            if (item.ObjType === 'CUSTOMER') {
                return true;
            }
            else {
                return false;
            }

        });

        var agentLeg = otherLegs.find(function (item) {
            if (item.ObjType === 'AGENT' || item.ObjType === 'PRIVATE_USER') {
                return true;
            }
            else {
                return false;
            }

        });

        if(customerLeg)
        {
            cdrAppendObj.BillSec = customerLeg.BillSec;
            cdrAppendObj.AnswerSec = customerLeg.AnswerSec;

            holdSecTemp = holdSecTemp + customerLeg.HoldSec;

            callHangupDirectionB = customerLeg.HangupDisposition;

            cdrAppendObj.IsAnswered = customerLeg.IsAnswered;

            cdrAppendObj.IsQueued = customerLeg.IsQueued;

        }

        if(agentLeg)
        {
            holdSecTemp = holdSecTemp + agentLeg.HoldSec;
            callHangupDirectionB = agentLeg.HangupDisposition;
            cdrAppendObj.RecievedBy = agentLeg.SipToUser;

            if(firstLeg.ObjType !== 'AGENT')
            {
                cdrAppendObj.AgentAnswered = agentLeg.IsAnswered;
            }
        }

        cdrAppendObj.HoldSec = holdSecTemp;
        cdrAppendObj.IvrConnectSec = 0;

    }

    if(!cdrAppendObj.IsAnswered)
    {
        cdrAppendObj.AnswerSec = cdrAppendObj.Duration;
    }


    if (callHangupDirectionA === 'recv_bye') {
        cdrAppendObj.HangupParty = 'CALLER';
    }
    else if (callHangupDirectionB === 'recv_bye') {
        cdrAppendObj.HangupParty = 'CALLEE';
    }
    else {
        cdrAppendObj.HangupParty = 'SYSTEM';
    }


    return cdrAppendObj;

};

var processSingleCdrLeg = function(primaryLeg, callback)
{
    var cdr = decodeOriginatedLegs(primaryLeg);

    var cdrList = {};

    //processCDRLegs method should immediately stop execution and return missing leg uuids or return the related cdr legs
    processCDRLegs(cdr, cdrList, function(err, resp, allLegsFound)
    {
        if(allLegsFound)
        {
            var cdrAppendObj = {};
            var primaryLeg = cdr;
            var isOutboundTransferCall = false;

            if(primaryLeg.DVPCallDirection === 'outbound' && (primaryLeg.ObjType === 'ATT_XFER_USER' || primaryLeg.ObjType === 'ATT_XFER_GATEWAY'))
            {
                isOutboundTransferCall = true;
            }

            var curCdr = resp[Object.keys(resp)[0]];

            if(cdr.ObjCategory === 'DIALER')
            {
                cdrAppendObj =  processCampaignCDR(cdr, curCdr);
            }
            else
            {
                var outLegAnswered = false;

                var callHangupDirectionA = '';
                var callHangupDirectionB = '';

                //Need to filter out inbound and outbound legs before processing

                /*var filteredInb = curCdr.filter(function (item)
                 {
                 if (item.Direction === 'inbound')
                 {
                 return true;
                 }
                 else
                 {
                 return false;
                 }

                 });*/

                var secondaryLeg = null;

                var filteredOutb = curCdr.filter(function (item)
                {
                    return item.Direction === 'outbound';
                });


                var transferredParties = '';

                var transferCallOriginalCallLeg = null;

                var transferLegB = [];
                var actualTransferLegs = [];

                if(isOutboundTransferCall)
                {
                    transferLegB = filteredOutb.filter(function (item)
                    {
                        if (item.ObjType !== 'ATT_XFER_USER' && item.ObjType !== 'ATT_XFER_GATEWAY')
                        {
                            return true;
                        }
                        else
                        {
                            return false;
                        }

                    });

                    actualTransferLegs = filteredOutb.filter(function (item)
                    {
                        if (item.ObjType === 'ATT_XFER_USER' || item.ObjType === 'ATT_XFER_GATEWAY')
                        {
                            return true;
                        }
                        else
                        {
                            return false;
                        }

                    });
                }
                else
                {
                    transferLegB = filteredOutb.filter(function (item)
                    {
                        if ((item.ObjType === 'ATT_XFER_USER' || item.ObjType === 'ATT_XFER_GATEWAY') && !item.IsTransferredParty)
                        {
                            return true;
                        }
                        else
                        {
                            return false;
                        }

                    });

                    actualTransferLegs = filteredOutb.filter(function (item)
                    {
                        if (item.IsTransferredParty)
                        {
                            return true;
                        }
                        else
                        {
                            return false;
                        }

                    });
                }



                if(transferLegB && transferLegB.length > 0)
                {

                    var transferLegBAnswered = filteredOutb.filter(function (item) {
                        return item.IsAnswered === true;
                    });

                    if(transferLegBAnswered && transferLegBAnswered.length > 0)
                    {
                        transferCallOriginalCallLeg = transferLegBAnswered[0];
                    }
                    else
                    {
                        transferCallOriginalCallLeg = transferLegB[0];
                    }
                }

                var callCategory = primaryLeg.ObjCategory;

                if(transferCallOriginalCallLeg)
                {
                    secondaryLeg = transferCallOriginalCallLeg;

                    for(k = 0; k < actualTransferLegs.length; k++)
                    {
                        transferredParties = transferredParties + actualTransferLegs[k].SipToUser + ',';
                    }
                }
                else
                {
                    if(filteredOutb.length > 1)
                    {
                        var filteredOutbAnswered = filteredOutb.filter(function (item2)
                        {
                            return item2.IsAnswered;
                        });

                        if(filteredOutbAnswered && filteredOutbAnswered.length > 0)
                        {
                            secondaryLeg = filteredOutbAnswered[0];
                        }
                        else
                        {
                            secondaryLeg = filteredOutb[0];
                        }
                    }
                    else
                    {
                        if(filteredOutb && filteredOutb.length > 0)
                        {
                            secondaryLeg = filteredOutb[0];

                            if(callCategory === 'FOLLOW_ME' || callCategory === 'FORWARDING')
                            {
                                for (k = 0; k < filteredOutb.length; k++) {
                                    transferredParties = transferredParties + filteredOutb[k].SipToUser + ',';
                                }

                            }


                        }
                    }
                }

                if(cdrAppendObj.ObjType === 'FAX_INBOUND')
                {
                    cdrAppendObj.IsAnswered = primaryLeg.IsAnswered;
                }

                //process primary leg first

                //process common data

                cdrAppendObj.Uuid = primaryLeg.Uuid;
                cdrAppendObj.RecordingUuid = primaryLeg.Uuid;
                cdrAppendObj.CallUuid = primaryLeg.CallUuid;
                cdrAppendObj.BridgeUuid = primaryLeg.BridgeUuid;
                cdrAppendObj.SwitchName = primaryLeg.SwitchName;
                cdrAppendObj.SipFromUser = primaryLeg.SipFromUser;
                cdrAppendObj.SipToUser = primaryLeg.SipToUser;
                cdrAppendObj.CallerContext = primaryLeg.CallerContext;
                cdrAppendObj.HangupCause = primaryLeg.HangupCause;
                cdrAppendObj.CreatedTime = primaryLeg.CreatedTime;
                cdrAppendObj.Duration = primaryLeg.Duration;
                cdrAppendObj.BridgedTime = primaryLeg.BridgedTime;
                cdrAppendObj.HangupTime = primaryLeg.HangupTime;
                cdrAppendObj.AppId = primaryLeg.AppId;
                cdrAppendObj.CompanyId = primaryLeg.CompanyId;
                cdrAppendObj.TenantId = primaryLeg.TenantId;
                cdrAppendObj.ExtraData = primaryLeg.ExtraData;
                cdrAppendObj.IsQueued = primaryLeg.IsQueued;
                cdrAppendObj.BusinessUnit = primaryLeg.BusinessUnit;

                cdrAppendObj.AgentAnswered = primaryLeg.AgentAnswered;

                if (primaryLeg.DVPCallDirection)
                {
                    callHangupDirectionA = primaryLeg.HangupDisposition;
                }

                cdrAppendObj.IsAnswered = false;


                cdrAppendObj.BillSec = 0;
                cdrAppendObj.HoldSec = 0;
                cdrAppendObj.ProgressSec = 0;
                cdrAppendObj.FlowBillSec = 0;
                cdrAppendObj.ProgressMediaSec = 0;
                cdrAppendObj.WaitSec = 0;

                if(primaryLeg.ProgressSec)
                {
                    cdrAppendObj.ProgressSec = primaryLeg.ProgressSec;
                }

                if(primaryLeg.FlowBillSec)
                {
                    cdrAppendObj.FlowBillSec = primaryLeg.FlowBillSec;
                }

                if(primaryLeg.ProgressMediaSec)
                {
                    cdrAppendObj.ProgressMediaSec = primaryLeg.ProgressMediaSec;
                }

                if(primaryLeg.WaitSec)
                {
                    cdrAppendObj.WaitSec = primaryLeg.WaitSec;
                }


                cdrAppendObj.DVPCallDirection = primaryLeg.DVPCallDirection;

                cdrAppendObj.HoldSec = cdrAppendObj.HoldSec +  primaryLeg.HoldSec;

                /*if (primaryLeg.DVPCallDirection === 'inbound')
                 {
                 cdrAppendObj.HoldSec = primaryLeg.HoldSec;
                 }*/


                cdrAppendObj.QueueSec = primaryLeg.QueueSec;
                cdrAppendObj.AgentSkill = primaryLeg.AgentSkill;

                cdrAppendObj.AnswerSec = primaryLeg.AnswerSec;
                cdrAppendObj.AnsweredTime = primaryLeg.AnsweredTime;

                cdrAppendObj.ObjType = primaryLeg.ObjType;
                cdrAppendObj.ObjCategory = primaryLeg.ObjCategory;


                //process outbound legs next

                if(secondaryLeg)
                {
                    if(cdrAppendObj.DVPCallDirection === 'outbound')
                    {
                        cdrAppendObj.RecordingUuid = secondaryLeg.Uuid;
                    }

                    callHangupDirectionB = secondaryLeg.HangupDisposition;

                    cdrAppendObj.RecievedBy = secondaryLeg.SipToUser;

                    cdrAppendObj.AnsweredTime = secondaryLeg.AnsweredTime;


                    cdrAppendObj.HoldSec = cdrAppendObj.HoldSec + secondaryLeg.HoldSec;
                    /*if (primaryLeg.DVPCallDirection === 'outbound')
                     {
                     cdrAppendObj.HoldSec = secondaryLeg.HoldSec;
                     }*/

                    cdrAppendObj.BillSec = secondaryLeg.BillSec;

                    if (!cdrAppendObj.ObjType)
                    {
                        cdrAppendObj.ObjType = secondaryLeg.ObjType;
                    }

                    if (!cdrAppendObj.ObjCategory)
                    {
                        cdrAppendObj.ObjCategory = secondaryLeg.ObjCategory;
                    }

                    if (secondaryLeg.BillSec > 0)
                    {
                        outLegAnswered = true;
                    }

                    cdrAppendObj.AnswerSec = secondaryLeg.AnswerSec;

                    if(!outLegAnswered && cdrAppendObj.RecievedBy)
                    {
                        cdrAppendObj.AnswerSec = secondaryLeg.Duration;
                    }

                    if(transferredParties)
                    {
                        transferredParties = transferredParties.slice(0, -1);
                        cdrAppendObj.TransferredParties = transferredParties;
                    }
                }

                /*if(transferCallOriginalCallLeg)
                 {
                 cdrAppendObj.SipFromUser = transferCallOriginalCallLeg.SipFromUser;
                 }*/


                cdrAppendObj.IvrConnectSec = cdrAppendObj.Duration - cdrAppendObj.QueueSec - cdrAppendObj.BillSec;


                cdrAppendObj.IsAnswered = outLegAnswered;


                if (callHangupDirectionA === 'recv_bye')
                {
                    cdrAppendObj.HangupParty = 'CALLER';
                }
                else if (callHangupDirectionB === 'recv_bye')
                {
                    cdrAppendObj.HangupParty = 'CALLEE';
                }
                else
                {
                    cdrAppendObj.HangupParty = 'SYSTEM';
                }
            }

            dbHandler.CDRGEN_AddProcessedCDR(cdrAppendObj, function(err, addResp)
            {
                //REMOVE REDIS OBJECTS
                redisHandler.GetSetMembers('UUID_MAP_' + cdrAppendObj.Uuid, function(err, items)
                {
                    items.forEach(function(item){
                        redisHandler.DeleteObject(item);
                    });

                    redisHandler.DeleteObject('UUID_MAP_' + cdrAppendObj.Uuid);

                    callback(null, true);

                });

            });
        }
        else
        {
            callback(null, false);
        }



    })
};

var ips = [];
if(config.RabbitMQ.ip) {
    ips = config.RabbitMQ.ip.split(",");
}


var connection = amqp.createConnection({
    //url: queueHost,
    host: ips,
    port: config.RabbitMQ.port,
    login: config.RabbitMQ.user,
    password: config.RabbitMQ.password,
    vhost: config.RabbitMQ.vhost,
    noDelay: true,
    heartbeat:10
}, {
    reconnect: true,
    reconnectBackoffStrategy: 'linear',
    reconnectExponentialLimit: 120000,
    reconnectBackoffTime: 1000
});

//logger.debug('[DVP-EventMonitor.handler] - [%s] - AMQP Creating connection ' + rmqIp + ' ' + rmqPort + ' ' + rmqUser + ' ' + rmqPassword);

connection.on('connect', function()
{
    logger.debug('[DVP-CDRProcessor.AMQPConnection] - [%s] - AMQP Connection CONNECTED');
});

connection.on('ready', function()
{
    amqpConState = 'READY';

    logger.debug('[DVP-CDRProcessor.AMQPConnection] - [%s] - AMQP Connection READY');

    connection.queue('CDRQUEUE', {durable: true, autoDelete: false}, function (q) {
        q.bind('#');

        // Receive messages
        q.subscribe(function (message) {

            processSingleCdrLeg(message, function(err, queueNotNeeded)
            {
                if(!queueNotNeeded)
                {
                    message.TryCount++;

                    console.log('=============== PUBLISH QUEUE - TRY COUNT : ' + message.TryCount + ' ================');

                    if(message.TryCount <= 20)
                    {
                        setTimeout(amqpPublisher, 3000, 'CDRQUEUE', message);

                        //amqpPublisher('CDRQUEUE', message);
                    }

                }
            })


        });

    });
});

connection.on('error', function(e)
{
    logger.error('[DVP-EventMonitor.handler] - [%s] - AMQP Connection ERROR', e);
    amqpConState = 'CLOSE';
});


var dbModel = require('dvp-dbmodels');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var config = require('config');
var Promise = require('bluebird');
var async = require('async');

var abandonCallThreshold = config.AbandonCallThreshold;

if(!abandonCallThreshold)
{
    abandonCallThreshold = 10;
}

var GetCallRelatedLegsInDateRange = function(startTime, endTime, companyId, tenantId, offset, limit, agentFilter, skillFilter, dirFilter, recFilter, customerFilter, didFilter, callback)
{
    var callLegList = [];

    try
    {
        var sqlCond = {CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, Direction: 'inbound', ObjCategory: {ne: 'CONFERENCE'}, $or: [{OriginatedLegs: {ne: null}}, {OriginatedLegs: null, $or:[{ObjType: 'HTTAPI'},{ObjType: 'SOCKET'},{ObjType: 'REJECTED'},{ObjType: 'FAX_INBOUND'},{ObjCategory: 'DND'},{ObjCategory: 'OUTBOUND_DENIED'}]}]};
        if(agentFilter)
        {
            sqlCond.$and = [];
            sqlCond.$and.push({$or :[{DVPCallDirection: 'inbound', SipResource: agentFilter},{DVPCallDirection: 'outbound', $or:[{SipResource: agentFilter}, {SipFromUser: agentFilter}]}]});
        }
        if(skillFilter)
        {
            sqlCond.AgentSkill = skillFilter;
        }
        if(dirFilter)
        {
            sqlCond.DVPCallDirection = dirFilter;
        }
        if(recFilter == 'true' || recFilter == 'false')
        {
            if(recFilter == 'true')
            {
                sqlCond.BillSec = { gt: 0 }
            }
            else
            {
                sqlCond.BillSec = 0
            }

        }

        if(customerFilter)
        {
            if(!sqlCond.$and)
            {
                sqlCond.$and = [];
            }

            sqlCond.$and.push({$or : [{DVPCallDirection: 'inbound', SipFromUser: customerFilter},{DVPCallDirection: 'outbound', SipToUser: customerFilter}]})

        }

        if(didFilter)
        {
            if(!sqlCond.$and)
            {
                sqlCond.$and = [];
            }

            sqlCond.$and.push({DVPCallDirection: 'inbound', SipToUser: didFilter});

        }

        if(limit)
        {
            var query = {where :[sqlCond], order:'"CreatedTime" DESC', limit: limit};

            if(offset)
            {
                query.offset = offset;
            }

            dbModel.CallCDR.findAll(query).then(function(callLeg)
            {

                logger.info('[DVP-CDRProcessor.GetCallRelatedLegsInDateRange] PGSQL Get call cdr records for date range query success');

                callback(undefined, callLeg);

            }).catch(function(err)
            {
                logger.error('[DVP-CDRProcessor.GetCallRelatedLegsInDateRange] PGSQL Get call cdr records for date range query failed', err);

                callback(err, callLegList);
            });

        }
        else
        {

            dbModel.CallCDR.findAll({where :[sqlCond], order:'"CreatedTime" DESC'}).then(function(callLeg)
            {

                logger.info('[DVP-CDRProcessor.GetCallRelatedLegsInDateRange] PGSQL Get call cdr records for date range query success');

                callback(undefined, callLeg);

            }).catch(function(err)
            {
                logger.error('[DVP-CDRProcessor.GetCallRelatedLegsInDateRange] PGSQL Get call cdr records for date range query failed', err);

                callback(err, callLegList);
            });
        }


    }
    catch(ex)
    {
        callback(ex, callLegList);
    }
};

var GetCallRelatedLegsInDateRangeCount = function(startTime, endTime, companyId, tenantId, agentFilter, skillFilter, dirFilter, recFilter, customerFilter, didFilter, callback)
{
    try
    {
        var sqlCond = {where:[{CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, Direction: 'inbound', ObjCategory: {ne: 'CONFERENCE'}, $or: [{OriginatedLegs: {ne: null}}, {OriginatedLegs: null, $or:[{ObjType: 'HTTAPI'},{ObjType: 'SOCKET'},{ObjType: 'REJECTED'},{ObjType: 'FAX_INBOUND'},{ObjCategory: 'DND'},{ObjCategory: 'OUTBOUND_DENIED'}]}]}]};
        //var sqlCond = {CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, Direction: 'inbound', ObjCategory: {ne: 'CONFERENCE'}, $or: [{OriginatedLegs: {ne: null}}, {OriginatedLegs: null, $or:[{ObjType: 'HTTAPI'},{ObjType: 'SOCKET'},{ObjType: 'REJECTED'},{ObjType: 'FAX_INBOUND'},{ObjCategory: 'DND'},{ObjCategory: 'OUTBOUND_DENIED'}]}]};
        if(agentFilter)
        {
            sqlCond.where[0].$and = [];
            sqlCond.where[0].$and.push({$or :[{DVPCallDirection: 'inbound', SipResource: agentFilter},{DVPCallDirection: 'outbound', $or:[{SipResource: agentFilter}, {SipFromUser: agentFilter}]}]});
        }
        if(skillFilter)
        {
            sqlCond.where[0].AgentSkill = skillFilter;
        }
        if(dirFilter)
        {
            sqlCond.where[0].DVPCallDirection = dirFilter;
        }
        if(recFilter == 'true' || recFilter == 'false')
        {
            if(recFilter == 'true')
            {
                sqlCond.where[0].BillSec = { gt: 0 }
            }
            else
            {
                sqlCond.where[0].BillSec = 0
            }

        }

        if(customerFilter)
        {
            if(!sqlCond.where[0].$and)
            {
                sqlCond.where[0].$and = [];
            }

            sqlCond.where[0].$and.push({$or : [{DVPCallDirection: 'inbound', SipFromUser: customerFilter},{DVPCallDirection: 'outbound', SipToUser: customerFilter}]})

        }

        if(didFilter)
        {
            if(!sqlCond.where[0].$and)
            {
                sqlCond.where[0].$and = [];
            }

            sqlCond.where[0].$and.push({DVPCallDirection: 'inbound', SipToUser: didFilter});

        }

        dbModel.CallCDR.aggregate('*', 'count', sqlCond).then(function(cdrCount)
        {

            callback(null, cdrCount);

        }).catch(function(err)
        {
            callback(err, 0);
        });


    }
    catch(ex)
    {
        callback(ex, 0);
    }
};

var GetCampaignCallLegsInDateRangeCount = function(startTime, endTime, companyId, tenantId, agentFilter, recFilter, customerFilter, callback)
{
    try
    {
        var sqlCond = {where:[{CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, Direction: 'outbound', ObjCategory: 'DIALER'}]};

        if(agentFilter)
        {
            sqlCond.where[0].SipResource = agentFilter;
        }
        if(recFilter == 'true' || recFilter == 'false')
        {
            if(recFilter == 'true')
            {
                sqlCond.where[0].BillSec = { gt: 0 }
            }
            else
            {
                sqlCond.where[0].BillSec = 0
            }

        }

        if(customerFilter)
        {
            sqlCond.where[0].SipToUser = customerFilter;

        }

        dbModel.CallCDR.aggregate('*', 'count', sqlCond).then(function(cdrCount)
        {
            callback(null, cdrCount);

        }).catch(function(err)
        {
            callback(err, 0);
        });


    }
    catch(ex)
    {
        callback(ex, 0);
    }
};

var GetCampaignCallLegsInDateRange = function(startTime, endTime, companyId, tenantId, offset, limit, agentFilter, recFilter, customerFilter, callback)
{
    var callLegList = [];

    try
    {
        var sqlCond = {CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, Direction: 'outbound', ObjCategory: 'DIALER'};

        if(agentFilter)
        {
            sqlCond.where[0].SipResource = agentFilter;
        }
        if(recFilter == 'true' || recFilter == 'false')
        {
            if(recFilter == 'true')
            {
                sqlCond.where[0].BillSec = { gt: 0 }
            }
            else
            {
                sqlCond.where[0].BillSec = 0
            }

        }

        if(customerFilter)
        {
            sqlCond.where[0].SipToUser = customerFilter;

        }

        if(limit)
        {
            var query = {where :[sqlCond], order:'"CreatedTime" DESC', limit: limit};

            if(offset)
            {
                query.offset = offset;
            }

            dbModel.CallCDR.findAll(query).then(function(callLeg)
            {
                callback(undefined, callLeg);

            }).catch(function(err)
            {
                callback(err, callLegList);
            });

        }
        else
        {

            dbModel.CallCDR.findAll({where :[sqlCond], order:'"CreatedTime" DESC'}).then(function(callLeg)
            {
                callback(undefined, callLeg);

            }).catch(function(err)
            {
                callback(err, callLegList);
            });
        }


    }
    catch(ex)
    {
        callback(ex, callLegList);
    }
};

var GetAbandonCallRelatedLegsInDateRangeCount = function(startTime, endTime, companyId, tenantId, agentFilter, skillFilter, customerFilter, didFilter, callback)
{
    try
    {
        var sqlCond = {where :[{CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, ObjType: 'HTTAPI', Direction: 'inbound', QueueSec: {gt: abandonCallThreshold}, AgentAnswered: false, ObjCategory: {ne: 'CONFERENCE'}, $or: [{OriginatedLegs: {ne: null}}, {OriginatedLegs: null, $or:[{ObjType: 'HTTAPI'},{ObjType: 'SOCKET'},{ObjType: 'REJECTED'},{ObjCategory: 'DND'},{ObjCategory: 'OUTBOUND_DENIED'}]}]}]}

        //var sqlCond = {CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, ObjType: 'HTTAPI', Direction: 'inbound', QueueSec: {gt: abandonCallThreshold}, AgentAnswered: false, ObjCategory: {ne: 'CONFERENCE'}, $or: [{OriginatedLegs: {ne: null}}, {OriginatedLegs: null, $or:[{ObjType: 'HTTAPI'},{ObjType: 'SOCKET'},{ObjType: 'REJECTED'},{ObjCategory: 'DND'},{ObjCategory: 'OUTBOUND_DENIED'}]}]};

        if(agentFilter)
        {
            sqlCond.where[0].$and = [];
            sqlCond.where[0].$and.push({$or :[{DVPCallDirection: 'inbound', SipResource: agentFilter},{DVPCallDirection: 'outbound', $or:[{SipResource: agentFilter}, {SipFromUser: agentFilter}]}]});
        }
        if(skillFilter)
        {
            sqlCond.where[0].AgentSkill = skillFilter;
        }

        if(customerFilter)
        {
            if(!sqlCond.where[0].$and)
            {
                sqlCond.where[0].$and = [];
            }

            sqlCond.where[0].$and.push({$or : [{DVPCallDirection: 'inbound', SipFromUser: customerFilter},{DVPCallDirection: 'outbound', SipToUser: customerFilter}]})

        }

        if(didFilter)
        {
            if(!sqlCond.where[0].$and)
            {
                sqlCond.where[0].$and = [];
            }

            sqlCond.where[0].$and.push({DVPCallDirection: 'inbound', SipToUser: didFilter});

        }

        dbModel.CallCDR.aggregate('*', 'count', sqlCond).then(function(abandonCdrCount)
        {

            callback(null, abandonCdrCount);

        }).catch(function(err)
        {
            callback(err, 0);
        });


    }
    catch(ex)
    {
        callback(ex, 0);
    }
};

var GetAbandonCallRelatedLegsInDateRange = function(startTime, endTime, companyId, tenantId, offset, limit, agentFilter, skillFilter, customerFilter, didFilter, callback)
{
    var callLegList = [];

    try
    {

        var sqlCond = {CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, ObjType: 'HTTAPI', Direction: 'inbound', QueueSec: {gt: abandonCallThreshold}, AgentAnswered: false, ObjCategory: {ne: 'CONFERENCE'}, $or: [{OriginatedLegs: {ne: null}}, {OriginatedLegs: null, $or:[{ObjType: 'HTTAPI'},{ObjType: 'SOCKET'},{ObjType: 'REJECTED'},{ObjCategory: 'DND'},{ObjCategory: 'OUTBOUND_DENIED'}]}]};

        if(agentFilter)
        {
            sqlCond.$and = [];
            sqlCond.$and.push({$or :[{DVPCallDirection: 'inbound', SipResource: agentFilter},{DVPCallDirection: 'outbound', $or:[{SipResource: agentFilter}, {SipFromUser: agentFilter}]}]});
        }
        if(skillFilter)
        {
            sqlCond.AgentSkill = skillFilter;
        }

        if(customerFilter)
        {
            if(!sqlCond.$and)
            {
                sqlCond.$and = [];
            }

            sqlCond.$and.push({$or : [{DVPCallDirection: 'inbound', SipFromUser: customerFilter},{DVPCallDirection: 'outbound', SipToUser: customerFilter}]})

        }

        if(didFilter)
        {
            if(!sqlCond.$and)
            {
                sqlCond.$and = [];
            }

            sqlCond.$and.push({DVPCallDirection: 'inbound', SipToUser: didFilter});

        }

        if(limit)
        {
            var query = {where :[sqlCond], order:'"CreatedTime" DESC', limit: limit};
            if(offset)
            {
                query.offset = offset;
            }

            dbModel.CallCDR.findAll(query).then(function(callLeg)
            {

                logger.info('[DVP-CDRProcessor.GetAbandonCallRelatedLegsInDateRange] PGSQL Get call cdr records for date range query success');

                callback(undefined, callLeg);

            }).catch(function(err)
            {
                logger.error('[DVP-CDRProcessor.GetAbandonCallRelatedLegsInDateRange] PGSQL Get call cdr records for date range query failed', err);

                callback(err, callLegList);
            });
        }
        else
        {
            dbModel.CallCDR.findAll({where :[sqlCond], order:'"CreatedTime" DESC'}).then(function(callLeg)
            {

                logger.info('[DVP-CDRProcessor.GetAbandonCallRelatedLegsInDateRange] PGSQL Get call cdr records for date range query success');

                callback(undefined, callLeg);

            }).catch(function(err)
            {
                logger.error('[DVP-CDRProcessor.GetAbandonCallRelatedLegsInDateRange] PGSQL Get call cdr records for date range query failed', err);

                callback(err, callLegList);
            });
        }


    }
    catch(ex)
    {
        callback(ex, callLegList);
    }
};

var GetIVRCallCount = function(st, et, skill, companyId, tenantId, callback)
{
    var query = {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', ObjType: 'HTTAPI'}]};
    if(skill)
    {
        query.where[0].AgentSkill = skill;
    }

    dbModel.CallCDRProcessed.aggregate('*', 'count', query).then(function(callCount)
    {
        callback(null, callCount);
    }).catch(function(err)
    {
        callback(err, 0);
    });

};

var GetQueuedCallCount = function(st, et, skill, companyId, tenantId, callback)
{
    var query = {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', IsQueued: true, ObjType: 'HTTAPI'}]};
    if(skill)
    {
        query.where[0].AgentSkill = skill;
    }

    dbModel.CallCDRProcessed.aggregate('*', 'count', query).then(function(queuedCount)
    {
        callback(null, queuedCount);
    }).catch(function(err)
    {
        callback(err, 0);
    });

};

var GetAbandonCallsCount = function(st, et, skill, companyId, tenantId, callback)
{
    var query = {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, IsQueued: true, DVPCallDirection: 'inbound', QueueSec: {gt: abandonCallThreshold}, AgentAnswered: false, ObjType: 'HTTAPI'}]};
    if(skill)
    {
        query.where[0].AgentSkill = skill;
    }

    dbModel.CallCDRProcessed.aggregate('*', 'count', query).then(function(abandonCount)
    {
        callback(null, abandonCount);
    }).catch(function(err)
    {
        callback(err, 0);
    });

};

var GetDropCallsCount = function(st, et, skill, companyId, tenantId, callback)
{
    var query = {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, IsQueued: true, DVPCallDirection: 'inbound', QueueSec: {lte: abandonCallThreshold}, AgentAnswered: false, ObjType: 'HTTAPI'}]};
    if(skill)
    {
        query.where[0].AgentSkill = skill;
    }


    dbModel.CallCDRProcessed.aggregate('*', 'count', query).then(function(dropCount)
    {
        callback(null, dropCount);
    }).catch(function(err)
    {
        callback(err, 0);
    });

};

var GetHoldAverage = function(st, et, skill, companyId, tenantId, callback)
{
    var query = {where :[{CreatedTime : { gte: st , lt: et}, HoldSec: {gt: 0}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', AgentAnswered: true, ObjType: 'HTTAPI'}]};

    if(skill)
    {
        query.where[0].AgentSkill = skill;
    }

    dbModel.CallCDRProcessed.aggregate('HoldSec', 'avg', query).then(function(holdAvg)
    {
        callback(null, holdAvg);
    }).catch(function(err)
    {
        callback(err, 0);
    });

};

var GetIvrAverage = function(st, et, skill, companyId, tenantId, callback)
{
    var query = {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', ObjType: 'HTTAPI'}]};
    if(skill)
    {
        query.where[0].AgentSkill = skill;
    }


    dbModel.CallCDRProcessed.aggregate('IvrConnectSec', 'avg', query).then(function(ivrAvg)
    {
        callback(null, ivrAvg);
    }).catch(function(err)
    {
        callback(err, 0);
    });

};

var GetRingAverage = function(st, et, skill, companyId, tenantId, callback)
{
    var query = {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', AgentAnswered: true, ObjType: 'HTTAPI'}]};
    if(skill)
    {
        query.where[0].AgentSkill = skill;
    }

    dbModel.CallCDRProcessed.aggregate('AnswerSec', 'avg', query).then(function(ringAvg)
    {
        callback(null, ringAvg);
    }).catch(function(err)
    {
        callback(err, 0);
    });

};

var GetTalkAverage = function(st, et, skill, companyId, tenantId, callback)
{
    var query = {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', AgentAnswered: true, ObjType: 'HTTAPI'}]};
    if(skill)
    {
        query.where[0].AgentSkill = skill;
    }

    dbModel.CallCDRProcessed.aggregate('BillSec', 'avg', query).then(function(talkAvg)
    {
        callback(null, talkAvg);
    }).catch(function(err)
    {
        callback(err, 0);
    });

};

var GetAnswerCount = function(st, et, skill, companyId, tenantId, callback)
{
    var query = {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', AgentAnswered: true, ObjType: 'HTTAPI'}]};
    if(skill)
    {
        query.where[0].AgentSkill = skill;
    }


    dbModel.CallCDRProcessed.aggregate('*', 'count', query).then(function(answerCount)
    {
        callback(null, answerCount);
    }).catch(function(err)
    {
        callback(err, 0);
    });

};

var GetCallSummaryDetailsDateRange = function(caption, startTime, endTime, companyId, tenantId, callback)
{
    var summaryDetails = {};
    try
    {
        var st = startTime.toISOString();
        var et = endTime.toISOString();

        dbModel.CallCDRProcessed.aggregate('*', 'count', {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', ObjType: 'HTTAPI'}]}).then(function(callCount)
        {
            if(callCount)
            {
                summaryDetails.IVRCallsCount = callCount;
            }
            else
            {
                summaryDetails.IVRCallsCount = 0;
            }

            dbModel.CallCDRProcessed.aggregate('*', 'count', {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', IsQueued: true, ObjType: 'HTTAPI'}]}).then(function(queuedCount)
            {
                if(callCount)
                {
                    summaryDetails.QueuedCallsCount = queuedCount;
                }
                else
                {
                    summaryDetails.QueuedCallsCount = 0;
                }


                dbModel.CallCDRProcessed.aggregate('*', 'count', {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', QueueSec: {gt: abandonCallThreshold}, AgentAnswered: false, IsQueued: true, ObjType: 'HTTAPI'}]}).then(function(abandonCount)
                {
                    if(abandonCount)
                    {
                        summaryDetails.AbandonCallsCount = abandonCount;
                    }
                    else
                    {
                        summaryDetails.AbandonCallsCount = 0;
                    }

                    if(summaryDetails.QueuedCallsCount)
                    {
                        summaryDetails.AbandonPercentage = Math.round((summaryDetails.AbandonCallsCount / summaryDetails.QueuedCallsCount) * 100);
                    }
                    else
                    {
                        summaryDetails.AbandonPercentage = 'N/A';
                    }


                    dbModel.CallCDRProcessed.aggregate('*', 'count', {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', QueueSec: {lte: abandonCallThreshold}, IsQueued: true, AgentAnswered: false, ObjType: 'HTTAPI'}]}).then(function(dropCount)
                    {
                        if(dropCount)
                        {
                            summaryDetails.DropCallsCount = dropCount;
                        }
                        else
                        {
                            summaryDetails.DropCallsCount = 0;
                        }

                        if(summaryDetails.QueuedCallsCount)
                        {
                            summaryDetails.DropPercentage = Math.round((summaryDetails.DropCallsCount / summaryDetails.QueuedCallsCount) * 100);
                        }
                        else
                        {
                            summaryDetails.DropPercentage = 'N/A';
                        }

                        dbModel.CallCDRProcessed.aggregate('HoldSec', 'avg', {where :[{CreatedTime : { gte: st , lt: et}, HoldSec: {gt: 0}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', AgentAnswered: true, ObjType: 'HTTAPI'}]}).then(function(holdAvg)
                        {
                            if(holdAvg)
                            {
                                summaryDetails.HoldAverage = holdAvg;
                            }
                            else
                            {
                                summaryDetails.HoldAverage = 'N/A';
                            }

                            dbModel.CallCDRProcessed.aggregate('IvrConnectSec', 'avg', {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', ObjType: 'HTTAPI'}]}).then(function(ivrAvg)
                            {
                                if(ivrAvg)
                                {
                                    summaryDetails.IvrAverage = ivrAvg;
                                }
                                else
                                {
                                    summaryDetails.IvrAverage = 'N/A';
                                }

                                dbModel.CallCDRProcessed.aggregate('AnswerSec', 'avg', {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', AgentAnswered: true, ObjType: 'HTTAPI'}]}).then(function(ringAvg)
                                {
                                    if(ringAvg)
                                    {
                                        summaryDetails.RingAverage = ringAvg;
                                    }
                                    else
                                    {
                                        summaryDetails.RingAverage = 'N/A';
                                    }

                                    dbModel.CallCDRProcessed.aggregate('BillSec', 'avg', {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', AgentAnswered: true, ObjType: 'HTTAPI'}]}).then(function(talkAvg)
                                    {
                                        if(talkAvg)
                                        {
                                            summaryDetails.TalkAverage = talkAvg;
                                        }
                                        else
                                        {
                                            summaryDetails.TalkAverage = 'N/A';
                                        }

                                        dbModel.CallCDRProcessed.aggregate('*', 'count', {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', AgentAnswered: true, ObjType: 'HTTAPI'}]}).then(function(answerCount)
                                        {
                                            if(answerCount)
                                            {
                                                summaryDetails.AnswerCount = answerCount;
                                            }
                                            else
                                            {
                                                summaryDetails.AnswerCount = 0;
                                            }

                                            if(summaryDetails.QueuedCallsCount)
                                            {
                                                summaryDetails.AnswerPercentage = Math.round((summaryDetails.AnswerCount / summaryDetails.QueuedCallsCount) * 100);
                                            }
                                            else
                                            {
                                                summaryDetails.AnswerPercentage = 'N/A';
                                            }

                                            summaryDetails.Caption = caption;

                                            callback(null, summaryDetails);

                                        }).catch(function(err)
                                        {
                                            callback(err, summaryDetails);
                                        });

                                    }).catch(function(err)
                                    {
                                        callback(err, summaryDetails);
                                    });

                                }).catch(function(err)
                                {
                                    callback(err, summaryDetails);
                                });

                            }).catch(function(err)
                            {
                                callback(err, summaryDetails);
                            });

                        }).catch(function(err)
                        {
                            callback(err, summaryDetails);
                        });

                    }).catch(function(err)
                    {
                        callback(err, summaryDetails);
                    });

                }).catch(function(err)
                {
                    callback(err, summaryDetails);
                });

            }).catch(function(err)
            {
                callback(err, summaryDetails);
            });


        }).catch(function(err)
        {
            callback(err, summaryDetails);
        });


    }
    catch(ex)
    {
        callback(ex, summaryDetails);
    }
};

var GetCallSummaryDetailsDateRangeWithSkill = function(caption, startTime, endTime, companyId, tenantId, skill, callback)
{
    var summaryDetails = {};
    try
    {
        var asyncArr = [];

        var st = startTime.toISOString();
        var et = endTime.toISOString();

        asyncArr.push(GetIVRCallCount.bind(this, st, et, skill, companyId, tenantId));
        asyncArr.push(GetQueuedCallCount.bind(this, st, et, skill, companyId, tenantId));
        asyncArr.push(GetAbandonCallsCount.bind(this, st, et, skill, companyId, tenantId));
        asyncArr.push(GetDropCallsCount.bind(this, st, et, skill, companyId, tenantId));
        asyncArr.push(GetHoldAverage.bind(this, st, et, skill, companyId, tenantId));
        asyncArr.push(GetIvrAverage.bind(this, st, et, skill, companyId, tenantId));
        asyncArr.push(GetRingAverage.bind(this, st, et, skill, companyId, tenantId));
        asyncArr.push(GetTalkAverage.bind(this, st, et, skill, companyId, tenantId));
        asyncArr.push(GetAnswerCount.bind(this, st, et, skill, companyId, tenantId));

        async.parallel(asyncArr, function(err, results){

            if(err)
            {
                callback(err, summaryDetails);
            }
            else
            {
                summaryDetails.IVRCallsCount = results[0];
                summaryDetails.QueuedCallsCount = results[1];
                summaryDetails.AbandonCallsCount = results[2];

                if(summaryDetails.QueuedCallsCount)
                {
                    summaryDetails.AbandonPercentage = Math.round((summaryDetails.AbandonCallsCount / summaryDetails.QueuedCallsCount) * 100);
                }
                else
                {
                    summaryDetails.AbandonPercentage = 'N/A';
                }

                summaryDetails.DropCallsCount = results[3];

                if(summaryDetails.QueuedCallsCount)
                {
                    summaryDetails.DropPercentage = Math.round((summaryDetails.DropCallsCount / summaryDetails.QueuedCallsCount) * 100);
                }
                else
                {
                    summaryDetails.DropPercentage = 'N/A';
                }

                if(results[4])
                {
                    summaryDetails.HoldAverage = results[4];
                }
                else
                {
                    summaryDetails.HoldAverage = 'N/A';
                }

                if(results[5])
                {
                    summaryDetails.IvrAverage = results[5];
                }
                else
                {
                    summaryDetails.IvrAverage = 'N/A';
                }

                if(results[6])
                {
                    summaryDetails.RingAverage = results[6];
                }
                else
                {
                    summaryDetails.RingAverage = 'N/A';
                }

                if(results[7])
                {
                    summaryDetails.TalkAverage = results[7];
                }
                else
                {
                    summaryDetails.TalkAverage = 'N/A';
                }

                if(results[8])
                {
                    summaryDetails.AnswerCount = results[8];
                }
                else
                {
                    summaryDetails.AnswerCount = 0;
                }

                if(summaryDetails.QueuedCallsCount)
                {
                    summaryDetails.AnswerPercentage = Math.round((summaryDetails.AnswerCount / summaryDetails.QueuedCallsCount) * 100);
                }
                else
                {
                    summaryDetails.AnswerPercentage = 'N/A';
                }

                summaryDetails.Caption = caption;

                callback(null, summaryDetails);
            }

        });

        /*dbModel.CallCDRProcessed.aggregate('*', 'count', {where :[{CreatedTime : { gte: st , lt: et}, AgentSkill: skill, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', ObjType: 'HTTAPI'}]}).then(function(callCount)
        {
            if(callCount)
            {
                summaryDetails.IVRCallsCount = callCount;
            }
            else
            {
                summaryDetails.IVRCallsCount = 0;
            }

            dbModel.CallCDRProcessed.aggregate('*', 'count', {where :[{CreatedTime : { gte: st , lt: et}, AgentSkill: skill, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', IsQueued: true, ObjType: 'HTTAPI'}]}).then(function(queuedCount)
            {
                if(callCount)
                {
                    summaryDetails.QueuedCallsCount = queuedCount;
                }
                else
                {
                    summaryDetails.QueuedCallsCount = 0;
                }


                dbModel.CallCDRProcessed.aggregate('*', 'count', {where :[{CreatedTime : { gte: st , lt: et}, AgentSkill: skill, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', QueueSec: {gt: abandonCallThreshold}, AgentAnswered: false, ObjType: 'HTTAPI'}]}).then(function(abandonCount)
                {
                    if(abandonCount)
                    {
                        summaryDetails.AbandonCallsCount = abandonCount;
                    }
                    else
                    {
                        summaryDetails.AbandonCallsCount = 0;
                    }

                    if(summaryDetails.IVRCallsCount)
                    {
                        summaryDetails.AbandonPercentage = Math.round((summaryDetails.AbandonCallsCount / summaryDetails.IVRCallsCount) * 100);
                    }
                    else
                    {
                        summaryDetails.AbandonPercentage = 'N/A';
                    }


                    dbModel.CallCDRProcessed.aggregate('*', 'count', {where :[{CreatedTime : { gte: st , lt: et}, AgentSkill: skill, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', QueueSec: {lte: abandonCallThreshold}, AgentAnswered: false, ObjType: 'HTTAPI'}]}).then(function(dropCount)
                    {
                        if(dropCount)
                        {
                            summaryDetails.DropCallsCount = dropCount;
                        }
                        else
                        {
                            summaryDetails.DropCallsCount = 0;
                        }

                        if(summaryDetails.IVRCallsCount)
                        {
                            summaryDetails.DropPercentage = Math.round((summaryDetails.DropCallsCount / summaryDetails.IVRCallsCount) * 100);
                        }
                        else
                        {
                            summaryDetails.DropPercentage = 'N/A';
                        }

                        dbModel.CallCDRProcessed.aggregate('HoldSec', 'avg', {where :[{CreatedTime : { gte: st , lt: et}, AgentSkill: skill, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', AgentAnswered: true, ObjType: 'HTTAPI'}]}).then(function(holdAvg)
                        {
                            if(holdAvg)
                            {
                                summaryDetails.HoldAverage = holdAvg;
                            }
                            else
                            {
                                summaryDetails.HoldAverage = 'N/A';
                            }

                            dbModel.CallCDRProcessed.aggregate('IvrConnectSec', 'avg', {where :[{CreatedTime : { gte: st , lt: et}, AgentSkill: skill, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', ObjType: 'HTTAPI'}]}).then(function(ivrAvg)
                            {
                                if(ivrAvg)
                                {
                                    summaryDetails.IvrAverage = ivrAvg;
                                }
                                else
                                {
                                    summaryDetails.IvrAverage = 'N/A';
                                }

                                dbModel.CallCDRProcessed.aggregate('AnswerSec', 'avg', {where :[{CreatedTime : { gte: st , lt: et}, AgentSkill: skill, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', AgentAnswered: true, ObjType: 'HTTAPI'}]}).then(function(ringAvg)
                                {
                                    if(ringAvg)
                                    {
                                        summaryDetails.RingAverage = ringAvg;
                                    }
                                    else
                                    {
                                        summaryDetails.RingAverage = 'N/A';
                                    }

                                    dbModel.CallCDRProcessed.aggregate('BillSec', 'avg', {where :[{CreatedTime : { gte: st , lt: et}, AgentSkill: skill, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', AgentAnswered: true, ObjType: 'HTTAPI'}]}).then(function(talkAvg)
                                    {
                                        if(talkAvg)
                                        {
                                            summaryDetails.TalkAverage = talkAvg;
                                        }
                                        else
                                        {
                                            summaryDetails.TalkAverage = 'N/A';
                                        }

                                        dbModel.CallCDRProcessed.aggregate('*', 'count', {where :[{CreatedTime : { gte: st , lt: et}, AgentSkill: skill, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', AgentAnswered: true, ObjType: 'HTTAPI'}]}).then(function(answerCount)
                                        {
                                            if(answerCount)
                                            {
                                                summaryDetails.AnswerCount = answerCount;
                                            }
                                            else
                                            {
                                                summaryDetails.AnswerCount = 0;
                                            }

                                            if(summaryDetails.IVRCallsCount)
                                            {
                                                summaryDetails.AnswerPercentage = Math.round((summaryDetails.AnswerCount / summaryDetails.IVRCallsCount) * 100);
                                            }
                                            else
                                            {
                                                summaryDetails.AnswerPercentage = 'N/A';
                                            }

                                            summaryDetails.Caption = caption;

                                            callback(null, summaryDetails);

                                        }).catch(function(err)
                                        {
                                            callback(err, summaryDetails);
                                        });

                                    }).catch(function(err)
                                    {
                                        callback(err, summaryDetails);
                                    });

                                }).catch(function(err)
                                {
                                    callback(err, summaryDetails);
                                });

                            }).catch(function(err)
                            {
                                callback(err, summaryDetails);
                            });

                        }).catch(function(err)
                        {
                            callback(err, summaryDetails);
                        });

                    }).catch(function(err)
                    {
                        callback(err, summaryDetails);
                    });

                }).catch(function(err)
                {
                    callback(err, summaryDetails);
                });

            }).catch(function(err)
            {
                callback(err, summaryDetails);
            });


        }).catch(function(err)
        {
            callback(err, summaryDetails);
        });*/


    }
    catch(ex)
    {
        callback(ex, summaryDetails);
    }
};

var GetConferenceRelatedLegsInDateRange = function(startTime, endTime, companyId, tenantId, offset, limit, callback)
{
    var confLegList = [];

    try
    {
        if(offset)
        {

            dbModel.CallCDR.findAll({where :[{CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, id: { gt: offset }, ObjCategory: 'CONFERENCE'}], order:['CreatedTime'], limit: limit}).then(function(callLeg)
            {

                logger.info('[DVP-CDRProcessor.GetCallRelatedLegsInDateRange] PGSQL Get call cdr records for date range query success');

                callback(undefined, callLeg);

            }).catch(function(err)
            {
                logger.error('[DVP-CDRProcessor.GetCallRelatedLegsInDateRange] PGSQL Get call cdr records for date range query failed', err);

                callback(err, confLegList);
            });
        }
        else
        {
            dbModel.CallCDR.findAll({where :[{CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, ObjCategory: 'CONFERENCE'}], order:['CreatedTime'], limit: limit}).then(function(callLeg)
            {

                logger.info('[DVP-CDRProcessor.GetCallRelatedLegsInDateRange] PGSQL Get call cdr records for date range query success');

                callback(undefined, callLeg);

            }).catch(function(err)
            {
                logger.error('[DVP-CDRProcessor.GetCallRelatedLegsInDateRange] PGSQL Get call cdr records for date range query failed', err);

                callback(err, confLegList);
            })
        }


    }
    catch(ex)
    {
        callback(ex, confLegList);
    }
};

var GetCallRelatedLegsForAppId = function(appId, companyId, tenantId, startTime, endTime, offset, limit, callback)
{
    var callLegList = [];

    try
    {
        dbModel.CallCDR.findAll({where :[{CreatedTime : {between:[startTime, endTime]}, AppId : appId, CompanyId: companyId, TenantId: tenantId, Direction: 'inbound'}], offset: offset, limit: limit}).then(function(callLeg)
        {
            logger.info('[DVP-CDRProcessor.GetCallRelatedLegsForAppId] PGSQL Get call cdr records for app id query success');

            if(callLeg.length > 200)
            {
                callback(new Error('Too much data to load - please narrow the search'), callLegList);
            }
            else
            {
                callback(undefined, callLeg);
            }

        }).catch(function(err)
        {
            logger.error('[DVP-CDRProcessor.GetCallRelatedLegsForAppId] PGSQL Get call cdr records for app id query failed', err);
            callback(err, callLegList);
        })

    }
    catch(ex)
    {
        callback(ex, callLegList);
    }
};

var GetProcessedCDRInDateRangeCustomer = function(startTime, endTime, companyId, tenantId, callback)
{
    var callLegList = [];

    try
    {
        var sqlCond = {CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId};
        sqlCond.$and = [];
        sqlCond.$and.push({$or : [{DVPCallDirection: 'inbound'},{DVPCallDirection: 'outbound', ObjCategory: 'GATEWAY'}]});


        dbModel.CallCDRProcessed.findAll({where :[sqlCond], order:'"CreatedTime" ASC'}).then(function(callLeg)
        {
            callback(undefined, callLeg);

        }).catch(function(err)
        {
            callback(err, callLegList);
        })


    }
    catch(ex)
    {
        callback(ex, callLegList);
    }
};

var GetProcessedCDRForSessions = function(sessionIdArr, companyId, tenantId, callback)
{
    var callLegList = [];

    try
    {

        dbModel.CallCDRProcessed.findAll({where :[{Uuid: {in: sessionIdArr}}]})
        .then(function(callLeg)
        {
            callback(undefined, callLeg);

        }).catch(function(err)
        {
            callback(err, callLegList);
        })


    }
    catch(ex)
    {
        callback(ex, callLegList);
    }
};

var GetProcessedCDRInDateRange = function(startTime, endTime, companyId, tenantId, agentFilter, skillFilter, dirFilter, recFilter, customerFilter, didFilter, limit, offset, callback)
{
    var callLegList = [];

    try
    {
        var sqlCond = {CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, ObjCategory: {ne: 'DIALER'}};
        if(agentFilter)
        {
            sqlCond.$and = [];
            sqlCond.$and.push({$or :[{DVPCallDirection: 'inbound', RecievedBy: agentFilter},{DVPCallDirection: 'outbound', SipFromUser: agentFilter}]});
        }
        if(skillFilter)
        {
            sqlCond.AgentSkill = skillFilter;
        }
        if(dirFilter)
        {
            sqlCond.DVPCallDirection = dirFilter;
        }
        if(recFilter == 'true' || recFilter == 'false')
        {
            if(recFilter == 'true')
            {
                sqlCond.BillSec = { gt: 0 }
            }
            else
            {
                sqlCond.BillSec = 0
            }

        }

        if(customerFilter)
        {
            if(!sqlCond.$and)
            {
                sqlCond.$and = [];
            }

            sqlCond.$and.push({$or : [{DVPCallDirection: 'inbound', SipFromUser: customerFilter},{DVPCallDirection: 'outbound', SipToUser: customerFilter}]})

        }

        if(didFilter)
        {
            if(!sqlCond.$and)
            {
                sqlCond.$and = [];
            }

            sqlCond.$and.push({DVPCallDirection: 'inbound', SipToUser: didFilter});

        }

        var query = {where :[sqlCond], order:'"CreatedTime" DESC'};

        if(limit >= 0)
        {
            query.limit = limit;
        }

        if(offset >= 0)
        {
            query.offset = offset;
        }

        dbModel.CallCDRProcessed.findAll(query).then(function(callLeg)
        {
            callback(undefined, callLeg);

        }).catch(function(err)
        {
            callback(err, callLegList);
        })


    }
    catch(ex)
    {
        callback(ex, callLegList);
    }
};

var GetProcessedCampaignCDRInDateRange = function(startTime, endTime, companyId, tenantId, agentFilter, recFilter, customerFilter, limit, offset, callback)
{
    var callLegList = [];

    try
    {
        var sqlCond = {CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, Direction: 'outbound', ObjCategory: 'DIALER'};

        if(agentFilter)
        {
            sqlCond.where[0].SipResource = agentFilter;
        }
        if(recFilter == 'true' || recFilter == 'false')
        {
            if(recFilter == 'true')
            {
                sqlCond.where[0].BillSec = { gt: 0 }
            }
            else
            {
                sqlCond.where[0].BillSec = 0
            }

        }

        if(customerFilter)
        {
            sqlCond.where[0].SipToUser = customerFilter;

        }

        var query = {where :[sqlCond], order:'"CreatedTime" DESC'};

        if(limit >= 0)
        {
            query.limit = limit;
        }

        if(offset >= 0)
        {
            query.offset = offset;
        }

        dbModel.CallCDRProcessed.findAll(query).then(function(callLeg)
        {
            callback(undefined, callLeg);

        }).catch(function(err)
        {
            callback(err, callLegList);
        })


    }
    catch(ex)
    {
        callback(ex, callLegList);
    }
};

var GetProcessedCDRInDateRangeCount = function(startTime, endTime, companyId, tenantId, agentFilter, skillFilter, dirFilter, recFilter, customerFilter, didFilter, callback)
{
    try
    {
        var sqlCond = {CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, ObjCategory: {ne: 'DIALER'}};
        if(agentFilter)
        {
            sqlCond.$and = [];
            sqlCond.$and.push({$or :[{DVPCallDirection: 'inbound', RecievedBy: agentFilter},{DVPCallDirection: 'outbound', SipFromUser: agentFilter}]});
        }
        if(skillFilter)
        {
            sqlCond.AgentSkill = skillFilter;
        }
        if(dirFilter)
        {
            sqlCond.DVPCallDirection = dirFilter;
        }
        if(recFilter == 'true' || recFilter == 'false')
        {
            if(recFilter == 'true')
            {
                sqlCond.BillSec = { gt: 0 }
            }
            else
            {
                sqlCond.BillSec = 0
            }

        }

        if(customerFilter)
        {
            if(!sqlCond.$and)
            {
                sqlCond.$and = [];
            }

            sqlCond.$and.push({$or : [{DVPCallDirection: 'inbound', SipFromUser: customerFilter},{DVPCallDirection: 'outbound', SipToUser: customerFilter}]})

        }

        if(didFilter)
        {
            if(!sqlCond.$and)
            {
                sqlCond.$and = [];
            }

            sqlCond.$and.push({DVPCallDirection: 'inbound', SipToUser: didFilter});

        }

        var query = {where :[sqlCond]};

        dbModel.CallCDRProcessed.aggregate('*', 'count', query).then(function(recCount)
        {
            callback(undefined, recCount);

        }).catch(function(err)
        {
            callback(err, 0);
        })


    }
    catch(ex)
    {
        callback(ex, 0);
    }
};

var GetProcessedCampaignCDRInDateRangeCount = function(startTime, endTime, companyId, tenantId, agentFilter, recFilter, customerFilter, callback)
{
    try
    {
        var sqlCond = {CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, Direction: 'outbound', ObjCategory: 'DIALER'};

        if(agentFilter)
        {
            sqlCond.where[0].SipResource = agentFilter;
        }
        if(recFilter == 'true' || recFilter == 'false')
        {
            if(recFilter == 'true')
            {
                sqlCond.where[0].BillSec = { gt: 0 }
            }
            else
            {
                sqlCond.where[0].BillSec = 0
            }

        }

        if(customerFilter)
        {
            sqlCond.where[0].SipToUser = customerFilter;

        }

        var query = {where :[sqlCond]};

        dbModel.CallCDRProcessed.aggregate('*', 'count', query).then(function(recCount)
        {
            callback(undefined, recCount);

        }).catch(function(err)
        {
            callback(err, 0);
        })


    }
    catch(ex)
    {
        callback(ex, 0);
    }
};

var GetProcessedCDRInDateRangeAbandon = function(startTime, endTime, companyId, tenantId, agentFilter, skillFilter, dirFilter, recFilter, customerFilter, didFilter, callback)
{
    var callLegList = [];

    try
    {
        var sqlCond = {CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, AgentAnswered: false, QueueSec: {gt: abandonCallThreshold}};
        if(agentFilter)
        {
            sqlCond.$and = [];
            sqlCond.$and.push({$or :[{DVPCallDirection: 'inbound', RecievedBy: agentFilter},{DVPCallDirection: 'outbound', SipFromUser: agentFilter}]});
        }
        if(skillFilter)
        {
            sqlCond.AgentSkill = skillFilter;
        }
        if(dirFilter)
        {
            sqlCond.DVPCallDirection = dirFilter;
        }
        if(recFilter == 'true' || recFilter == 'false')
        {
            if(recFilter == 'true')
            {
                sqlCond.BillSec = { gt: 0 }
            }
            else
            {
                sqlCond.BillSec = 0
            }

        }

        if(customerFilter)
        {
            if(!sqlCond.$and)
            {
                sqlCond.$and = [];
            }

            sqlCond.$and.push({$or : [{DVPCallDirection: 'inbound', SipFromUser: customerFilter},{DVPCallDirection: 'outbound', SipToUser: customerFilter}]})


        }

        if(didFilter)
        {
            if(!sqlCond.$and)
            {
                sqlCond.$and = [];
            }

            sqlCond.$and.push({DVPCallDirection: 'inbound', SipToUser: didFilter});

        }

        dbModel.CallCDRProcessed.findAll({where :[sqlCond], order:'"CreatedTime" DESC'}).then(function(callLeg)
        {
            callback(undefined, callLeg);

        }).catch(function(err)
        {
            callback(err, callLegList);
        })


    }
    catch(ex)
    {
        callback(ex, callLegList);
    }
};


var GetSpecificLegByUuid = function(uuid, callback)
{
    try
    {
        dbModel.CallCDR.find({where :[{Uuid: uuid}]}).then(function(callLeg)
        {
            callback(null, callLeg);
        });

    }
    catch(ex)
    {
        callback(ex, null);
    }
}

var GetBLegForIVRCalls = function(uuid, callUuid, callback)
{
    try
    {
        dbModel.CallCDR.findAll({where :[{CallUuid: callUuid, Direction: 'outbound', Uuid: {ne: uuid}}]}).then(function(callLeg)
        {
            callback(null, callLeg);
        });

    }
    catch(ex)
    {
        callback(ex, null);
    }
};

var GetResourceStatusList = function(startTime, endTime, statusList, agents, companyId, tenantId, callback)
{
    var emptyArr = [];

    try
    {
        var defaultQuery = {where :[{CompanyId: companyId, TenantId: tenantId, StatusType: 'ResourceStatus', createdAt: {between:[startTime, endTime]}}], order: ['createdAt'], include: [{model: dbModel.ResResource, as: 'ResResource'}]};

        if(statusList && statusList.length > 0)
        {
            defaultQuery.where[0].$or = [];

            statusList.forEach(function(status)
            {
                defaultQuery.where[0].$or.push({Reason: status.Status});

            });
        }

        if(agents && agents.length > 0)
        {
            defaultQuery.include[0].where = [{$or:[]}];

            var tempOrCondArr = defaultQuery.include[0].where[0].$or;
            agents.forEach(function(agent)
            {
                tempOrCondArr.push({ResourceName: agent.ResourceName});

            });
        }


        dbModel.ResResourceStatusChangeInfo.findAll(defaultQuery).then(function(resourceInfoList)
        {
            callback(null, resourceInfoList)

        }).catch(function(err)
        {
            callback(err, emptyArr)
        });

    }
    catch(ex)
    {
        callback(ex, emptyArr);
    }
};


var GetMyResourceStatusList = function(startTime, endTime, agent, companyId, tenantId, callback)
{
    var emptyArr = [];

    try
    {
        var defaultQuery = {where :[{CompanyId: companyId, TenantId: tenantId, StatusType: 'ResourceStatus', createdAt: {between:[startTime, endTime]}}], order: ['createdAt'], include: [{model: dbModel.ResResource, as: 'ResResource'}]};

        defaultQuery.include[0].where = {ResourceName: agent};

        dbModel.ResResourceStatusChangeInfo.findAll(defaultQuery).then(function(resourceInfoList)
        {
            callback(null, resourceInfoList)

        }).catch(function(err)
        {
            callback(err, emptyArr)
        });

    }
    catch(ex)
    {
        callback(ex, emptyArr);
    }
};

var GetCallRelatedLegs = function(sessionId, callback)
{
    var callLegList = [];

    try
    {
        dbModel.CallCDR.find({where :[{Uuid: sessionId}]}).then(function(callLeg)
        {

            logger.info('[DVP-CDRProcessor.GetCallRelatedLegs] PGSQL Get call cdr record for sessionId query success');
            if (callLeg && callLeg.CallUuid)
            {
                var callId = callLeg.CallUuid;
                dbModel.CallCDR.findAll({where: [{CallUuid: callId}]}).then(function (callLegs)
                {
                    logger.debug('[DVP-CDRProcessor.GetCallRelatedLegs] PGSQL Get call cdr records for call uuid query success');

                    callback(undefined, callLegs);

                }).catch(function (err)
                {
                    logger.error('[DVP-CDRProcessor.GetCallRelatedLegs] PGSQL Get call cdr records for call uuid query failed', err);
                    callback(err, callLegList);
                });
            }
            else
            {
                callback(new Error('CDR not found'), callLegList);
            }


        }).catch(function(err)
        {
            logger.error('[DVP-CDRProcessor.GetCallRelatedLegs] PGSQL Get call cdr record for sessionId query failed', err);
            callback(err, callLegList);
        })

    }
    catch(ex)
    {
        callback(ex, callLegList);
    }
};

/*var GetMailRecipients = function(companyId, tenantId, reportType)
{
    return new Promise(function(fulfill, reject)
    {

        try
        {
            dbModel.ReportMailRecipients.find({where :[{CompanyId: companyId, TenantId: tenantId, ReportType: reportType}]}).then(function(repMailRes)
            {

                fulfill(repMailRes);


            }).catch(function(err)
            {
                reject(err);
            })

        }
        catch(ex)
        {
            reject(ex);
        }
    });

};*/

var AddCDRRecord = function(cdrInfo, callback)
{
    try
    {
        cdrInfo
            .save()
            .then(function (rsp)
            {
                logger.info('[DVP-CDRProcessor.AddCDRRecord] PGSQL ADD CDR RECORD query success');
                callback(undefined, true);

            }).catch(function(err)
            {
                logger.error('[DVP-CDRProcessor.AddCDRRecord] PGSQL ADD CDR RECORD query failed', err);
                callback(err, false);
            })
    }
    catch(ex)
    {
        callback(ex, false);
    }
};

/*var addEmailRecipientRecord = function(recipients, reportType, companyId, tenantId)
{
    return new Promise(function(fulfill, reject)
    {

        try
        {
            var mailRecipient = dbModel.ReportMailRecipients.build({
                ReportType: reportType,
                Recipient: recipients,
                CompanyId: companyId,
                TenantId: tenantId

            });

            mailRecipient
                .save()
                .then(function (rsp)
                {
                    fulfill(rsp);

                }).catch(function(err)
                {
                    reject(err);
                })
        }
        catch(ex)
        {
            reject(ex);
        }
    });

};*/

/*var deleteEmailRecipientRecord = function(id, companyId, tenantId)
{
    return new Promise(function(fulfill, reject)
    {

        try
        {
            dbModel.ReportMailRecipients.destroy({ where: [{id: id},{CompanyId: companyId},{TenantId: tenantId}]}).then(function (destroyCount)
            {
                fulfill(true);

            }).catch(function(err)
            {
                reject(err);
            });
        }
        catch(ex)
        {
            reject(ex);
        }
    });

};*/

/*var getEmailRecipients = function(companyId, tenantId)
{
    return new Promise(function(fulfill, reject)
    {

        try
        {
            dbModel.ReportMailRecipients.findAll({ where: [{CompanyId: companyId},{TenantId: tenantId}]}).then(function (recipients)
            {
                fulfill(recipients);

            }).catch(function(err)
            {
                reject(err);
            });
        }
        catch(ex)
        {
            reject(ex);
        }
    });

};*/

module.exports.AddCDRRecord = AddCDRRecord;
module.exports.GetCallRelatedLegs = GetCallRelatedLegs;
module.exports.GetCallRelatedLegsInDateRange = GetCallRelatedLegsInDateRange;
module.exports.GetCallRelatedLegsInDateRangeCount = GetCallRelatedLegsInDateRangeCount;
module.exports.GetConferenceRelatedLegsInDateRange = GetConferenceRelatedLegsInDateRange;
module.exports.GetCallRelatedLegsForAppId = GetCallRelatedLegsForAppId;
module.exports.GetSpecificLegByUuid = GetSpecificLegByUuid;
module.exports.GetBLegForIVRCalls = GetBLegForIVRCalls;
module.exports.GetAbandonCallRelatedLegsInDateRange = GetAbandonCallRelatedLegsInDateRange;
module.exports.GetCallSummaryDetailsDateRange = GetCallSummaryDetailsDateRange;
module.exports.GetCallSummaryDetailsDateRangeWithSkill = GetCallSummaryDetailsDateRangeWithSkill;
module.exports.GetResourceStatusList = GetResourceStatusList;
module.exports.GetMyResourceStatusList = GetMyResourceStatusList;
module.exports.GetProcessedCDRInDateRange = GetProcessedCDRInDateRange;
module.exports.GetProcessedCDRInDateRangeAbandon = GetProcessedCDRInDateRangeAbandon;
module.exports.GetProcessedCDRInDateRangeCustomer = GetProcessedCDRInDateRangeCustomer;
module.exports.GetProcessedCDRForSessions = GetProcessedCDRForSessions;
module.exports.GetProcessedCDRInDateRangeCount = GetProcessedCDRInDateRangeCount;
module.exports.GetAbandonCallRelatedLegsInDateRangeCount = GetAbandonCallRelatedLegsInDateRangeCount;
module.exports.GetCampaignCallLegsInDateRangeCount = GetCampaignCallLegsInDateRangeCount;
module.exports.GetCampaignCallLegsInDateRange = GetCampaignCallLegsInDateRange;
module.exports.GetProcessedCampaignCDRInDateRange = GetProcessedCampaignCDRInDateRange;
module.exports.GetProcessedCampaignCDRInDateRangeCount = GetProcessedCampaignCDRInDateRangeCount;
var dbModel = require('dvp-dbmodels');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var config = require('config');

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
        var sqlCond = {CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, Direction: 'inbound', ObjCategory: {ne: 'CONFERENCE'}, $or: [{OriginatedLegs: {ne: null}}, {OriginatedLegs: null, $or:[{ObjType: 'HTTAPI'},{ObjType: 'SOCKET'},{ObjType: 'REJECTED'},{ObjCategory: 'DND'}]}]};
        if(agentFilter)
        {
            sqlCond.$and = [];
            sqlCond.$and.push({$or :[{DVPCallDirection: 'inbound', SipResource: agentFilter},{DVPCallDirection: 'outbound', $or:[{SipResource: agentFilter}, {SipFromUser: agentFilter}]}]});
        }
        if(skillFilter)
        {
            sqlCond.AgentSkill = skillFilter;
        }
        if(offset)
        {
            sqlCond.id = { gt: offset }
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
            dbModel.CallCDR.findAll({where :[sqlCond], order:['CreatedTime'], limit: limit}).then(function(callLeg)
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

            dbModel.CallCDR.findAll({where :[sqlCond], order:['CreatedTime']}).then(function(callLeg)
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

var GetAbandonCallRelatedLegsInDateRange = function(startTime, endTime, companyId, tenantId, offset, limit, agentFilter, skillFilter, customerFilter, didFilter, callback)
{
    var callLegList = [];

    try
    {

        var sqlCond = {CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, ObjType: 'HTTAPI', Direction: 'inbound', QueueSec: {gt: abandonCallThreshold}, AgentAnswered: false, ObjCategory: {ne: 'CONFERENCE'}, $or: [{OriginatedLegs: {ne: null}}, {OriginatedLegs: null, $or:[{ObjType: 'HTTAPI'},{ObjType: 'SOCKET'},{ObjType: 'REJECTED'},{ObjCategory: 'DND'}]}]};

        if(agentFilter)
        {
            sqlCond.$and = [];
            sqlCond.$and.push({$or :[{DVPCallDirection: 'inbound', SipResource: agentFilter},{DVPCallDirection: 'outbound', $or:[{SipResource: agentFilter}, {SipFromUser: agentFilter}]}]});
        }
        if(skillFilter)
        {
            sqlCond.AgentSkill = skillFilter;
        }

        if(offset)
        {
            sqlCond.id = { gt: offset };
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

            dbModel.CallCDR.findAll({where :[sqlCond], order:['CreatedTime'], limit: limit}).then(function(callLeg)
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
            dbModel.CallCDR.findAll({where :[sqlCond], order:['CreatedTime']}).then(function(callLeg)
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


                dbModel.CallCDRProcessed.aggregate('*', 'count', {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', QueueSec: {gt: abandonCallThreshold}, AgentAnswered: false, ObjType: 'HTTAPI'}]}).then(function(abandonCount)
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


                    dbModel.CallCDRProcessed.aggregate('*', 'count', {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', QueueSec: {lte: abandonCallThreshold}, AgentAnswered: false, ObjType: 'HTTAPI'}]}).then(function(dropCount)
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

                        dbModel.CallCDRProcessed.aggregate('HoldSec', 'avg', {where :[{CreatedTime : { gte: st , lt: et}, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', AgentAnswered: true, ObjType: 'HTTAPI'}]}).then(function(holdAvg)
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
        var st = startTime.toISOString();
        var et = endTime.toISOString();

        dbModel.CallCDRProcessed.aggregate('*', 'count', {where :[{CreatedTime : { gte: st , lt: et}, AgentSkill: skill, CompanyId: companyId, TenantId: tenantId, DVPCallDirection: 'inbound', ObjType: 'HTTAPI'}]}).then(function(callCount)
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
        });


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

var GetProcessedCDRInDateRange = function(startTime, endTime, companyId, tenantId, agentFilter, skillFilter, dirFilter, recFilter, customerFilter, didFilter, callback)
{
    var callLegList = [];

    try
    {
        var sqlCond = {CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId};
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
            if(sqlCond.$and)
            {
                sqlCond.$and.push({$or : [{DVPCallDirection: 'inbound', SipFromUser: customerFilter},{DVPCallDirection: 'outbound', SipToUser: customerFilter}]})
            }

        }

        if(didFilter)
        {
            if(!sqlCond.$and)
            {
                sqlCond.$and = [];
            }

            sqlCond.$and.push({DVPCallDirection: 'inbound', SipToUser: didFilter});

        }

        dbModel.CallCDRProcessed.findAll({where :[sqlCond], order:['CreatedTime']}).then(function(callLeg)
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

var GetProcessedCDRInDateRangeAbandon = function(startTime, endTime, companyId, tenantId, agentFilter, skillFilter, dirFilter, recFilter, customerFilter, didFilter, callback)
{
    var callLegList = [];

    try
    {
        var sqlCond = {CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, AgentAnswered: false, QueueSec: {gt: abandonCallThreshold}};
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
            if(sqlCond.$and)
            {
                sqlCond.$and.push({$or : [{DVPCallDirection: 'inbound', SipFromUser: customerFilter},{DVPCallDirection: 'outbound', SipToUser: customerFilter}]})
            }

        }

        if(didFilter)
        {
            if(!sqlCond.$and)
            {
                sqlCond.$and = [];
            }

            sqlCond.$and.push({DVPCallDirection: 'inbound', SipToUser: didFilter});

        }

        dbModel.CallCDRProcessed.findAll({where :[sqlCond], order:['CreatedTime']}).then(function(callLeg)
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


module.exports.AddCDRRecord = AddCDRRecord;
module.exports.GetCallRelatedLegs = GetCallRelatedLegs;
module.exports.GetCallRelatedLegsInDateRange = GetCallRelatedLegsInDateRange;
module.exports.GetConferenceRelatedLegsInDateRange = GetConferenceRelatedLegsInDateRange;
module.exports.GetCallRelatedLegsForAppId = GetCallRelatedLegsForAppId;
module.exports.GetSpecificLegByUuid = GetSpecificLegByUuid;
module.exports.GetBLegForIVRCalls = GetBLegForIVRCalls;
module.exports.GetAbandonCallRelatedLegsInDateRange = GetAbandonCallRelatedLegsInDateRange;
module.exports.GetCallSummaryDetailsDateRange = GetCallSummaryDetailsDateRange;
module.exports.GetCallSummaryDetailsDateRangeWithSkill = GetCallSummaryDetailsDateRangeWithSkill;
module.exports.GetResourceStatusList = GetResourceStatusList;
module.exports.GetProcessedCDRInDateRange = GetProcessedCDRInDateRange;
module.exports.GetProcessedCDRInDateRangeAbandon = GetProcessedCDRInDateRangeAbandon;
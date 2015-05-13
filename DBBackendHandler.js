var dbModel = require('DVP-DBModels');

var GetCallRelatedLegsInDateRange = function(startTime, endTime, companyId, tenantId, callback)
{
    var callLegList = [];

    try
    {
        dbModel.CallCDR.findAll({where :[{CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId}]}).complete(function(err, callLeg)
        {
            if(err)
            {
                logger.error('[DVP-CDRProcessor.GetCallRelatedLegsInDateRange] PGSQL Get call cdr records for date range query failed', err);
            }
            else
            {
                logger.info('[DVP-CDRProcessor.GetCallRelatedLegsInDateRange] PGSQL Get call cdr records for date range query success');
            }
            if(callLeg.length > 200)
            {
                callback(new Error('Too much data to load - please narrow the search'), callLegList);
            }
            else
            {
                callback(err, callLeg);
            }

        })

    }
    catch(ex)
    {
        callback(err, callLegList);
    }
};

var GetCallRelatedLegsForAppId = function(appId, companyId, tenantId, callback)
{
    var callLegList = [];

    try
    {
        dbModel.CallCDR.findAll({where :[{AppId : appId, CompanyId: companyId, TenantId: tenantId}]}).complete(function(err, callLeg)
        {
            if(err)
            {
                logger.error('[DVP-CDRProcessor.GetCallRelatedLegsForAppId] PGSQL Get call cdr records for app id query failed', err);
            }
            else
            {
                logger.info('[DVP-CDRProcessor.GetCallRelatedLegsForAppId] PGSQL Get call cdr records for app id query success');
            }

            if(callLeg.length > 200)
            {
                callback(new Error('Too much data to load - please narrow the search'), callLegList);
            }
            else
            {
                callback(err, callLeg);
            }

        })

    }
    catch(ex)
    {
        callback(err, callLegList);
    }
};

var GetCallRelatedLegs = function(sessionId, callback)
{
    var callLegList = [];

    try
    {
        dbModel.CallCDR.find({where :[{Uuid: sessionId}]}).complete(function(err, callLeg)
        {
            if(err)
            {
                logger.error('[DVP-CDRProcessor.GetCallRelatedLegs] PGSQL Get call cdr record for sessionId query failed', err);
                callback(err, callLegList);
            }
            else
            {
                logger.info('[DVP-CDRProcessor.GetCallRelatedLegs] PGSQL Get call cdr record for sessionId query success');
                if(callLeg.CallUuid)
                {
                    var callId = callLeg.CallUuid;
                    dbModel.CallCDR.findAll({where :[{CallUuid: callId}]}).complete(function(err, callLegs)
                    {
                        if(err)
                        {
                            logger.error('[DVP-CDRProcessor.GetCallRelatedLegs] PGSQL Get call cdr records for call uuid query failed', err);
                        }
                        else
                        {
                            logger.info('[DVP-CDRProcessor.GetCallRelatedLegs] PGSQL Get call cdr records for call uuid query success');
                        }

                        callback(err, callLegs);
                    });
                }
                else
                {
                    callback(new Error('CallUuid not found in cdr'), callLegList);
                }
            }

        })

    }
    catch(ex)
    {
        callback(err, callLegList);
    }
};

var AddCDRRecord = function(cdrInfo, callback)
{
    try
    {
        cdrInfo
            .save()
            .complete(function (err) {
                try
                {
                    if (err)
                    {
                        logger.error('[DVP-CDRProcessor.AddCDRRecord] PGSQL ADD CDR RECORD query failed', err);
                        callback(err, false);
                    }
                    else
                    {
                        logger.info('[DVP-CDRProcessor.AddCDRRecord] PGSQL ADD CDR RECORD query success');
                        callback(undefined, true);
                    }
                }
                catch (ex)
                {
                    callback(ex, false);
                }

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
module.exports.GetCallRelatedLegsForAppId = GetCallRelatedLegsForAppId;
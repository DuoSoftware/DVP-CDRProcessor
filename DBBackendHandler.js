var dbModel = require('dvp-dbmodels');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;

var GetCallRelatedLegsInDateRange = function(startTime, endTime, companyId, tenantId, offset, limit, callback)
{
    var callLegList = [];

    try
    {
        if(offset)
        {

            dbModel.CallCDR.findAll({where :[{CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, Direction: 'inbound', id: { gt: offset }, ObjCategory: {ne: 'CONFERENCE'}, $or: [{OriginatedLegs: {ne: null}}, {OriginatedLegs: null, $or:[{ObjType: 'HTTAPI'},{ObjType: 'SOCKET'},{ObjType: 'REJECTED'},{ObjCategory: 'DND'}]}]}], order:['CreatedTime'], limit: limit}).then(function(callLeg)
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
            dbModel.CallCDR.findAll({where :[{CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId, Direction: 'inbound', $or: [{OriginatedLegs: {ne: null}}, {OriginatedLegs: null, $or:[{ObjType: 'HTTAPI'},{ObjType: 'SOCKET'},{ObjType: 'REJECTED'},{ObjCategory: 'DND'}]}]}], order:['CreatedTime'], limit: limit}).then(function(callLeg)
            {

                logger.info('[DVP-CDRProcessor.GetCallRelatedLegsInDateRange] PGSQL Get call cdr records for date range query success');

                callback(undefined, callLeg);

            }).catch(function(err)
            {
                logger.error('[DVP-CDRProcessor.GetCallRelatedLegsInDateRange] PGSQL Get call cdr records for date range query failed', err);

                callback(err, callLegList);
            })
        }


    }
    catch(ex)
    {
        callback(ex, callLegList);
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
        dbModel.CallCDR.find({where :[{CallUuid: callUuid, Direction: 'outbound', Uuid: {ne: uuid}}]}).then(function(callLeg)
        {
            callback(null, callLeg);
        });

    }
    catch(ex)
    {
        callback(ex, null);
    }
}

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
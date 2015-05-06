var dbModel = require('DVP-DBModels');

var GetCallRelatedLegsInDateRange = function(startTime, endTime, companyId, tenantId, callback)
{
    var callLegList = [];

    try
    {
        dbModel.CallCDR.findAll({where :[{CreatedTime : {between:[startTime, endTime]}, CompanyId: companyId, TenantId: tenantId}]}).complete(function(err, callLeg)
        {
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
                callback(err, callLegList);
            }
            else
            {
                if(callLeg.CallUuid)
                {
                    var callId = callLeg.CallUuid;
                    dbModel.CallCDR.findAll({where :[{CallUuid: callId}]}).complete(function(err, callLegs)
                    {
                        callback(err, callLegs);
                    });
                }
                else
                {
                    callback(err, callLegList);
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
                try {
                    if (err)
                    {
                        callback(err, false);
                    }
                    else
                    {
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
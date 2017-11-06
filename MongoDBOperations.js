/**
 * Created by dinusha on 12/6/2016.
 */
var Promise = require('bluebird');
var IntegrationData = require('dvp-mongomodels/model/IntegrationData').IntegrationData;
var ReportEmail = require('dvp-mongomodels/model/ReportEmailConfig').ReportEmailConfig;
var RawCdr = require('dvp-mongomodels/model/Cdr').Cdr;
var User = require('dvp-mongomodels/model/User');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var config = require('config');


var getUserById = function(id, companyId, tenantId)
{
    return new Promise(function(fulfill, reject)
    {
        try
        {
            if(id)
            {
                User.findOne({company: companyId, tenant: tenantId, _id: id})
                    .exec( function(err, user)
                    {
                        if (err)
                        {
                            reject(err);
                        }
                        else
                        {
                            fulfill(user);
                        }
                    });
            }
            else
            {
                fulfill(null);
            }

        }
        catch(ex)
        {
            reject(ex);
        }
    });


};

var getEmailRecipients = function(companyId, tenantId, reportType)
{
    return new Promise(function(fulfill, reject)
    {

        try
        {
            ReportEmail.findOne({company: companyId, tenant: tenantId, reportType: reportType})
                .populate('users')
                .exec(function(err, user)
                {
                    if (err)
                    {
                        reject(err);
                    }
                    else
                    {
                        fulfill(user);
                    }
                });
        }
        catch(ex)
        {
            reject(ex);
        }
    });

};

var deleteEmailRecipientRecord = function(id, companyId, tenantId)
{
    return new Promise(function(fulfill, reject)
    {

        try
        {
            ReportEmail.findOneAndRemove({
                company: companyId,
                tenant: tenantId,
                _id:id

            }, function (err, removeResult) {
                if (err)
                {

                    reject(err);
                }
                else
                {
                    fulfill(removeResult);
                }
            });
        }
        catch(ex)
        {
            reject(ex);
        }
    });

};

var addEmailRecipientRecord = function(recipients, reportType, template, companyId, tenantId)
{
    return new Promise(function(fulfill, reject)
    {
        try
        {
            var mailRecipient = ReportEmail({
                reportType: reportType,
                users: recipients,
                company: companyId,
                tenant: tenantId,
                template: template
            });

            mailRecipient.save(function (err, obj)
            {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    fulfill(obj);
                }
            });
        }
        catch(ex)
        {
            reject(ex);
        }
    });

};

var addRawCDRRecord = function(obj)
{
    if(config.SaveRawCDRMongo == 'true')
    {
        var cdr = RawCdr(obj);

        cdr.save(function (err, obj)
        {
            if (err)
            {
                console.log(JSON.stringify(err));
            }
        });
    }

};

var updateEmailRecipientRecord = function(id, recipients, reportType, template, companyId, tenantId)
{
    return new Promise(function(fulfill, reject)
    {
        try
        {

            ReportEmail.findOneAndUpdate({company: companyId, tenant: tenantId, _id: id, reportType: reportType},
                {
                    users: recipients,
                    template: template

                }, function (err, resp)
                {
                    if (err)
                    {
                        reject(err);
                    }
                    else
                    {
                        if (resp)
                        {
                            fulfill(resp);
                        }
                        else
                        {
                            reject(new Error('No recipient data found for company'));
                        }

                    }
                });


        }
        catch(ex)
        {
            reject(ex);
        }
    });

};

module.exports.getUserById = getUserById;
module.exports.getEmailRecipients = getEmailRecipients;
module.exports.deleteEmailRecipientRecord = deleteEmailRecipientRecord;
module.exports.addEmailRecipientRecord = addEmailRecipientRecord;
module.exports.updateEmailRecipientRecord = updateEmailRecipientRecord;
module.exports.addRawCDRRecord = addRawCDRRecord;
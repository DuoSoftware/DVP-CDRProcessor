var ConvertToObject = function(jsonString)
{
    try
    {
        return JSON.parse(jsonString);
    }
    catch(ex)
    {
        return undefined;
    }

};

module.exports.ConvertToObject = ConvertToObject;
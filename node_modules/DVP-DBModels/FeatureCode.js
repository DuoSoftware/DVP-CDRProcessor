module.exports = function(sequelize, DataTypes)
{
    var FeatureCode = sequelize.define('CSDB_FeatureCode',
        {
            PickUp: DataTypes.STRING,
            Intercept: DataTypes.STRING,
            Park: DataTypes.STRING,
            VoiceMail: DataTypes.STRING,
            Barge: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING
        }
    );

    return FeatureCode;
};
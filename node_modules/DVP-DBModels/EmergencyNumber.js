module.exports = function(sequelize, DataTypes)
{
    var EmergencyNumber = sequelize.define('CSDB_EmergencyNumber',
        {
            EmergencyNum: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING
        }
    );

    return EmergencyNumber;
};
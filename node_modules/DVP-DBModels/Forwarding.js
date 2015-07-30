module.exports = function(sequelize, DataTypes)
{
    var Forwarding = sequelize.define('CSDB_Forwarding',
        {
            DestinationNumber: DataTypes.STRING,
            RingTimeout: DataTypes.INTEGER,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            DisconnectReason: DataTypes.STRING,
            IsActive: DataTypes.BOOLEAN
        }
    );

    return Forwarding;
};
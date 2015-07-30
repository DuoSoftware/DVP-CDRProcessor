module.exports = function(sequelize, DataTypes)
{
    var FollowMe = sequelize.define('CSDB_FollowMe',
        {
            DestinationNumber: DataTypes.STRING,
            RingTimeout: DataTypes.INTEGER,
            Priority: DataTypes.INTEGER,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING
        }
    );

    return FollowMe;
};
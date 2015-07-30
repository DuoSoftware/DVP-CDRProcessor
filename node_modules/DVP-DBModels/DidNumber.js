module.exports = function(sequelize, DataTypes)
{
    var DidNumber = sequelize.define('CSDB_DidNumber',
        {
            DidNumber: DataTypes.STRING,
            DidActive: DataTypes.BOOLEAN,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING
        }
    );

    return DidNumber;
};
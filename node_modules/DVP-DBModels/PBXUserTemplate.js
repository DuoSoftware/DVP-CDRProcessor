module.exports = function(sequelize, DataTypes) {
    var PBXUserTemplate = sequelize.define('CSDB_PBXUserTemplate', {
            CallDivertNumber: DataTypes.STRING,
            CallDivertUser: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING
        }
    );

    return PBXUserTemplate;
};
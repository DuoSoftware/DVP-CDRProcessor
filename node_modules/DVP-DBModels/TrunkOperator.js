module.exports = function(sequelize, DataTypes) {
    var TrunkOperator = sequelize.define('CSDB_TrunkOperator', {
            OperatorName: DataTypes.STRING,
            OperatorCode: DataTypes.STRING,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER
        }
    );


    return TrunkOperator;
};
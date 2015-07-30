module.exports = function(sequelize, DataTypes) {
    var Trunk = sequelize.define('CSDB_Trunk', {
            TrunkCode: DataTypes.STRING,
            TrunkName: DataTypes.STRING,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            IpUrl: DataTypes.STRING,
            Enable: DataTypes.BOOLEAN,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER
        }
    );


    return Trunk;
};
module.exports = function(sequelize, DataTypes) {
    var LimitInfo = sequelize.define('CSDB_LimitInfo', {
            LimitId: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            LimitDescription: DataTypes.STRING,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            MaxCount: DataTypes.INTEGER,
            Enable: DataTypes.BOOLEAN,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER
        }
    );


    return LimitInfo;
};
module.exports = function(sequelize, DataTypes) {
    var UserGroup = sequelize.define('CSDB_UserGroup', {
            GroupName: DataTypes.STRING,
            Domain: DataTypes.STRING,
            ExtraData: DataTypes.STRING,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER
        }
    );


    return UserGroup;
};
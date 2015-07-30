module.exports = function(sequelize, DataTypes) {
    var Extension = sequelize.define('CSDB_Extension', {
            Extension: DataTypes.STRING,
            ExtensionName: DataTypes.STRING,
            Enabled: DataTypes.BOOLEAN,
            ExtraData: DataTypes.STRING,
            ExtRefId: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING, //USER, GROUP, FAX
            DodNumber: DataTypes.STRING,
            DodActive: DataTypes.BOOLEAN,
            AddUser: DataTypes.STRING,
            UpdateUser: DataTypes.STRING
        }
    );


    return Extension;
};
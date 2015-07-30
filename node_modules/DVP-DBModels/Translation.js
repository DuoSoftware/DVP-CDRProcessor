module.exports = function(sequelize, DataTypes) {
    var Translation = sequelize.define('CSDB_Translation', {
            TransName: DataTypes.STRING,
            TransDescription: DataTypes.STRING,
            Enabled: DataTypes.BOOLEAN,
            LAdd: DataTypes.STRING,
            LRemove: DataTypes.INTEGER,
            RAdd: DataTypes.STRING,
            RRemove: DataTypes.INTEGER,
            Replace: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING
        }
    );


    return Translation;
};
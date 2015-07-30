module.exports = function(sequelize, DataTypes) {
    var FileUpload = sequelize.define('CSDB_FileUpload', {
            UniqueId: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            FileStructure: DataTypes.STRING,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            URL: DataTypes.STRING,
            UploadTimestamp: DataTypes.STRING,
            Filename: {type:DataTypes.STRING,unique: "compositeIndex"},
            Version:{type:DataTypes.INTEGER,unique: "compositeIndex"},
            DisplayName: DataTypes.STRING,
            CompanyId: {type:DataTypes.INTEGER,unique: "compositeIndex"},
            TenantId: {type:DataTypes.INTEGER,unique: "compositeIndex"},
            RefId:DataTypes.STRING,
            Status:DataTypes.STRING
        }
    );


    return FileUpload;
};
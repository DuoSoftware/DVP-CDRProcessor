module.exports = function(sequelize, DataTypes) {
    var FileDownload = sequelize.define('CSDB_FileDownload', {
            DownloadId: DataTypes.STRING,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            Filename: DataTypes.STRING,
            DownloadTimestamp: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER
        }
    );


    return FileDownload;
};
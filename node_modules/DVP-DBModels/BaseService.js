module.exports = function(sequelize, DataTypes) {
    var BaseService = sequelize.define('CSDB_BaseService', {
            ServiceName: DataTypes.STRING,
            Description: DataTypes.STRING,
            ServiceVersion: DataTypes.STRING,
            ServiceVersionStatus: DataTypes.STRING,
            SourceUrl: DataTypes.STRING,
            DockerUrl: DataTypes.STRING,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            NoOfPorts: DataTypes.INTEGER,
            PortType: DataTypes.STRING,
            ServiceProtocol: DataTypes.STRING,
            Importance: DataTypes.STRING //LB, FAIL_OVER, NONE

        }
    );


    return BaseService;
};
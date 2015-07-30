module.exports = function(sequelize, DataTypes) {
    var ServiceDeploymentDistribution = sequelize.define('CSDB_ServiceDeploymentDistribution', {
            ServiceName: DataTypes.STRING,
            ServiceInstanceName: DataTypes.STRING,
            ServiceVersion: DataTypes.STRING,
            HostEnvironment: DataTypes.STRING, //DOCKER, REMOTE
            HostIp: DataTypes.STRING,
            GuestIp: DataTypes.STRING,
            GuestPortInfo: DataTypes.STRING, //Contains a JSON Object with Port and Bind Status
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING, //SERVICE
            ObjCategory: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER

        }
    );

    return ServiceDeploymentDistribution;
};
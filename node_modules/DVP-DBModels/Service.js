/**
 * Created by a on 5/18/2015.
 */
module.exports = function(sequelize, DataTypes) {
    var Service = sequelize.define('CSDB_Service', {
            Name: DataTypes.STRING,
            Description: DataTypes.STRING,
            Class: DataTypes.STRING,
            Type: DataTypes.STRING,
            Category: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            MultiPorts: DataTypes.BOOLEAN,
            Direction: DataTypes.STRING,
            Protocol: DataTypes.STRING,
            DefaultStartPort: DataTypes.INTEGER
        }
    );

    return Service;
};

/**
 * Created by a on 5/18/2015.
 */
module.exports = function(sequelize, DataTypes) {
    var Resource = sequelize.define('CSDB_Resource', {
            Name: DataTypes.STRING,
            Description: DataTypes.STRING,
            DockerUrl: DataTypes.STRING,
            Class: DataTypes.STRING,
            Type: DataTypes.STRING,
            Category: DataTypes.STRING

        }
    );


    return Resource;
};
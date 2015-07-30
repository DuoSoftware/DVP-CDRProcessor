
/**
 * Created by a on 5/18/2015.
 */
module.exports = function(sequelize, DataTypes) {
    var Image = sequelize.define('CSDB_Image', {
            Name: {type : DataTypes.STRING, unique: true},
            Description: DataTypes.STRING,
            Version: DataTypes.STRING,
            VersionStatus: DataTypes.STRING,
            SourceUrl: DataTypes.STRING,
            DockerUrl: DataTypes.STRING,
            Class: DataTypes.STRING,
            Type: DataTypes.STRING,
            Category: DataTypes.STRING,
            Cmd: DataTypes.STRING,
            Importance: DataTypes.STRING //LB, FAIL_OVER, NONE*/

        }
    );


    return Image;
};
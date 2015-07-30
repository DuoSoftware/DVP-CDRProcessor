/**
 * Created by a on 5/18/2015.
 */
module.exports = function(sequelize, DataTypes) {
    var Volume = sequelize.define('CSDB_Volume', {
            Name: DataTypes.STRING,
            Description: DataTypes.STRING,
            Default: DataTypes.STRING
        }
    );

    return Volume;
};


/**
 * Created by a on 5/18/2015.
 */
module.exports = function(sequelize, DataTypes) {
    var Variable = sequelize.define('CSDB_Variable', {
            Name: DataTypes.STRING,
            Description: DataTypes.STRING,
            DefaultValue: DataTypes.STRING,
            Export: DataTypes.BOOLEAN,
            Type: DataTypes.STRING

        }
    );


    return Variable;
};
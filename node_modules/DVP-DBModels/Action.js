/**
 * Created by a on 6/4/2015.
 */


module.exports = function(sequelize, DataTypes) {
    var Action = sequelize.define('CSDB_Action', {

            Name: DataTypes.STRING,
            Action: DataTypes.STRING,
            OnEvent: DataTypes.STRING,
            Data: DataTypes.STRING
        }
    );


    return Action;
};

/**
 * Created by a on 5/18/2015.
 */
module.exports = function(sequelize, DataTypes) {
    var Template = sequelize.define('CSDB_Template', {
            Name: {type : DataTypes.STRING, unique: true},
            Description: DataTypes.STRING,
            Class: DataTypes.STRING,
            Type: DataTypes.STRING,
            Category: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER

        }
    );

    return Template;
};
/**
 * Created by a on 1/29/2015.
 */

module.exports = function(sequelize, DataTypes) {
    var callserver = sequelize.define('CSDB_CallServer', {
            Name: DataTypes.STRING,
            //ID: DataTypes.INTEGER,
            Activate: DataTypes.BOOLEAN,
            Code: DataTypes.INTEGER,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            Class: DataTypes.STRING,
            Type: DataTypes.STRING,
            Category: DataTypes.STRING,
            InternalMainIP: DataTypes.STRING
        }
    );
    return callserver;
};

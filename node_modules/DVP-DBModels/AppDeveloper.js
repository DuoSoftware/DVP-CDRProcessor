/**
 * Created by pawan on 4/8/2015.
 */

module.exports = function(sequelize, DataTypes) {
    var AppDeveloper = sequelize.define('CSDB_AppDeveloper', {
            Username: DataTypes.STRING,
            Password: DataTypes.STRING,
            Email:DataTypes.STRING,
            Phone:DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            RegDate: DataTypes.STRING,
            RefId:DataTypes.INTEGER,
            Availability:DataTypes.BOOLEAN



        }
    );


    return AppDeveloper;
};

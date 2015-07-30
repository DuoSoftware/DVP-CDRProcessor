module.exports = function(sequelize, DataTypes) {
    var AttachedService = sequelize.define('CSDB_AttachedService', {
            AttServiceName: DataTypes.STRING,
            Description: DataTypes.STRING,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING
        }
    );


    return AttachedService;
};
module.exports = function(sequelize, DataTypes) {
    var Context = sequelize.define('CSDB_Context', {
            Context: {type:DataTypes.STRING, primaryKey:true},
            Description: DataTypes.STRING,
            ContextCat: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            AddUser: DataTypes.STRING,
            UpdateUser: DataTypes.STRING
        }
    );


    return Context;
};
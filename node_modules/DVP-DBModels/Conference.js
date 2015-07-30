module.exports = function(sequelize, DataTypes) {
    var Conference = sequelize.define('CSDB_Conference', {
            ConferenceName: {type:DataTypes.STRING, primaryKey:true},
            Description: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            Pin:DataTypes.STRING,
            AllowAnonymousUser:DataTypes.BOOLEAN,
            StartTime:DataTypes.DATE,
            EndTime:DataTypes.DATE,
            Domain:DataTypes.STRING,
            IsLocked:DataTypes.BOOLEAN,
            MaxUser:DataTypes.INTEGER,
            CurrentUsers: DataTypes.INTEGER

        }
    );


    return Conference;
};
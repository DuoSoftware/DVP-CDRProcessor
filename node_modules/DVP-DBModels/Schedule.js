module.exports = function(sequelize, DataTypes) {
    var Schedule = sequelize.define('CSDB_Schedule', {
            ScheduleName: DataTypes.STRING,
            Action: DataTypes.STRING,
            ExtraData: DataTypes.STRING,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER
        }
    );


    return Schedule;
};
module.exports = function(sequelize, DataTypes) {
    var Appointment = sequelize.define('CSDB_Appointment', {
            AppointmentName: DataTypes.STRING,
            Action: DataTypes.STRING,
            ExtraData: DataTypes.STRING,
            StartDate: DataTypes.STRING,
            EndDate: DataTypes.STRING,
            StartTime: DataTypes.DATE,
            EndTime: DataTypes.DATE,
            DaysOfWeek: DataTypes.STRING,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER
        }
    );


    return Appointment;
};
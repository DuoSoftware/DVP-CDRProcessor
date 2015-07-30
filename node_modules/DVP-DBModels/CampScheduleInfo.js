/**
 * Created by Rajinda on 6/29/2015.
 */


module.exports = function (sequelize, DataTypes) {
    var CampScheduleInfo = sequelize.define('DB_CAMP_ScheduleInfo', {
            CampaignId: {type:DataTypes.INTEGER,unique: 'CampScheduleInfoIndex'},
            ScheduleId: {type:DataTypes.INTEGER,unique: 'CampScheduleInfoIndex'},
            ScheduleType: DataTypes.STRING,
            //CamScheduleId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            CompanyId: DataTypes.INTEGER,
            Status: DataTypes.BOOLEAN,
            CamScheduleId:{type:DataTypes.INTEGER, primaryKey:true,autoIncrement: true}
        }
    );
    return CampScheduleInfo;
};

